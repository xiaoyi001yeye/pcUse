from __future__ import annotations

from pydantic import BaseModel, Field


class ToolPolicy(BaseModel):
    enabled: bool = True
    require_confirmation: bool = False
    allowed_actions: list[str] = Field(default_factory=list)


class SecurityPolicy(BaseModel):
    allowed_file_roots: list[str] = Field(default_factory=list)
    blocked_command_patterns: list[str] = Field(default_factory=list)
    risky_command_patterns: list[str] = Field(default_factory=list)
    tools: dict[str, ToolPolicy] = Field(default_factory=dict)
