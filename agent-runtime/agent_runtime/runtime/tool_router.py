from __future__ import annotations

from typing import Protocol

from agent_runtime.schemas.tool_call import ToolCall, ToolResult


class Tool(Protocol):
    name: str

    def run(self, call: ToolCall) -> ToolResult:
        ...


class ToolRouter:
    def __init__(self, tools: dict[str, Tool]) -> None:
        self.tools = tools

    def run(self, call: ToolCall) -> ToolResult:
        tool = self.tools.get(call.tool)
        if not tool:
            return ToolResult(ok=False, error=f"Tool not found: {call.tool}")
        return tool.run(call)

    def list_tools(self) -> list[str]:
        return sorted(self.tools)
