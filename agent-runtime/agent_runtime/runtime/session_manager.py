from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass
class Session:
    id: str = field(default_factory=lambda: f"session_{uuid.uuid4().hex[:12]}")
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class SessionManager:
    def __init__(self) -> None:
        self.current = Session()

    def reset(self) -> Session:
        self.current = Session()
        return self.current
