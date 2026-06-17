"""TerraVista — Knowledge router.

Serves the curated mitigation/management actions for each risk level. Used by
the dashboards to show "what to do next" for a given verdict.

Author: Gabriel Mule (RM 560586)
"""

from __future__ import annotations

from fastapi import APIRouter, Query

from app.schemas import KnowledgeItem, KnowledgeResponse
from app.services import knowledge

router = APIRouter(prefix="/knowledge", tags=["knowledge"])


@router.get("", response_model=KnowledgeResponse)
def get_knowledge(
    risk_label: str | None = Query(default=None, examples=["CRITICAL"]),
) -> KnowledgeResponse:
    """Return mitigation actions, optionally filtered by a risk label."""
    items = knowledge.get_items(risk_label)
    return KnowledgeResponse(items=[KnowledgeItem(**i) for i in items])
