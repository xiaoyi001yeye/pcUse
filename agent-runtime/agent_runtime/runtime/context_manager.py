from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass
class RuntimeContext:
    current_app: str = ""
    current_window: str = ""
    current_mode: str = "structured"
    last_screenshot: str | None = None
    updated_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ContextManager:
    def __init__(self) -> None:
        self.context = RuntimeContext()

    def update(self, **kwargs: object) -> RuntimeContext:
        for key, value in kwargs.items():
            if hasattr(self.context, key):
                setattr(self.context, key, value)
        self.context.updated_at = datetime.now(timezone.utc).isoformat()
        return self.context

    def snapshot(self) -> dict[str, object]:
        return self.context.__dict__.copy()
