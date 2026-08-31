"""
WebSocket consumers برای کاتالوگ محصول — پخش لحظه‌ای رویدادها از Redis Channel Layer.

مسیرها (product.routing):
  ws/catalog/              — فید عمومی فروشگاه (+ subscribe به domain/category)
  ws/catalog/admin/        — پنل staff (نیاز به احراز هویت)
  ws/products/<id>/         — صفحه جزئیات یک محصول

رویدادها از signals/models با broadcast_product_event() پخش می‌شوند.
"""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from typing import Any, Final

from asgiref.sync import async_to_sync
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.layers import get_channel_layer

from product.constants import ProductEvent

logger = logging.getLogger(__name__)

WS_MESSAGE_TYPE: Final[str] = "catalog.event"


class CatalogGroups:
    """نام گروه‌های Redis — قرارداد ثابت برای scale افقی."""

    PUBLIC = "catalog.public"
    ADMIN = "catalog.admin"

    @staticmethod
    def domain(domain: str) -> str:
        return f"catalog.domain.{domain}"

    @staticmethod
    def category(slug: str) -> str:
        return f"catalog.category.{slug}"

    @staticmethod
    def product(product_id: int) -> str:
        return f"catalog.product.{product_id}"


# رویدادهایی که مشتری فروشگاه حق دیدنشان را دارد (بعد از انتشار)
PUBLIC_STORE_EVENTS: Final[frozenset[str]] = frozenset(
    {
        ProductEvent.PRODUCT_PUBLISHED,
        ProductEvent.PRODUCT_ARCHIVED,
        ProductEvent.PRICE_CHANGED,
        ProductEvent.AVAILABILITY_CHANGED,
        ProductEvent.VARIANT_CREATED,
        ProductEvent.VARIANT_UPDATED,
    }
)


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def build_event_envelope(event: str, payload: dict[str, Any]) -> dict[str, Any]:
    """قالب یکسان پیام WebSocket برای فرانت."""
    return {
        "event": event,
        "type": event,
        "ts": _utc_now_iso(),
        "payload": payload,
    }


def _resolve_target_groups(
    *,
    event: str,
    domain: str | None = None,
    category_slug: str | None = None,
    product_id: int | None = None,
    to_public: bool = False,
    to_admin: bool = True,
) -> list[str]:
    groups: list[str] = []

    if to_admin:
        groups.append(CatalogGroups.ADMIN)

    if to_public and event in PUBLIC_STORE_EVENTS:
        groups.append(CatalogGroups.PUBLIC)
        if domain:
            groups.append(CatalogGroups.domain(domain))
        if category_slug:
            groups.append(CatalogGroups.category(category_slug))
        if product_id is not None:
            groups.append(CatalogGroups.product(product_id))

    # dedupe preserving order
    seen: set[str] = set()
    unique: list[str] = []
    for name in groups:
        if name not in seen:
            seen.add(name)
            unique.append(name)
    return unique


def broadcast_product_event(
    event: str,
    payload: dict[str, Any],
    *,
    domain: str | None = None,
    category_slug: str | None = None,
    product_id: int | None = None,
    to_public: bool = False,
    to_admin: bool = True,
) -> int:
    """
    پخش رویداد به گروه‌های WebSocket (sync — از signals/Celery قابل فراخوانی).

    Returns:
        تعداد گروه‌هایی که پیام به آن‌ها ارسال شد.
    """
    layer = get_channel_layer()
    if layer is None:
        logger.warning("Channel layer not configured; skip broadcast %s", event)
        return 0

    groups = _resolve_target_groups(
        event=event,
        domain=domain,
        category_slug=category_slug,
        product_id=product_id,
        to_public=to_public,
        to_admin=to_admin,
    )
    if not groups:
        return 0

    envelope = build_event_envelope(event, payload)
    message = {"type": WS_MESSAGE_TYPE, "data": envelope}

    for group in groups:
        try:
            async_to_sync(layer.group_send)(group, message)
        except Exception:
            logger.exception("WebSocket broadcast failed for group=%s event=%s", group, event)

    return len(groups)


async def abroadcast_product_event(
    event: str,
    payload: dict[str, Any],
    *,
    domain: str | None = None,
    category_slug: str | None = None,
    product_id: int | None = None,
    to_public: bool = False,
    to_admin: bool = True,
) -> int:
    """نسخه async برای consumerهای دیگر یا FastAPI bridge."""
    layer = get_channel_layer()
    if layer is None:
        return 0

    groups = _resolve_target_groups(
        event=event,
        domain=domain,
        category_slug=category_slug,
        product_id=product_id,
        to_public=to_public,
        to_admin=to_admin,
    )
    if not groups:
        return 0

    envelope = build_event_envelope(event, payload)
    message = {"type": WS_MESSAGE_TYPE, "data": envelope}

    for group in groups:
        await layer.group_send(group, message)

    return len(groups)


class _CatalogStreamMixin:
    """Handler مشترک پیام group_send."""

    subscribed_groups: set[str]

    async def catalog_event(self, event: dict[str, Any]) -> None:
        await self.send_json(event["data"])

    async def _join_group(self, group: str) -> None:
        if group in self.subscribed_groups:
            return
        await self.channel_layer.group_add(group, self.channel_name)
        self.subscribed_groups.add(group)

    async def _leave_all_groups(self) -> None:
        for group in list(self.subscribed_groups):
            await self.channel_layer.group_discard(group, self.channel_name)
        self.subscribed_groups.clear()


class ProductCatalogConsumer(_CatalogStreamMixin, AsyncJsonWebsocketConsumer):
    """
    فید لحظه‌ای فروشگاه.

    پیام ورودی (اختیاری):
      {"action": "ping"}
      {"action": "subscribe", "domain": "dairy"}
      {"action": "subscribe", "category": "labaniyat"}
      {"action": "unsubscribe", "domain": "dairy"}
    """

    async def connect(self) -> None:
        self.subscribed_groups = set()
        await self.accept()
        await self._join_group(CatalogGroups.PUBLIC)
        await self.send_json(
            {
                "event": "catalog.connected",
                "ts": _utc_now_iso(),
                "payload": {"channel": "public"},
            }
        )

    async def disconnect(self, code: int) -> None:
        await self._leave_all_groups()

    async def receive_json(self, content: dict[str, Any], **kwargs: Any) -> None:
        action = (content.get("action") or "").strip().lower()

        if action == "ping":
            await self.send_json({"event": "pong", "ts": _utc_now_iso(), "payload": {}})
            return

        if action == "subscribe":
            domain = content.get("domain")
            category = content.get("category")
            if domain:
                await self._join_group(CatalogGroups.domain(str(domain)))
            if category:
                await self._join_group(CatalogGroups.category(str(category)))
            await self.send_json(
                {
                    "event": "catalog.subscribed",
                    "ts": _utc_now_iso(),
                    "payload": {"domain": domain, "category": category},
                }
            )
            return

        if action == "unsubscribe":
            domain = content.get("domain")
            category = content.get("category")
            if domain:
                group = CatalogGroups.domain(str(domain))
                if group in self.subscribed_groups:
                    await self.channel_layer.group_discard(group, self.channel_name)
                    self.subscribed_groups.discard(group)
            if category:
                group = CatalogGroups.category(str(category))
                if group in self.subscribed_groups:
                    await self.channel_layer.group_discard(group, self.channel_name)
                    self.subscribed_groups.discard(group)
            await self.send_json(
                {
                    "event": "catalog.unsubscribed",
                    "ts": _utc_now_iso(),
                    "payload": {"domain": domain, "category": category},
                }
            )
            return

        await self.send_json(
            {
                "event": "catalog.error",
                "ts": _utc_now_iso(),
                "payload": {"message": "عملیات ناشناخته است."},
            }
        )


class ProductDetailConsumer(_CatalogStreamMixin, AsyncJsonWebsocketConsumer):
    """فید لحظه‌ای یک محصول — قیمت، موجودی، واریانت."""

    product_id: int

    async def connect(self) -> None:
        self.product_id = int(self.scope["url_route"]["kwargs"]["product_id"])
        self.subscribed_groups = set()
        await self.accept()
        await self._join_group(CatalogGroups.product(self.product_id))
        await self.send_json(
            {
                "event": "product.connected",
                "ts": _utc_now_iso(),
                "payload": {"product_id": self.product_id},
            }
        )

    async def disconnect(self, code: int) -> None:
        await self._leave_all_groups()

    async def receive_json(self, content: dict[str, Any], **kwargs: Any) -> None:
        if (content.get("action") or "").lower() == "ping":
            await self.send_json({"event": "pong", "ts": _utc_now_iso(), "payload": {}})


class ProductAdminConsumer(_CatalogStreamMixin, AsyncJsonWebsocketConsumer):
    """فید پنل مدیریت — همه رویدادهای دامنه محصول."""

    async def connect(self) -> None:
        user = self.scope.get("user")
        if user is None or not user.is_authenticated or not user.is_staff:
            await self.close(code=4401)
            return

        self.subscribed_groups = set()
        await self.accept()
        await self._join_group(CatalogGroups.ADMIN)
        await self.send_json(
            {
                "event": "catalog.admin.connected",
                "ts": _utc_now_iso(),
                "payload": {"user_id": user.pk},
            }
        )

    async def disconnect(self, code: int) -> None:
        await self._leave_all_groups()

    async def receive_json(self, content: dict[str, Any], **kwargs: Any) -> None:
        if (content.get("action") or "").lower() == "ping":
            await self.send_json({"event": "pong", "ts": _utc_now_iso(), "payload": {}})
