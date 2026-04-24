$ErrorActionPreference = "Stop"
pnpm install
./scripts/setup-runtime.ps1
pnpm dev:desktop
