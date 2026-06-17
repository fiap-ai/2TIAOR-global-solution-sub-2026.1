# TerraVista — Progress

**Status:** Phases 0–8 DONE · Phase: 9 (Delivery & QA)

## Current Focus
Phase 9 — Delivery & QA: visual evidence captured and wired into the docs; chat
markdown `<br>` bug fixed. All engineering work is complete. What remains is the
**User Delivery Checklist** below — those are Barney's manual steps (PDF export,
video, deploys, link swaps), not code tasks.
Next step: nothing on the engineering side; hand off the User Delivery Checklist.
Blocker: none

Note: Phase 6 Mobile DONE — RN+Expo SDK 56 app (react-native-paper dark, drawer nav, react-native-chart-kit), all 6 screens mirroring web, `npm run typecheck` clean (EXIT=0). Phase 5.1 done — chat markdown render, Vision 3 real-sample badges, Predict 3 preset badges, Supabase persistence in FastAPI; plus smoke-detection fix (brightness floor 0.55→0.40) and reusable theoretical-context layer (glossary.ts + InfoNote on all pages).




## User Handoff — Accounts & Keys (you, Barney)
> Guide: `docs/ACCOUNTS_SETUP.md`. Synthetic dataset needs none of these.
- [x] Kaggle account + `~/.kaggle/kaggle.json` (600) — validated, dataset downloaded
- [x] NASA FIRMS `MAP_KEY` → in `ml/.env` — validated, 787 live fires downloaded
- [ ] (reference only) NASA Earthdata account
- [ ] (reference only) Copernicus/Sentinel account
- [x] UCI Forest Fires — no credentials needed


## Progress

### Phase 0 — Scaffold
- [x] @todo/CONTEXT.md
- [x] @todo/TERRAVISTA/PLAN.md
- [x] @todo/TERRAVISTA/PROGRESS.md
- [x] Root directory structure (backend, ml, vision, web, mobile, iot, docs, assets)
- [x] Root .gitignore
- [x] FIAP logo copied to assets/

### Phase 1 — Machine Learning (hybrid data) ✅
- [x] Synthetic dataset generator (ml/generator.py)
- [x] docs/ACCOUNTS_SETUP.md (accounts & keys guide for real datasets)
- [x] real_data/SOURCES.md (catalog of real datasets)
- [x] real_data/download.py (subcommands: uci/kaggle/firms/all)
- [x] ml/.env.example (FIRMS_MAP_KEY + bbox area endpoint)
- [x] train.py (RandomForest → models/terra_risk.joblib)
- [x] Training notebook (synthetic EDA + 3 real bridges, RF, metrics) — executed OK
- [x] ml/Makefile + ml/README.md
- [x] Run generation + training (.joblib; recall CRITICAL≈0.80)
- [x] Real-data validated: UCI (517 rows) + Kaggle Crop (2200) + FIRMS (787 live fires)

### Phase 2 — Computer Vision ✅
- [x] Scene analyzer (vegetation indices: ExG/NDVI proxy) + optional YOLO (detector.py)
- [x] Synthetic sample-scene generator (generate_samples.py)
- [x] Notebook (01_vision_pipeline.ipynb) — executed OK
- [x] vision/Makefile + requirements.txt + README.md
- [x] Validated: 3/3 synthetic scenes classified correctly (HEALTHY/ATTENTION/CRITICAL)

### Phase 3 — Backend ✅
- [x] FastAPI app + config + schemas
- [x] Routers: health, auth, predict, vision, chat, sensors, knowledge
- [x] Bruno collection (13 requests) + Makefile + README
- [x] OpenRouter 3-tier fallback chain (free → deepseek-v4-flash → mock)
- [x] Documented OpenRouter key + fallback in docs/ACCOUNTS_SETUP.md
- [x] App logger (terravista) with per-request informative logs (predict/vision/chat/sensors/auth)
- [x] Validated all 7 endpoints via curl


### Phase 4 — IoT ✅
- [x] MicroPython main.py (wifi + sensors + edge risk + LED + LCD + POST)
- [x] lcd1602.py I2C driver + Wokwi diagram.json (ESP32 + DHT22 + pot + LDR + LCD + 3 LEDs)
- [x] Fixed Wokwi black-screen (boot print + LCD try/except + wokwi.toml firmware-only)
- [x] Validated on wokwi.com web: https://wokwi.com/projects/466934430632875009


### Phase 5 — Web ✅
- [x] React+Vite+TS+shadcn app (dark slate theme) — scaffolded via create-vite
- [x] lib: api (axios+interceptor), types, auth, risk, utils
- [x] shadcn/ui components via CLI (button/card/input/label/badge/tabs/textarea/table/sonner)
- [x] Layout (sidebar) + RiskBadge + ProtectedRoute
- [x] Pages: Login, Dashboard (Recharts), Predict, Vision, Chat, Knowledge
- [x] App.tsx (router + guard) + main.tsx (QueryClient + Toaster)
 - [x] vercel.json + .env.example + README
- [x] `npm run build` clean; validated in browser against backend

### Phase 6 — Mobile ✅
- [x] React Native + Expo SDK 56 app (scaffolded via create-expo-app; deps via `expo install`)
- [x] react-native-paper MD3 dark theme + drawer navigation (RootNavigator gates Login/Drawer)
- [x] lib/ mirror of web (types, risk, auth via AsyncStorage, api via expo-constants, glossary)
- [x] Screens: Login, Dashboard (react-native-chart-kit timeline), Predict, Vision (expo-image-picker), Chat, Knowledge
- [x] eas.json (dev/preview/prod) + mobile/README.md
- [x] `npm run typecheck` clean (EXIT=0); validated in browser via `expo start --web` (Login→Dashboard chart+KPIs from backend, Drawer, Predict)

### Phase 7 — Docs & Delivery ✅
- [x] Root README (FIAP template) + per-folder READMEs cross-linked
- [x] Architecture diagram (Mermaid) — README + docs/architecture.md
- [x] Technical report (docs/technical-report.md → PDF source; user exports PDF)
- [x] docs/professionalization.md (pro hardware roadmap: sensors, drones, satellites)
- [x] Video script (docs/video-script.md) — reviewed against spec + code (Scene 8 IoT corrected)


### Phase 8 — Deploy Handoff ✅
- [x] Deploy configs already exist (`web/vercel.json`, `mobile/eas.json`)
- [x] `docs/deploy.md` — step-by-step guide (backend → web → mobile → IoT) + post-deploy link-swap checklist

### Phase 9 — Delivery & QA ✅ (engineering side)
- [x] Captured 6 live web screenshots → `docs/assets/` (01-login … 06-chat)
- [x] Wired screenshots into `docs/technical-report.md` (§2.8 walkthrough)
- [x] Wired screenshots into `README.md` (§Telas)
- [x] Fixed chat markdown `<br>` literal bug — `normalizeMarkdown` in `web/src/lib/markdown.ts` + `mobile/src/lib/markdown.ts`, used by both Markdown components
- [x] `web` tsc -b clean + `mobile` typecheck clean after the fix
- [x] README deploy badges (Web/API/APK placeholders + live Wokwi)

## User Delivery Checklist (Barney — manual, not code)
> Everything engineering is done. These are your hands-on delivery steps.
- [x] Professor names: removed the section (sibling FIAP projects don't fill it either)
- [x] Delivery report translated to PT-BR (`docs/technical-report.md`) — final
      deliverable must be PT-BR even though docs/code default to EN
- [x] First PDF export done → `docs/terravista-technical-report.pdf` (PT-BR)
      via `pandoc --pdf-engine=xelatex -V lang=pt-BR` (command stored in the report
      header); §5 links still pending → re-export after the YouTube + repo links are filled
- [x] Mobile (07-10) + Wokwi (11-12) screenshots organized in `docs/assets/`
      (raw JPEGs removed), wired into report §2.6 (IoT) + §2.7 (Mobile) and README
      "📸 Telas" (Web/Mobile/IoT); PDF re-exported PT-BR (3.7 MB)

- [ ] Record the demo video (≤5 min) using `docs/video-script.md`; upload to
      YouTube as **unlisted**
- [ ] Add the YouTube link to `docs/technical-report.md` §5 (and re-export the PDF)
- [ ] (optional) Deploy per `docs/deploy.md`; then swap the 3 `#` README badges,
      the repo link in the report §5, and `iot/main.py` `API_URL`
- [ ] Add the public repo link to `docs/technical-report.md` §5
- [ ] **RE-EXPORT the PDF** after §5 has BOTH the YouTube + repo links filled
      (same command in the report header) — the submitted PDF MUST contain the
      video link
- [ ] Submit the PDF (no .zip); confirm repo is public and all code runs

## Decisions Made During Execution
- 2026-06-15: Project kicked off; theme TerraVista (EO disaster+agro) confirmed by user.
- 2026-06-15: FIRMS uses /area/ bbox endpoint (the /country/ endpoint needs elevated access; bbox works with a free MAP_KEY). Brazil bbox default: -74,-34,-34,6.
- 2026-06-15: Phase 1 closed with all 3 real datasets validated end-to-end in the notebook.
- 2026-06-15: Phase 5 Web — used official shadcn CLI (not manual copies); TS 7-beta requires `paths` without `baseUrl`; sonner pinned theme="dark" (dropped next-themes). 6 screens in dark slate theme, Dashboard uses Recharts (Area + Bar). Vercel SPA rewrite in vercel.json.
- 2026-06-15: Phase 5.1 — Supabase persistence lives in the FastAPI backend (not the frontend), using the service_role key; sensors.py transparently falls back to an in-memory deque when envs are empty. service_role needs explicit table grants (SELECT/INSERT/DELETE + sequence) despite bypassing RLS.
- 2026-06-15: Phase 5.1 — seed_data.py rewritten as a continuous 3-day "drying spell" time series (diurnal day/night cycle + slow drying curve) instead of 3 discrete random profiles — gives a realistic, smooth HEALTHY→ATTENTION→CRITICAL drift (48 readings, ~20/14/14). The Predict ATTENTION preset was also recalibrated (old fixed values scored CRITICAL; ATTENTION is a narrow band in the model).
- 2026-06-16: Phase 9 — screenshots captured via headless Puppeteer (cached Chrome-for-Testing) since browser_action can't save files; chat capture uses a 90s wait for the slow free OpenRouter model. Fixed the chat `<br>` literal bug by normalizing `<br>` → `\n` before rendering (no rehype-raw / raw HTML); extracted to `lib/markdown.normalizeMarkdown` in both web and mobile to avoid duplication.



