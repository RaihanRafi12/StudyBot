@echo off
REM Start StudyBot Backend Server (Windows)
REM This script starts the Django development server

echo.
echo ================================
echo StudyBot Backend Startup
echo ================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.9+ from https://www.python.org
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist ".env" (
    echo ERROR: .env file not found!
    echo Please create .env file with Supabase credentials
    echo Run: copy .env.example .env
    pause
    exit /b 1
)

REM Check if requirements are installed
pip list | findstr "Django" >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Python dependencies...
    pip install -r src\backend\requirements.txt
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

echo.
echo Testing Supabase connection...
python test_supabase.py
if %errorlevel% neq 0 (
    echo WARNING: Supabase connection test failed
    echo Please check your .env file
    pause
)

echo.
echo Starting Django development server...
echo Server will run at: http://localhost:8000
echo.

cd src\backend
python manage.py runserver

pause
