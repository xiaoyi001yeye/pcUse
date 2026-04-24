from __future__ import annotations

from pathlib import Path

from agent_runtime.schemas.tool_call import ToolCall, ToolResult


class UiTool:
    name = "uia"

    def __init__(self, data_dir: Path) -> None:
        self.data_dir = data_dir

    def run(self, call: ToolCall) -> ToolResult:
        if call.action == "list_windows":
            return self.list_windows()
        if call.action == "click_text":
            return self.click_text(str(call.args.get("text", "")))
        return ToolResult(ok=False, error=f"Unsupported UIA action: {call.action}")

    def list_windows(self) -> ToolResult:
        try:
            from pywinauto import Desktop
        except Exception as exc:  # noqa: BLE001
            return ToolResult(ok=False, error=f"pywinauto is only available on Windows and must be installed: {exc}")
        try:
            windows = []
            for window in Desktop(backend="uia").windows():
                title = window.window_text()
                if title:
                    windows.append({"title": title, "handle": int(window.handle)})
            return ToolResult(ok=True, output={"windows": windows[:100]})
        except Exception as exc:  # noqa: BLE001
            return ToolResult(ok=False, error=str(exc))

    def click_text(self, text: str) -> ToolResult:
        if not text:
            return ToolResult(ok=False, error="text is required")
        try:
            from pywinauto import Desktop
        except Exception as exc:  # noqa: BLE001
            return ToolResult(ok=False, error=f"pywinauto is only available on Windows and must be installed: {exc}")
        try:
            desktop = Desktop(backend="uia")
            matches = desktop.windows(title_re=".*")
            for window in matches:
                try:
                    control = window.child_window(title=text)
                    if control.exists(timeout=0.2):
                        control.click_input()
                        return ToolResult(ok=True, output={"clicked_text": text, "window": window.window_text()})
                except Exception:
                    continue
            return ToolResult(ok=False, error=f"Text not found in active windows: {text}")
        except Exception as exc:  # noqa: BLE001
            return ToolResult(ok=False, error=str(exc))
