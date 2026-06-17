# TerraVista — Professionalization Roadmap

> How to scale the TerraVista MVP into a production-grade Earth-Observation
> platform. The built MVP intentionally stays on ESP32/Wokwi + synthetic data;
> this is a vision/maturity document, not part of the delivered scope.
> Author: Gabriel Mule (RM 560586)

The MVP makes deliberate, **honest simplifications** so it is reproducible and
self-contained. Each one has a clear upgrade path to professional hardware and
real orbital data. This document maps that path.

---

## 1. From RGB proxy to true NDVI

| MVP | Production |
|---|---|
| Excess Green Index (`ExG = 2g − r − b`) on ordinary RGB | True **NDVI** `= (NIR − Red) / (NIR + Red)` from near-infrared bands |
| Synthetic / consumer imagery | **Sentinel-2** (10 m, free, ESA Copernicus), **Landsat 8/9** (30 m, free), **Planet** (3 m, daily, commercial) |
| Single-scene heuristic | Multi-temporal time series (phenology, anomaly detection) |

**Upgrade:** ingest Sentinel-2 L2A tiles via the Copernicus Data Space /
Sentinel Hub API, compute NDVI/NDWI/NDRE, and feed the indices into the same
risk taxonomy the MVP already uses.

---

## 2. Field hardware (edge layer)

| MVP (Wokwi) | Professional |
|---|---|
| DHT22 (temp/humidity) | **SHT31 / BME280** industrial-grade, calibrated |
| Potentiometer (soil proxy) | **Capacitive soil-moisture probe** + soil temperature |
| LDR (light proxy) | **Pyranometer** (true W/m² solar radiation) |
| — | **Anemometer + rain gauge** (real wind / precipitation) |
| ESP32 DevKit (bench) | **Ruggedized ESP32 / industrial gateway**, solar-powered, IP65 enclosure |

**Connectivity:** swap single-station Wi-Fi for **LoRaWAN** (km-range, low power)
with a field gateway, or **NB-IoT / LTE-M** for cellular coverage in remote
agricultural areas.

---

## 3. Aerial layer (drones)

A mid-tier between satellites and ground stations:

- **Mapping drones** (e.g. DJI Mavic 3 Multispectral) carry RGB + NIR + red-edge
  sensors — true NDVI/NDRE at centimeter resolution for individual parcels.
- **Use case:** ground-truth calibration of satellite indices and high-detail
  inspection of parcels flagged CRITICAL by the platform.

---

## 4. Orbital layer (satellites)

| Tier | Source | Resolution | Cost |
|---|---|---|---|
| Free, public | Sentinel-2, Landsat 8/9, MODIS, **NASA FIRMS** (active fire) | 10–500 m | Free |
| Commercial | Planet, Maxar, Airbus | 0.3–3 m | Paid |

FIRMS is already used in the MVP (787 live Brazilian fires downloaded for
calibration); in production it becomes a **real-time wildfire alert feed** fused
with the territorial risk model.

---

## 5. Backend, data & MLOps

| MVP | Production |
|---|---|
| In-memory deque / optional Supabase | Managed **PostgreSQL + PostGIS** (geospatial), time-series DB (TimescaleDB) |
| RandomForest, fixed seed | Periodic retraining pipeline, model registry (MLflow), drift monitoring |
| Single FastAPI process | Containerized (Docker) + autoscaling; queue (Celery/Kafka) for image jobs |
| Mock auth | Real auth (OAuth2 / JWT), per-tenant RBAC |
| Local files | Object storage (S3) for imagery + tiles |

**Scaling imagery:** a tiling pipeline (gdal/rasterio) + async workers to process
large satellite scenes; cache derived indices.

---

## 6. AI capability upgrades

- **Computer vision:** train a domain-specific segmentation model (burn scars,
  flooded areas, crop types) instead of the generic `yolov8n`; use the drone/
  satellite imagery for labeled data.
- **Generative AI:** move the assistant from a stateless chat to a **RAG**
  pipeline over an agronomy + civil-defense knowledge base, grounded in the
  parcel's real telemetry and history.
- **Forecasting:** add temporal models (LSTM / temporal CNN) for short-term fire
  and drought risk prediction, not just current-state classification.

---

## 7. Deployment & operations

- **Web:** Vercel (already configured).
- **Mobile:** EAS Build → Play Store / App Store distribution.
- **Backend:** managed container host (Render / Railway / Fly / AWS ECS) with a
  public HTTPS endpoint the field gateways reach directly.
- **Observability:** centralized logging, metrics (Prometheus/Grafana), alerting.

---

## 8. Summary

The MVP is a faithful, end-to-end skeleton of the full system: the **same risk
taxonomy, the same API contracts and the same client UX** would carry over
unchanged. Professionalization is mostly a matter of **replacing data sources and
hardware with higher-fidelity equivalents** and **hardening the backend** — not
re-architecting. That is by design: the simplifications are swappable, not
structural.
