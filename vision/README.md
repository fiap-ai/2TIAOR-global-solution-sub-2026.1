# TerraVista — Computer Vision Module

Computer-vision layer that estimates **territorial risk** from satellite / aerial
RGB imagery, using the **same three classes** as the tabular ML model so the
whole platform speaks one language:

| class | meaning |
|---|---|
| `HEALTHY` | vigorous canopy, low fire/drought risk |
| `ATTENTION` | growing dry/bare patches, monitor |
| `CRITICAL` | mostly bare/burnt soil, sparse vegetation, possible smoke |

## Two complementary layers

1. **Vegetation-index scene analysis** (`detector.py`, authorial & offline)
   - Computes the **Excess Green Index** `ExG = 2g − r − b` from per-pixel
     chromatic coordinates — an RGB proxy for NDVI when no near-infrared band is
     available.
   - Derives three interpretable fractions per scene:
     - `vegetation_fraction` — vigorous canopy (`ExG > 0.06`)
     - `dryness_fraction` — reddish-brown bare/burnt soil
     - `smoke_fraction` — bright, low-saturation (gray) pixels
   - Maps them to a risk class with a monotonic, auditable rule set.

2. **Object detection** (optional, Ultralytics YOLO `yolov8n`)
   - Flags infrastructure / field activity (vehicles, people, boats, aircraft)
     on **real** imagery.
   - **Degrades gracefully**: if `ultralytics` is not installed or weights can't
     be downloaded, `detections` is empty and the scene analysis still works.

## Quick start

```bash
make setup     # create venv + install dependencies
make samples   # generate reproducible synthetic scenes -> samples/
make analyze   # classify samples/ + write annotated images -> outputs/
```

Optional object-detection run (downloads ~6 MB YOLO weights on first use):

```bash
make analyze-yolo
```

Run on your own imagery (drop JPEG/PNG into `samples/` or pass a path):

```bash
.venv/bin/python detector.py path/to/image.jpg --yolo --annotate
```

## Files

| path | purpose |
|---|---|
| `detector.py` | scene analyzer (vegetation indices) + optional YOLO + annotation |
| `generate_samples.py` | reproducible synthetic HEALTHY/ATTENTION/CRITICAL scenes |
| `notebooks/01_vision_pipeline.ipynb` | documented end-to-end workflow + visualizations |
| `samples/` | input imagery (synthetic or real) |
| `outputs/` | annotated results |
| `requirements.txt` | dependencies (YOLO is optional) |
| `Makefile` | convenience commands (`make help`) |

## Output schema

`detector.py` prints one JSON object per image:

```json
{
  "image": "critical_scene.png",
  "risk_class": 2,
  "risk_label": "CRITICAL",
  "confidence": 0.655,
  "vegetation_fraction": 0.267,
  "dryness_fraction": 0.381,
  "smoke_fraction": 0.066,
  "detections": []
}
```

This is the exact payload consumed by the backend `/api/vision` endpoint.

## Validation

On the seed-`42` synthetic scenes the analyzer classifies all three correctly:

| scene | risk | vegetation | dryness | smoke |
|---|---|---|---|---|
| `healthy_scene` | HEALTHY | 0.956 | 0.021 | 0.000 |
| `attention_scene` | ATTENTION | 0.515 | 0.241 | 0.000 |
| `critical_scene` | CRITICAL | 0.267 | 0.381 | 0.066 |

## Notes on authorship & data

- The scene analyzer is an **original** remote-sensing heuristic (no copied
  code). The sample scenes are **procedurally synthesized** — no copyrighted
  imagery is shipped.
- ExG is a well-established vegetation index (Woebbecke et al., 1995); using it
  as an RGB-only NDVI proxy is a documented, honest simplification for the MVP.
  Production scaling to true NDVI (with NIR bands) is described in
  `../docs/professionalization.md`.

---
Author: **Gabriel Mule — RM 560586**
