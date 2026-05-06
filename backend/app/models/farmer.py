import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Farmer(Base):
    __tablename__ = "farmers"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phone: Mapped[str] = mapped_column(String(20), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    region: Mapped[str | None] = mapped_column(String(100))  # district name
    lat: Mapped[float | None] = mapped_column(Float)
    lon: Mapped[float | None] = mapped_column(Float)
    language_preference: Mapped[str] = mapped_column(String(5), default="bn")
    firebase_token: Mapped[str | None] = mapped_column(String(500))
    hashed_password: Mapped[str | None] = mapped_column(String(200))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    crops: Mapped[list["Crop"]] = relationship("Crop", back_populates="farmer", lazy="selectin")  # noqa: F821
    alerts: Mapped[list["Alert"]] = relationship("Alert", back_populates="farmer", lazy="selectin")  # noqa: F821
    bookings: Mapped[list["Booking"]] = relationship(
        "Booking", back_populates="farmer", lazy="selectin"
    )  # noqa: F821
