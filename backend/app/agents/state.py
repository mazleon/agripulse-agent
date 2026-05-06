from typing import Annotated, Any
from typing_extensions import TypedDict
from langgraph.graph.message import add_messages


class AgriState(TypedDict):
    """Central state object flowing through the LangGraph agent graph."""

    # ── Conversation ─────────────────────────────────────────────────────────
    messages: Annotated[list, add_messages]   # full chat history (user + assistant)
    session_id: str
    farmer_id: str | None

    # ── Current turn inputs ───────────────────────────────────────────────────
    user_message: str
    image_base64: str | None                  # optional uploaded image

    # ── Routing ───────────────────────────────────────────────────────────────
    intent: str | None                        # classified intent for this turn
    # pest_detection | weather_query | irrigation_advice | booking | general

    # ── Agent outputs (accumulated per turn) ──────────────────────────────────
    knowledge_result: str | None              # RAG passages
    sql_result: dict[str, Any] | None         # farmer profile + crop data
    vision_result: dict[str, Any] | None      # disease detection output
    weather_result: dict[str, Any] | None     # weather risk object
    long_term_context: str | None             # Graphiti facts for this farmer

    # ── Final response ────────────────────────────────────────────────────────
    final_response: str | None                # Bangla response ready to send
    agent_used: str | None                    # which specialist agent(s) ran
