"""Feedback router — capture 👍/👎 ratings and text corrections per message."""

import logging
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, field_validator
from sqlalchemy import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.models.feedback import Correction, Feedback

logger = logging.getLogger(__name__)
router = APIRouter()

_VALID_RATINGS = {"thumbs_up", "thumbs_down"}


class FeedbackRequest(BaseModel):
    session_id: str
    message_id: str
    rating: str  # "thumbs_up" | "thumbs_down"
    farmer_id: str | None = None
    correction: str | None = None  # farmer's corrected text
    original_response: str | None = None  # original assistant response (required with correction)
    agent_used: str | None = None

    @field_validator("rating")
    @classmethod
    def validate_rating(cls, v: str) -> str:
        if v not in _VALID_RATINGS:
            raise ValueError(f"rating must be one of {_VALID_RATINGS}")
        return v


class FeedbackResponse(BaseModel):
    id: str
    status: str


@router.post("/feedback", response_model=FeedbackResponse, tags=["feedback"])
async def submit_feedback(
    body: FeedbackRequest,
    db: AsyncSession = Depends(get_db),
) -> FeedbackResponse:
    farmer_uuid: uuid.UUID | None = None
    if body.farmer_id:
        try:
            farmer_uuid = uuid.UUID(body.farmer_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="farmer_id must be a valid UUID",
            ) from None

    feedback_id = uuid.uuid4()

    await db.execute(
        insert(Feedback).values(
            id=feedback_id,
            session_id=body.session_id,
            message_id=body.message_id,
            farmer_id=farmer_uuid,
            rating=body.rating,
            correction=body.correction,
            agent_used=body.agent_used,
        )
    )

    # When a thumbs-down carries a correction, persist it for the prompt-tuning pipeline
    if body.rating == "thumbs_down" and body.correction and body.original_response:
        await db.execute(
            insert(Correction).values(
                id=uuid.uuid4(),
                feedback_id=feedback_id,
                original_response=body.original_response,
                corrected_response=body.correction,
            )
        )

    await db.commit()

    logger.info(
        "Feedback recorded: session=%s rating=%s agent=%s",
        body.session_id,
        body.rating,
        body.agent_used,
    )
    return FeedbackResponse(id=str(feedback_id), status="ok")
