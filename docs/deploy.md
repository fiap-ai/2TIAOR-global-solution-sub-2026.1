# TerraVista — Deploy Handoff

> Step-by-step guide to take TerraVista from local to hosted.
> Author: Gabriel Mule (RM 560586)

The MVP runs fully on `localhost` with no deploy. This guide is for publishing
the public links referenced by the README badges and the technical report. Do
the steps **in order** — every client points at the backend, so deploy it first.

| Order | Component | Target | Config |
|---|---|---|---|
| 1 | Backend (FastAPI) | Render / Railway / Fly.io | `backend/requirements.txt` |
| 2 | Web (React) | Vercel | `web/vercel.json` |
| 3 | Mobile (Expo) | EAS Build (APK) | `mobile/eas.json` |
| 4 | IoT (ESP32) | Wokwi → tunnel | `iot/main.py` |

---

## 1. Backend — FastAPI

The backend serves all 9 endpoints and loads `ml/models/terra_risk.joblib` and
`vision/detector.py` **by path**, so the whole repo (not just `backend/`) must be
present at build time.

**Start command:**

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

(`$PORT` is injected by the host; locally use `make run` → port 8000.)

**Build:** `pip install -r backend/requirements.txt`. Set the root/working
directory so the relative paths to `ml/` and `vision/` resolve (the whole repo).

**Environment variables** (all optional — safe defaults exist):

| Var | Purpose | Default |
|---|---|---|
| `OPENROUTER_API_KEY` | Enables real chat (else offline mock) | _empty_ |
| `CORS_ORIGINS` | Comma-separated allowed origins | `*` |
| `AUTH_USERNAME` / `AUTH_PASSWORD` | Demo login | `admin` / `terravista` |
| `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` | Persist readings (else in-memory) | _empty_ |

After deploy, confirm `GET https://<host>/api/health` returns `model_loaded: true`
and that `https://<host>/docs` (Swagger) opens — that Swagger URL is the
**API badge** link in the README.

> Optional: run `python backend/seed_data.py` against the host to seed the
> dashboard timeline (or let the IoT station feed it live).

---

## 2. Web — Vercel

`web/vercel.json` already declares the SPA rewrite (all routes → `/`).

1. Import the repo in Vercel; set **Root Directory** to `web/`.
2. Framework preset: **Vite** (build `npm run build`, output `dist`).
3. Add the environment variable:

   ```
   VITE_API_URL=https://<your-backend-host>/api
   ```

4. Deploy. The resulting URL is the **Web badge** link in the README.

---

## 3. Mobile — EAS Build (APK)

`mobile/eas.json` defines a `preview` profile that produces an installable APK.

1. Point the app at the deployed backend in `mobile/app.json`:

   ```json
   "extra": { "apiUrl": "https://<your-backend-host>/api" }
   ```

2. Build:

   ```bash
   cd mobile
   npm install -g eas-cli   # if not installed
   eas login
   eas build -p android --profile preview
   ```

3. EAS returns a build page with the downloadable `.apk` — that link is the
   **APK badge** in the README.

---

## 4. IoT — ESP32 (Wokwi)

The Wokwi simulation already runs:
<https://wokwi.com/projects/466934430632875009>.

To make the station feed a real backend, edit `iot/main.py`:

```python
API_URL = "https://<your-backend-host>/api/sensors/readings"
```

(For a backend still on localhost, expose it first with `ngrok http 8000` and use
the https tunnel URL.) Run the simulation; readings then appear on the web/mobile
dashboard.

---

## 5. After deploying — update the links

Once the three hosted URLs exist, replace the placeholders:

- `README.md` — swap the three `href="#"` deploy badges (Web / API / APK).
- `docs/technical-report.md` §5 — fill the **Repository** link.
- `iot/main.py` — set the real `API_URL`.

The IoT (Wokwi) badge and link are already live.
