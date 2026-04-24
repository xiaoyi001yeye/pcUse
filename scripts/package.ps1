$ErrorActionPreference = "Stop"
./scripts/build.ps1
Write-Host "Installer artifacts are under apps/desktop-host/src-tauri/target/release/bundle"
