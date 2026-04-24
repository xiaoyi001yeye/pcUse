from __future__ import annotations

from .openai_client import OpenAIClient


class OpenAICompatibleClient(OpenAIClient):
    """OpenAI-compatible endpoint client.

    Configure with OPENAI_BASE_URL and OPENAI_API_KEY.
    """
