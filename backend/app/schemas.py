"""TerraVista — Pydantic v2 request/response schemas.

Shared data contracts for all endpoints. Field names mirror the ML feature
columns (ml/generator.py) and the vision output (vision/detector.py) so the
whole platform stays consistent.

Author: Gabriel Mule (RM 560586)
"""

from __future__ import annotations

from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

class HealthResponse(BaseModel):
    status: str = "ok"
    app: str
    version: str
    model_loaded: bool


# ---------------------------------------------------------------------------
# Auth (mock)
# ---------------------------------------------------------------------------

class LoginRequest(BaseModel):
    username: str = Field(..., examples=["admin"])
    password: str = Field(..., examples=["terravista"])


class LoginResponse(BaseModel):
    token: str
    user: str
    expires_in: int = Field(..., description="Token lifetime in seconds.")


# ---------------------------------------------------------------------------
# Predict (tabular ML)
# ---------------------------------------------------------------------------

class PredictRequest(BaseModel):
    """The 7 territorial features expected by the RandomForest model."""

    air_temperature: float = Field(..., ge=-10, le=60, examples=[39.0])
    air_humidity: float = Field(..., ge=0, le=100, examples=[18.0])
    soil_moisture: float = Field(..., ge=0, le=100, examples=[8.0])
    solar_radiation: float = Field(..., ge=0, le=1500, examples=[950.0])
    ndvi: float = Field(..., ge=0, le=1, examples=[0.18])
    days_since_rain: float = Field(..., ge=0, le=120, examples=[30.0])
    wind_speed: float = Field(..., ge=0, le=150, examples=[35.0])


class PredictResponse(BaseModel):
    risk_class: int = Field(..., description="0=HEALTHY, 1=ATTENTION, 2=CRITICAL")
    risk_label: str
    probabilities: dict[str, float]


# ---------------------------------------------------------------------------
# Vision
# ---------------------------------------------------------------------------

class VisionDetection(BaseModel):
    label: str
    domain_tag: str
    confidence: float
    box: list[float]


class VisionResponse(BaseModel):
    image: str
    risk_class: int
    risk_label: str
    confidence: float
    vegetation_fraction: float
    dryness_fraction: float
    smoke_fraction: float
    detections: list[VisionDetection] = []


# ---------------------------------------------------------------------------
# Chat (generative AI)
# ---------------------------------------------------------------------------

class ChatRequest(BaseModel):
    message: str = Field(..., examples=["What should I do with a CRITICAL parcel?"])
    context: str | None = Field(
        default=None,
        description="Optional risk context, e.g. the latest sensor verdict.",
    )


class ChatResponse(BaseModel):
    reply: str
    source: str = Field(..., description="'openrouter' or 'mock'")


# ---------------------------------------------------------------------------
# Sensors (IoT field station)
# ---------------------------------------------------------------------------

class SensorReading(BaseModel):
    """A reading posted by the ESP32 field station."""

    air_temperature: float
    air_humidity: float
    soil_moisture: float
    solar_radiation: float
    ndvi: float = Field(..., ge=0, le=1)
    days_since_rain: float = Field(default=0, ge=0, le=120)
    wind_speed: float = Field(default=0, ge=0, le=150)
    device_id: str = Field(default="esp32-terravista-01")


class SensorRecord(BaseModel):
    """A stored reading enriched with the model verdict and a timestamp."""

    reading: SensorReading
    risk_class: int
    risk_label: str
    timestamp: str


class SensorListResponse(BaseModel):
    count: int
    records: list[SensorRecord]


# ---------------------------------------------------------------------------
# Knowledge base
# ---------------------------------------------------------------------------

class KnowledgeItem(BaseModel):
    risk_label: str
    title: str
    actions: list[str]


class KnowledgeResponse(BaseModel):
    items: list[KnowledgeItem]
