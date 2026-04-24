from __future__ import annotations

import os


class KeyManager:
    def get_openai_api_key(self) -> str | None:
        return os.getenv("OPENAI_API_KEY")
