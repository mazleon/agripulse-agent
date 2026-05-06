"""Unit tests for intent classification logic."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.agents.orchestrator import VALID_INTENTS, classify_intent, route
from app.agents.state import AgriState


def make_state(message: str) -> AgriState:
    return {
        "messages": [],
        "session_id": "test-session",
        "farmer_id": None,
        "user_message": message,
        "image_base64": None,
        "intent": None,
        "knowledge_result": None,
        "sql_result": None,
        "vision_result": None,
        "weather_result": None,
        "long_term_context": None,
        "final_response": None,
        "agent_used": None,
    }


class TestIntentClassifier:
    @pytest.mark.asyncio
    async def test_valid_intent_returned(self):
        state = make_state("পাতায় দাগ পড়ছে")
        mock_llm = AsyncMock()
        mock_llm.ainvoke.return_value = MagicMock(content="pest_detection")

        with patch("app.agents.orchestrator.get_llm", return_value=mock_llm):
            result = await classify_intent(state)

        assert result["intent"] == "pest_detection"
        assert result["intent"] in VALID_INTENTS

    @pytest.mark.asyncio
    async def test_unknown_intent_falls_back_to_general(self):
        state = make_state("hello world")
        mock_llm = AsyncMock()
        mock_llm.ainvoke.return_value = MagicMock(content="unknown_nonsense")

        with patch("app.agents.orchestrator.get_llm", return_value=mock_llm):
            result = await classify_intent(state)

        assert result["intent"] == "general"

    @pytest.mark.asyncio
    async def test_strips_whitespace_from_llm_output(self):
        state = make_state("আজ বৃষ্টি হবে?")
        mock_llm = AsyncMock()
        mock_llm.ainvoke.return_value = MagicMock(content="  weather_query  \n")

        with patch("app.agents.orchestrator.get_llm", return_value=mock_llm):
            result = await classify_intent(state)

        assert result["intent"] == "weather_query"


class TestRouter:
    def test_pest_detection_routes_to_vision_knowledge_sql(self):
        state = make_state("")
        state["intent"] = "pest_detection"
        nodes = route(state)
        assert "vision_node" in nodes
        assert "knowledge_node" in nodes
        assert "sql_node" in nodes

    def test_weather_query_routes_to_weather_and_sql(self):
        state = make_state("")
        state["intent"] = "weather_query"
        nodes = route(state)
        assert "weather_node" in nodes
        assert "sql_node" in nodes

    def test_booking_routes_to_action_only(self):
        state = make_state("")
        state["intent"] = "booking"
        nodes = route(state)
        assert nodes == ["action_node"]

    def test_general_routes_to_knowledge_and_sql(self):
        state = make_state("")
        state["intent"] = "general"
        nodes = route(state)
        assert "knowledge_node" in nodes
        assert "sql_node" in nodes
