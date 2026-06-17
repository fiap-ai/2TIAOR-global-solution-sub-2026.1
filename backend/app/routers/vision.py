"""TerraVista — Vision router (computer vision).

Accepts an image upload (aerial/satellite RGB) and runs the shared scene
analyzer from `vision/detector.py`, returning the vegetation/dryness/smoke
fractions and the derived risk class. YOLO object detection is optional.

Author: Gabriel Mule (RM 560586)
"""

from __future__ import annotations

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.logging_config import get_logger
from app.schemas import VisionResponse
from app.services import vision

router = APIRouter(prefix="/vision", tags=["vision"])
log = get_logger()

_ALLOWED_TYPES = {"image/png", "image/jpeg", "image/jpg", "image/webp"}


@router.post("/analyze", response_model=VisionResponse)
async def analyze(
    file: UploadFile = File(...),
    run_yolo: bool = False,
) -> VisionResponse:
    """Analyze an uploaded image and return the territorial-risk verdict."""
    if file.content_type not in _ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported image type: {file.content_type}. Use PNG/JPEG/WEBP.",
        )

    data = await file.read()
    if not data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty file.",
        )

    result = vision.analyze_image_bytes(data, file.filename or "upload.png", run_yolo=run_yolo)
    log.info(
        "vision → %s (conf=%.2f) | veg=%.2f dry=%.2f smoke=%.2f | %s (%d bytes, yolo=%s)",
        result["risk_label"],
        result["confidence"],
        result["vegetation_fraction"],
        result["dryness_fraction"],
        result["smoke_fraction"],
        file.filename or "upload.png",
        len(data),
        run_yolo,
    )
    return VisionResponse(**result)
