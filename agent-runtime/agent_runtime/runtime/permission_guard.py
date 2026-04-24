from __future__ import annotations

import json
import os
import re
from pathlib import Path

from agent_runtime.schemas.policy import SecurityPolicy, ToolPolicy
from agent_runtime.schemas.tool_call import RiskLevel, ToolCall, ToolResult

DEFAULT_BLOCKED = [
    r"\bformat\b",
    r"\breg\s+delete\b",
    r"\bshutdown\b",
    r"\brmdir\s+/s\b",
    r"\brd\s+/s\b",
]
DEFAULT_RISKY = [
    r"\bdel\b",
    r"\bRemove-Item\b",
    r"\bSet-ExecutionPolicy\b",
    r"\bInvoke-WebRequest\b",
    r"\bcurl\b",
    r"\bwget\b",
]


class PermissionGuard:
    def __init__(self, policy: SecurityPolicy) -> None:
        self.policy = policy

    @classmethod
    def from_default_policy(cls) -> "PermissionGuard":
        candidates: list[Path] = []
        env_policy = os.getenv("PC_USE_AGENT_POLICY_FILE")
        if env_policy:
            candidates.append(Path(env_policy))
        candidates.extend(
            [
                Path(__file__).resolve().parents[3] / "security" / "policy" / "default_policy.json",
                Path.cwd() / "security" / "policy" / "default_policy.json",
            ]
        )
        for path in candidates:
            if path.is_file():
                data = json.loads(path.read_text(encoding="utf-8"))
                return cls(SecurityPolicy(**data))
        return cls(
            SecurityPolicy(
                allowed_file_roots=["%USERPROFILE%", "%PUBLIC%"],
                blocked_command_patterns=DEFAULT_BLOCKED,
                risky_command_patterns=DEFAULT_RISKY,
                tools={
                    "file": ToolPolicy(enabled=True),
                    "cmd": ToolPolicy(enabled=True, require_confirmation=True),
                    "browser": ToolPolicy(enabled=True),
                    "uia": ToolPolicy(enabled=True, require_confirmation=True),
                    "vision": ToolPolicy(enabled=True),
                    "system": ToolPolicy(enabled=True),
                },
            )
        )

    def check(self, call: ToolCall, confirm_risky: bool = False) -> ToolResult | None:
        tool_policy = self.policy.tools.get(call.tool)
        if tool_policy and not tool_policy.enabled:
            return ToolResult(ok=False, error=f"Tool disabled by policy: {call.tool}")
        if call.tool == "cmd":
            command = str(call.args.get("command", ""))
            blocked = self._matches_any(command, self.policy.blocked_command_patterns or DEFAULT_BLOCKED)
            if blocked:
                return ToolResult(ok=False, error=f"Command blocked by policy: {blocked}")
            risky = self._matches_any(command, self.policy.risky_command_patterns or DEFAULT_RISKY)
            if risky and not confirm_risky:
                return ToolResult(
                    ok=False,
                    error=f"Command requires user confirmation before execution: {risky}",
                    output={"requires_confirmation": True, "reason": risky},
                )
        if call.risk == RiskLevel.high and not confirm_risky:
            return ToolResult(
                ok=False,
                error="High-risk action requires user confirmation",
                output={"requires_confirmation": True},
            )
        return None

    def _matches_any(self, value: str, patterns: list[str]) -> str | None:
        for pattern in patterns:
            if re.search(pattern, value, flags=re.IGNORECASE):
                return pattern
        return None
