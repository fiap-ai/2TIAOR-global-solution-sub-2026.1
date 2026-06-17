# =============================================================================
# TerraVista — Vision module Makefile
# =============================================================================
# Computer-vision pipeline: synthetic scene generation + risk analysis + YOLO.
# Run `make help` to see all available commands with descriptions.
#
# Typical first run:
#   make setup     # create venv + install dependencies
#   make samples   # generate synthetic sample scenes
#   make analyze   # run the scene analyzer on the samples (+ annotated outputs)
# =============================================================================

PYTHON := python3
VENV   := .venv
BIN    := $(VENV)/bin
PY     := $(BIN)/python
PIP    := $(BIN)/pip

.DEFAULT_GOAL := help

# -----------------------------------------------------------------------------
.PHONY: help
help: ## Show this help (list all targets with descriptions)
	@echo "TerraVista Vision — available commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'
	@echo ""

# -----------------------------------------------------------------------------
.PHONY: setup
setup: ## Create the virtualenv and install all dependencies
	$(PYTHON) -m venv $(VENV)
	$(PIP) install --upgrade pip
	$(PIP) install -r requirements.txt
	@echo "✅ Setup complete. Activate with: source $(VENV)/bin/activate"

# -----------------------------------------------------------------------------
.PHONY: samples
samples: ## Generate reproducible synthetic sample scenes (samples/)
	$(PY) generate_samples.py

.PHONY: analyze
analyze: ## Run the scene analyzer on samples/ and save annotated images
	$(PY) detector.py samples --annotate

.PHONY: analyze-yolo
analyze-yolo: ## Same as analyze, but also run YOLO object detection
	$(PY) detector.py samples --annotate --yolo

# -----------------------------------------------------------------------------
.PHONY: notebook
notebook: ## Launch Jupyter on the vision notebook
	$(BIN)/jupyter notebook notebooks/01_vision_pipeline.ipynb

# -----------------------------------------------------------------------------
.PHONY: clean
clean: ## Remove generated samples and annotated outputs
	rm -rf samples/*_scene.png outputs
	@echo "🧹 Cleaned generated scenes and outputs."

.PHONY: clean-all
clean-all: clean ## Also remove the virtualenv and downloaded YOLO weights
	rm -rf $(VENV) yolov8n.pt
	@echo "🧹 Removed venv and YOLO weights."
