"""
API + database smoke tests (no browser).

Verifies Django can reach Postgres and core endpoints work.
Run with backend + database configured:

  cd backend
  venv\\Scripts\\activate
  python manage.py runserver

Then in another terminal:
  pip install requests
  python testing/api_db_test.py

Env:
  STUDYBOT_API_URL=http://localhost:8000/api
"""
from __future__ import annotations

import os
import sys
import time
import urllib.error
import urllib.request

try:
    import requests
except ImportError:
    raise SystemExit('Install requests: pip install requests') from None

API = os.environ.get('STUDYBOT_API_URL', 'http://localhost:8000/api').rstrip('/')


def check_server() -> None:
    health = os.environ.get('STUDYBOT_API_HEALTH', f'{API}/openapi.json')
    try:
        urllib.request.urlopen(health, timeout=5)
    except Exception as exc:
        raise SystemExit(
            f'API not reachable at {API}. Start: cd backend && python run_api.py\n{exc}'
        ) from exc


def main() -> int:
    check_server()
    failed = 0

    print('1. List resources (public)...')
    r = requests.get(f'{API}/resources', params={'limit': 5}, timeout=15)
    if r.status_code != 200:
        print(f'   FAIL status {r.status_code}: {r.text[:200]}')
        failed += 1
    else:
        data = r.json()
        print(f'   OK — {len(data)} resource(s) returned')

    email = f'dbtest_{int(time.time())}@example.com'
    password = 'Test123!'

    print('2. Register user (writes to DB)...')
    r = requests.post(
        f'{API}/auth/register',
        json={
            'name': 'DB Test User',
            'email': email,
            'password': password,
            'role': 'student',
        },
        timeout=15,
    )
    if r.status_code != 200:
        print(f'   FAIL status {r.status_code}: {r.text[:300]}')
        failed += 1
    else:
        token = r.json()['access_token']
        user = r.json()['user']
        print(f'   OK — user id {user["id"]}, points {user["points"]}')

    if failed:
        return 1

    headers = {'Authorization': f'Bearer {token}'}

    print('3. Profile read...')
    r = requests.get(f'{API}/auth/me', headers=headers, timeout=15)
    if r.status_code != 200:
        print(f'   FAIL status {r.status_code}')
        failed += 1
    else:
        print(f'   OK — {r.json()["email"]}')

    print('4. Activities (user tables)...')
    r = requests.get(f'{API}/user/activities', headers=headers, timeout=15)
    if r.status_code != 200:
        print(f'   FAIL status {r.status_code}')
        failed += 1
    else:
        print(f'   OK — {len(r.json())} activity row(s)')

    print('5. Admin login (seed user)...')
    r = requests.post(
        f'{API}/auth/login',
        json={'email': 'admin@example.com', 'password': 'adminpass'},
        timeout=15,
    )
    if r.status_code != 200:
        print(
            f'   FAIL status {r.status_code} — run database/seed.sql for admin@example.com'
        )
        failed += 1
    else:
        admin_token = r.json()['access_token']
        r2 = requests.get(
            f'{API}/admin/users',
            headers={'Authorization': f'Bearer {admin_token}'},
            timeout=15,
        )
        if r2.status_code != 200:
            print(f'   FAIL admin/users status {r2.status_code}')
            failed += 1
        else:
            print(f'   OK — {len(r2.json())} user(s) in admin list')

    print(f'\nResult: {"ALL PASSED" if not failed else f"{failed} check(s) failed"}')
    return 1 if failed else 0


if __name__ == '__main__':
    sys.exit(main())
