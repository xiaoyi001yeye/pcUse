from __future__ import annotations

import urllib.parse
import webbrowser
from pathlib import Path

from agent_runtime.schemas.tool_call import ToolCall, ToolResult


class BrowserTool:
    name = "browser"

    def __init__(self, data_dir: Path) -> None:
        self.data_dir = data_dir

    def run(self, call: ToolCall) -> ToolResult:
        if call.action == "open_url":
            return self.open_url(str(call.args.get("url", "")))
        if call.action == "search":
            return self.search(str(call.args.get("query", "")))
        if call.action == "click_selector":
            return self.click_selector(str(call.args.get("url", "")), str(call.args.get("selector", "")))
        return ToolResult(ok=False, error=f"Unsupported browser action: {call.action}")

    def open_url(self, url: str) -> ToolResult:
        if not url:
            return ToolResult(ok=False, error="url is required")
        if not (url.startswith("http://") or url.startswith("https://")):
            url = "https://" + url
        ok = webbrowser.open(url)
        return ToolResult(ok=bool(ok), output={"url": url, "opened": bool(ok)})

    def search(self, query: str) -> ToolResult:
        if not query:
            return ToolResult(ok=False, error="query is required")
        url = "https://www.bing.com/search?q=" + urllib.parse.quote(query)
        return self.open_url(url)

    def click_selector(self, url: str, selector: str) -> ToolResult:
        if not url or not selector:
            return ToolResult(ok=False, error="url and selector are required")
        try:
            from playwright.sync_api import sync_playwright
        except Exception as exc:  # noqa: BLE001
            return ToolResult(ok=False, error=f"playwright is not installed or browsers are missing: {exc}")
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=False)
                page = browser.new_page()
                page.goto(url)
                page.click(selector)
                browser.close()
            return ToolResult(ok=True, output={"url": url, "selector": selector, "clicked": True})
        except Exception as exc:  # noqa: BLE001
            return ToolResult(ok=False, error=str(exc))
