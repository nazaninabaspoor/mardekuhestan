"""Realtime hub: local WebSocket fanout + Redis Pub/Sub for multi-worker scale."""

from __future__ import annotations

import asyncio
import json
import logging
from typing import Any

from fastapi import WebSocket
from redis.asyncio import Redis

from app.core.config import get_settings

logger = logging.getLogger(__name__)


class SupportHub:
    def __init__(self) -> None:
        self._customers: dict[int, set[WebSocket]] = {}
        self._staff: set[WebSocket] = set()
        self._lock = asyncio.Lock()
        self._redis: Redis | None = None
        self._listener_task: asyncio.Task | None = None

    async def startup(self) -> None:
        settings = get_settings()
        try:
            self._redis = Redis.from_url(settings.REDIS_URL, decode_responses=True)
            await self._redis.ping()
            self._listener_task = asyncio.create_task(self._listen_redis())
            logger.info("support hub started on channel=%s", settings.SUPPORT_REDIS_CHANNEL)
        except Exception:  # noqa: BLE001
            logger.exception("Redis unavailable — support hub runs local-only (single worker)")
            self._redis = None
            self._listener_task = None

    async def shutdown(self) -> None:
        if self._listener_task:
            self._listener_task.cancel()
            try:
                await self._listener_task
            except asyncio.CancelledError:
                pass
        if self._redis:
            await self._redis.aclose()
            self._redis = None

    async def connect_customer(self, user_id: int, websocket: WebSocket) -> None:
        await websocket.accept()
        async with self._lock:
            self._customers.setdefault(user_id, set()).add(websocket)

    async def connect_staff(self, websocket: WebSocket) -> None:
        await websocket.accept()
        async with self._lock:
            self._staff.add(websocket)

    async def disconnect(self, websocket: WebSocket, *, user_id: int | None = None) -> None:
        async with self._lock:
            if user_id is not None:
                sockets = self._customers.get(user_id)
                if sockets:
                    sockets.discard(websocket)
                    if not sockets:
                        self._customers.pop(user_id, None)
            self._staff.discard(websocket)

    async def publish(self, event: dict[str, Any]) -> None:
        """Publish to Redis so every FastAPI worker can push to its local sockets."""
        settings = get_settings()
        payload = json.dumps(event, default=str)
        if self._redis is None:
            await self._dispatch_local(event)
            return
        await self._redis.publish(settings.SUPPORT_REDIS_CHANNEL, payload)

    async def _listen_redis(self) -> None:
        assert self._redis is not None
        settings = get_settings()
        pubsub = self._redis.pubsub()
        await pubsub.subscribe(settings.SUPPORT_REDIS_CHANNEL)
        try:
            async for message in pubsub.listen():
                if message is None or message.get("type") != "message":
                    continue
                data = message.get("data")
                if not data:
                    continue
                try:
                    event = json.loads(data)
                except json.JSONDecodeError:
                    continue
                await self._dispatch_local(event)
        finally:
            await pubsub.unsubscribe(settings.SUPPORT_REDIS_CHANNEL)
            await pubsub.aclose()

    async def _dispatch_local(self, event: dict[str, Any]) -> None:
        customer_id = event.get("customer_id")
        dead: list[tuple[int | None, WebSocket]] = []

        async with self._lock:
            targets: list[WebSocket] = list(self._staff)
            if customer_id is not None:
                targets.extend(self._customers.get(int(customer_id), set()))

        text = json.dumps(event, default=str)
        for ws in targets:
            try:
                await ws.send_text(text)
            except Exception:  # noqa: BLE001
                dead.append((int(customer_id) if customer_id is not None else None, ws))

        for uid, ws in dead:
            await self.disconnect(ws, user_id=uid)


support_hub = SupportHub()
