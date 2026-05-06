import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Float, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Crop(Base):
    __tablename__ = "crops"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farmer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("farmers.id", ondelete="CASCADE"), nullable=False, index=True
    )
    crop_type: Mapped[str] = mapped_column(String(100), nullable=False)  # rice, wheat, jute...
    crop_name_bn: Mapped[str | None] = mapped_column(String(200))        # Bangla name
    land_size_acres: Mapped[float | None] = mapped_column(Float)
    soil_type: Mapped[str | None] = mapped_column(String(50))            # clay, loam, sandy
    planting_date: Mapped[date | None] = mapped_column(Date)
    expected_harvest_date: Mapped[date | None] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(20), default="active")   # active / harvested / failed
    notes: Mapped[str | None] = mapped_column(String(1000))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    farmer: Mapped["Farmer"] = relationship("Farmer", back_populates="crops")  # noqa: F821
