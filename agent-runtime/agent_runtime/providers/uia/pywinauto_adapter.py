from __future__ import annotations


class PywinautoAdapter:
    def available(self) -> bool:
        try:
            import pywinauto  # noqa: F401
            return True
        except Exception:
            return False
