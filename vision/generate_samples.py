"""TerraVista — Synthetic sample imagery generator.

Produces small, reproducible RGB scenes (seed-controlled) that emulate the three
territorial-risk situations the vision module classifies:

    HEALTHY    — dense green canopy, scattered soil patches.
    ATTENTION  — mixed canopy with growing dry/bare patches.
    CRITICAL   — mostly bare/burnt soil, sparse vegetation, smoke plumes.

These are intentionally *synthetic* (procedural noise + colored blobs) so the
demo runs fully offline with no copyrighted imagery. Drop real satellite/aerial
JPEGs into `samples/` to test the detector on genuine data.

Author: Gabriel Mule (RM 560586)
"""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
SAMPLES_DIR = HERE / "samples"

# Base color palettes (RGB) per terrain type.
GREEN = np.array([60, 140, 55])
DRY = np.array([170, 130, 70])
BURN = np.array([90, 60, 45])
SMOKE = np.array([200, 200, 205])

SIZE = 256


def _blobs(rng: np.random.Generator, color: np.ndarray, count: int, radius: int):
    """Yield (cx, cy, r, color) blob specs scattered over the canvas."""
    for _ in range(count):
        cx = rng.integers(0, SIZE)
        cy = rng.integers(0, SIZE)
        r = rng.integers(radius // 2, radius)
        yield cx, cy, r, color


def _paint(canvas: np.ndarray, blobs) -> None:
    """Paint soft circular blobs onto an HxWx3 float canvas."""
    yy, xx = np.mgrid[0:SIZE, 0:SIZE]
    for cx, cy, r, color in blobs:
        mask = (xx - cx) ** 2 + (yy - cy) ** 2 <= r * r
        canvas[mask] = color


def _scene(kind: str, seed: int) -> Image.Image:
    """Build one scene of the requested kind."""
    rng = np.random.default_rng(seed)

    if kind == "healthy":
        base = GREEN
        canvas = np.tile(base, (SIZE, SIZE, 1)).astype(np.float64)
        _paint(canvas, _blobs(rng, DRY, count=6, radius=22))
    elif kind == "attention":
        base = GREEN
        canvas = np.tile(base, (SIZE, SIZE, 1)).astype(np.float64)
        _paint(canvas, _blobs(rng, DRY, count=34, radius=44))
        _paint(canvas, _blobs(rng, BURN, count=8, radius=26))
    elif kind == "critical":
        base = DRY
        canvas = np.tile(base, (SIZE, SIZE, 1)).astype(np.float64)
        _paint(canvas, _blobs(rng, BURN, count=22, radius=40))
        _paint(canvas, _blobs(rng, GREEN, count=4, radius=16))
        _paint(canvas, _blobs(rng, SMOKE, count=6, radius=30))
    else:
        raise ValueError(f"unknown scene kind: {kind}")

    # Add per-pixel texture noise so the scene is not flat.
    noise = rng.normal(0.0, 12.0, (SIZE, SIZE, 3))
    canvas = np.clip(canvas + noise, 0, 255).astype(np.uint8)
    return Image.fromarray(canvas, mode="RGB")


def generate(seed: int = 42) -> list[Path]:
    """Generate one image per risk kind into samples/. Returns the paths."""
    SAMPLES_DIR.mkdir(parents=True, exist_ok=True)
    paths = []
    for i, kind in enumerate(("healthy", "attention", "critical")):
        img = _scene(kind, seed + i)
        out = SAMPLES_DIR / f"{kind}_scene.png"
        img.save(out)
        paths.append(out)
        print(f"[samples] wrote {out.name}")
    return paths


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate synthetic sample scenes.")
    parser.add_argument("--seed", type=int, default=42, help="Random seed.")
    args = parser.parse_args()
    generate(args.seed)


if __name__ == "__main__":
    main()
