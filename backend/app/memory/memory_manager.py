from app.memory.graphiti_client import FarmerMemory
from app.memory.redis_client import SessionMemory


class MemoryManager:
    """Unified interface for short-term (Redis) and long-term (Graphiti) memory."""

    def __init__(self, session_id: str, farmer_id: str | None = None) -> None:
        self.session = SessionMemory(session_id)
        self.farmer_id = farmer_id
        self._long_term = FarmerMemory(farmer_id, session_id) if farmer_id else None

    async def on_user_message(self, content: str) -> None:
        await self.session.add_message("user", content)

    async def on_assistant_response(self, content: str) -> None:
        await self.session.add_message("assistant", content)
        if self._long_term:
            messages = await self.session.get_messages()
            if len(messages) >= 2:
                last_user = messages[-2]["content"]
                await self._long_term.add_episode(last_user, content)

    async def get_short_term_messages(self) -> list[dict]:
        return await self.session.get_messages()

    async def get_long_term_context(self, query: str) -> str:
        if not self._long_term:
            return ""
        return await self._long_term.get_context_string(query)

    async def get_full_context(self, current_query: str) -> dict:
        short_term = await self.get_short_term_messages()
        long_term_ctx = await self.get_long_term_context(current_query)
        return {
            "messages": short_term,
            "long_term_context": long_term_ctx,
        }
