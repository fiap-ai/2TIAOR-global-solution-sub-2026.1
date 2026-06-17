# TerraVista Mobile

React Native + Expo client for **TerraVista** — Earth Observation for Climate &
Agricultural Resilience. It mirrors the web app: the same backend, the same risk
model, the same five feature screens, built with
[react-native-paper](https://callstack.github.io/react-native-paper/) (Material 3,
dark theme) and drawer navigation.

## Stack

- **Expo SDK 56** / React Native 0.85 / React 19
- **react-native-paper** — Material 3 components & dark theme
- **@react-navigation/drawer** — side-drawer navigation
- **@tanstack/react-query** + **axios** — server state & API client
- **react-native-chart-kit** — Dashboard timeline chart
- **expo-image-picker** — gallery upload for the Vision screen
- **@react-native-async-storage/async-storage** — mock-auth token storage

## Screens

| Screen | Mirrors web page | Notes |
|---|---|---|
| Login | `Login.tsx` | Mock auth (`admin` / `terravista`) |
| Dashboard | `Dashboard.tsx` | KPIs, timeline chart, recent-readings table |
| Predict | `Predict.tsx` | 7 inputs, presets, RandomForest verdict |
| Vision | `Vision.tsx` | Pick an image, vegetation/dryness/smoke fractions |
| Chat | `Chat.tsx` | Resilience assistant |
| Knowledge | `Knowledge.tsx` | Mitigation actions per risk level |

## Configuration

The API base URL is read from `app.json` → `expo.extra.apiUrl`:

```json
"extra": { "apiUrl": "http://localhost:8000/api" }
```

> **Physical device:** `localhost` points to the phone, not your machine. Set
> `apiUrl` to your computer's LAN IP (e.g. `http://192.168.0.10:8000/api`) and make
> sure the backend is reachable on the same network.

## Running

Make sure the backend is running first (`backend/` on port 8000), then:

```bash
cd mobile
npm install
npm start          # Expo dev server (scan QR with Expo Go)
# or
npm run ios        # iOS simulator
npm run android    # Android emulator
npm run web        # browser preview
```

Type-check only:

```bash
npm run typecheck
```

## Build (EAS)

`eas.json` defines `development`, `preview` (Android APK) and `production`
profiles. With the EAS CLI authenticated:

```bash
eas build --profile preview --platform android
```

---

Author: Gabriel Mule (RM 560586)
