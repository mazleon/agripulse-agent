"""
LangGraph orchestrator — the brain of AgriPulse.

Graph flow:
  classify_intent
       ↓
    route  ──────────────────────────────────────────────────────┐
     ├── pest_detection   → [vision_node, knowledge_node, sql_node]  (parallel)
     ├── livestock_detection → [vision_node, knowledge_node]
     ├── weather_query    → [weather_node, sql_node]
     ├── irrigation_advice → [weather_node, knowledge_node, sql_node]
     ├── booking          → action_node
     └── general          → [knowledge_node, sql_node]
       ↓
  synthesize
       ↓
  safety_check
       ↓
    END
"""

import logging
from typing import Literal

from langchain_core.messages import AIMessage, HumanMessage
from langgraph.graph import END, StateGraph

from app.agents.knowledge_agent import knowledge_node
from app.agents.prompts import (
    INTENT_CLASSIFIER_PROMPT,
    SYNTHESIS_PROMPT,
)
from app.agents.sql_agent import sql_node
from app.agents.state import AgriState
from app.config import get_llm
from app.utils.safety import apply_safety

logger = logging.getLogger(__name__)

Intent = Literal[
    "pest_detection",
    "livestock_detection",
    "weather_query",
    "irrigation_advice",
    "booking",
    "general",
]

VALID_INTENTS = {
    "pest_detection",
    "livestock_detection",
    "weather_query",
    "irrigation_advice",
    "booking",
    "general",
}


# ── Node: classify intent ─────────────────────────────────────────────────────


async def classify_intent(state: AgriState) -> dict:
    llm = get_llm(fast=True)
    prompt = INTENT_CLASSIFIER_PROMPT.format(message=state["user_message"])
    response = await llm.ainvoke([HumanMessage(content=prompt)])
    raw = response.content.strip().lower()
    intent = raw if raw in VALID_INTENTS else "general"
    logger.info("Intent classified: %s", intent)
    return {"intent": intent}


# ── Router ────────────────────────────────────────────────────────────────────


def route(state: AgriState) -> list[str]:
    """Return the list of nodes to run next (parallel fan-out)."""
    intent = state.get("intent") or "general"
    routes = {
        "pest_detection": ["vision_node", "knowledge_node", "sql_node"],
        "livestock_detection": ["vision_node", "knowledge_node"],
        "weather_query": ["weather_node", "sql_node"],
        "irrigation_advice": ["weather_node", "knowledge_node", "sql_node"],
        "booking": ["action_node"],
        "general": ["knowledge_node", "sql_node"],
    }
    return routes.get(intent, ["knowledge_node"])


# ── Node: synthesize response ─────────────────────────────────────────────────


async def synthesize(state: AgriState) -> dict:
    llm = get_llm(fast=False)

    def _section(label: str, value: str | dict | None) -> str:
        if not value:
            return ""
        text = value if isinstance(value, str) else str(value)
        return f"\n[{label}]\n{text}\n"

    prompt = SYNTHESIS_PROMPT.format(
        user_message=state["user_message"],
        long_term_context=_section("দীর্ঘমেয়াদি স্মৃতি", state.get("long_term_context")),
        knowledge_result=_section("কৃষি জ্ঞান", state.get("knowledge_result")),
        sql_context=_section("আপনার তথ্য", state.get("sql_result")),
        vision_result=_section("ছবি বিশ্লেষণ", state.get("vision_result")),
        weather_result=_section("আবহাওয়া", state.get("weather_result")),
    )

    response = await llm.ainvoke([HumanMessage(content=prompt)])
    raw_text = response.content.strip()

    agents_used = [
        k
        for k, v in {
            "knowledge": state.get("knowledge_result"),
            "vision": state.get("vision_result"),
            "weather": state.get("weather_result"),
            "sql": state.get("sql_result"),
        }.items()
        if v
    ]

    return {
        "final_response": raw_text,
        "agent_used": ",".join(agents_used) or "general",
        "messages": [AIMessage(content=raw_text)],
    }


# ── Node: safety check ────────────────────────────────────────────────────────


async def safety_check(state: AgriState) -> dict:
    safe_response = await apply_safety(state["final_response"] or "")
    return {"final_response": safe_response}


# ── Placeholder nodes (implemented in Phase 2–3) ──────────────────────────────


async def vision_node(state: AgriState) -> dict:
    """Placeholder — implemented in Phase 2."""
    return {"vision_result": None}


async def weather_node(state: AgriState) -> dict:
    """Placeholder — implemented in Phase 2."""
    return {"weather_result": None}


async def action_node(state: AgriState) -> dict:
    """Placeholder — implemented in Phase 3."""
    return {"knowledge_result": "বুকিং সিস্টেম শীঘ্রই চালু হবে।"}


# ── Build the graph ───────────────────────────────────────────────────────────


def build_graph() -> StateGraph:
    g = StateGraph(AgriState)

    g.add_node("classify_intent", classify_intent)
    g.add_node("knowledge_node", knowledge_node)
    g.add_node("sql_node", sql_node)
    g.add_node("vision_node", vision_node)
    g.add_node("weather_node", weather_node)
    g.add_node("action_node", action_node)
    g.add_node("synthesize", synthesize)
    g.add_node("safety_check", safety_check)

    g.set_entry_point("classify_intent")

    # After classification, fan out to specialist nodes
    g.add_conditional_edges(
        "classify_intent",
        route,
        {
            "knowledge_node": "knowledge_node",
            "sql_node": "sql_node",
            "vision_node": "vision_node",
            "weather_node": "weather_node",
            "action_node": "action_node",
        },
    )

    # All specialist nodes converge at synthesize
    for node in ["knowledge_node", "sql_node", "vision_node", "weather_node", "action_node"]:
        g.add_edge(node, "synthesize")

    g.add_edge("synthesize", "safety_check")
    g.add_edge("safety_check", END)

    return g


# Compiled graph — import this in routers
graph = build_graph().compile()
