"""TerraVista — Supabase seed script.

Simulates a single field station over a ~3-day drying spell: a continuous,
realistic time series where the parcel slowly dries out — day/night cycles in
temperature and solar radiation, falling humidity/soil-moisture/NDVI — so the
risk verdict drifts naturally HEALTHY → ATTENTION → CRITICAL (no artificial
jumps). Each reading is scored by the ML model and inserted into Supabase.

Usage (from repo root, with backend/.env filled in):
    backend/.venv/bin/python backend/seed_data.py

Requires SUPABASE_URL + SUPABASE_SERVICE_KEY in backend/.env. If they are empty
the script aborts (there is nothing to persist to).

Author: Gabriel Mule (RM 560586)
"""

from __future__ import annotations

import math
import random
import sys
from collections import Counter
from datetime import datetime, timedelta, timezone

from app.config import settings
from app.services import db, model

random.seed(7)

N_READINGS = 48          # 48 samples...
STEP_HOURS = 1.5         # ...1.5h apart -> a 3-day window
DRY_START, DRY_END = 0.06, 0.90  # how far into the drying spell the window spans
DEVICE_ID = "esp32-terravista-01"


def _diurnal(hour: float, lo: float, hi: float) -> float:
    """Day/night cycle: peaks ~14h, troughs ~3h."""
    frac = (math.sin((hour - 8.0) / 24.0 * 2 * math.pi) + 1) / 2
    return lo + (hi - lo) * frac


def _drying_curve(t: float) -> float:
    """Map 0..1 with a slower mid-window slope so the parcel lingers in ATTENTION."""
    return t + 0.6 * math.sin(2 * math.pi * t) / (2 * math.pi)


def _reading_at(i: int) -> dict[str, float]:
    """Build one realistic reading at step i of the drying time series."""
    p = DRY_START + (DRY_END - DRY_START) * _drying_curve(i / (N_READINGS - 1))
    hour = (i * STEP_HOURS) % 24
    jit = lambda s: random.uniform(-s, s)  # noqa: E731 (small local helper)

    return {
        "air_temperature": round((22 + 16 * p) + _diurnal(hour, -4, 5) + jit(0.8), 2),
        "air_humidity": round(max(5, min(100, (72 - 52 * p) + _diurnal(hour, 6, -6) + jit(2))), 2),
        "soil_moisture": round(max(2, min(100, (60 - 50 * p) + jit(2))), 2),
        "solar_radiation": round(max(0, _diurnal(hour, 40, 520 + 480 * p) + jit(15)), 2),
        "ndvi": round(max(0.05, min(0.95, (0.80 - 0.60 * p) + jit(0.02))), 2),
        "days_since_rain": round(max(0, 1 + 32 * p + jit(0.5)), 2),
        "wind_speed": round(max(0, (6 + 26 * p) + jit(2)), 2),
    }


def main() -> int:
    if not settings.supabase_enabled:
        print("✗ Supabase not configured. Fill SUPABASE_URL + SUPABASE_SERVICE_KEY in backend/.env.")
        return 1

    client = db.get_client()
    assert client is not None

    now = datetime.now(timezone.utc)
    rows: list[dict] = []
    for i in range(N_READINGS):
        reading = _reading_at(i)
        verdict = model.predict(reading)
        ts = now - timedelta(hours=STEP_HOURS) * (N_READINGS - 1 - i)
        rows.append(
            {
                **reading,
                "device_id": DEVICE_ID,
                "risk_class": verdict["risk_class"],
                "risk_label": verdict["risk_label"],
                "timestamp": ts.isoformat(),
            }
        )

    # Wipe existing rows so re-seeding gives a clean, coherent series.
    client.table(settings.supabase_table).delete().neq("id", 0).execute()
    client.table(settings.supabase_table).insert(rows).execute()

    counts = Counter(r["risk_label"] for r in rows)
    print(f"✓ Inserted {len(rows)} readings into '{settings.supabase_table}'.")
    for lbl in ("HEALTHY", "ATTENTION", "CRITICAL"):
        print(f"  {lbl}: {counts.get(lbl, 0)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
