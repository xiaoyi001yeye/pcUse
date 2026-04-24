$ErrorActionPreference = "Stop"
pnpm install
./scripts/setup-runtime.ps1
pnpm build:ui
pnpm --filter @pc-use-agent/desktop-host tauri build
