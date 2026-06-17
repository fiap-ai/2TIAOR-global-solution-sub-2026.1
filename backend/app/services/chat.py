"""TerraVista — Chat assistant service (Generative AI).

Acts as a civil-defense + agronomist assistant. Uses OpenRouter when an API key
is configured; otherwise falls back to a deterministic, keyword-driven mock so
the demo always works offline (no key required).

Author: Gabriel Mule (RM 560586)
"""

from __future__ import annotations

import time

import requests

from app.config import settings
from app.logging_config import get_logger
from app.services import knowledge

log = get_logger()


# Free OpenRouter models are occasionally rate-limited upstream (HTTP 429).
# We retry once, honoring the provider's Retry-After hint (capped), before
# letting the caller fall back to the offline mock.
_MAX_RETRY_AFTER = 8

SYSTEM_PROMPT = (
    "You are TerraVista's assistant, an expert in civil-defense (wildfire/drought "
    "prevention) and agronomy (crop water-stress management). Answer concisely and "
    "practically. The platform classifies land parcels into HEALTHY, ATTENTION or "
    "CRITICAL territorial risk from satellite (NDVI) and field-sensor data."
)


def _mock_reply(message: str, context: str | None) -> str:
    """Deterministic offline answer grounded in the knowledge base."""
    text = f"{message} {context or ''}".lower()

    if "critical" in text or "fire" in text or "fogo" in text or "incêndio" in text:
        label = "CRITICAL"
    elif "attention" in text or "stress" in text or "dry" in text or "seca" in text:
        label = "ATTENTION"
    elif "healthy" in text or "ok" in text or "saudável" in text:
        label = "HEALTHY"
    else:
        label = None

    if label:
        item = knowledge.get_items(label)[0]
        actions = "\n".join(f"- {a}" for a in item["actions"])
        return (
            f"[offline assistant] For a {label} parcel — {item['title']}:\n{actions}\n\n"
            "Configure OPENROUTER_API_KEY in backend/.env for full AI responses."
        )

    return (
        "[offline assistant] I can advise on HEALTHY, ATTENTION or CRITICAL parcels "
        "(irrigation, monitoring, firebreaks, civil-defense alerts). Ask about a "
        "specific risk level, or configure OPENROUTER_API_KEY for full AI answers."
    )


def _openrouter_reply(message: str, context: str | None, model: str) -> str:
    """Call OpenRouter's chat-completions API with a given model. Raises on failure."""
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    if context:
        messages.append({"role": "system", "content": f"Current context: {context}"})
    messages.append({"role": "user", "content": message})

    headers = {
        "Authorization": f"Bearer {settings.openrouter_api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://terravista.example",
        "X-Title": "TerraVista",
    }
    payload = {
        "model": model,
        "messages": messages,
        "max_tokens": settings.openrouter_max_tokens,
    }

    for attempt in range(2):  # one retry on a transient 429
        resp = requests.post(
            settings.openrouter_url,
            headers=headers,
            json=payload,
            timeout=settings.openrouter_timeout,
        )
        if resp.status_code == 429 and attempt == 0:
            wait = min(int(resp.headers.get("Retry-After", 3)), _MAX_RETRY_AFTER)
            time.sleep(wait)
            continue
        break

    resp.raise_for_status()
    data = resp.json()
    return data["choices"][0]["message"]["content"].strip()


def chat(message: str, context: str | None = None) -> dict[str, str]:
    """Return an assistant reply via a graceful fallback chain.

    1. Free primary model (zero cost).
    2. Cheap paid fallback model (only if the free one is rate-limited / errors).
    3. Deterministic offline mock (if both fail or no key is configured).

    `source` reports which tier answered: "openrouter:<model>" or "mock".
    """
    if not settings.openrouter_api_key.strip():
        return {"reply": _mock_reply(message, context), "source": "mock"}

    candidates = [settings.openrouter_model]
    fallback = settings.openrouter_fallback_model.strip()
    if fallback and fallback != settings.openrouter_model:
        candidates.append(fallback)

    for model in candidates:
        try:
            reply = _openrouter_reply(message, context, model)
            return {"reply": reply, "source": f"openrouter:{model}"}
        except Exception as exc:  # noqa: BLE001 — try the next tier on any API/network error
            log.warning("chat: model '%s' failed (%s); trying next tier", model, exc)
            continue

    log.warning("chat: all OpenRouter models failed; using offline mock")
    return {"reply": _mock_reply(message, context), "source": "mock"}

