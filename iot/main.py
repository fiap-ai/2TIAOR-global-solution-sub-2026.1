# TerraVista — ESP32 field station (MicroPython)
#
# Reads environmental sensors, derives a local (edge) territorial-risk hint to
# drive a 3-color LED, and POSTs the full reading to the TerraVista backend,
# which re-scores it with the trained ML model.
#
# Wiring (see diagram.json):
#   DHT22  data  -> GPIO15   (air temperature + humidity)
#   Soil pot     -> GPIO34   (ADC, capacitive-probe proxy: soil moisture)
#   LDR          -> GPIO35   (ADC, solar radiation proxy)
#   LCD 16x2 I2C -> GPIO21 SDA / GPIO22 SCL (status display)
#   LED green    -> GPIO25   (HEALTHY)
#   LED yellow   -> GPIO26   (ATTENTION)
#   LED red      -> GPIO27   (CRITICAL)
#
# Author: Gabriel Mule (RM 560586)

# First thing on boot: prove main.py is actually running. If you don't see this
# line in the serial monitor, the firmware never loaded your code (see README).
print("TerraVista boot...")

import time

import dht
import network
import urequests
from machine import ADC, I2C, Pin

from lcd1602 import Lcd1602


# --- Configuration --------------------------------------------------------
# Wokwi provides internet through the "Wokwi-GUEST" open network.
WIFI_SSID = "Wokwi-GUEST"
WIFI_PASSWORD = ""

# Backend endpoint. The Wokwi sandbox cannot reach your localhost directly:
#   - expose it with a tunnel:  `ngrok http 8000`  -> use the https URL, or
#   - point to your deployed backend (Phase 8).
API_URL = "https://YOUR-BACKEND-HOST/api/sensors/readings"
DEVICE_ID = "esp32-terravista-01"

SEND_INTERVAL_S = 10  # seconds between readings

# --- Hardware setup -------------------------------------------------------
dht_sensor = dht.DHT22(Pin(15))
soil_adc = ADC(Pin(34))
ldr_adc = ADC(Pin(35))
soil_adc.atten(ADC.ATTN_11DB)  # full 0-3.3V range
ldr_adc.atten(ADC.ATTN_11DB)

led_green = Pin(25, Pin.OUT)
led_yellow = Pin(26, Pin.OUT)
led_red = Pin(27, Pin.OUT)

# The LCD is best-effort: if the I2C display doesn't answer we keep running
# (LEDs + serial + backend POST still work). `lcd` is set up in setup_lcd().
lcd = None


def setup_lcd():
    """Initialize the I2C LCD; never let a display fault freeze the station."""
    global lcd
    try:
        i2c = I2C(0, scl=Pin(22), sda=Pin(21), freq=100000)
        lcd = Lcd1602(i2c)
        lcd.write_line("TerraVista", 0)
        lcd.write_line("booting...", 1)
        print("lcd: ready")
    except Exception as exc:
        lcd = None
        print("lcd: unavailable, continuing without display:", exc)


def lcd_line(text, line):
    """Write to the LCD only if it initialized successfully."""
    if lcd is not None:
        try:
            lcd.write_line(text, line)
        except Exception:
            pass


def connect_wifi():
    """Join the Wokwi-GUEST network (open, instant in simulation)."""
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    if not wlan.isconnected():
        print("wifi: connecting to", WIFI_SSID, "...")
        lcd_line("WiFi connecting", 1)
        wlan.connect(WIFI_SSID, WIFI_PASSWORD)
        while not wlan.isconnected():
            time.sleep(0.5)
    print("wifi: connected, ip =", wlan.ifconfig()[0])
    lcd_line("WiFi connected", 1)


def read_sensors():
    """Read raw sensors and map them to the 7 model features."""
    dht_sensor.measure()
    air_temperature = dht_sensor.temperature()  # C
    air_humidity = dht_sensor.humidity()        # %

    # ADC is 0..4095. Map the soil pot to 0..100 % moisture.
    soil_moisture = round(soil_adc.read() / 4095 * 100, 1)

    # LDR -> solar radiation proxy in W/m2 (0..1200).
    solar_radiation = round(ldr_adc.read() / 4095 * 1200, 1)

    # NDVI / days_since_rain / wind come from satellite + weather services in
    # production. On the edge we derive plausible proxies from local readings so
    # the demo is self-contained (documented in README + professionalization).
    ndvi = round(max(0.05, min(0.9, soil_moisture / 130 + air_humidity / 400)), 2)
    days_since_rain = 0 if air_humidity > 60 else int((60 - air_humidity) / 5)
    wind_speed = round(solar_radiation / 120, 1)

    return {
        "air_temperature": air_temperature,
        "air_humidity": air_humidity,
        "soil_moisture": soil_moisture,
        "solar_radiation": solar_radiation,
        "ndvi": ndvi,
        "days_since_rain": days_since_rain,
        "wind_speed": wind_speed,
        "device_id": DEVICE_ID,
    }


def edge_risk(reading):
    """Cheap on-device heuristic to light the status LED (0/1/2)."""
    score = 0
    if reading["ndvi"] < 0.3:
        score += 1
    if reading["soil_moisture"] < 20:
        score += 1
    if reading["air_temperature"] > 35 and reading["air_humidity"] < 25:
        score += 1
    return min(score, 2)


def set_led(level):
    """0=green (HEALTHY), 1=yellow (ATTENTION), 2=red (CRITICAL)."""
    led_green.value(1 if level == 0 else 0)
    led_yellow.value(1 if level == 1 else 0)
    led_red.value(1 if level == 2 else 0)


def post_reading(reading):
    """Send the reading to the backend; print the model's verdict."""
    try:
        resp = urequests.post(API_URL, json=reading)
        if resp.status_code == 201:
            data = resp.json()
            print("backend: stored ->", data["risk_label"])
        else:
            print("backend: HTTP", resp.status_code)
        resp.close()
    except Exception as exc:  # network errors shouldn't crash the station
        print("backend: post failed:", exc)


def show_status(reading, label):
    """Render two info lines on the LCD: risk + key readings."""
    lcd_line("Risk: " + label, 0)
    lcd_line(
        "{t:.0f}C {h:.0f}% N{n:.2f}".format(
            t=reading["air_temperature"],
            h=reading["air_humidity"],
            n=reading["ndvi"],
        ),
        1,
    )


def main():
    setup_lcd()
    connect_wifi()
    labels = ("HEALTHY", "ATTENTION", "CRITICAL")
    while True:
        reading = read_sensors()
        level = edge_risk(reading)
        set_led(level)
        show_status(reading, labels[level])
        print(
            "reading: temp={t}C hum={h}% soil={s}% ndvi={n} -> edge {lbl}".format(
                t=reading["air_temperature"],
                h=reading["air_humidity"],
                s=reading["soil_moisture"],
                n=reading["ndvi"],
                lbl=labels[level],
            )
        )
        post_reading(reading)
        time.sleep(SEND_INTERVAL_S)


main()
