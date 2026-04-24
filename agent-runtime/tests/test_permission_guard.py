from agent_runtime.runtime.permission_guard import PermissionGuard
from agent_runtime.schemas.tool_call import RiskLevel, ToolCall


def test_blocks_format_command() -> None:
    guard = PermissionGuard.from_default_policy()
    call = ToolCall(id="1", tool="cmd", action="run", args={"command": "format C:"}, risk=RiskLevel.high)
    result = guard.check(call, confirm_risky=False)
    assert result is not None
    assert not result.ok
