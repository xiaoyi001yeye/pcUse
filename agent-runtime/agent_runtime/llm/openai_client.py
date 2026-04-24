from __future__ import annotations

import os
from typing import Any


class OpenAIClient:
    def __init__(self, model: str | None = None, base_url: str | None = None, api_key: str | None = None) -> None:
        self.model = model or os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        self.base_url = base_url or os.getenv("OPENAI_BASE_URL")
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")

    def available(self) -> bool:
        return bool(self.api_key)

    def complete(self, messages: list[dict[str, str]], tools: list[dict[str, Any]] | None = None) -> dict[str, Any]:
        if not self.available():
            return {"ok": False, "error": "OPENAI_API_KEY is not configured"}
        try:
            from openai import OpenAI
        except Exception as exc:  # noqa: BLE001
            return {"ok": False, "error": f"openai package unavailable: {exc}"}
        client = OpenAI(api_key=self.api_key, base_url=self.base_url)
        response = client.chat.completions.create(model=self.model, messages=messages, tools=tools or None)
        return {"ok": True, "response": response.model_dump()}
