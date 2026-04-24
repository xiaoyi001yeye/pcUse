from __future__ import annotations

import subprocess
from pathlib import Path
from typing import Any

from agent_runtime.schemas.tool_call import ToolCall, ToolResult


class CmdTool:
    name = "cmd"

    def __init__(self, data_dir: Path) -> None:
        self.data_dir = data_dir
        self.workspace = data_dir / "workspace"
        self.workspace.mkdir(parents=True, exist_ok=True)

    def run(self, call: ToolCall) -> ToolResult:
        if call.action != "run":
            return ToolResult(ok=False, error=f"Unsupported cmd action: {call.action}")
        command = str(call.args.get("command", "")).strip()
        if not command:
            return ToolResult(ok=False, error="command is required")
        timeout_seconds = int(call.args.get("timeout_seconds", 60))
        cwd = Path(str(call.args.get("cwd") or self.workspace)).expanduser()
        cwd.mkdir(parents=True, exist_ok=True)
        try:
            completed = subprocess.run(
                command,
                cwd=str(cwd),
                shell=True,
                capture_output=True,
                text=True,
                timeout=max(1, min(timeout_seconds, 300)),
                encoding="utf-8",
                errors="replace",
            )
            output = {
                "command": command,
                "cwd": str(cwd),
                "exit_code": completed.returncode,
                "stdout": completed.stdout[-12000:],
                "stderr": completed.stderr[-12000:],
            }
            return ToolResult(ok=completed.returncode == 0, output=output, error=None if completed.returncode == 0 else completed.stderr[-2000:])
        except subprocess.TimeoutExpired as exc:
            return ToolResult(ok=False, error=f"Command timed out after {timeout_seconds}s", output={"stdout": exc.stdout, "stderr": exc.stderr})
        except Exception as exc:  # noqa: BLE001
            return ToolResult(ok=False, error=str(exc))
