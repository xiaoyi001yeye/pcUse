from __future__ import annotations


class PlaywrightDriver:
    def available(self) -> bool:
        try:
            import playwright  # noqa: F401
            return True
        except Exception:
            return False
