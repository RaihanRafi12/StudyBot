# StudyBot testing

## What each file does

| File | Type | Tests database? |
|------|------|-----------------|
| `api_db_test.py` | HTTP API smoke tests | **Yes** (via Django → Postgres) |
| `selenium_tests.py` | Browser UI (Chrome) | **Indirectly** (UI → API → DB) |

`selenium_tests.py` is **not** a database test script. It automates the website in Chrome. Use `api_db_test.py` to verify DB + API quickly.

## One command (recommended)

Starts backend + frontend, runs `api_db_test.py`, then stops servers:

```bash
# From project root (Windows)
run-tests.bat

# Or
python testing/run_with_servers.py
```

With browser UI tests too (needs Chrome):

```bash
python testing/run_with_servers.py --selenium
```

Keep servers running after tests:

```bash
python testing/run_with_servers.py --no-stop
```

Backend only (no Vite):

```bash
python testing/run_with_servers.py --api-only
```

**Before first run:** copy `backend/.env.example` → `backend/.env`, apply `database/schema_postgresql.sql` + `seed.sql`.

---

## Manual — database / API

```bash
# Terminal 1 — backend
cd backend
venv\Scripts\activate
python manage.py runserver

# Terminal 2 — API/DB smoke test
pip install requests
python testing/api_db_test.py
```

Expected: list resources, register user, profile, activities, admin login.

## UI tests (Selenium)

```bash
# Terminal 1 — backend (same as above)
# Terminal 2 — frontend
npm run dev

# Terminal 3 — Selenium
pip install -r testing/requirements.txt
python testing/selenium_tests.py
```

Requirements:

- Google Chrome installed
- Frontend at http://localhost:5173
- Backend at http://localhost:8000
- `database/seed.sql` applied (for `admin@example.com` / `adminpass`)

Optional:

```bash
set STUDYBOT_HEADLESS=0
python testing/selenium_tests.py
```

## Can I run `selenium_tests.py` directly?

Yes:

```bash
python testing/selenium_tests.py
```

Exit code `0` = all passed, `1` = failure. If the frontend is down you will see `ERR_CONNECTION_REFUSED` or a clear `[SKIP]` message.
