from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from typing import Any

from agent_runtime.schemas.tool_call import ExecutionStep


class SQLiteRepo:
    def __init__(self, path: Path) -> None:
        self.path = path
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._init()

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init(self) -> None:
        with self._connect() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS tasks (
                  id TEXT PRIMARY KEY,
                  prompt TEXT NOT NULL,
                  status TEXT NOT NULL,
                  summary TEXT,
                  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS steps (
                  id TEXT NOT NULL,
                  task_id TEXT NOT NULL,
                  status TEXT NOT NULL,
                  title TEXT NOT NULL,
                  tool TEXT,
                  action TEXT,
                  payload TEXT,
                  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                  PRIMARY KEY (id, task_id)
                )
                """
            )

    def create_task(self, task_id: str, prompt: str, status: str) -> None:
        with self._connect() as conn:
            conn.execute("INSERT INTO tasks (id, prompt, status) VALUES (?, ?, ?)", (task_id, prompt, status))

    def update_task(self, task_id: str, status: str, summary: str) -> None:
        with self._connect() as conn:
            conn.execute(
                "UPDATE tasks SET status = ?, summary = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                (status, summary, task_id),
            )

    def add_step(self, task_id: str, step: ExecutionStep) -> None:
        with self._connect() as conn:
            conn.execute(
                "INSERT OR REPLACE INTO steps (id, task_id, status, title, tool, action, payload) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (step.id, task_id, step.status, step.title, step.tool, step.action, step.model_dump_json()),
            )

    def update_step(self, task_id: str, step: ExecutionStep) -> None:
        self.add_step(task_id, step)

    def list_tasks(self, limit: int = 50) -> list[dict[str, Any]]:
        with self._connect() as conn:
            rows = conn.execute("SELECT * FROM tasks ORDER BY created_at DESC LIMIT ?", (limit,)).fetchall()
            return [dict(row) for row in rows]
