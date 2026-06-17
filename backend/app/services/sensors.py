"""TerraVista — IoT sensor store.

Holds readings posted by the ESP32 field station. Each reading is scored by the
ML model on arrival so the latest territorial-risk verdict is always available
to the dashboards.

Persistence is pluggable:
  * Supabase (Postgres) when credentials are configured — survives restarts.
  * In-memory ring buffer (deque) otherwise — the demo still works offline.

Author: Gabriel Mule (RM 560586)
"""

from __future__ import annotations

from collections import deque
from datetime import datetime, timezone
from typing import Any

from app.config import settings
from app.services import db, model

MAX_READINGS = 100
_store: deque[dict[str, Any]] = deque(maxlen=MAX_READINGS)

# Features the model needs (subset of the reading payload).
_MODEL_FEATURES = [
    "air_temperature",
    "air_humidity",
    "soil_moisture",
    "solar_radiation",
    "ndvi",
    "days_since_rain",
    "wind_speed",
]

# Reading fields persisted as flat columns in Supabase.
_READING_FIELDS = _MODEL_FEATURES + ["device_id"]


def _score(reading: dict[str, Any]) -> dict[str, Any]:
    """Build a stored record (reading + verdict + timestamp) from a raw reading."""
    features = {k: float(reading[k]) for k in _MODEL_FEATURES}
    verdict = model.predict(features)
    return {
        "reading": reading,
        "risk_class": verdict["risk_class"],
        "risk_label": verdict["risk_label"],
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


def _record_to_row(record: dict[str, Any]) -> dict[str, Any]:
    """Flatten a record into a Supabase table row."""
    reading = record["reading"]
    row = {k: reading.get(k) for k in _READING_FIELDS}
    row["risk_class"] = record["risk_class"]
    row["risk_label"] = record["risk_label"]
    row["timestamp"] = record["timestamp"]
    return row


def _row_to_record(row: dict[str, Any]) -> dict[str, Any]:
    """Rebuild the nested record shape from a Supabase table row."""
    return {
        "reading": {k: row[k] for k in _READING_FIELDS if k in row},
        "risk_class": row["risk_class"],
        "risk_label": row["risk_label"],
        "timestamp": row["timestamp"],
    }


def add_reading(reading: dict[str, Any]) -> dict[str, Any]:
    """Score a sensor reading with the model and store the enriched record."""
    record = _score(reading)

    client = db.get_client()
    if client is not None:
        client.table(settings.supabase_table).insert(_record_to_row(record)).execute()
    else:
        _store.append(record)

    return record


def list_readings(limit: int = 50) -> list[dict[str, Any]]:
    """Return the most recent readings (newest last)."""
    client = db.get_client()
    if client is not None:
        resp = (
            client.table(settings.supabase_table)
            .select("*")
            .order("timestamp", desc=True)
            .limit(limit)
            .execute()
        )
        rows = list(reversed(resp.data or []))
        return [_row_to_record(r) for r in rows]

    items = list(_store)
    return items[-limit:]


def latest() -> dict[str, Any] | None:
    """Return the most recent record, or None if the store is empty."""
    client = db.get_client()
    if client is not None:
        resp = (
            client.table(settings.supabase_table)
            .select("*")
            .order("timestamp", desc=True)
            .limit(1)
            .execute()
        )
        rows = resp.data or []
        return _row_to_record(rows[0]) if rows else None

    return _store[-1] if _store else None


def count() -> int:
    client = db.get_client()
    if client is not None:
        resp = (
            client.table(settings.supabase_table)
            .select("id", count="exact")
            .execute()
        )
        return resp.count or 0

    return len(_store)
