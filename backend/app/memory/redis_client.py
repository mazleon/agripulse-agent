import json
import logging
from typing import Any

import redis.asyncio as aioredis

from app.config import settings

logger = logging.getLogger(__name__)

_redis: aioredis.Redis | None = None


async def get_redis() -> aioredis.Redis:
    global _redis
    if _redis is None:
        _redis = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
        )
    return _redis


async def close_redis() -> None:
    global _redis
    if _redis is not None:
        await _redis.aclose()
        _redis = None


class SessionMemory:
    """Short-term per-session chat memory backed by Redis."""

    MAX_MESSAGES = 20

    def __init__(self, session_id: str) -> None:
        self.session_id = session_id
        self._key = f"session:{session_id}:messages"
        self._ttl = settings.REDIS_SESSION_TTL_SECONDS

    async def add_message(self, role: str, content: str) -> None:
        r = await get_redis()
        message = json.dumps({"role": role, "content": content})
        await r.rpush(self._key, message)
        # Trim to last MAX_MESSAGES
        await r.ltrim(self._key, -self.MAX_MESSAGES, -1)
        await r.expire(self._key, self._ttl)

    async def get_messages(self) -> list[dict[str, Any]]:
        r = await get_redis()
        raw = await r.lrange(self._key, 0, -1)
        return [json.loads(m) for m in raw]

    async def clear(self) -> None:
        r = await get_redis()
        await r.delete(self._key)

    async def refresh_ttl(self) -> None:
        r = await get_redis()
        await r.expire(self._key, self._ttl)
