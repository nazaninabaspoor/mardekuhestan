from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class MessageOut(BaseModel):
    id: UUID
    conversation_id: UUID
    sender_role: str
    sender_user_id: int | None = None
    body: str
    client_message_id: str | None = None
    created_at: datetime


class ConversationOut(BaseModel):
    id: UUID
    status: str
    customer_id: int
    last_message_at: datetime | None = None
    messages: list[MessageOut] = Field(default_factory=list)


class SendMessageIn(BaseModel):
    body: str = Field(min_length=1, max_length=4000)
    client_message_id: str | None = Field(default=None, max_length=64)


class StaffReplyIn(BaseModel):
    conversation_id: UUID
    body: str = Field(min_length=1, max_length=4000)
    client_message_id: str | None = Field(default=None, max_length=64)


class BroadcastIn(BaseModel):
    type: str = "support.message"
    conversation_id: UUID
    customer_id: int
    message: MessageOut


class WsClientEvent(BaseModel):
    action: str
    body: str | None = None
    client_message_id: str | None = None
    conversation_id: UUID | None = None
