# TerraVista — Demo Video Script (≤ 5 min)

> Storyboard for the Global Solution delivery video.
> Author: Gabriel Mule (RM 560586)
> Target length: **under 5 minutes** · unlisted YouTube link goes at the end of the
> technical report.

**Recording notes**
- Record at 1080p; share the browser window full-screen for the web flow.
- Have the **backend running** (`backend/` on port 8000) before you start.
- Pre-open the tabs/projects you will switch to (Wokwi, Expo) to avoid dead air.
- Speak over each scene; the timings below are a guide, not a hard cut list.
- Demo credentials: **`admin` / `terravista`**.

---

## Scene 0 — Opening (0:00 – 0:25)

**On screen:** title slide or the web Login page with the TerraVista logo.

> "Hi, I'm Gabriel Mule, RM 560586. This is **TerraVista**, my Global Solution
> project. The Global Solution asks how advanced AI and computing can drive the new
> **space economy** and create a positive impact on Earth. TerraVista answers that
> with an **Earth-Observation platform**: it fuses orbital vegetation data with IoT
> field stations to do two things at once — **disaster prevention** and
> **agricultural protection**."

---

## Scene 1 — Architecture in one breath (0:25 – 0:50)

**On screen:** the architecture diagram (README or `docs/architecture.md`).

> "The data comes from two sources: **satellite imagery** and an **ESP32 field
> station**. Everything flows into a single **FastAPI backend** that exposes four AI
> capabilities — a machine-learning risk model, computer vision, a generative-AI
> assistant, and a knowledge base. Two clients consume it: a **React web app** and a
> **React Native mobile app**. They all speak the same three-class risk language:
> **HEALTHY, ATTENTION, CRITICAL**."

---

## Scene 2 — Backend running (0:50 – 1:15)

**On screen:** Swagger UI at `http://127.0.0.1:8000/docs`.

> "Here's the backend live. Nine REST endpoints — auth, predict, vision, chat,
> sensors and knowledge. The important design choice: the API **reuses the trained
> model and the vision analyzer by path**, so what we serve is exactly what we
> trained and tested — no duplicated logic, no drift."

*(Optionally expand `/api/predict` to show the schema, then move on.)*

---

## Scene 3 — Web: Login & Dashboard (1:15 – 1:55)

**On screen:** web app, log in with `admin` / `terravista`, land on Dashboard.

> "Logging into the web app. The **Dashboard** is the operations view: KPI cards for
> the latest reading, an **environmental timeline** of temperature, humidity and soil
> moisture, the risk-class distribution, and the recent telemetry table. This data is
> a simulated three-day drying spell, so you can watch the territory drift from
> **HEALTHY** toward **CRITICAL** as it dries out."

---

## Scene 4 — Web: Predict (1:55 – 2:25)

**On screen:** Predict page, click a preset, submit.

> "**Predict** scores a land parcel from seven environmental features using the
> **RandomForest** model. I'll load the CRITICAL preset and run it — the model returns
> the risk class with its probabilities. The model was trained on a synthetic core
> validated against three real datasets: UCI Forest Fires, a Kaggle crop dataset, and
> live NASA FIRMS fire detections."

---

## Scene 5 — Web: Vision (2:25 – 2:55)

**On screen:** Vision page, upload a sample scene, show the result.

> "**Vision** analyzes an RGB scene. It computes an **Excess-Green index** as an NDVI
> proxy and breaks the image into vegetation, dryness and smoke fractions, then maps
> those to the same risk taxonomy. Here's a dry/smoky scene flagged as CRITICAL.
> YOLO detection is optional and degrades gracefully if the weights aren't present."

---

## Scene 6 — Web: Chat & Knowledge (2:55 – 3:25)

**On screen:** Chat page — ask a question; then Knowledge page.

> "The **Assistant** is the generative-AI piece — civil-defense and agronomic
> guidance through OpenRouter, with a mock fallback so the demo never breaks offline.
> I'll ask what to do under critical fire risk... and it answers with actionable
> mitigation steps. The **Knowledge** page is the curated companion: recommended
> actions per risk level."

---

## Scene 7 — Mobile (3:25 – 4:00)

**On screen:** the Expo app (device, emulator, or `--web`), log in, show Dashboard.

> "The same platform on **mobile**, built with React Native, Expo and React Native
> Paper. Same backend, same risk model, same screens — Dashboard, Predict, Vision,
> Chat and Knowledge — so a field agent gets the full toolkit on their phone. Notice
> the dashboard chart pulls the same live telemetry from the backend."

---

## Scene 8 — IoT field station (4:00 – 4:35)

**On screen:** the Wokwi project (`https://wokwi.com/projects/466934430632875009`).

> "And this is where the field data is born: an **ESP32 station** in MicroPython,
> simulated on Wokwi. It reads a DHT22 for temperature and humidity, a potentiometer
> standing in for a soil-moisture probe, and an LDR for light. Watch the serial log:
> it maps those readings into the same seven features the model uses, computes a
> **risk hint at the edge** — driving the LEDs and LCD — and **POSTs the telemetry**
> to the very same `/api/sensors/readings` endpoint that backs the dashboard. In this
> demo the dashboard runs on seeded data; pointed at the deployed backend through a
> tunnel, the station feeds that exact pipeline live."

---

## Scene 9 — Closing (4:35 – 5:00)

**On screen:** back to the architecture diagram or the Dashboard.

> "So that's TerraVista: orbital and edge data, four AI capabilities behind one API,
> on web and mobile — turning space-economy data into **actionable resilience on the
> ground**, for both disaster prevention and agriculture. Thanks for watching. The
> code and full technical report are in the repository linked in the description."

---

## Quick shot list (for editing)

| # | Scene | Source |
|---|---|---|
| 0 | Opening | Login page / title |
| 1 | Architecture | `docs/architecture.md` diagram |
| 2 | Backend | Swagger `/docs` |
| 3 | Dashboard | web `/dashboard` |
| 4 | Predict | web `/predict` |
| 5 | Vision | web `/vision` |
| 6 | Chat + Knowledge | web `/chat`, `/knowledge` |
| 7 | Mobile | Expo app |
| 8 | IoT | Wokwi project |
| 9 | Closing | architecture / dashboard |
