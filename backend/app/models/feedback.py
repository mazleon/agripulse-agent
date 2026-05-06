import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Feedback(Base):
    __tablename__ = "feedback"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    message_id: Mapped[str] = mapped_column(String(100), nullable=False)
    farmer_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("farmers.id", ondelete="SET NULL"), nullable=True
    )
    rating: Mapped[str] = mapped_column(String(20), nullable=False)  # thumbs_up / thumbs_down
    correction: Mapped[str | None] = mapped_column(Text)
    agent_used: Mapped[str | None] = mapped_column(String(50))  # knowledge / vision / weather ...
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    farmer: Mapped["Farmer | None"] = relationship("Farmer")  # noqa: F821
    correction_record: Mapped["Correction | None"] = relationship(  # noqa: F821
        "Correction", back_populates="feedback", uselist=False
    )


class Correction(Base):
    __tablename__ = "corrections"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    feedback_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("feedback.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    original_response: Mapped[str] = mapped_column(Text, nullable=False)
    corrected_response: Mapped[str] = mapped_column(Text, nullable=False)
    is_processed: Mapped[bool] = mapped_column(Boolean, default=False)  # for prompt-tuning pipeline
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    feedback: Mapped["Feedback"] = relationship("Feedback", back_populates="correction_record")
