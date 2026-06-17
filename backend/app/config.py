"""TerraVista — Backend configuration.

Centralizes runtime settings, loaded from environment variables / `.env`.
Also resolves the repository paths to the ML model and the vision module so the
backend reuses the *exact* artifacts produced by those modules (no duplication).

Author: Gabriel Mule (RM 560586)
"""

from __future__ import annotations

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Repository layout: backend/app/config.py -> repo root is two parents up.
BACKEND_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = BACKEND_DIR.parent
ML_DIR = REPO_ROOT / "ml"
VISION_DIR = REPO_ROOT / "vision"
MODEL_PATH = ML_DIR / "models" / "terra_risk.joblib"


class Settings(BaseSettings):
    """Application settings (env-driven, with safe defaults for the demo)."""

    model_config = SettingsConfigDict(
        env_file=str(BACKEND_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "TerraVista API"
    version: str = "1.0.0"

    # Generative AI (chat) — optional; falls back to a mock when empty.
    # Chain: free primary model -> cheap paid fallback -> offline mock.
    openrouter_api_key: str = ""
    openrouter_model: str = "openai/gpt-oss-120b:free"
    openrouter_fallback_model: str = "deepseek/deepseek-v4-flash"
    openrouter_url: str = "https://openrouter.ai/api/v1/chat/completions"
    openrouter_timeout: int = 20
    openrouter_max_tokens: int = 512

    # Mock auth (MVP scope).
    auth_username: str = "admin"
    auth_password: str = "terravista"
    auth_secret: str = "change-me-in-production"

    # CORS: comma-separated origins ("*" = all).
    cors_origins: str = "*"

    # Supabase (optional) — persists sensor readings. When empty, the sensor
    # store falls back to an in-memory ring buffer (the demo still works).
    supabase_url: str = ""
    supabase_service_key: str = ""
    supabase_table: str = "sensor_readings"

    @property
    def supabase_enabled(self) -> bool:
        return bool(self.supabase_url and self.supabase_service_key)

    @property
    def cors_origin_list(self) -> list[str]:
        """Parse CORS origins into a list for the middleware."""
        raw = self.cors_origins.strip()
        if raw in ("", "*"):
            return ["*"]
        return [o.strip() for o in raw.split(",") if o.strip()]


settings = Settings()
