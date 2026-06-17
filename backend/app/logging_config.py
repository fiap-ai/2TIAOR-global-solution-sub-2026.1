"""TerraVista — Logging configuration.

Sets up a single application logger (`terravista`) with a readable format so the
console shows *what* each request did (e.g. predicted risk, vision verdict, chat
source) — not only uvicorn's bare access lines (`POST /api/predict 200 OK`).

Author: Gabriel Mule (RM 560586)
"""

from __future__ import annotations

import logging

LOGGER_NAME = "terravista"

_FORMAT = "%(asctime)s | %(levelname)-7s | terravista | %(message)s"
_DATEFMT = "%H:%M:%S"


def configure_logging(level: int = logging.INFO) -> None:
    """Attach a console handler to the app logger (idempotent)."""
    logger = logging.getLogger(LOGGER_NAME)
    if logger.handlers:  # already configured (e.g. uvicorn --reload re-import)
        return
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter(_FORMAT, datefmt=_DATEFMT))
    logger.addHandler(handler)
    logger.setLevel(level)
    logger.propagate = False


def get_logger() -> logging.Logger:
    """Return the shared application logger."""
    return logging.getLogger(LOGGER_NAME)
