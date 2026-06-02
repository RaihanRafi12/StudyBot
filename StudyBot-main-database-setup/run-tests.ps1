# One-command: start servers, run API/DB tests, stop servers.
Set-Location $PSScriptRoot
python testing/run_with_servers.py @args
