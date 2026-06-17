"""TerraVista — Chat router (Generative AI).

Conversational assistant for civil-defense and agronomy guidance. Uses
OpenRouter when a key is configured, otherwise a deterministic offline mock.

Author: Gabriel Mule (RM 560586)
"""

from __future__ import annotations

from fastapi import APIRouter

from app.logging_config import get_logger
from app.schemas import ChatRequest, ChatResponse
from app.services import chat as chat_service

router = APIRouter(prefix="/chat", tags=["chat"])
log = get_logger()


@router.post("", response_model=ChatResponse)
def chat(payload: ChatRequest) -> ChatResponse:
    """Answer a user question, grounded in the platform's risk knowledge base."""
    result = chat_service.chat(payload.message, payload.context)
    log.info(
        "chat → source=%s | %d chars in, %d chars out",
        result["source"],
        len(payload.message),
        len(result["reply"]),
    )
    return ChatResponse(**result)

