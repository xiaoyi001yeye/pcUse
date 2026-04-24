$ErrorActionPreference = "Stop"
$DataDir = $env:PC_USE_AGENT_DATA_DIR
if (!$DataDir) { $DataDir = Join-Path $HOME ".pc-use-agent" }
New-Item -ItemType Directory -Force -Path $DataDir | Out-Null
Write-Host "Data directory ready: $DataDir"
