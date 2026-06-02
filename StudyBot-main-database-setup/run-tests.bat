@echo off
REM One-command: start servers, run API/DB tests, stop servers.
cd /d "%~dp0"
python testing\run_with_servers.py %*
