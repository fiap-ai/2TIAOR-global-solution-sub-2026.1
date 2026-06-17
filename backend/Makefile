# TerraVista — Backend (FastAPI) Makefile
# Author: Gabriel Mule (RM 560586)

VENV := .venv
PY   := $(VENV)/bin/python
PIP  := $(VENV)/bin/pip
HOST ?= 127.0.0.1
PORT ?= 8000

.PHONY: help setup run dev smoke clean

help:  ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}'

setup:  ## Create venv and install dependencies
	python3 -m venv $(VENV)
	$(PIP) install --quiet --upgrade pip
	$(PIP) install --quiet -r requirements.txt
	@echo "Backend ready. Copy .env.example to .env and (optionally) add your OpenRouter key."

run:  ## Start the API server (production-style, no reload)
	$(PY) -m uvicorn app.main:app --host $(HOST) --port $(PORT)

dev:  ## Start the API server with auto-reload (development)
	$(PY) -m uvicorn app.main:app --host $(HOST) --port $(PORT) --reload

smoke:  ## Quick check: import the app and run one prediction
	$(PY) -c "from app.main import app; from app.services import model; \
print('routes=', len(app.routes), '| model_loaded=', model.model_is_available()); \
print(model.predict({'air_temperature':39,'air_humidity':18,'soil_moisture':8,'solar_radiation':950,'ndvi':0.18,'days_since_rain':30,'wind_speed':35}))"

clean:  ## Remove the virtual environment and caches
	rm -rf $(VENV) app/__pycache__ app/**/__pycache__
