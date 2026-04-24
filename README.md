# PC-Use Agent v0.2 (Local Mode)

PC-Use Agent is a Windows-first local AI automation assistant. It is designed to run on the same Windows machine that it controls, so the architecture is simpler and safer than a remote-control system.

This repository contains a runnable MVP codebase based on the design diagrams:

- Tauri 2 desktop shell
- React + TypeScript UI
- Python 3.11 Agent Runtime
- Tool routing for files, commands, browser, UI automation, screenshots, and system info
- SQLite storage for tasks, steps, logs, and artifacts
- Permission guard and auditable policy files
- GitHub Actions workflow for producing Windows installers and macOS DMG artifacts

## Repository layout

```text
pc-use-agent/
  apps/
    app-ui/             React + TypeScript UI
    desktop-host/       Tauri 2 + Rust desktop host
  agent-runtime/        Python Agent Runtime and Windows tools
  shared/               Cross-process protocol and shared types
  storage/              Local runtime data placeholder
  security/             Default policies and audit helpers
  installer/            Windows installer notes
  docs/                 Architecture and implementation docs
  tests/                E2E and integration test placeholders
  .github/workflows/    CI/CD and Windows packaging
```

## MVP behavior

The MVP can:

1. Accept a natural language command in the desktop app.
2. Send the command to the local Python Agent Runtime.
3. Create a simple plan using deterministic heuristics.
4. Execute allowed local tools:
   - Open a file.
   - Read the first rows of a text, CSV, or Excel file.
   - Run a CMD/PowerShell command with timeout and policy checks.
   - Open a browser URL or search query.
   - Capture screenshots on demand.
5. Save task and step results into SQLite.
6. Display results in the UI.

## Prerequisites

- Windows 11 recommended
- Node.js 20+
- pnpm 9+
- Rust stable
- Python 3.11+

## Local development

```powershell
pnpm install
python -m venv agent-runtime/.venv
agent-runtime/.venv/Scripts/python -m pip install -r agent-runtime/requirements.txt

# Terminal 1: runtime
cd agent-runtime
.venv/Scripts/python -m agent_runtime.server

# Terminal 2: desktop app
pnpm dev:desktop
```

## Build installer locally

```powershell
./scripts/build.ps1
```

The GitHub Actions workflow in `.github/workflows/build-installers.yml` builds the UI, packages the Python runtime sidecar, runs `tauri build`, and uploads Windows installer plus macOS DMG artifacts on each push.

## Security defaults

The default policy is intentionally conservative:

- High-risk commands require confirmation.
- Known destructive patterns are blocked.
- File reads are allowed by default only under common user folders unless policy is expanded.
- Browser and UI automation are tools, not hidden remote-control channels.
- Full real-time screen preview is not shown by default; screenshots are captured only for debug, failure analysis, or user confirmation.

See `docs/security-policy.md`.
