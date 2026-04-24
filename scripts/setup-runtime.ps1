$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Runtime = Join-Path $Root "agent-runtime"
$Venv = Join-Path $Runtime ".venv"

if (!(Test-Path $Venv)) {
  python -m venv $Venv
}
& "$Venv\Scripts\python.exe" -m pip install --upgrade pip
& "$Venv\Scripts\python.exe" -m pip install -r "$Runtime\requirements.txt"
Write-Host "Runtime setup complete."
