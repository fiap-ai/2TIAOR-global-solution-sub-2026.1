# TerraVista — Backend (FastAPI)

REST API that ties the whole platform together. It **reuses the exact artifacts**
produced by the other modules — the RandomForest model from `ml/` and the scene
analyzer from `vision/` — so the API never diverges from the trained pipeline.

- **Author:** Gabriel Mule (RM 560586)
- **Stack:** Python 3.11 · FastAPI · Pydantic v2 · scikit-learn · Pillow

## Architecture

```
backend/app
├── main.py            # FastAPI app, CORS, router mounting (/api prefix)
├── config.py          # env-driven settings + repo path resolution
├── schemas.py         # Pydantic v2 request/response contracts
├── routers/           # one module per endpoint group
│   ├── health.py      # GET  /api/health
│   ├── auth.py        # POST /api/auth/login           (mock token)
│   ├── predict.py     # POST /api/predict              (tabular ML)
│   ├── vision.py      # POST /api/vision/analyze        (computer vision)
│   ├── chat.py        # POST /api/chat                  (generative AI)
│   ├── sensors.py     # POST/GET /api/sensors/*         (IoT ingest)
│   └── knowledge.py   # GET  /api/knowledge             (mitigation actions)
└── services/          # business logic (model, vision, sensors, chat, knowledge)
```

The model and vision modules are imported by path (`ml/`, `vision/`) — no logic is
duplicated. `config.py` resolves those paths relative to the repo root.

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET  | `/api/health` | Liveness + model availability |
| POST | `/api/auth/login` | Mock login → bearer token |
| POST | `/api/predict` | Classify a parcel from 7 features → HEALTHY/ATTENTION/CRITICAL |
| POST | `/api/vision/analyze` | Classify an uploaded RGB scene (ExG vegetation index) |
| POST | `/api/chat` | AI assistant (OpenRouter, mock fallback) |
| POST | `/api/sensors/readings` | Store an ESP32 reading (auto-scored) |
| GET  | `/api/sensors/readings` | List recent readings |
| GET  | `/api/sensors/latest` | Latest reading + verdict |
| GET  | `/api/knowledge` | Mitigation actions (optionally `?risk_label=`) |

Interactive docs (Swagger UI) at **`/docs`** when the server is running.

## Quick start

```bash
make setup                 # create .venv and install deps
cp .env.example .env        # optionally add your OpenRouter key
make dev                    # start with auto-reload on http://127.0.0.1:8000
```

Smoke-test without HTTP:

```bash
make smoke                  # imports the app and runs one prediction
```

## Configuration (`.env`)

| Variable | Default | Notes |
|---|---|---|
| `OPENROUTER_API_KEY` | *(empty)* | If empty, `/api/chat` uses the offline mock |
| `OPENROUTER_MODEL` | `openai/gpt-oss-120b:free` | Primary (free) chat model |
| `OPENROUTER_FALLBACK_MODEL` | `deepseek/deepseek-v4-flash` | Cheap paid model used only if the free one fails |
| `OPENROUTER_URL` | `…/chat/completions` | OpenRouter chat endpoint |
| `OPENROUTER_TIMEOUT` | `20` | Request timeout (seconds) |
| `OPENROUTER_MAX_TOKENS` | `512` | Cap on completion length (cost control) |
| `AUTH_USERNAME` / `AUTH_PASSWORD` | `admin` / `terravista` | Mock login credentials |
| `AUTH_SECRET` | `change-me-in-production` | Used to derive the mock token |
| `CORS_ORIGINS` | `*` | Comma-separated allowed origins |

> The chat assistant **degrades gracefully** through a 3-tier fallback chain so the
> demo never breaks:
> 1. **Free primary model** (`OPENROUTER_MODEL`) — zero cost.
> 2. **Cheap paid fallback** (`OPENROUTER_FALLBACK_MODEL`) — only used if the free
>    model is rate-limited (HTTP 429) or errors; a few thousandths of a cent per reply.
> 3. **Offline mock** — deterministic answer grounded in the knowledge base, used if
>    both models fail or no key is configured.
>
> The `source` field in the response reports which tier answered
> (`openrouter:<model>` or `mock`).

## API testing (Bruno)

A [Bruno](https://www.usebruno.com/) collection lives in `bruno/`. Open the folder
in Bruno, select the **Local** environment, then run the requests. The collection
includes HEALTHY/ATTENTION/CRITICAL variants for `predict` and `vision`, the full
sensor flow (post → list → latest) and both knowledge queries.

## Prerequisites

- The ML model must exist at `ml/models/terra_risk.joblib` (run `make train` in `ml/`).
- The vision module (`vision/detector.py`) must be present for `/api/vision/analyze`.
