from __future__ import annotations

import re
import uuid
from pathlib import Path

from agent_runtime.schemas.tool_call import RiskLevel, ToolCall
from agent_runtime.schemas.task import TaskRequest

WINDOWS_PATH_RE = re.compile(r"[A-Za-z]:\\(?:[^\\/:*?\"<>|\r\n]+\\)*[^\\/:*?\"<>|\r\n]+\.(?:txt|csv|xlsx|xlsm|xls|md|json|log|py|ts|tsx|exe|bat|cmd|ps1)", re.IGNORECASE)
URL_RE = re.compile(r"https?://[^\s\"']+")
CMD_HINT_RE = re.compile(r"(?:cmd|powershell|\u547d\u4ee4|\u8fd0\u884c)[:\uff1a]?\s*([^\n\r]+)", re.IGNORECASE)

COMMON_COMMANDS = [
    "ipconfig",
    "whoami",
    "hostname",
    "dir",
    "systeminfo",
    "tasklist",
    "netstat",
]


def _id() -> str:
    return f"call_{uuid.uuid4().hex[:12]}"


class Planner:
    """Deterministic MVP planner.

    The LLM planner can be added later. This simple planner is deliberately conservative:
    it maps explicit user intent to tool calls and avoids inventing hidden actions.
    """

    def plan(self, request: TaskRequest) -> list[ToolCall]:
        prompt = request.prompt.strip()
        calls: list[ToolCall] = []

        paths = WINDOWS_PATH_RE.findall(prompt)
        for path in paths:
            clean_path = path.rstrip(". ,\uff0c\u3002")
            calls.append(
                ToolCall(
                    id=_id(),
                    tool="file",
                    action="open",
                    title="\u6253\u5f00\u6587\u4ef6",
                    description=clean_path,
                    args={"path": clean_path},
                    risk=RiskLevel.low,
                )
            )
            if self._should_read_preview(prompt, clean_path):
                calls.append(
                    ToolCall(
                        id=_id(),
                        tool="file",
                        action="read_preview",
                        title="\u8bfb\u53d6\u6587\u4ef6\u9884\u89c8",
                        description="\u8bfb\u53d6\u524d\u51e0\u884c\u5185\u5bb9",
                        args={"path": clean_path, "rows": self._extract_rows(prompt)},
                        risk=RiskLevel.low,
                    )
                )

        command = self._extract_command(prompt)
        if command:
            calls.append(
                ToolCall(
                    id=_id(),
                    tool="cmd",
                    action="run",
                    title="\u6267\u884c\u547d\u4ee4",
                    description=command,
                    args={"command": command, "timeout_seconds": 60},
                    risk=self._command_risk(command),
                )
            )

        url_match = URL_RE.search(prompt)
        if url_match:
            calls.append(
                ToolCall(
                    id=_id(),
                    tool="browser",
                    action="open_url",
                    title="\u6253\u5f00\u7f51\u9875",
                    description=url_match.group(0),
                    args={"url": url_match.group(0)},
                    risk=RiskLevel.low,
                )
            )
        elif "\u6d4f\u89c8\u5668" in prompt or "browser" in prompt.lower():
            calls.append(
                ToolCall(
                    id=_id(),
                    tool="browser",
                    action="search",
                    title="\u6d4f\u89c8\u5668\u641c\u7d22",
                    description=prompt,
                    args={"query": prompt},
                    risk=RiskLevel.low,
                )
            )

        if not calls:
            calls.append(
                ToolCall(
                    id=_id(),
                    tool="system",
                    action="context",
                    title="\u83b7\u53d6\u7cfb\u7edf\u4e0a\u4e0b\u6587",
                    description="\u6682\u672a\u8bc6\u522b\u5230\u53ef\u76f4\u63a5\u6267\u884c\u7684\u5de5\u5177\uff0c\u8fd4\u56de\u672c\u673a\u4e0a\u4e0b\u6587\u3002",
                    args={},
                    risk=RiskLevel.low,
                )
            )
        return calls

    def _should_read_preview(self, prompt: str, path: str) -> bool:
        suffix = Path(path).suffix.lower()
        preview_words = ["\u8bfb\u53d6", "\u67e5\u770b", "\u524d", "read", "preview", "show"]
        return suffix in {".txt", ".csv", ".xlsx", ".xls", ".md", ".json"} and any(word in prompt.lower() for word in preview_words)

    def _extract_rows(self, prompt: str) -> int:
        match = re.search(r"(?:\u524d|first)\s*(\d+)\s*(?:\u884c|rows?)", prompt, re.IGNORECASE)
        if match:
            return max(1, min(50, int(match.group(1))))
        return 5

    def _extract_command(self, prompt: str) -> str | None:
        lower = prompt.lower()
        for cmd in COMMON_COMMANDS:
            if re.search(rf"\b{re.escape(cmd)}\b", lower):
                return cmd
        match = CMD_HINT_RE.search(prompt)
        if match:
            candidate = match.group(1).strip().strip("` ")
            # Stop at the first sentence boundary for simple command extraction.
            candidate = re.split(r"[\u3002\n\r]", candidate)[0].strip()
            return candidate or None
        return None

    def _command_risk(self, command: str) -> RiskLevel:
        dangerous = ["del ", "remove-item", "format", "reg delete", "shutdown", "rd /s", "rmdir /s"]
        lower = command.lower()
        if any(token in lower for token in dangerous):
            return RiskLevel.high
        if any(token in lower for token in ["curl", "wget", "invoke-webrequest", "powershell -enc"]):
            return RiskLevel.medium
        return RiskLevel.low
