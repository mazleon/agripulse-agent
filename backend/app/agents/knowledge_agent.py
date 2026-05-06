"""Knowledge Agent — LlamaIndex RAG node for the LangGraph pipeline."""

import logging

from app.agents.state import AgriState

logger = logging.getLogger(__name__)


async def knowledge_node(state: AgriState) -> dict:
    """Query the RAG index and return top passages."""
    try:
        from app.rag.index import get_query_engine

        engine = get_query_engine()

        # Build a context-enriched query
        query_parts = [state["user_message"]]
        sql_result = state.get("sql_result")
        if sql_result:
            if sql_result.get("crop_type"):
                query_parts.append(f"crop: {sql_result['crop_type']}")
            if sql_result.get("region"):
                query_parts.append(f"region: {sql_result['region']}")

        query = " | ".join(query_parts)
        response = engine.query(query)

        result_text = str(response).strip()
        logger.info("Knowledge agent returned %d chars", len(result_text))
        return {"knowledge_result": result_text if result_text else None}

    except Exception as exc:
        logger.error("Knowledge agent failed: %s", exc)
        return {"knowledge_result": None}
