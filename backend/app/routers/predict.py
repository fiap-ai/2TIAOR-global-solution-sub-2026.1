"""TerraVista — Predict router (tabular ML).

Exposes the RandomForest territorial-risk classifier trained in `ml/`. Accepts
the 7 environmental features and returns the risk class, label and per-class
probabilities.

Author: Gabriel Mule (RM 560586)
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from app.logging_config import get_logger
from app.schemas import PredictRequest, PredictResponse
from app.services import model

router = APIRouter(prefix="/predict", tags=["predict"])
log = get_logger()


@router.post("", response_model=PredictResponse)
def predict(payload: PredictRequest) -> PredictResponse:
    """Classify a parcel's territorial risk from its environmental features."""
    if not model.model_is_available():
        log.warning("predict → model unavailable (not trained)")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model not trained. Run `make train` in ml/ first.",
        )

    result = model.predict(payload.model_dump())
    top = result["probabilities"][result["risk_label"]]
    log.info(
        "predict → %s (class %d, p=%.4f) | ndvi=%.2f soil=%.1f temp=%.1f",
        result["risk_label"],
        result["risk_class"],
        top,
        payload.ndvi,
        payload.soil_moisture,
        payload.air_temperature,
    )
    return PredictResponse(**result)

