"""TerraVista — Vision service.

Thin adapter that reuses the *exact* detector from the `vision/` module
(`vision/detector.py`) so the backend and the CV pipeline never diverge. The
vision directory is added to `sys.path` once, lazily, on first use.

Author: Gabriel Mule (RM 560586)
"""

from __future__ import annotations

import sys
import tempfile
from pathlib import Path
from typing import Any

from app.config import VISION_DIR


def _ensure_importable() -> None:
    """Add the vision/ module to sys.path so `detector` is importable."""
    vision_path = str(VISION_DIR)
    if vision_path not in sys.path:
        sys.path.insert(0, vision_path)


def analyze_image_bytes(data: bytes, filename: str, run_yolo: bool = False) -> dict[str, Any]:
    """Run the vision scene analyzer on raw image bytes.

    Writes the upload to a temp file (Pillow needs a path/stream) and delegates
    to the shared detector. Returns a plain dict matching `VisionResponse`.
    """
    _ensure_importable()
    from detector import analyze  # imported lazily from vision/

    suffix = Path(filename).suffix or ".png"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=True) as tmp:
        tmp.write(data)
        tmp.flush()
        result = analyze(tmp.name, run_yolo=run_yolo)

    payload = result.to_dict()
    payload["image"] = filename  # report the original name, not the temp path
    return payload
