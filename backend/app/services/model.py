"""TerraVista — ML model service.

Loads the RandomForest bundle produced by `ml/train.py` and exposes a single
`predict()` helper. The model is loaded lazily and cached, so the first request
pays the load cost and subsequent ones are fast.

Author: Gabriel Mule (RM 560586)
"""

from __future__ import annotations

from functools import lru_cache
from typing import Any

import joblib
import pandas as pd

from app.config import MODEL_PATH


@lru_cache(maxsize=1)
def _load_bundle() -> dict[str, Any]:
    """Load and cache the serialized model bundle (model + metadata)."""
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Model not found at {MODEL_PATH}. Run `make train` in ml/ first."
        )
    return joblib.load(MODEL_PATH)


def model_is_available() -> bool:
    """True if the model file exists (used by /health)."""
    return MODEL_PATH.exists()


def predict(features: dict[str, float]) -> dict[str, Any]:
    """Predict the territorial-risk class for one feature dict.

    Returns the class index, human label and per-class probabilities.
    """
    bundle = _load_bundle()
    model = bundle["model"]
    feature_columns: list[str] = bundle["feature_columns"]
    class_names: dict[int, str] = bundle["class_names"]

    # Order the features exactly as the model was trained.
    row = pd.DataFrame([[features[c] for c in feature_columns]], columns=feature_columns)

    pred = int(model.predict(row)[0])
    proba = model.predict_proba(row)[0]
    probabilities = {class_names[i]: round(float(p), 4) for i, p in enumerate(proba)}

    return {
        "risk_class": pred,
        "risk_label": class_names[pred],
        "probabilities": probabilities,
    }
