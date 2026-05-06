"""Unit tests for MemoryManager."""
from unittest.mock import AsyncMock, patch

import pytest


class TestSessionMemory:
    @pytest.mark.asyncio
    async def test_add_and_get_messages(self):
        with patch("app.memory.redis_client.get_redis") as mock_get:
            mock_redis = AsyncMock()
            mock_redis.rpush = AsyncMock(return_value=1)
            mock_redis.ltrim = AsyncMock()
            mock_redis.expire = AsyncMock()
            mock_redis.lrange = AsyncMock(return_value=[
                '{"role": "user", "content": "পাতায় দাগ"}',
                '{"role": "assistant", "content": "ব্লাস্ট রোগ হয়েছে।"}',
            ])
            mock_get.return_value = mock_redis

            from app.memory.redis_client import SessionMemory
            mem = SessionMemory("test-session")
            await mem.add_message("user", "পাতায় দাগ")
            messages = await mem.get_messages()

        assert len(messages) == 2
        assert messages[0]["role"] == "user"
        assert messages[1]["role"] == "assistant"

    @pytest.mark.asyncio
    async def test_clear_deletes_key(self):
        with patch("app.memory.redis_client.get_redis") as mock_get:
            mock_redis = AsyncMock()
            mock_redis.delete = AsyncMock()
            mock_get.return_value = mock_redis

            from app.memory.redis_client import SessionMemory
            mem = SessionMemory("test-session")
            await mem.clear()

            mock_redis.delete.assert_called_once()


class TestMemoryManager:
    @pytest.mark.asyncio
    async def test_no_farmer_id_skips_graphiti(self):
        with patch("app.memory.redis_client.get_redis") as mock_redis_get:
            mock_r = AsyncMock()
            mock_r.lrange = AsyncMock(return_value=[])
            mock_r.rpush = AsyncMock()
            mock_r.ltrim = AsyncMock()
            mock_r.expire = AsyncMock()
            mock_redis_get.return_value = mock_r

            from app.memory.memory_manager import MemoryManager
            manager = MemoryManager(session_id="s1", farmer_id=None)
            ctx = await manager.get_long_term_context("test query")
            assert ctx == ""
