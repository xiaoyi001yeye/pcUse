# Architecture

PC-Use Agent v0.2 is a local-mode architecture:

```text
React UI -> Tauri Rust Host -> Local Python Runtime -> Windows Tools
```

## Layers

1. Desktop UI: chat, settings, permission state, task context.
2. Rust host: window, IPC, runtime lifecycle, settings persistence, installer integration.
3. Agent runtime: planning, routing, execution management, permission guard.
4. Tools: file, cmd, browser, UIA, screenshot, system info.
5. Storage: SQLite, screenshots, logs, exported results.
6. CI/CD: GitHub Actions builds Windows installer artifacts.

The UI does not show a full real-time screen preview by default. Screenshots are optional artifacts for debug, failed steps, or confirmation.
