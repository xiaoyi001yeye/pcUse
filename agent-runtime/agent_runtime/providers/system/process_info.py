from __future__ import annotations

import os


def current_process() -> dict[str, object]:
    return {"pid": os.getpid(), "ppid": os.getppid() if hasattr(os, "getppid") else None}
