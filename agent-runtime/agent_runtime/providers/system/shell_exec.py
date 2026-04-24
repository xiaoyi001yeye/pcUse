from __future__ import annotations

import subprocess


def run_shell(command: str, timeout: int = 60) -> subprocess.CompletedProcess[str]:
    return subprocess.run(command, shell=True, text=True, capture_output=True, timeout=timeout)
