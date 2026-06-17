"""TerraVista — Auth router (mock).

Minimal credential check for the MVP. Returns an opaque token derived from the
configured secret. This is intentionally simple (no real JWT/JWKS) — the goal is
to demonstrate a login flow for the web/mobile clients, not production security.

Author: Gabriel Mule (RM 560586)
"""

from __future__ import annotations

import hashlib

from fastapi import APIRouter, HTTPException, status

from app.config import settings
from app.logging_config import get_logger
from app.schemas import LoginRequest, LoginResponse

router = APIRouter(prefix="/auth", tags=["auth"])
log = get_logger()

TOKEN_TTL_SECONDS = 3600


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest) -> LoginResponse:
    """Validate credentials and return a mock bearer token."""
    if payload.username != settings.auth_username or payload.password != settings.auth_password:
        log.warning("login → DENIED for user '%s'", payload.username)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
        )

    raw = f"{payload.username}:{settings.auth_secret}".encode()
    token = hashlib.sha256(raw).hexdigest()
    log.info("login → OK for user '%s' (token ttl=%ds)", payload.username, TOKEN_TTL_SECONDS)
    return LoginResponse(token=token, user=payload.username, expires_in=TOKEN_TTL_SECONDS)
