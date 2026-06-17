# TerraVista — Web

Operations dashboard for **TerraVista**, an Earth-Observation platform for climate and
agricultural resilience. Built with Vite + React + TypeScript, styled with Tailwind CSS and
shadcn/ui (dark slate theme), data fetching via TanStack Query, charts via Recharts.

Author: Gabriel Mule (RM 560586)

## Features

- **Dashboard** — live sensor telemetry: KPI cards, environmental timeline (Recharts),
  risk-class distribution, recent-readings table.
- **Predict** — score a land parcel from its 7 environmental features using the trained model.
- **Vision** — upload a field/satellite image for vegetation/dryness/smoke analysis.
- **Assistant** — chat with the knowledge assistant for mitigation guidance.
- **Knowledge** — recommended actions per risk level.
- Mock auth (login `admin` / `terravista`) with a protected route layout.

## Requirements

- Node.js 18+
- The TerraVista backend running (default `http://localhost:8000`).

## Setup

```bash
npm install
cp .env.example .env   # adjust VITE_API_URL if the backend is elsewhere
npm run dev            # http://localhost:5173
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server (port 5173). |
| `npm run build` | Type-check (`tsc -b`) and build for production. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run ESLint. |

## Environment

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000/api` | Base URL of the backend, including `/api`. |

## Deploy (Vercel)

1. Import the repository, set the **Root Directory** to `web/`.
2. Framework preset: **Vite** (build `npm run build`, output `dist`).
3. Add the `VITE_API_URL` environment variable pointing to the deployed backend.
4. `vercel.json` already rewrites all routes to `/` for client-side routing.
