from __future__ import annotations


def tool_schemas() -> list[dict[str, object]]:
    return [
        {
            "type": "function",
            "function": {
                "name": "run_tool",
                "description": "Run a local PC-Use Agent tool call.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "tool": {"type": "string", "enum": ["file", "cmd", "browser", "uia", "vision", "system"]},
                        "action": {"type": "string"},
                        "args": {"type": "object"},
                        "risk": {"type": "string", "enum": ["low", "medium", "high"]},
                    },
                    "required": ["tool", "action", "args"],
                },
            },
        }
    ]
