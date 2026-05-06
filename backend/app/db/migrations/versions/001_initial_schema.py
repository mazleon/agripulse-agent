"""Initial schema: farmers, crops, alerts, bookings, feedback, corrections

Revision ID: 001
Revises:
Create Date: 2026-05-06
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── farmers ──────────────────────────────────────────────────────────────
    op.create_table(
        "farmers",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("phone", sa.String(20), nullable=False, unique=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("region", sa.String(100)),
        sa.Column("lat", sa.Float),
        sa.Column("lon", sa.Float),
        sa.Column("language_preference", sa.String(5), nullable=False, server_default="bn"),
        sa.Column("firebase_token", sa.String(500)),
        sa.Column("hashed_password", sa.String(200)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_farmers_phone", "farmers", ["phone"])

    # ── crops ─────────────────────────────────────────────────────────────────
    op.create_table(
        "crops",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "farmer_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("farmers.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("crop_type", sa.String(100), nullable=False),
        sa.Column("crop_name_bn", sa.String(200)),
        sa.Column("land_size_acres", sa.Float),
        sa.Column("soil_type", sa.String(50)),
        sa.Column("planting_date", sa.Date),
        sa.Column("expected_harvest_date", sa.Date),
        sa.Column("status", sa.String(20), nullable=False, server_default="active"),
        sa.Column("notes", sa.String(1000)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_crops_farmer_id", "crops", ["farmer_id"])

    # ── alerts ────────────────────────────────────────────────────────────────
    op.create_table(
        "alerts",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "farmer_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("farmers.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("alert_type", sa.String(50), nullable=False),
        sa.Column("severity", sa.String(20), nullable=False, server_default="medium"),
        sa.Column("title_bn", sa.String(500), nullable=False),
        sa.Column("body_bn", sa.Text, nullable=False),
        sa.Column("affected_crop", sa.String(100)),
        sa.Column("region", sa.String(100)),
        sa.Column("sent_at", sa.DateTime(timezone=True)),
        sa.Column("is_read", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_alerts_farmer_id", "alerts", ["farmer_id"])

    # ── bookings ──────────────────────────────────────────────────────────────
    op.create_table(
        "bookings",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "farmer_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("farmers.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("expert_name", sa.String(200), nullable=False),
        sa.Column("expert_type", sa.String(50), nullable=False),
        sa.Column("expert_phone", sa.String(20)),
        sa.Column("slot_datetime", sa.DateTime(timezone=True), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("notes", sa.Text),
        sa.Column("confirmation_sent", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_bookings_farmer_id", "bookings", ["farmer_id"])

    # ── feedback ──────────────────────────────────────────────────────────────
    op.create_table(
        "feedback",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("session_id", sa.String(100), nullable=False),
        sa.Column("message_id", sa.String(100), nullable=False),
        sa.Column(
            "farmer_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("farmers.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("rating", sa.String(20), nullable=False),
        sa.Column("correction", sa.Text),
        sa.Column("agent_used", sa.String(50)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_feedback_session_id", "feedback", ["session_id"])

    # ── corrections ───────────────────────────────────────────────────────────
    op.create_table(
        "corrections",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "feedback_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("feedback.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("original_response", sa.Text, nullable=False),
        sa.Column("corrected_response", sa.Text, nullable=False),
        sa.Column("is_processed", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_corrections_feedback_id", "corrections", ["feedback_id"])
    op.create_index("ix_corrections_is_processed", "corrections", ["is_processed"])


def downgrade() -> None:
    op.drop_table("corrections")
    op.drop_table("feedback")
    op.drop_table("bookings")
    op.drop_table("alerts")
    op.drop_table("crops")
    op.drop_table("farmers")
