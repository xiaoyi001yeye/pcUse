from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

from .tool_call import ExecutionStep


ExecutionMode = Literal["structured", "vision", "hybrid"]


class TaskRequest(BaseModel):
    prompt: str
    auto_execute: bool = False
    execution_mode: ExecutionMode = "structured"
    confirm_risky: bool = False
    attachments: list[str] = Field(default_factory=list)


class TaskResponse(BaseModel):
    task_id: str
    status: str
    summary: str
    steps: list[ExecutionStep]
    artifacts: dict[str, str] = Field(default_factory=dict)
