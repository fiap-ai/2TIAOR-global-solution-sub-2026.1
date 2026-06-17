# TerraVista — IoT Field Station (ESP32 + MicroPython)

Simulated ESP32 field station that reads environmental sensors, computes a quick
**on-edge** risk hint (LED feedback) and `POST`s each reading to the TerraVista
backend (`POST /api/sensors/readings`), which re-scores it with the trained ML
model and keeps a live timeline for the dashboards.

Runs entirely in the **Wokwi simulator** — no physical hardware required.

▶ **Live simulation:** <https://wokwi.com/projects/466934430632875009>


## Files

| File | Purpose |
|---|---|
| `main.py` | MicroPython firmware: Wi-Fi, sensor reads, edge risk + LED + LCD, HTTP POST |
| `lcd1602.py` | Minimal I2C LCD1602 driver (PCF8574 backpack) |
| `diagram.json` | Wokwi circuit: ESP32 DevKit v1 + DHT22 + soil pot + LDR + LCD + 3 LEDs |
| `wokwi.toml` | Points the VSCode Wokwi extension at the MicroPython firmware |
| `esp32-micropython.bin` | MicroPython interpreter image (ESP32_GENERIC v1.23.0) |

---

## Sensor → model-feature mapping

| Model feature | Source in simulation | Real-world source |
|---|---|---|
| `air_temperature` | DHT22 | DHT22 / SHT31 |
| `air_humidity` | DHT22 | DHT22 / SHT31 |
| `soil_moisture` | potentiometer (proxy) | capacitive soil probe |
| `solar_radiation` | LDR | pyranometer / LDR |
| `ndvi` | derived proxy | Sentinel-2 satellite |
| `days_since_rain` | derived from humidity | weather API / rain gauge |
| `wind_speed` | derived proxy | anemometer |

> NDVI, days-since-rain and wind come from satellite/weather services in
> production. On the edge we derive plausible proxies so the demo is
> self-contained. See `docs/professionalization.md` for the upgrade path.

---

## Wiring (see `diagram.json`)

```
DHT22  data -> GPIO15       LED green  -> GPIO25 (HEALTHY)
Soil pot    -> GPIO34 (ADC) LED yellow -> GPIO26 (ATTENTION)
LDR         -> GPIO35 (ADC) LED red    -> GPIO27 (CRITICAL)
LCD I2C     -> GPIO21 (SDA) / GPIO22 (SCL)
```

The 16x2 LCD shows the current risk on line 1 and the key readings
(`temp / humidity / NDVI`) on line 2.


---

## Running in VSCode (Wokwi extension)

1. Make sure the **Wokwi Simulator** extension is installed and licensed
   (`Cmd/Ctrl+Shift+P` → *"Wokwi: Request a New License"*).
2. Open this `iot/` folder in VSCode.
3. `Cmd/Ctrl+Shift+P` → **"Wokwi: Start Simulator"**.
4. The circuit opens; the serial panel shows the station logs:
   ```
   wifi: connected, ip = 10.13.37.2
   reading: temp=24.0C hum=40.0% soil=55.0% ndvi=0.52 -> edge HEALTHY
   backend: stored -> HEALTHY
   ```
5. Drag the **soil potentiometer** down and raise the **DHT22 temperature** to
   push the parcel toward **ATTENTION/CRITICAL** — the LED and the backend
   verdict follow.

> Tip: prefer a zero-setup run? Use **wokwi.com** (next section) — it runs
> MicroPython natively, no `.bin` or `wokwi.toml` needed.

---

## Running on wokwi.com (web) — recommended for recording

The website runs MicroPython natively with zero local config. This is the most
reliable way to demo/record the station.

1. Open a fresh **MicroPython ESP32** project via the direct link:
   <https://wokwi.com/projects/new/micropython-esp32>
   (the template is not in the main "New Project" list anymore — use the link).
   Log in with a free account if asked.
2. The editor shows tabs for `main.py` and `diagram.json`, plus a **"+"**
   button to add files. Set the three files up:
   - **`main.py`** — clear it and paste this repo's `iot/main.py`.
   - Click **"+"** → create a file named exactly **`lcd1602.py`** → paste this
     repo's `iot/lcd1602.py`. The name must match (the code does
     `from lcd1602 import Lcd1602`).
   - **`diagram.json`** — open the tab, clear it and paste this repo's
     `iot/diagram.json`.
3. Press the green **▶ play** button. The serial monitor should show:
   ```
   TerraVista boot...
   lcd: ready
   wifi: connected, ip = 10.13.37.2
   reading: temp=24.0C hum=40.0% soil=55.0% ndvi=0.52 -> edge HEALTHY
   ```
4. Edit `API_URL` in `main.py` to a public backend URL (see the network gotcha
   below — wokwi.com also can't reach `localhost`).
5. Drag the **soil potentiometer** and raise the **DHT22 temperature** to push
   the parcel toward **ATTENTION/CRITICAL** — the LED and LCD follow.

---

## Troubleshooting — black screen / stuck at boot

If the simulator opens but the canvas stays black and the serial monitor shows
nothing, work down this list:

1. **Look for `TerraVista boot...` in the serial monitor.**
   - If you see it, `main.py` is running — let it continue (Wi-Fi + readings
     follow). The LCD is best-effort: a `lcd: unavailable` line just means the
     display didn't answer; the station keeps working (LEDs + POST + serial).
   - If you do **not** see it, the firmware booted but never loaded your `.py`
     files — go to step 2.
2. **`wokwi.toml` must only set `firmware`** (no `elf`). Pointing `elf` at the
   raw `.bin` makes some extension versions fail silently. This repo is already
   configured correctly.
3. **Use wokwi.com as a guaranteed fallback (recommended for recording).** See
   the *"Running on wokwi.com (web)"* section above — it runs MicroPython
   natively with zero config and boots instantly.

---

## Connecting to the backend (the network gotcha)

The Wokwi sandbox **cannot reach `localhost`**. Set `API_URL` in `main.py` to a
publicly reachable URL using one of these:

- **Tunnel (local dev):** run the backend, then
  ```bash
  ngrok http 8000          # or: cloudflared tunnel --url http://localhost:8000
  ```
  Copy the `https://…` URL → `API_URL = "https://xxxx.ngrok-free.app/api/sensors/readings"`.

- **Deployed backend (Phase 8):** point `API_URL` at the hosted API.

When a reading arrives you'll see it in the backend console (the informative log
we added):
```
HH:MM:SS | INFO | terravista | sensor reading from 'esp32-terravista-01' → CRITICAL | total stored=1
```

---

## Notes

- Firmware: `ESP32_GENERIC-20240602-v1.23.0` from <https://micropython.org/download/ESP32_GENERIC/>.
- `SEND_INTERVAL_S` controls how often readings are posted (default 10 s).
- HTTP errors are caught so the station keeps running even if the backend is down.

Author: Gabriel Mule (RM 560586)
