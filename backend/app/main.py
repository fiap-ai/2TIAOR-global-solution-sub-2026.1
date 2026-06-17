"""TerraVista — FastAPI application entrypoint.

Wires together every router under the `/api` prefix and enables CORS so the web
and mobile clients can call the backend. Run with:

    uvicorn app.main:app --reload

Author: Gabriel Mule (RM 560586)
"""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.logging_config import configure_logging, get_logger
from app.routers import (
    auth,
    chat,
    health,
    knowledge,
    predict,
    sensors,
    vision,
)

configure_logging()
log = get_logger()

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description=(
        "Earth-observation platform for climate & agricultural resilience. "
        "Classifies land parcels into HEALTHY / ATTENTION / CRITICAL territorial "
        "risk from satellite (NDVI), field sensors (ESP32) and computer vision."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# All endpoints live under /api.
API_PREFIX = "/api"
app.include_router(health.router, prefix=API_PREFIX)
app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(predict.router, prefix=API_PREFIX)
app.include_router(vision.router, prefix=API_PREFIX)
app.include_router(chat.router, prefix=API_PREFIX)
app.include_router(sensors.router, prefix=API_PREFIX)
app.include_router(knowledge.router, prefix=API_PREFIX)


@app.get("/", tags=["root"])
def root() -> dict[str, str]:
    """Friendly landing payload pointing to the interactive docs."""
    return {
        "app": settings.app_name,
        "version": settings.version,
        "docs": "/docs",
        "health": f"{API_PREFIX}/health",
    }
