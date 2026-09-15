"""گفتگوی پشتیبانی زنده — مشتری ↔ ادمین استخدامی."""

from __future__ import annotations

import uuid

from django.conf import settings
from django.db import models

from support.constants import (
    CONVERSATION_STATUS_CLOSED,
    CONVERSATION_STATUS_OPEN,
    CONVERSATION_STATUS_WAITING,
    MESSAGE_BODY_MAX_LENGTH,
    SENDER_CUSTOMER,
    SENDER_STAFF,
    SENDER_SYSTEM,
)


class SupportConversation(models.Model):
    class Status(models.TextChoices):
        OPEN = CONVERSATION_STATUS_OPEN, "باز"
        WAITING = CONVERSATION_STATUS_WAITING, "در انتظار پاسخ ادمین"
        CLOSED = CONVERSATION_STATUS_CLOSED, "بسته (خروج کاربر)"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="support_conversations",
        verbose_name="مشتری",
    )
    assigned_staff = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_support_conversations",
        verbose_name="ادمین پاسخ‌گو",
        limit_choices_to={"is_staff": True},
    )
    status = models.CharField(
        "وضعیت",
        max_length=32,
        choices=Status.choices,
        default=Status.OPEN,
        db_index=True,
    )
    last_message_at = models.DateTimeField("آخرین پیام", null=True, blank=True, db_index=True)
    customer_last_read_at = models.DateTimeField("آخرین خواندن مشتری", null=True, blank=True)
    staff_last_read_at = models.DateTimeField("آخرین خواندن ادمین", null=True, blank=True)
    created_at = models.DateTimeField("ایجاد", auto_now_add=True)
    updated_at = models.DateTimeField("بروزرسانی", auto_now=True)

    class Meta:
        verbose_name = "گفتگوی پشتیبانی"
        verbose_name_plural = "گفتگوهای پشتیبانی"
        ordering = ["-last_message_at", "-created_at"]
        indexes = [
            models.Index(fields=["customer", "status"]),
            models.Index(fields=["-last_message_at"]),
        ]

    def __str__(self) -> str:
        return f"چت {self.customer_id} · {self.get_status_display()}"


class SupportMessage(models.Model):
    class Sender(models.TextChoices):
        CUSTOMER = SENDER_CUSTOMER, "مشتری"
        STAFF = SENDER_STAFF, "ادمین"
        SYSTEM = SENDER_SYSTEM, "سیستم"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(
        SupportConversation,
        on_delete=models.CASCADE,
        related_name="messages",
        verbose_name="گفتگو",
    )
    sender_role = models.CharField("نقش فرستنده", max_length=16, choices=Sender.choices)
    sender_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="support_messages",
        verbose_name="کاربر فرستنده",
    )
    body = models.TextField("متن", max_length=MESSAGE_BODY_MAX_LENGTH)
    client_message_id = models.CharField(
        "شناسه سمت کلاینت",
        max_length=64,
        blank=True,
        default="",
        help_text="برای جلوگیری از پیام تکراری در شبکه کند",
    )
    whatsapp_notified_at = models.DateTimeField("نوتیف واتساپ", null=True, blank=True)
    created_at = models.DateTimeField("زمان", auto_now_add=True, db_index=True)

    class Meta:
        verbose_name = "پیام پشتیبانی"
        verbose_name_plural = "پیام‌های پشتیبانی"
        ordering = ["created_at"]
        indexes = [
            models.Index(fields=["conversation", "created_at"]),
            models.Index(fields=["client_message_id"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["conversation", "client_message_id"],
                condition=~models.Q(client_message_id=""),
                name="support_unique_client_message",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.get_sender_role_display()}: {self.body[:48]}"
