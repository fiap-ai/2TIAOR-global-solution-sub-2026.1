"""TerraVista — Health router.

Liveness/readiness probe. Reports whether the ML model artifact is loadable so
the dashboards can warn if the backend was started before `make train`.

Author: Gabriel Mule (RM 560586)
"""

from __future__ import annotations

from fastapi import APIRouter

from app.config import settings
from app.schemas import HealthResponse
from app.services import model

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    """Return service status and whether the model is available."""
    return HealthResponse(
        status="ok",
        app=settings.app_name,
        version=settings.version,
        model_loaded=model.model_is_available(),
    )
