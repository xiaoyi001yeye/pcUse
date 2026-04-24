from __future__ import annotations

SYSTEM_PROMPT = """You are PC-Use Agent, a local Windows automation assistant.
Prefer structured tools over visual clicking. Ask for confirmation before risky actions.
Return concise JSON tool calls only when tool planning is requested.
"""


class PromptBuilder:
    def build(self, user_prompt: str) -> list[dict[str, str]]:
        return [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ]
