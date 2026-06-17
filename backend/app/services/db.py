"""TerraVista — Supabase client (lazy singleton).

Thin wrapper around supabase-py. The client is created on first use only when
credentials are present, so the app boots fine without Supabase configured.

Author: Gabriel Mule (RM 560586)
"""

from __future__ import annotations

from functools import lru_cache

from app.config import settings


@lru_cache(maxsize=1)
def get_client():
    """Return a cached Supabase client, or None when not configured."""
    if not settings.supabase_enabled:
        return None
    from supabase import create_client

    return create_client(settings.supabase_url, settings.supabase_service_key)
