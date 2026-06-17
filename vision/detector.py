"""TerraVista — Computer Vision scene analyzer.

Analyzes satellite / aerial RGB imagery to estimate **territorial risk** for the
same three classes used by the tabular ML model (HEALTHY / ATTENTION /
CRITICAL), so the vision module and the RandomForest speak the same language.

Two complementary layers:

1. Vegetation-index analysis (authorial, offline, reproducible)
   - Computes the Excess Green Index (ExG = 2g - r - b) and a brown/burn index
     from the chromatic coordinates of every pixel.
   - Aggregates them into a vegetation fraction and a dryness/burn fraction,
     then maps the scene to a risk class. This is a genuine remote-sensing
     heuristic (RGB proxy for NDVI when no NIR band is available).

2. Object detection (optional, Ultralytics YOLO yolov8n)
   - Runs a pretrained detector to flag infrastructure / field activity
     (vehicles, people, aircraft, boats) on *real* imagery. Degrades gracefully
     when `ultralytics` is not installed or weights cannot be downloaded.

Author: Gabriel Mule (RM 560586)
"""

from __future__ import annotations

import argparse
import json
from dataclasses import asdict, dataclass, field
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

# Class mapping mirrors the ML model (ml/generator.py) for consistency.
CLASS_NAMES = {0: "HEALTHY", 1: "ATTENTION", 2: "CRITICAL"}
CLASS_COLORS = {0: (46, 125, 50), 1: (249, 168, 37), 2: (198, 40, 40)}

# COCO classes that are meaningful for field/infrastructure monitoring. Used to
# tag YOLO detections with a domain-relevant label for the demo.
INFRASTRUCTURE_COCO = {
    "person": "field activity",
    "bicycle": "field activity",
    "car": "vehicle / access",
    "motorcycle": "vehicle / access",
    "bus": "vehicle / access",
    "truck": "heavy vehicle / logging",
    "boat": "waterway activity",
    "airplane": "aerial survey",
}


@dataclass
class Detection:
    """A single YOLO object detection mapped to a domain label."""

    label: str
    domain_tag: str
    confidence: float
    box: list[float]  # [x1, y1, x2, y2]


@dataclass
class SceneResult:
    """Full vision analysis for one image."""

    image: str
    risk_class: int
    risk_label: str
    confidence: float
    vegetation_fraction: float
    dryness_fraction: float
    smoke_fraction: float
    detections: list[Detection] = field(default_factory=list)

    def to_dict(self) -> dict:
        data = asdict(self)
        data["detections"] = [asdict(d) for d in self.detections]
        return data


# ---------------------------------------------------------------------------
# Layer 1 — vegetation-index scene analysis (offline, authorial)
# ---------------------------------------------------------------------------

def _chromatic(rgb: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Normalize an HxWx3 uint8 array into per-pixel chromatic coordinates."""
    arr = rgb.astype(np.float64)
    total = arr.sum(axis=2) + 1e-6
    r = arr[..., 0] / total
    g = arr[..., 1] / total
    b = arr[..., 2] / total
    return r, g, b


def analyze_scene(image_path: str | Path) -> SceneResult:
    """Estimate territorial risk from an RGB image using vegetation indices."""
    path = Path(image_path)
    rgb = np.asarray(Image.open(path).convert("RGB"))
    r, g, b = _chromatic(rgb)

    # Excess Green Index: high where vegetation is vigorous.
    exg = 2.0 * g - r - b
    vegetation_mask = exg > 0.06
    vegetation_fraction = float(vegetation_mask.mean())

    # Brown/burn index: reddish-brown, low-green pixels (bare/burnt soil).
    dryness_mask = (r > g) & (g > b) & (exg < 0.0)
    dryness_fraction = float(dryness_mask.mean())

    # Smoke proxy: gray (low-saturation) pixels above mid brightness. The
    # brightness floor is 0.40 (not 0.55) so dark gray wildfire smoke is caught,
    # not only bright white plumes; dark shadows stay below the floor.
    arr = rgb.astype(np.float64) / 255.0
    brightness = arr.mean(axis=2)
    saturation = arr.max(axis=2) - arr.min(axis=2)
    smoke_mask = (brightness > 0.40) & (saturation < 0.10)
    smoke_fraction = float(smoke_mask.mean())

    risk_class, confidence = _classify(
        vegetation_fraction, dryness_fraction, smoke_fraction
    )

    return SceneResult(
        image=path.name,
        risk_class=risk_class,
        risk_label=CLASS_NAMES[risk_class],
        confidence=round(confidence, 3),
        vegetation_fraction=round(vegetation_fraction, 3),
        dryness_fraction=round(dryness_fraction, 3),
        smoke_fraction=round(smoke_fraction, 3),
    )


def _classify(
    vegetation: float, dryness: float, smoke: float
) -> tuple[int, float]:
    """Map index fractions to a risk class with a confidence score.

    Rules are interpretable and monotonic:
      - lots of vegetation, little dryness/smoke -> HEALTHY
      - significant bare/burnt soil or smoke      -> CRITICAL
      - in between                                -> ATTENTION
    """
    stress = dryness + smoke - vegetation  # higher == riskier, range ~[-1, 2]

    if vegetation >= 0.45 and dryness < 0.20 and smoke < 0.05:
        risk = 0
    elif dryness >= 0.35 or smoke >= 0.12 or vegetation < 0.12:
        risk = 2
    else:
        risk = 1

    # Confidence: distance of the stress score from the decision midpoints,
    # squashed into 0.5..0.99 so the demo always shows a calibrated-looking value.
    confidence = 0.5 + 0.45 * np.tanh(abs(stress) * 2.0)
    return risk, float(confidence)


# ---------------------------------------------------------------------------
# Layer 2 — optional YOLO object detection
# ---------------------------------------------------------------------------

_YOLO_MODEL = None  # cached across calls


def detect_objects(
    image_path: str | Path, conf: float = 0.25, weights: str = "yolov8n.pt"
) -> list[Detection]:
    """Run YOLO object detection; return [] if YOLO is unavailable."""
    global _YOLO_MODEL
    try:
        from ultralytics import YOLO
    except ImportError:
        print("[vision] ultralytics not installed — skipping object detection.")
        return []

    try:
        if _YOLO_MODEL is None:
            _YOLO_MODEL = YOLO(weights)
        results = _YOLO_MODEL.predict(str(image_path), conf=conf, verbose=False)
    except Exception as exc:  # noqa: BLE001 — weights download / runtime issues
        print(f"[vision] YOLO unavailable ({exc}) — skipping object detection.")
        return []

    detections: list[Detection] = []
    for res in results:
        names = res.names
        for box in res.boxes:
            label = names[int(box.cls)]
            detections.append(
                Detection(
                    label=label,
                    domain_tag=INFRASTRUCTURE_COCO.get(label, "object of interest"),
                    confidence=round(float(box.conf), 3),
                    box=[round(float(v), 1) for v in box.xyxy[0].tolist()],
                )
            )
    return detections


# ---------------------------------------------------------------------------
# Combined analysis + annotation
# ---------------------------------------------------------------------------

def analyze(
    image_path: str | Path, run_yolo: bool = False, conf: float = 0.25
) -> SceneResult:
    """Full analysis: vegetation-index risk + optional YOLO detections."""
    result = analyze_scene(image_path)
    if run_yolo:
        result.detections = detect_objects(image_path, conf=conf)
    return result


def annotate(result: SceneResult, image_path: str | Path, out_path: str | Path) -> Path:
    """Draw the risk verdict and detection boxes onto a copy of the image."""
    img = Image.open(image_path).convert("RGB")
    draw = ImageDraw.Draw(img)
    color = CLASS_COLORS[result.risk_class]

    try:
        font = ImageFont.truetype("DejaVuSans-Bold.ttf", 18)
    except OSError:
        font = ImageFont.load_default()

    banner = f"{result.risk_label}  ({result.confidence:.0%})"
    draw.rectangle([0, 0, img.width, 28], fill=color)
    draw.text((6, 5), banner, fill=(255, 255, 255), font=font)

    for det in result.detections:
        draw.rectangle(det.box, outline=(21, 101, 192), width=2)
        tag = f"{det.label} {det.confidence:.0%}"
        draw.text((det.box[0] + 2, det.box[1] + 2), tag, fill=(21, 101, 192), font=font)

    out = Path(out_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out)
    return out


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(description="TerraVista vision scene analyzer.")
    parser.add_argument("image", help="Path to an RGB image (or a directory).")
    parser.add_argument("--yolo", action="store_true", help="Also run YOLO detection.")
    parser.add_argument("--conf", type=float, default=0.25, help="YOLO confidence.")
    parser.add_argument(
        "--annotate", action="store_true", help="Save annotated image(s) to outputs/."
    )
    args = parser.parse_args()

    target = Path(args.image)
    images = (
        sorted(p for p in target.iterdir() if p.suffix.lower() in {".png", ".jpg", ".jpeg"})
        if target.is_dir()
        else [target]
    )

    out_dir = Path(__file__).resolve().parent / "outputs"
    for img_path in images:
        result = analyze(img_path, run_yolo=args.yolo, conf=args.conf)
        print(json.dumps(result.to_dict(), indent=2))
        if args.annotate:
            saved = annotate(result, img_path, out_dir / f"annotated_{img_path.name}")
            print(f"[vision] annotated → {saved}")


if __name__ == "__main__":
    main()
