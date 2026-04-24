from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class RiskLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class ToolCall(BaseModel):
    id: str
    tool: str
    action: str
    args: dict[str, Any] = Field(default_factory=dict)
    title: str = ""
    description: str = ""
    risk: RiskLevel = RiskLevel.low


class ToolResult(BaseModel):
    ok: bool
    output: Any = None
    error: str | None = None
    artifacts: dict[str, str] = Field(default_factory=dict)


class ExecutionStep(BaseModel):
    id: str
    title: str
    description: str | None = None
    tool: str | None = None
    action: str | None = None
    status: str = "pending"
    output: Any = None
    risk: RiskLevel = RiskLevel.low
    started_at: str | None = None
    ended_at: str | None = None
