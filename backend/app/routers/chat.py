"""Chat router — WebSocket (streaming) + REST fallback."""
import base64
import json
import logging
import uuid

from fastapi import APIRouter, Query, UploadFile, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

from app.agents.orchestrator import graph
from app.agents.state import AgriState
from app.memory.memory_manager import MemoryManager

logger = logging.getLogger(__name__)
router = APIRouter()


# ── REST: single-turn (useful for testing / simple clients) ──────────────────

class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None
    farmer_id: str | None = None
    image_base64: str | None = None


class ChatResponse(BaseModel):
    session_id: str
    response: str
    agent_used: str | None = None


@router.post("/chat", response_model=ChatResponse, tags=["chat"])
async def chat_rest(body: ChatRequest) -> ChatResponse:
    session_id = body.session_id or str(uuid.uuid4())
    memory = MemoryManager(session_id=session_id, farmer_id=body.farmer_id)

    await memory.on_user_message(body.message)
    ctx = await memory.get_full_context(body.message)

    initial_state: AgriState = {
        "messages": [{"role": "user", "content": body.message}],
        "session_id": session_id,
        "farmer_id": body.farmer_id,
        "user_message": body.message,
        "image_base64": body.image_base64,
        "intent": None,
        "knowledge_result": None,
        "sql_result": None,
        "vision_result": None,
        "weather_result": None,
        "long_term_context": ctx["long_term_context"],
        "final_response": None,
        "agent_used": None,
    }

    result = await graph.ainvoke(initial_state)
    response_text = result.get("final_response") or "দুঃখিত, উত্তর দেওয়া সম্ভব হচ্ছে না।"

    await memory.on_assistant_response(response_text)

    return ChatResponse(
        session_id=session_id,
        response=response_text,
        agent_used=result.get("agent_used"),
    )


# ── WebSocket: streaming ──────────────────────────────────────────────────────

@router.websocket("/ws/chat")
async def chat_websocket(
    websocket: WebSocket,
    session_id: str = Query(default_factory=lambda: str(uuid.uuid4())),
    farmer_id: str | None = Query(default=None),
) -> None:
    await websocket.accept()
    memory = MemoryManager(session_id=session_id, farmer_id=farmer_id)
    logger.info("WebSocket connected: session=%s farmer=%s", session_id, farmer_id)

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                data = {"message": raw}

            user_message: str = data.get("message", "").strip()
            image_base64: str | None = data.get("image_base64")

            if not user_message and not image_base64:
                continue

            await memory.on_user_message(user_message or "[image]")
            ctx = await memory.get_full_context(user_message)

            initial_state: AgriState = {
                "messages": [{"role": "user", "content": user_message}],
                "session_id": session_id,
                "farmer_id": farmer_id,
                "user_message": user_message,
                "image_base64": image_base64,
                "intent": None,
                "knowledge_result": None,
                "sql_result": None,
                "vision_result": None,
                "weather_result": None,
                "long_term_context": ctx["long_term_context"],
                "final_response": None,
                "agent_used": None,
            }

            # Stream tokens as they arrive
            async for chunk in graph.astream(initial_state, stream_mode="values"):
                if chunk.get("final_response"):
                    await websocket.send_json({
                        "type": "token",
                        "content": chunk["final_response"],
                        "agent_used": chunk.get("agent_used"),
                        "done": True,
                    })
                    await memory.on_assistant_response(chunk["final_response"])
                    break
                elif chunk.get("intent"):
                    await websocket.send_json({
                        "type": "status",
                        "content": chunk["intent"],
                    })

    except WebSocketDisconnect:
        logger.info("WebSocket disconnected: session=%s", session_id)


# ── Image upload helper ───────────────────────────────────────────────────────

@router.post("/chat/upload-image", tags=["chat"])
async def upload_image(file: UploadFile) -> dict:
    """Convert uploaded image to base64 for use in chat requests."""
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:  # 10 MB limit
        return {"error": "Image too large (max 10 MB)"}
    b64 = base64.b64encode(content).decode("utf-8")
    media_type = file.content_type or "image/jpeg"
    return {"image_base64": f"data:{media_type};base64,{b64}"}
