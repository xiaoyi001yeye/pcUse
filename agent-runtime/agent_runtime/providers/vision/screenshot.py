from __future__ import annotations

from pathlib import Path


def latest_screenshot(directory: Path) -> Path | None:
    files = sorted(directory.glob("*.png"), key=lambda p: p.stat().st_mtime, reverse=True)
    return files[0] if files else None
