"""TerraVista — Synthetic territorial-risk dataset generator.

Generates a physically/agronomically plausible dataset that fuses:
  - Field-station (IoT) measurements: air temperature/humidity, soil moisture,
    solar radiation.
  - Earth Observation features: NDVI (vegetation vigor), days since last rain,
    wind speed.

The target `risk_class` represents combined territorial risk for a land parcel,
spanning both disaster (drought/fire) and agricultural (water-stress/yield-loss)
domains, encoded in three ordinal levels:
    0 = HEALTHY    (parcel is well-watered, vegetation vigorous, low fire risk)
    1 = ATTENTION  (early stress signs, irrigation/monitoring recommended)
    2 = CRITICAL   (severe water stress / high fire/yield-loss risk)

The generator intentionally produces a class imbalance (~50/35/15) reproducing
real triage scenarios where most parcels are healthy and few are critical.

Author: Gabriel Mule (RM 560586)
"""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
import pandas as pd

# ---------------------------------------------------------------------------
# Feature definitions (names are domain-explicit, English)
# ---------------------------------------------------------------------------

FEATURE_COLUMNS = [
    "air_temperature",      # °C — ambient air temperature
    "air_humidity",         # %  — relative air humidity
    "soil_moisture",        # %  — volumetric soil water content
    "solar_radiation",      # W/m2 — incident solar radiation
    "ndvi",                 # 0-1 — Normalized Difference Vegetation Index (satellite)
    "days_since_rain",      # days — consecutive dry days
    "wind_speed",           # km/h — surface wind speed (fire-spread factor)
]

TARGET_COLUMN = "risk_class"
CLASS_NAMES = {0: "HEALTHY", 1: "ATTENTION", 2: "CRITICAL"}


def _sample_features(rng: np.random.Generator, n: int) -> pd.DataFrame:
    """Draw raw feature samples from plausible marginal distributions."""
    air_temperature = rng.normal(26.0, 6.0, n).clip(2, 48)
    air_humidity = rng.normal(60.0, 18.0, n).clip(8, 100)
    soil_moisture = rng.normal(38.0, 16.0, n).clip(3, 95)
    solar_radiation = rng.normal(520.0, 180.0, n).clip(50, 1100)
    ndvi = rng.normal(0.62, 0.18, n).clip(0.02, 0.95)
    days_since_rain = rng.gamma(shape=2.0, scale=4.0, size=n).clip(0, 60)
    wind_speed = rng.gamma(shape=2.0, scale=6.0, size=n).clip(0, 70)

    return pd.DataFrame(
        {
            "air_temperature": air_temperature,
            "air_humidity": air_humidity,
            "soil_moisture": soil_moisture,
            "solar_radiation": solar_radiation,
            "ndvi": ndvi,
            "days_since_rain": days_since_rain,
            "wind_speed": wind_speed,
        }
    )


def _risk_score(df: pd.DataFrame) -> np.ndarray:
    """Compute a latent continuous risk score from features.

    The score combines clinically/agronomically interpretable drivers:
      - Low soil moisture and low NDVI raise risk (water stress / weak canopy).
      - High temperature, high radiation, long dry spell raise risk.
      - Low air humidity and high wind raise fire-spread risk.
    Coefficients are hand-tuned to be monotonic and plausible, not fitted.
    """
    # Normalize each driver to a 0..1 "stress" contribution.
    s_soil = (40.0 - df["soil_moisture"]).clip(lower=0) / 40.0          # dry soil
    s_ndvi = (0.65 - df["ndvi"]).clip(lower=0) / 0.65                   # weak vegetation
    s_temp = (df["air_temperature"] - 24.0).clip(lower=0) / 24.0        # heat
    s_rad = (df["solar_radiation"] - 450.0).clip(lower=0) / 650.0       # radiation
    s_dry = df["days_since_rain"] / 60.0                               # drought
    s_humid = (55.0 - df["air_humidity"]).clip(lower=0) / 55.0          # dry air
    s_wind = df["wind_speed"] / 70.0                                   # fire spread

    score = (
        0.28 * s_soil
        + 0.22 * s_ndvi
        + 0.14 * s_temp
        + 0.10 * s_rad
        + 0.13 * s_dry
        + 0.08 * s_humid
        + 0.05 * s_wind
    )
    return score.to_numpy()


def generate(n_samples: int = 5000, seed: int = 42) -> pd.DataFrame:
    """Generate the full synthetic dataset with features + risk_class label."""
    rng = np.random.default_rng(seed)
    df = _sample_features(rng, n_samples)

    score = _risk_score(df)
    # Add small stochastic noise so the boundary is not perfectly separable.
    score = score + rng.normal(0.0, 0.05, n_samples)

    # Thresholds chosen to yield an approximate 50/35/15 class balance.
    healthy_thr = np.quantile(score, 0.50)
    critical_thr = np.quantile(score, 0.85)

    labels = np.where(score >= critical_thr, 2, np.where(score >= healthy_thr, 1, 0))
    df[TARGET_COLUMN] = labels.astype(int)

    # Round features for readability/realism.
    df["air_temperature"] = df["air_temperature"].round(1)
    df["air_humidity"] = df["air_humidity"].round(1)
    df["soil_moisture"] = df["soil_moisture"].round(1)
    df["solar_radiation"] = df["solar_radiation"].round(0)
    df["ndvi"] = df["ndvi"].round(3)
    df["days_since_rain"] = df["days_since_rain"].round(0)
    df["wind_speed"] = df["wind_speed"].round(1)

    return df


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate TerraVista synthetic dataset.")
    parser.add_argument("--samples", type=int, default=5000, help="Number of rows.")
    parser.add_argument("--seed", type=int, default=42, help="Random seed.")
    parser.add_argument(
        "--out",
        type=str,
        default=str(Path(__file__).resolve().parent / "data" / "territory_samples.csv"),
        help="Output CSV path.",
    )
    args = parser.parse_args()

    df = generate(args.samples, args.seed)

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out_path, index=False)

    dist = df[TARGET_COLUMN].value_counts().sort_index()
    print(f"[generator] Wrote {len(df)} rows to {out_path}")
    for cls, count in dist.items():
        print(f"  {CLASS_NAMES[cls]:9s} ({cls}): {count}  ({count / len(df):.1%})")


if __name__ == "__main__":
    main()
