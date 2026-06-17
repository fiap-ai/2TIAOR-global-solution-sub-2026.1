# CONTEXT.md — TerraVista Project Knowledge Base

> Maintained by Cline for context recovery between sessions.
> Last updated: 2026-06-15

## Stack & Infra
- **Backend:** Python 3.11+, FastAPI, Pydantic v2, scikit-learn, Ultralytics (YOLO), OpenRouter (LLM).
- **ML:** RandomForestClassifier on synthetic territorial-risk dataset, serialized as `.joblib`.
- **Vision:** YOLO (Ultralytics) for object detection on satellite/aerial imagery.
- **Web:** React + Vite + TypeScript + shadcn/ui → deploy Vercel (CI/CD).
- **Mobile:** React Native + Expo + React Native Paper → APK via EAS Build.
- **IoT:** MicroPython on ESP32 (Wokwi simulator), DHT22 + potentiometers/LDR + SSD1306 OLED + 3 LEDs.

## Architecture
```
Satellite EO (image/NDVI) + Field Station (ESP32/MicroPython/Wokwi)
                     │ HTTP POST
                     ▼
            Backend FastAPI (Python)
        ├─► ML RandomForest   → territorial risk (disaster + agri)
        ├─► YOLO (Ultralytics) → fire/drought/flood/crop-failure in imagery
        ├─► LLM/RAG (OpenRouter)→ civil-defense + agronomist assistant
        └─► Knowledge base    → mitigation/management actions
                     ▼
        Web (React+Vite, Vercel) + Mobile (Expo, EAS APK)
```

## Conventions
- Code & documentation in **English**; user conversation in **pt-br**.
- Directory layout: `backend/ ml/ vision/ web/ mobile/ iot/ docs/ assets/`.
- Backend endpoints: `/health`, `/api/auth/login`, `/api/predict`, `/api/vision`, `/api/chat`, `/api/sensors`, `/api/sensors/latest`, `/api/knowledge`.
- Synthetic data with physically/agronomically plausible coefficients; recall-focused evaluation.

## Current State
- Theme decided: **TerraVista — Earth Observation for Climate & Agricultural Resilience** (50/50 disaster + agro).
- Approach: rewrite from scratch, using Phase 6/7 (CardioIA) only as architectural reference.
- Identity: Gabriel Mule — RM 560586.

## Active Decisions (ADRs)
- Chat uses OpenRouter with **mock fallback** (works offline, no API key needed for demo).
- In-memory sensor store (deque, last 100 readings) — lightweight for MVP.
- Mock auth (`admin`/`terravista`) returns a JWT-like token.
- Deploy handoff: configs ready, user runs deploy commands (Cline has no credentials).

## Known Pitfalls
- YOLO weights can be heavy; use a small pretrained model (yolov8n) + custom class mapping for demo.
- Wokwi VS Code extension may not load separate `.py` files → inline SSD1306 driver fallback.
- GS is individual: code must be authorial. Do NOT copy Phase 7 verbatim.
