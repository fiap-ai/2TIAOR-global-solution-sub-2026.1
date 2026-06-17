 # 🌍 Real Datasets — Catalog & Provenance (TerraVista)

This document catalogs the **real-world datasets** that ground TerraVista's
synthetic model in reality. The MVP trains on a **synthetic dataset**
(`ml/generator.py`) for reproducibility and independence, while these real
sources provide **professional credibility**, **feature calibration**, and
**cross-domain validation**.

> See `docs/ACCOUNTS_SETUP.md` for how to create the (free) accounts and keys.

---

## How the hybrid strategy works

```
Real datasets (UCI / Kaggle / NASA)        Synthetic generator (ml/generator.py)
        │  EDA + correlations                       │  plausible coefficients
        └──────────────┬────────────────────────────┘
                       ▼
        Notebook bridges both: synthetic coefficients are
        calibrated/validated against real-data correlations.
                       ▼
        RandomForest trained on synthetic core → terra_risk.joblib
```

---

## 1. UCI — Forest Fires  ✅ (automated, no login)

- **What:** 517 forest-fire records from Montesinho park (Portugal) with
  meteorological features (temperature, relative humidity, wind, rain) and
  burned area. Classic benchmark for fire-risk modeling.
- **Why it matters:** validates our **disaster/fire** drivers — temperature,
  humidity, wind, dry conditions — the same features in our generator.
- **License:** open (UCI Machine Learning Repository, CC BY 4.0).
- **Access:** direct URL, no account.
- **Download:** `python download.py uci`
- **Link:** https://archive.ics.uci.edu/dataset/162/forest+fires

## 2. Kaggle — Crop Recommendation  🔑 (kaggle.json)

- **What:** ~2,200 rows with soil N/P/K, temperature, humidity, pH, rainfall →
  recommended crop. Widely used AgTech teaching dataset.
- **Why it matters:** validates our **agricultural** drivers — soil/air
  conditions vs. plant suitability — bridging into the agro side.
- **License:** open (per dataset page).
- **Access:** Kaggle account + API token (`~/.kaggle/kaggle.json`).
- **Download:** `python download.py kaggle`
- **Link:** https://www.kaggle.com/datasets/atharvaingle/crop-recommendation-dataset

## 3. NASA FIRMS — Active Fire Data  🔑 (MAP_KEY)

- **What:** near-real-time active fire/thermal anomalies from MODIS & VIIRS
  satellites. Updated multiple times per day.
- **Why it matters:** the **space-economy anchor** — real satellite EO data,
  feeding the disaster module with live fire hotspots.
- **License:** open (NASA, public domain).
- **Access:** free `MAP_KEY` from FIRMS.
- **Download:** `python download.py firms` (queries a country/area, last N days).
- **Link:** https://firms.modaps.eosdis.nasa.gov/api/area/
- https://firms.modaps.eosdis.nasa.gov/api/map_key/

## 4. NASA Earthdata — SMAP Soil Moisture  📚 (reference only)

- **What:** Soil Moisture Active Passive (SMAP) global soil-moisture product.
- **Why it matters:** real **satellite-derived soil moisture** — the
  professional version of our IoT soil sensor.
- **License:** open (NASA).
- **Access:** Earthdata account + token; heavy granules → **not automated**.
- **Link:** https://nsidc.org/data/smap

## 5. Copernicus / ESA — Sentinel-2 (NDVI) & Sentinel-1 (SAR)  📚 (reference only)

- **What:** Sentinel-2 multispectral imagery (NDVI/NDRE) and Sentinel-1 radar
  (soil moisture, cloud-penetrating).
- **Why it matters:** source of **real NDVI** (our key EO feature) and imagery
  for the **Computer Vision** module.
- **License:** open (Copernicus, free & open data).
- **Access:** Copernicus account; large tiles → **not automated** (use sample
  imagery in the MVP).
- **Link:** https://dataspace.copernicus.eu/

---

## Feature mapping: synthetic ↔ real

| TerraVista feature | Real-data analog | Source |
|---|---|---|
| `air_temperature` | `temp` | UCI Forest Fires / Kaggle Crop |
| `air_humidity` | `RH` / `humidity` | UCI Forest Fires / Kaggle Crop |
| `soil_moisture` | SMAP soil moisture / Kaggle (rainfall proxy) | NASA SMAP / Kaggle |
| `solar_radiation` | derived (season/latitude) | — (modeled) |
| `ndvi` | Sentinel-2 NDVI | Copernicus |
| `days_since_rain` | `rain` accumulation | UCI Forest Fires |
| `wind_speed` | `wind` | UCI Forest Fires |
| `risk_class` (target) | burned `area` (fire) / crop suitability (agro) | UCI / Kaggle |

---

## Reproducibility notes

- The synthetic generator uses a fixed seed (`42`) → identical dataset every run.
- `download.py` stamps downloads with a timestamp so refreshed real data (e.g.
  FIRMS daily fires) is traceable.
- Real datasets are **not** committed by default (see `.gitignore`); run the
  downloader locally. UCI is small enough to keep if desired.
