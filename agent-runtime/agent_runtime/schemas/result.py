from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class AgentResult(BaseModel):
    ok: bool
    summary: str
    data: Any = None
    artifacts: dict[str, str] = Field(default_factory=dict)
