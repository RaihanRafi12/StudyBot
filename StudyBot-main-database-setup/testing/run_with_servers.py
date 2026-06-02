#!/usr/bin/env python3
"""
Start StudyBot frontend + backend, wait until healthy, run API/DB tests.

Usage (from project root):
  python testing/run_with_servers.py
  python testing/run_with_servers.py --selenium   # also run browser UI tests
  python testing/run_with_servers.py --api-only   # skip starting frontend

Requires:
  - backend/venv with pip install -r backend/requirements.txt
  - npm install at project root
  - backend/.env configured (copy from backend/.env.example)
  - database/schema_postgresql.sql + seed.sql applied
"""
from __future__ import annotations

import argparse
import atexit
import os
import signal
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BACKEND = ROOT / 'backend'
TESTING = ROOT / 'testing'
FRONTEND_URL = os.environ.get('STUDYBOT_BASE_URL', 'http://localhost:5173')
API_BASE = os.environ.get('STUDYBOT_API_URL', 'http://localhost:8000/api').rstrip('/')
API_HEALTH_URL = os.environ.get('STUDYBOT_API_HEALTH', f'{API_BASE}/openapi.json')
STARTUP_TIMEOUT = int(os.environ.get('STUDYBOT_STARTUP_TIMEOUT', '120'))

PROCS: list[subprocess.Popen] = []
LOG_DIR = TESTING / '.server-logs'


def venv_python() -> Path:
    if sys.platform == 'win32':
        exe = BACKEND / 'venv' / 'Scripts' / 'python.exe'
    else:
        exe = BACKEND / 'venv' / 'bin' / 'python'
    if not exe.exists():
        raise SystemExit(
            'Backend venv not found. Run:\n'
            '  cd backend\n'
            '  python -m venv venv\n'
            '  venv\\Scripts\\activate  (Windows)\n'
            '  pip install -r requirements.txt'
        )
    return exe


def npm_cmd() -> str:
    return 'npm.cmd' if sys.platform == 'win32' else 'npm'


def wait_for_url(url: str, label: str, timeout: int = STARTUP_TIMEOUT) -> bool:
    deadline = time.time() + timeout
    last_err = None
    while time.time() < deadline:
        try:
            urllib.request.urlopen(url, timeout=3)
            print(f'  Ready: {label} ({url})')
            return True
        except (urllib.error.URLError, TimeoutError) as exc:
            last_err = exc
            time.sleep(1)
    print(f'  Timeout: {label} did not start at {url}\n  Last error: {last_err}')
    return False


def start_process(cmd: list[str], cwd: Path, name: str, log_name: str) -> subprocess.Popen:
    print(f'Starting {name}...')
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    log_path = LOG_DIR / log_name
    log_file = open(log_path, 'w', encoding='utf-8')  # noqa: SIM115
    kwargs: dict = {
        'cwd': str(cwd),
        'stdout': log_file,
        'stderr': subprocess.STDOUT,
    }
    if sys.platform == 'win32':
        kwargs['creationflags'] = subprocess.CREATE_NEW_PROCESS_GROUP  # type: ignore[attr-defined]
    proc = subprocess.Popen(cmd, **kwargs)
    proc._log_file = log_file  # type: ignore[attr-defined]
    proc._log_path = log_path  # type: ignore[attr-defined]
    PROCS.append(proc)
    return proc


def print_log_tail(path: Path, lines: int = 25) -> None:
    if not path.exists():
        return
    content = path.read_text(encoding='utf-8', errors='replace').strip().splitlines()
    if not content:
        return
    print(f'\n--- Last lines of {path.name} ---')
    for line in content[-lines:]:
        print(line)
    print('---\n')


def shutdown() -> None:
    if not PROCS:
        return
    print('\nStopping servers...')
    for proc in PROCS:
        if proc.poll() is not None:
            continue
        try:
            if sys.platform == 'win32':
                proc.terminate()
            else:
                os.kill(proc.pid, signal.SIGTERM)
        except OSError:
            pass
    deadline = time.time() + 10
    for proc in PROCS:
        while proc.poll() is None and time.time() < deadline:
            time.sleep(0.2)
        if proc.poll() is None:
            try:
                proc.kill()
            except OSError:
                pass
        log_file = getattr(proc, '_log_file', None)
        if log_file and not log_file.closed:
            log_file.close()
    PROCS.clear()


def ensure_deps() -> None:
    py = venv_python()
    check = subprocess.run(
        [str(py), '-c', 'import requests'],
        capture_output=True,
    )
    if check.returncode != 0:
        print('Installing test dependencies in backend venv...')
        subprocess.check_call(
            [str(py), '-m', 'pip', 'install', '-r', str(TESTING / 'requirements.txt'), '-q']
        )

    if not (ROOT / 'node_modules').exists():
        print('Installing frontend dependencies (npm install)...')
        subprocess.check_call([npm_cmd(), 'install'], cwd=ROOT)


def run_script(script: Path) -> int:
    py = venv_python()
    result = subprocess.run([str(py), str(script)], cwd=ROOT)
    return result.returncode


def main() -> int:
    parser = argparse.ArgumentParser(description='Start StudyBot servers and run tests')
    parser.add_argument(
        '--selenium',
        action='store_true',
        help='Also run selenium_tests.py (needs Chrome)',
    )
    parser.add_argument(
        '--api-only',
        action='store_true',
        help='Only start backend (skip frontend)',
    )
    parser.add_argument(
        '--no-stop',
        action='store_true',
        help='Leave servers running after tests finish',
    )
    args = parser.parse_args()

    env_file = BACKEND / '.env'
    if not env_file.exists():
        print(
            'Warning: backend/.env missing. Copy backend/.env.example to backend/.env '
            'and set Supabase credentials.\n'
        )

    atexit.register(shutdown)
    if sys.platform != 'win32':
        signal.signal(signal.SIGTERM, lambda *_: (shutdown(), sys.exit(1)))
    signal.signal(signal.SIGINT, lambda *_: (shutdown(), sys.exit(130)))

    try:
        ensure_deps()
        py = venv_python()

        backend_proc = start_process(
            [str(py), 'run_api.py'],
            BACKEND,
            'StudyBot API (:8000)',
            'backend.log',
        )

        frontend_proc = None
        if not args.api_only:
            if not (ROOT / 'node_modules').exists():
                subprocess.check_call([npm_cmd(), 'install'], cwd=ROOT)
            frontend_proc = start_process(
                [npm_cmd(), 'run', 'dev'],
                ROOT,
                'Vite frontend (:5173)',
                'frontend.log',
            )

        print(f'\nWaiting up to {STARTUP_TIMEOUT}s for servers...\n')
        if not wait_for_url(API_HEALTH_URL, 'API'):
            if backend_proc.poll() is not None:
                print('Backend process exited early.')
            print_log_tail(backend_proc._log_path)  # type: ignore[attr-defined]
            if not env_file.exists():
                print('Create backend/.env from backend/.env.example with your Supabase credentials.')
            return 1
        if not args.api_only and not wait_for_url(FRONTEND_URL, 'Frontend'):
            if frontend_proc and frontend_proc.poll() is not None:
                print('Frontend process exited early.')
            if frontend_proc:
                print_log_tail(frontend_proc._log_path)  # type: ignore[attr-defined]
            return 1

        print('\n=== API / database smoke tests ===\n')
        code = run_script(TESTING / 'api_db_test.py')
        if code != 0:
            if not env_file.exists():
                print(
                    '\nSetup required:\n'
                    '  1. copy backend\\.env.example backend\\.env\n'
                    '  2. Add Supabase DB_HOST, DB_USER, DB_PASSWORD, etc.\n'
                    '  3. Run database/schema_postgresql.sql and database/seed.sql\n'
                )
            return code

        if args.selenium:
            if args.api_only:
                print('\nSelenium needs the frontend; omit --api-only.')
                return 1
            print('\n=== Selenium UI tests ===\n')
            try:
                subprocess.check_call(
                    [str(py), '-m', 'pip', 'install', '-r', str(TESTING / 'requirements.txt'), '-q']
                )
            except subprocess.CalledProcessError:
                pass
            code = run_script(TESTING / 'selenium_tests.py')
            if code != 0:
                return code

        print('\nAll automated checks passed.')
        return 0
    finally:
        if not args.no_stop:
            shutdown()
        else:
            print('\nServers left running (--no-stop).')
            print(f'  Frontend: {FRONTEND_URL}')
            print(f'  API: {API_BASE} (docs: {API_BASE}/docs)')


if __name__ == '__main__':
    sys.exit(main())
