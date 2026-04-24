from __future__ import annotations

from pathlib import Path

from agent_runtime.schemas.tool_call import ToolCall, ToolResult


class RegistryTool:
    name = "registry"

    def __init__(self, data_dir: Path) -> None:
        self.data_dir = data_dir

    def run(self, call: ToolCall) -> ToolResult:
        return ToolResult(ok=False, error="Registry tool is intentionally disabled in MVP. Enable only with a strict policy.")
