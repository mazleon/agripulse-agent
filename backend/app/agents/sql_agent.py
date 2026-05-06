"""SQL Agent — fetches structured farmer data for the LangGraph pipeline."""
import logging
import uuid

from sqlalchemy import select

from app.agents.state import AgriState
from app.db.database import AsyncSessionLocal
from app.models.crop import Crop
from app.models.farmer import Farmer

logger = logging.getLogger(__name__)


async def _get_farmer_profile(farmer_id: str) -> dict | None:
    try:
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(Farmer).where(Farmer.id == uuid.UUID(farmer_id))
            )
            farmer = result.scalar_one_or_none()
            if not farmer:
                return None
            return {
                "name": farmer.name,
                "region": farmer.region,
                "lat": farmer.lat,
                "lon": farmer.lon,
                "language_preference": farmer.language_preference,
            }
    except Exception as exc:
        logger.error("Failed to fetch farmer profile: %s", exc)
        return None


async def _get_active_crops(farmer_id: str) -> list[dict]:
    try:
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(Crop).where(
                    Crop.farmer_id == uuid.UUID(farmer_id),
                    Crop.status == "active",
                )
            )
            crops = result.scalars().all()
            return [
                {
                    "crop_type": c.crop_type,
                    "crop_name_bn": c.crop_name_bn,
                    "land_size_acres": c.land_size_acres,
                    "soil_type": c.soil_type,
                    "planting_date": c.planting_date.isoformat() if c.planting_date else None,
                }
                for c in crops
            ]
    except Exception as exc:
        logger.error("Failed to fetch crops: %s", exc)
        return []


async def sql_node(state: AgriState) -> dict:
    """Load farmer profile + active crops; return as structured dict."""
    farmer_id = state.get("farmer_id")
    if not farmer_id:
        return {"sql_result": None}

    profile = await _get_farmer_profile(farmer_id)
    crops = await _get_active_crops(farmer_id)

    if not profile:
        return {"sql_result": None}

    return {
        "sql_result": {
            **profile,
            "crops": crops,
            "crop_type": crops[0]["crop_type"] if crops else None,
        }
    }
