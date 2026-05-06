import logging
from datetime import datetime, timezone

from graphiti_core import Graphiti
from graphiti_core.nodes import EpisodeType

from app.config import settings

logger = logging.getLogger(__name__)

_graphiti: Graphiti | None = None


async def get_graphiti() -> Graphiti:
    global _graphiti
    if _graphiti is None:
        _graphiti = Graphiti(
            settings.NEO4J_URI,
            settings.NEO4J_USER,
            settings.NEO4J_PASSWORD,
        )
        await _graphiti.build_indices_and_constraints()
        logger.info("Graphiti initialized (uri=%s)", settings.NEO4J_URI)
    return _graphiti


async def close_graphiti() -> None:
    global _graphiti
    if _graphiti is not None:
        await _graphiti.close()
        _graphiti = None


class FarmerMemory:
    """Long-term episodic memory per farmer, backed by Graphiti knowledge graph."""

    def __init__(self, farmer_id: str, session_id: str) -> None:
        self.farmer_id = farmer_id
        self.session_id = session_id

    async def add_episode(self, user_message: str, assistant_response: str) -> None:
        g = await get_graphiti()
        episode_body = f"Farmer: {user_message}\nAssistant: {assistant_response}"
        await g.add_episode(
            name=f"session_{self.session_id}",
            episode_body=episode_body,
            source=EpisodeType.message,
            source_description=f"Chat session for farmer {self.farmer_id}",
            reference_time=datetime.now(timezone.utc),
            group_id=self.farmer_id,
        )

    async def search(self, query: str, limit: int = 5) -> list[dict]:
        g = await get_graphiti()
        results = await g.search(query, group_ids=[self.farmer_id], num_results=limit)
        return [
            {
                "fact": r.fact,
                "score": r.score,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in results
        ]

    async def get_context_string(self, query: str) -> str:
        facts = await self.search(query)
        if not facts:
            return ""
        lines = ["[দীর্ঘমেয়াদি স্মৃতি থেকে প্রাসঙ্গিক তথ্য:]"]
        for f in facts:
            lines.append(f"• {f['fact']}")
        return "\n".join(lines)
