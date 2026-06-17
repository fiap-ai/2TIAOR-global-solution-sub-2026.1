"""TerraVista — Sensors router (IoT field station).

Ingests readings posted by the ESP32 station, scores each with the ML model and
keeps the last N in memory so the dashboards can show a live risk timeline.

Author: Gabriel Mule (RM 560586)
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query, status

from app.logging_config import get_logger
from app.schemas import SensorListResponse, SensorReading, SensorRecord
from app.services import sensors

router = APIRouter(prefix="/sensors", tags=["sensors"])
log = get_logger()


@router.post("/readings", response_model=SensorRecord, status_code=status.HTTP_201_CREATED)
def post_reading(reading: SensorReading) -> SensorRecord:
    """Store an ESP32 reading enriched with the model's risk verdict."""
    record = sensors.add_reading(reading.model_dump())
    log.info(
        "sensor reading from '%s' → %s | total stored=%d",
        reading.device_id,
        record["risk_label"],
        sensors.count(),
    )
    return SensorRecord(**record)


@router.get("/readings", response_model=SensorListResponse)
def get_readings(limit: int = Query(default=50, ge=1, le=100)) -> SensorListResponse:
    """List the most recent readings (newest last)."""
    items = sensors.list_readings(limit=limit)
    return SensorListResponse(count=len(items), records=[SensorRecord(**r) for r in items])


@router.get("/latest", response_model=SensorRecord)
def get_latest() -> SensorRecord:
    """Return the most recent reading, or 404 if none have been posted yet."""
    record = sensors.latest()
    if record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No sensor readings yet.",
        )
    return SensorRecord(**record)
