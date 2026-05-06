import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farmer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("farmers.id", ondelete="CASCADE"), nullable=False, index=True
    )
    expert_name: Mapped[str] = mapped_column(String(200), nullable=False)
    expert_type: Mapped[str] = mapped_column(String(50), nullable=False)  # agri_specialist / vet
    expert_phone: Mapped[str | None] = mapped_column(String(20))
    slot_datetime: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending")   # pending / confirmed / cancelled
    notes: Mapped[str | None] = mapped_column(Text)
    confirmation_sent: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    farmer: Mapped["Farmer"] = relationship("Farmer", back_populates="bookings")  # noqa: F821
