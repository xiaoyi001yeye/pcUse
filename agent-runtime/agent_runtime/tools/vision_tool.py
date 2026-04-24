from __future__ import annotations

from datetime import datetime
from pathlib import Path

from agent_runtime.schemas.tool_call import ToolCall, ToolResult


class VisionTool:
    name = "vision"

    def __init__(self, data_dir: Path) -> None:
        self.screenshot_dir = data_dir / "screenshots"
        self.screenshot_dir.mkdir(parents=True, exist_ok=True)

    def run(self, call: ToolCall) -> ToolResult:
        if call.action == "screenshot":
            return self.screenshot()
        return ToolResult(ok=False, error=f"Unsupported vision action: {call.action}")

    def screenshot(self) -> ToolResult:
        filename = f"screenshot_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        path = self.screenshot_dir / filename
        try:
            import mss
            import mss.tools

            with mss.mss() as sct:
                monitor = sct.monitors[1]
                image = sct.grab(monitor)
                mss.tools.to_png(image.rgb, image.size, output=str(path))
            return ToolResult(ok=True, output={"path": str(path)})
        except Exception as exc:  # noqa: BLE001
            return ToolResult(ok=False, error=f"screenshot failed: {exc}")
