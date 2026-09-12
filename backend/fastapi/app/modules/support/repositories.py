"""Persistence helpers for support chat."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.support.constants import STATUS_CLOSED, STATUS_OPEN, STATUS_WAITING
from app.modules.support.models import AuthUserRow, SupportConversation, SupportMessage


async def get_user_flags(session: AsyncSession, user_id: int) -> AuthUserRow | None:
    return await session.get(AuthUserRow, user_id)


async def get_active_conversation(
    session: AsyncSession,
    customer_id: int,
) -> SupportConversation | None:
    stmt = (
        select(SupportConversation)
        .where(
            SupportConversation.customer_id == customer_id,
            SupportConversation.status != STATUS_CLOSED,
        )
        .options(selectinload(SupportConversation.messages))
        .order_by(SupportConversation.created_at.desc())
        .limit(1)
    )
    result = await session.execute(stmt)
    return result.scalar_one_or_none()


async def get_or_create_active_conversation(
    session: AsyncSession,
    customer_id: int,
) -> SupportConversation:
    existing = await get_active_conversation(session, customer_id)
    if existing:
        return existing
    conversation = SupportConversation(
        id=uuid.uuid4(),
        customer_id=customer_id,
        status=STATUS_OPEN,
    )
    session.add(conversation)
    await session.commit()
    await session.refresh(conversation)
    # reload with messages relationship
    reloaded = await get_active_conversation(session, customer_id)
    return reloaded or conversation


async def get_conversation(
    session: AsyncSession,
    conversation_id: uuid.UUID,
) -> SupportConversation | None:
    stmt = (
        select(SupportConversation)
        .where(SupportConversation.id == conversation_id)
        .options(selectinload(SupportConversation.messages))
    )
    result = await session.execute(stmt)
    return result.scalar_one_or_none()


async def add_message(
    session: AsyncSession,
    *,
    conversation: SupportConversation,
    sender_role: str,
    sender_user_id: int | None,
    body: str,
    client_message_id: str = "",
    next_status: str | None = None,
) -> SupportMessage:
    now = datetime.now(timezone.utc)
    if client_message_id:
        existing = await session.execute(
            select(SupportMessage).where(
                SupportMessage.conversation_id == conversation.id,
                SupportMessage.client_message_id == client_message_id,
            )
        )
        found = existing.scalar_one_or_none()
        if found:
            return found

    message = SupportMessage(
        id=uuid.uuid4(),
        conversation_id=conversation.id,
        sender_role=sender_role,
        sender_user_id=sender_user_id,
        body=body.strip(),
        client_message_id=client_message_id or "",
    )
    conversation.last_message_at = now
    if next_status:
        conversation.status = next_status
    session.add(message)
    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()
        if client_message_id:
            existing = await session.execute(
                select(SupportMessage).where(
                    SupportMessage.conversation_id == conversation.id,
                    SupportMessage.client_message_id == client_message_id,
                )
            )
            found = existing.scalar_one_or_none()
            if found:
                return found
        raise
    await session.refresh(message)
    return message


async def close_conversation(session: AsyncSession, conversation: SupportConversation) -> None:
    conversation.status = STATUS_CLOSED
    conversation.updated_at = datetime.now(timezone.utc)
    await session.commit()


async def mark_whatsapp_notified(session: AsyncSession, message: SupportMessage) -> None:
    message.whatsapp_notified_at = datetime.now(timezone.utc)
    await session.commit()


def waiting_status_for_customer() -> str:
    return STATUS_WAITING
