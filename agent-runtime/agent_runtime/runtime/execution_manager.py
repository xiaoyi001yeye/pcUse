from __future__ import annotations

import asyncio
import uuid
from datetime import datetime, timezone

from agent_runtime.runtime.permission_guard import PermissionGuard
from agent_runtime.runtime.planner import Planner
from agent_runtime.runtime.tool_router import ToolRouter
from agent_runtime.schemas.task import TaskRequest, TaskResponse
from agent_runtime.schemas.tool_call import ExecutionStep, ToolCall, ToolResult
from agent_runtime.storage.sqlite_repo import SQLiteRepo


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class ExecutionManager:
    def __init__(self, planner: Planner, router: ToolRouter, permission_guard: PermissionGuard, repo: SQLiteRepo) -> None:
        self.planner = planner
        self.router = router
        self.permission_guard = permission_guard
        self.repo = repo

    async def run(self, request: TaskRequest) -> TaskResponse:
        task_id = f"task_{uuid.uuid4().hex[:12]}"
        self.repo.create_task(task_id=task_id, prompt=request.prompt, status="running")
        calls = self.planner.plan(request)
        steps: list[ExecutionStep] = []
        artifacts: dict[str, str] = {}
        final_status = "success"

        for call in calls:
            step = self._step_from_call(call)
            step.status = "running"
            step.started_at = now_iso()
            self.repo.add_step(task_id, step)

            guard_result = self.permission_guard.check(call, confirm_risky=request.confirm_risky)
            if guard_result is not None:
                step.ended_at = now_iso()
                if isinstance(guard_result.output, dict) and guard_result.output.get("requires_confirmation"):
                    step.status = "requires_confirmation"
                    final_status = "requires_confirmation"
                else:
                    step.status = "failed"
                    final_status = "failed"
                step.output = guard_result.model_dump()
                self.repo.update_step(task_id, step)
                steps.append(step)
                if final_status in {"failed", "requires_confirmation"}:
                    break
                continue

            result = await asyncio.to_thread(self.router.run, call)
            step.ended_at = now_iso()
            step.status = "success" if result.ok else "failed"
            step.output = self._compact_result(result)
            artifacts.update(result.artifacts)
            self.repo.update_step(task_id, step)
            steps.append(step)
            if not result.ok:
                final_status = "failed"
                break

        summary = self._summary(final_status, steps)
        self.repo.update_task(task_id, status=final_status, summary=summary)
        return TaskResponse(task_id=task_id, status=final_status, summary=summary, steps=steps, artifacts=artifacts)

    def _step_from_call(self, call: ToolCall) -> ExecutionStep:
        return ExecutionStep(
            id=call.id,
            title=call.title or f"{call.tool}.{call.action}",
            description=call.description,
            tool=call.tool,
            action=call.action,
            risk=call.risk,
        )

    def _compact_result(self, result: ToolResult) -> object:
        if result.ok:
            return result.output
        return {"error": result.error, "output": result.output}

    def _summary(self, status: str, steps: list[ExecutionStep]) -> str:
        if status == "success":
            return f"\u4efb\u52a1\u5df2\u5b8c\u6210\uff0c\u5171\u6267\u884c {len(steps)} \u4e2a\u6b65\u9aa4\u3002"
        if status == "requires_confirmation":
            return "\u4efb\u52a1\u5df2\u6682\u505c\uff0c\u9700\u8981\u4f60\u786e\u8ba4\u9ad8\u98ce\u9669\u64cd\u4f5c\u540e\u7ee7\u7eed\u3002"
        return "\u4efb\u52a1\u6267\u884c\u5931\u8d25\uff0c\u8bf7\u67e5\u770b\u6b65\u9aa4\u8f93\u51fa\u3002"
