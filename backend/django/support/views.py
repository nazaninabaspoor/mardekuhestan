"""API گفتگوی پشتیبانی روی خود Django — بدون وابستگی به پورت FastAPI."""

from __future__ import annotations

from django.db import IntegrityError
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.authentication import CookieJWTAuthentication
from accounts.permissions import IsCustomerOrStaff
from support.constants import (
    CONVERSATION_STATUS_WAITING,
    MESSAGE_BODY_MAX_LENGTH,
    SENDER_CUSTOMER,
)
from support.models import SupportConversation, SupportMessage


def _serialize_message(message: SupportMessage) -> dict:
    created = message.created_at
    if created is not None and created.tzinfo is None:
        created_at = created.isoformat() + "Z"
    else:
        created_at = created.isoformat() if created else None
    return {
        "id": str(message.id),
        "conversation_id": str(message.conversation_id),
        "sender_role": message.sender_role,
        "sender_user_id": message.sender_user_id,
        "body": message.body,
        "client_message_id": message.client_message_id or None,
        "created_at": created_at,
    }


def _serialize_conversation(conversation: SupportConversation) -> dict:
    messages = [
        _serialize_message(item)
        for item in conversation.messages.all().order_by("created_at")
    ]
    return {
        "id": str(conversation.id),
        "status": conversation.status,
        "customer_id": conversation.customer_id,
        "last_message_at": (
            conversation.last_message_at.isoformat()
            if conversation.last_message_at
            else None
        ),
        "messages": messages,
    }


def _active_conversation(user) -> SupportConversation:
    conversation = (
        SupportConversation.objects.filter(customer=user)
        .exclude(status=SupportConversation.Status.CLOSED)
        .order_by("-last_message_at", "-created_at")
        .first()
    )
    if conversation is None:
        conversation = SupportConversation.objects.create(customer=user)
    return conversation


class SupportConversationView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsCustomerOrStaff]

    def get(self, request):
        conversation = _active_conversation(request.user)
        conversation = (
            SupportConversation.objects.filter(pk=conversation.pk)
            .prefetch_related("messages")
            .first()
            or conversation
        )
        return Response(_serialize_conversation(conversation))


class SupportMessageCreateView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsCustomerOrStaff]

    def post(self, request):
        body = str(request.data.get("body") or "").strip()
        if not body:
            return Response({"detail": "متن پیام خالی است."}, status=400)
        if len(body) > MESSAGE_BODY_MAX_LENGTH:
            body = body[:MESSAGE_BODY_MAX_LENGTH]
        client_id = str(request.data.get("client_message_id") or "").strip()[:64]
        conversation = _active_conversation(request.user)
        now = timezone.now()
        try:
            message = SupportMessage.objects.create(
                conversation=conversation,
                sender_role=SENDER_CUSTOMER,
                sender_user=request.user,
                body=body,
                client_message_id=client_id,
            )
        except IntegrityError:
            existing = SupportMessage.objects.filter(
                conversation=conversation,
                client_message_id=client_id,
            ).first()
            if existing is not None:
                return Response(_serialize_message(existing), status=200)
            raise
        conversation.status = CONVERSATION_STATUS_WAITING
        conversation.last_message_at = now
        conversation.save(update_fields=["status", "last_message_at", "updated_at"])
        return Response(_serialize_message(message), status=201)
