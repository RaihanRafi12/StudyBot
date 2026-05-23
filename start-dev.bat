@echo off
REM Start StudyBot Complete Application (Windows)
REM This script starts both frontend and backend

echo.
echo =========================================
echo StudyBot Development Environment
echo =========================================
echo.

REM Check for Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

REM Check for Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed
    echo Please install Python 3.9+ from https://www.python.org
    pause
    exit /b 1
)

REM Install npm dependencies if needed
if not exist "node_modules" (
    echo Installing npm dependencies...
    call npm install
)

REM Install Python dependencies if needed
pip list | findstr "Django" >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Python dependencies...
    pip install -r src\backend\requirements.txt
)

echo.
echo Starting StudyBot services...
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8000
echo.

REM Start frontend in new window
start cmd /k "npm run dev"

REM Start backend in new window
timeout /t 2 /nobreak >nul
start cmd /k "call start-backend.bat"

echo.
echo Both services started in new windows
echo Press any key to close this window...
pause
