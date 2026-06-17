# =============================================================================
# TerraVista — ML module Makefile
# =============================================================================
# Convenience targets for the machine-learning pipeline (synthetic + real data).
# Run `make help` to see all available commands with descriptions.
#
# Typical first run:
#   make setup        # create venv + install dependencies
#   make train        # generate synthetic data + train model (.joblib)
#   make data-real    # (optional) download real datasets for credibility
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
	@echo "TerraVista ML — available commands:"
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
.PHONY: data
data: ## Generate the synthetic dataset (data/territory_samples.csv)
	$(PY) generator.py

.PHONY: train
train: ## Generate data (if missing) + train the RandomForest -> models/terra_risk.joblib
	$(PY) train.py

.PHONY: retrain
retrain: ## Force-regenerate the synthetic dataset and retrain from scratch
	$(PY) train.py --regenerate

# -----------------------------------------------------------------------------
.PHONY: data-real
data-real: ## Download ALL real datasets (skips sources without credentials)
	$(PY) real_data/download.py all

.PHONY: data-uci
data-uci: ## Download UCI Forest Fires (no login required)
	$(PY) real_data/download.py uci

.PHONY: data-kaggle
data-kaggle: ## Download Kaggle Crop Recommendation (needs ~/.kaggle/kaggle.json)
	$(PY) real_data/download.py kaggle

.PHONY: data-firms
data-firms: ## Download NASA FIRMS active fires (needs FIRMS_MAP_KEY in .env)
	$(PY) real_data/download.py firms

# -----------------------------------------------------------------------------
.PHONY: notebook
notebook: ## Launch Jupyter on the training notebook
	$(BIN)/jupyter notebook notebooks/01_model_training.ipynb

# -----------------------------------------------------------------------------
.PHONY: clean
clean: ## Remove generated data and the trained model (keeps real downloads)
	rm -f data/territory_samples.csv models/terra_risk.joblib
	@echo "🧹 Cleaned generated dataset and model."

.PHONY: clean-all
clean-all: clean ## Also remove the virtualenv and downloaded real datasets
	rm -rf $(VENV) real_data/forestfires.csv real_data/kaggle_crop real_data/firms_*.csv
	@echo "🧹 Removed venv and real datasets."
