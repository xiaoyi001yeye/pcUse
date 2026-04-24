from __future__ import annotations

import os
from pathlib import Path

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from agent_runtime import __version__
from agent_runtime.runtime.execution_manager import ExecutionManager
from agent_runtime.runtime.permission_guard import PermissionGuard
from agent_runtime.runtime.planner import Planner
from agent_runtime.runtime.tool_router import ToolRouter
from agent_runtime.schemas.task import TaskRequest, TaskResponse
from agent_runtime.storage.sqlite_repo import SQLiteRepo
from agent_runtime.tools.browser_tool import BrowserTool
from agent_runtime.tools.cmd_tool import CmdTool
from agent_runtime.tools.file_tool import FileTool
from agent_runtime.tools.registry import RegistryTool
from agent_runtime.tools.system_tool import SystemTool
from agent_runtime.tools.ui_tool import UiTool
from agent_runtime.tools.vision_tool import VisionTool


def data_dir() -> Path:
    raw = os.getenv("PC_USE_AGENT_DATA_DIR")
    if raw:
        path = Path(raw)
    else:
        path = Path.home() / ".pc-use-agent"
    path.mkdir(parents=True, exist_ok=True)
    return path


def create_app() -> FastAPI:
    root = data_dir()
    repo = SQLiteRepo(root / "app.db")
    guard = PermissionGuard.from_default_policy()
    router = ToolRouter(
        tools={
            "file": FileTool(root),
            "cmd": CmdTool(root),
            "browser": BrowserTool(root),
            "uia": UiTool(root),
            "vision": VisionTool(root),
            "system": SystemTool(root),
            "registry": RegistryTool(root),
        }
    )
    manager = ExecutionManager(
        planner=Planner(),
        router=router,
        permission_guard=guard,
        repo=repo,
    )

    app = FastAPI(title="PC-Use Agent Runtime", version=__version__)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://127.0.0.1:1420", "tauri://localhost"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    def health() -> dict[str, object]:
        return {"ok": True, "status": "online", "version": __version__}

    @app.post("/task", response_model=TaskResponse)
    async def run_task(request: TaskRequest) -> TaskResponse:
        try:
            return await manager.run(request)
        except Exception as exc:  # noqa: BLE001 - HTTP boundary
            raise HTTPException(status_code=500, detail=str(exc)) from exc

    @app.get("/history")
    def history(limit: int = 50) -> dict[str, object]:
        return {"items": repo.list_tasks(limit=limit)}

    return app


app = create_app()


def main() -> None:
    host = os.getenv("PC_USE_AGENT_HOST", "127.0.0.1")
    port = int(os.getenv("PC_USE_AGENT_PORT", "8765"))
    uvicorn.run("agent_runtime.server:app", host=host, port=port, reload=False)


if __name__ == "__main__":
    main()
