# TerraVista — PLAN

## Context
GS 2026.1 (SUB Global Solution): build a POC answering "How can advanced AI/computing
boost the new space economy and generate positive impact on Earth?". We pivot the proven
full-stack architecture from CardioIA (Phase 6/7) into **TerraVista** — an Earth Observation
platform that fuses satellite data (EO/NDVI) + IoT field stations, processed by AI, for
**disaster prevention** and **agricultural protection** (50/50 balance). Rewritten from scratch.

## Goals
- Functional MVP covering GS minimum requirements: Generative AI, Computer Vision, ML,
  data analysis, APIs, dashboards, sensors/ESP32/Edge.
- Full-stack: backend (FastAPI), ML (RandomForest), vision (YOLO), web (React), mobile
  (Expo), IoT (MicroPython/Wokwi).
- Complete documentation: root README, per-folder READMEs, architecture diagram,
  technical report, delivery PDF structure, video script.

## Scope
**In:**
- Synthetic ML dataset + notebook + serialized model.
- YOLO inference script/notebook + sample imagery.
- FastAPI backend with 7 endpoints + Bruno collection.
- MicroPython IoT (ESP32 + DHT22 + 2 pots/LDR + OLED + 3 LEDs) + Wokwi diagram.
- React web (Login, Dashboard, Predict, Vision, Chat) + Vercel config.
- React Native mobile (same screens) + EAS config.
- docs/ (architecture, report) + delivery PDF draft + video script.
- docs/professionalization.md — roadmap of professional hardware (pro sensors,
  mapping drones, satellites, gateways) showing how to scale the MVP to production.
  Scope of the built MVP stays ESP32/Wokwi; this is a vision/maturity document only.

**Out:**
- Actual deploy (handoff to user — needs their credentials).
- Real satellite API integration (use sample imagery + synthetic NDVI for MVP).
- Real authentication/database (mock auth + in-memory store).

## Decisions
- Theme: TerraVista, 50/50 disaster + agro, Earth Observation as the space-economy anchor.
- Identity: Gabriel Mule — RM 560586.
- Chat: OpenRouter + mock fallback (offline-capable demo).
- YOLO: yolov8n pretrained as base; domain class mapping for demo detections.
- Code/docs in English; conversation in pt-br.

## Phases
0. Scaffold repo + @todo context — S
1. ML: synthetic generator + notebook + .joblib — M
2. Vision: YOLO script/notebook + sample imagery — M
3. Backend: FastAPI 7 endpoints + Bruno — L
4. IoT: MicroPython ESP32 + Wokwi diagram — M
5. Web: React+Vite+shadcn + Vercel config — L
6. Mobile: React Native+Expo + EAS config — M
7. Docs & delivery PDF + video script — M
8. Deploy handoff (configs + step-by-step) — S
