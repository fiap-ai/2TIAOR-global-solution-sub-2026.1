# TerraVista — Architecture

> Detailed architecture diagrams for the TerraVista platform.
> Author: Gabriel Mule (RM 560586)

TerraVista fuses **Earth-Observation imagery** and **IoT field telemetry** into a
single FastAPI backend that serves four AI capabilities (ML, computer vision,
generative AI, knowledge base) to a web and a mobile client. This document zooms
into the data flow and a representative request lifecycle.

---

## 1. System overview

```mermaid
flowchart TD
    subgraph CAPTURE["🌍 Data capture"]
        SAT["🛰️ Earth Observation<br/>RGB scene / NDVI proxy"]
        IOT["📡 ESP32 Field Station<br/>MicroPython · Wokwi<br/>DHT22 + soil pot + LDR"]
    end

    subgraph BACKEND["⚙️ Backend — FastAPI (Python)"]
        direction TB
        ROUTERS["REST routers (/api)"]
        ML["🌲 ML service<br/>RandomForest → risk"]
        CV["👁️ Vision service<br/>ExG index + optional YOLO"]
        LLM["🤖 Chat service<br/>OpenRouter + mock fallback"]
        KB["📚 Knowledge service<br/>mitigation actions"]
        STORE["🗄️ Sensor store<br/>in-memory deque / Supabase"]
        ROUTERS --> ML & CV & LLM & KB & STORE
    end

    subgraph CLIENTS["📱 Clients"]
        WEB["💻 Web — React + Vite<br/>(Vercel)"]
        MOB["📱 Mobile — Expo<br/>(EAS APK)"]
    end

    SAT -->|"POST /api/vision/analyze"| ROUTERS
    IOT -->|"POST /api/sensors/readings"| ROUTERS
    WEB <-->|"REST /api"| ROUTERS
    MOB <-->|"REST /api"| ROUTERS

    ML -. reuses .-> ARTML["ml/models/terra_risk.joblib"]
    CV -. reuses .-> ARTCV["vision/detector.py"]
```

**Key principle — no duplicated logic:** the backend imports the trained model
(`ml/models/terra_risk.joblib`) and the scene analyzer (`vision/detector.py`)
**by path**, so the served pipeline never diverges from what was trained/tested.

---

## 2. Module responsibilities

| Module | Responsibility | Key tech |
|---|---|---|
| `ml/` | Train the territorial-risk classifier on synthetic data validated against real datasets | RandomForest, scikit-learn |
| `vision/` | Classify an RGB scene (vegetation / dryness / smoke) + optional detection | ExG index, Ultralytics YOLO |
| `backend/` | REST API tying every capability together (9 endpoints) | FastAPI, Pydantic v2 |
| `iot/` | Edge field station: read sensors, edge-score, POST telemetry | MicroPython, ESP32, Wokwi |
| `web/` | Operator dashboard + tools (Predict, Vision, Chat, Knowledge) | React, Vite, shadcn/ui |
| `mobile/` | Same screens for field use | React Native, Expo, Paper |

---

## 3. Risk taxonomy (shared language)

Every capability speaks the **same 3-class taxonomy**, so tabular ML, computer
vision and the IoT edge all agree:

```mermaid
flowchart LR
    H["🟢 HEALTHY<br/>vigorous, low risk"]
    A["🟡 ATTENTION<br/>early stress, monitor"]
    C["🔴 CRITICAL<br/>severe stress / fire / loss"]
    H --> A --> C
```

---

## 4. Request lifecycle — IoT reading → dashboard

This sequence shows the end-to-end path from the field station to the dashboard,
exercising the IoT edge, the ML model and the persistence layer.

```mermaid
sequenceDiagram
    participant ESP as 📡 ESP32 (MicroPython)
    participant API as ⚙️ FastAPI /api/sensors
    participant ML as 🌲 ML service (RandomForest)
    participant DB as 🗄️ Sensor store
    participant WEB as 💻 Web / 📱 Mobile dashboard

    ESP->>ESP: read DHT22 + soil pot + LDR
    ESP->>ESP: edge risk hint (LED feedback)
    ESP->>API: POST /api/sensors/readings (JSON telemetry)
    API->>ML: predict(features)
    ML-->>API: risk_label + probabilities
    API->>DB: store reading + verdict
    API-->>ESP: 200 OK (stored → risk_label)
    WEB->>API: GET /api/sensors/readings (poll 15s)
    API->>DB: fetch recent readings
    DB-->>API: timeline
    API-->>WEB: readings + latest verdict
    WEB->>WEB: render KPIs + chart
```

---

## 5. Request lifecycle — Vision analysis

```mermaid
sequenceDiagram
    participant U as 👤 User (web/mobile)
    participant API as ⚙️ FastAPI /api/vision/analyze
    participant CV as 👁️ Vision service (detector.py)

    U->>API: POST image (multipart/form-data)
    API->>CV: analyze(image, run_yolo?)
    CV->>CV: ExG index → vegetation / dryness / smoke fractions
    CV->>CV: monotonic rule set → risk class + confidence
    opt run_yolo = true
        CV->>CV: YOLO detections (graceful if unavailable)
    end
    CV-->>API: risk_label, fractions, detections
    API-->>U: JSON result → rendered badges + bars
```

---

## 6. Deployment topology (target)

```mermaid
flowchart LR
    subgraph CLOUD["☁️ Hosting"]
        VERCEL["Vercel<br/>web (static SPA)"]
        APIHOST["API host<br/>(Render/Railway/Fly)"]
    end
    subgraph DEVICES["📱 Devices"]
        APK["Android APK<br/>(EAS Build)"]
        WOKWI["ESP32 / Wokwi<br/>(tunnel → API)"]
    end
    VERCEL -->|REST| APIHOST
    APK -->|REST| APIHOST
    WOKWI -->|REST via tunnel| APIHOST
```

Deploy configs already exist (`web/vercel.json`, `mobile/eas.json`); the
step-by-step handoff guide lives in [`deploy.md`](deploy.md).
