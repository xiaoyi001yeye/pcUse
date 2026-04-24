from agent_runtime.runtime.planner import Planner
from agent_runtime.schemas.task import TaskRequest


def test_planner_detects_ipconfig() -> None:
    calls = Planner().plan(TaskRequest(prompt="run ipconfig"))
    assert any(call.tool == "cmd" and call.args["command"] == "ipconfig" for call in calls)


def test_planner_detects_file_path() -> None:
    calls = Planner().plan(TaskRequest(prompt=r"open C:\Users\Public\Documents\readme.txt and read first 5 rows"))
    assert calls[0].tool == "file"
    assert calls[0].action == "open"
