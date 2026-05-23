@echo off
REM Install StudyBot dependencies on Windows
REM This handles the psycopg2-binary build issues on Windows

echo.
echo ================================================
echo Installing StudyBot Python Dependencies
echo ================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed
    echo Please install Python 3.9+ from https://www.python.org
    pause
    exit /b 1
)

echo Upgrading pip, setuptools, and wheel...
python -m pip install --upgrade pip setuptools wheel

echo.
echo Installing dependencies (using pre-built wheels only)...

REM Install all packages with binary-only flag to avoid build issues on Windows
echo Installing Django, django-ninja, django-cors-headers...
python -m pip install --only-binary :all: ^
  Django ^
  django-ninja ^
  django-cors-headers ^
  python-decouple ^
  PyJWT ^
  bcrypt ^
  python-multipart

if %errorlevel% neq 0 (
    echo.
    echo ⚠ Warning: Some packages couldn't use binary-only mode
    echo Retrying with fallback mode...
    echo.
)

echo.
echo Installing psycopg2-binary (database driver)...
python -m pip install --only-binary :all: psycopg2-binary
if %errorlevel% neq 0 (
    echo Warning: Trying psycopg2-binary without version constraints...
    python -m pip install psycopg2-binary
    if %errorlevel% neq 0 (
        echo ERROR: Could not install psycopg2-binary
        echo.
        echo Troubleshooting:
        echo   1. Ensure pip is up to date: python -m pip install --upgrade pip
        echo   2. Try: python -m pip install psycopg2
        echo   3. Install PostgreSQL: https://www.postgresql.org/download/windows/
        goto error
    )
)

echo.
echo Verifying installations...
python -c "import django; import psycopg2; import jwt; import bcrypt; print('✓ All packages verified')"
if %errorlevel% neq 0 (
    echo ERROR: Verification failed
    goto error
)

echo.
echo ================================================
echo ✓ All dependencies installed successfully!
echo ================================================
echo.
echo Next steps:
echo   1. Set up database: Run schema.sql in Supabase SQL Editor
echo   2. Test connection: python test_supabase.py
echo   3. Start backend: cd src\backend && python manage.py runserver
echo.
pause
exit /b 0

:error
echo.
echo ================================================
echo ✗ Installation failed
echo ================================================
echo.
echo Troubleshooting steps:
echo   1. Upgrade pip: python -m pip install --upgrade pip
echo   2. Clear pip cache: python -m pip cache purge
echo   3. Try installing one at a time:
echo      python -m pip install Django
echo      python -m pip install django-ninja
echo      python -m pip install psycopg2-binary
echo.
echo If psycopg2-binary still fails:
echo   - Install PostgreSQL from https://www.postgresql.org/download/windows/
echo   - Or modify requirements.txt and use 'psycopg2' instead
echo.
pause
exit /b 1
