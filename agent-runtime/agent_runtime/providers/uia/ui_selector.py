from __future__ import annotations

from dataclasses import dataclass


@dataclass
class UiSelector:
    title: str | None = None
    control_type: str | None = None
    automation_id: str | None = None
