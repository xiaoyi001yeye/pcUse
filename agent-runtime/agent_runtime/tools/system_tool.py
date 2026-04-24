from __future__ import annotations

import os
import platform
from pathlib import Path

from agent_runtime.schemas.tool_call import ToolCall, ToolResult


class SystemTool:
    name = "system"

    def __init__(self, data_dir: Path) -> None:
        self.data_dir = data_dir

    def run(self, call: ToolCall) -> ToolResult:
        if call.action in {"context", "info"}:
            return self.context()
        return ToolResult(ok=False, error=f"Unsupported system action: {call.action}")

    def context(self) -> ToolResult:
        return ToolResult(
            ok=True,
            output={
                "platform": platform.platform(),
                "system": platform.system(),
                "release": platform.release(),
                "machine": platform.machine(),
                "user": os.getenv("USERNAME") or os.getenv("USER"),
                "computer": os.getenv("COMPUTERNAME"),
                "cwd": os.getcwd(),
                "data_dir": str(self.data_dir),
            },
        )
