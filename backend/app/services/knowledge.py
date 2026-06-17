"""TerraVista — Knowledge base.

Static, curated mitigation / management actions for each risk level, covering
both the disaster-prevention and the agricultural side of the platform. Used by
the `/api/knowledge` endpoint and as grounding context for the chat assistant.

Author: Gabriel Mule (RM 560586)
"""

from __future__ import annotations

from typing import Any

KNOWLEDGE: dict[str, dict[str, Any]] = {
    "HEALTHY": {
        "title": "Healthy parcel — maintain and monitor",
        "actions": [
            "Keep the routine satellite/NDVI monitoring cadence (weekly).",
            "Maintain current irrigation schedule; avoid over-watering.",
            "Log baseline soil moisture and NDVI for trend comparison.",
            "No civil-defense action required.",
        ],
    },
    "ATTENTION": {
        "title": "Attention — early stress, act preventively",
        "actions": [
            "Increase monitoring frequency (every 2-3 days).",
            "Inspect irrigation lines; consider a supplemental watering cycle.",
            "Check for early pest/disease signs in the stressed sub-areas.",
            "Prepare firebreaks if dryness and wind are rising.",
            "Notify the field agronomist for a ground check.",
        ],
    },
    "CRITICAL": {
        "title": "Critical — high fire/drought/yield-loss risk",
        "actions": [
            "Trigger civil-defense alert for the affected area.",
            "Activate emergency irrigation where feasible; prioritize hotspots.",
            "Clear/expand firebreaks and stage firefighting resources.",
            "Restrict access and machinery that can ignite dry vegetation.",
            "Cross-check with NASA FIRMS active-fire detections in the region.",
            "Plan crop-loss mitigation and insurance documentation.",
        ],
    },
}


def get_items(risk_label: str | None = None) -> list[dict[str, Any]]:
    """Return knowledge items, optionally filtered by a risk label."""
    if risk_label:
        key = risk_label.upper()
        if key in KNOWLEDGE:
            entry = KNOWLEDGE[key]
            return [{"risk_label": key, **entry}]
        return []
    return [{"risk_label": k, **v} for k, v in KNOWLEDGE.items()]
