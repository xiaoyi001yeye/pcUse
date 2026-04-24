# Implementation notes

This code package implements the PC-Use Agent v0.2 local-mode MVP described by the design diagrams.

## Included

- Tauri 2 + Rust desktop host with IPC commands.
- React + TypeScript UI matching the no-realtime-preview local-mode design.
- Python 3.11 Agent Runtime with FastAPI.
- Deterministic planner for explicit local commands.
- Tool router and tools for file, CMD, browser, UIA, screenshots, system context, and registry placeholder.
- Permission guard and JSON policy files.
- SQLite task/step storage.
- Windows GitHub Actions packaging workflow for MSI/EXE artifacts.
- Docs and generated diagrams under `docs/`.

## Verified in this environment

- Python source syntax compiled with `compileall`.
- Repository files were generated and zipped.

## Not verified here

The current execution environment is not Windows and does not have Node/Rust/Tauri dependencies installed, so the following must be verified on a Windows development machine or GitHub Actions Windows runner:

- `pnpm install`
- React/Vite build
- Rust/Tauri compile
- Tauri NSIS/MSI installer output
- pywinauto Windows UI Automation behavior
- `os.startfile` and Windows shell integration

## First Windows run

```powershell
corepack enable
pnpm install
./scripts/setup-runtime.ps1
pnpm dev:desktop
```

## Build installer

```powershell
./scripts/build.ps1
```
