from __future__ import annotations

from agent_runtime.schemas.tool_call import ExecutionStep


class ResultSummarizer:
    def summarize(self, steps: list[ExecutionStep]) -> str:
        ok = sum(1 for step in steps if step.status == "success")
        failed = sum(1 for step in steps if step.status == "failed")
        return f"completed={ok}, failed={failed}, total={len(steps)}"
