# 🤖 TerraVista — Machine Learning Module

Territorial-risk classifier that powers the backend `/api/predict` endpoint.
Given field-station + Earth-Observation features, it predicts a 3-level risk:

| Class | Label | Meaning |
|------|-----------|---------|
| 0 | `HEALTHY` | well-watered parcel, vigorous vegetation, low fire risk |
| 1 | `ATTENTION` | early stress signs, monitoring/irrigation recommended |
| 2 | `CRITICAL` | severe water stress / high fire / yield-loss risk |

---

## 🧬 Hybrid data strategy

The MVP trains on a **synthetic, reproducible** dataset for full independence,
while **real-world datasets** ground it in reality (calibration + credibility):

```
Real datasets (UCI / Kaggle / NASA)        Synthetic generator (generator.py)
        │  EDA + correlations                       │  plausible coefficients
        └──────────────┬────────────────────────────┘
                       ▼
   Notebook bridges both: the synthetic coefficients are validated
   against real-data correlations (directional agreement check).
                       ▼
   RandomForest trained on the synthetic core → models/terra_risk.joblib
```

- **Synthetic core** — `generator.py` (seed `42`, identical every run).
- **Real-data layer** — `real_data/` (catalog + downloader). See
  [`real_data/SOURCES.md`](real_data/SOURCES.md) and
  [`../docs/ACCOUNTS_SETUP.md`](../docs/ACCOUNTS_SETUP.md).

---

## 🌱 Features & target

| Feature | Unit | Source domain |
|---|---|---|
| `air_temperature` | °C | IoT field station |
| `air_humidity` | % | IoT field station |
| `soil_moisture` | % | IoT field station |
| `solar_radiation` | W/m² | IoT field station |
| `ndvi` | 0–1 | Earth Observation (satellite) |
| `days_since_rain` | days | Earth Observation / weather |
| `wind_speed` | km/h | IoT field station |
| **`risk_class`** (target) | 0/1/2 | combined disaster + agro risk |

---

## 🚀 Quick start

```bash
make setup     # create .venv + install dependencies
make train     # generate synthetic data + train → models/terra_risk.joblib
```

Optional real-data layer (free accounts — see docs):

```bash
make data-uci      # UCI Forest Fires (no login)
make data-real     # all sources (skips those without credentials)
```

Run `make help` to list every command with a description.

---

## 📂 Files

| Path | Purpose |
|---|---|
| `generator.py` | Synthetic dataset generator (single source of truth for features/classes). |
| `train.py` | Train + evaluate the RandomForest, serialize the model bundle. |
| `real_data/download.py` | Idempotent downloader for real datasets (uci/kaggle/firms/all). |
| `real_data/SOURCES.md` | Catalog & provenance of the real datasets. |
| `notebooks/01_model_training.ipynb` | End-to-end EDA → reality bridge → training → metrics. |
| `Makefile` | Convenience targets for the whole pipeline. |
| `requirements.txt` | Python dependencies. |
| `data/territory_samples.csv` | Generated synthetic dataset (git-ignored). |
| `models/terra_risk.joblib` | Trained model bundle consumed by the backend. |

---

## 📦 Model bundle

`models/terra_risk.joblib` is a dict so the backend can infer without re-deriving metadata:

```python
{
    "model": RandomForestClassifier,   # fitted estimator
    "feature_columns": [...],          # exact input ordering
    "class_names": {0: "HEALTHY", ...},
    "version": "1.0.0",
}
```

---

## 📊 Model & evaluation

- **Algorithm:** `RandomForestClassifier` (`n_estimators=300`, `max_depth=12`,
  `min_samples_leaf=5`, `class_weight="balanced"`, `random_state=42`).
- **Split:** 80/20 stratified.
- **Evaluation focus:** **recall on the `CRITICAL` class** — the costliest error
  is a missed critical parcel (undetected fire/drought/crop-loss).
- **Reference metrics (seed 42):** recall (CRITICAL) ≈ `0.80`, macro F1 ≈ `0.69`,
  with `soil_moisture` and `ndvi` as the dominant drivers — consistent with the
  generator's physical/agronomic design.

---

## 🔁 Reproducibility

- Fixed seed (`42`) → identical synthetic dataset and model every run.
- The notebook and CLI import from the same `generator.py` / `train.py`
  (no duplicated logic).
- Real datasets are git-ignored by default; regenerate locally via `make data-real`.
