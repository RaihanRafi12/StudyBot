"""
Thin database wrapper using psycopg2 directly (no Django ORM).
Queries use the Supabase / PostgreSQL connection configured in settings.
"""
from __future__ import annotations
import uuid
import psycopg2
import psycopg2.extras
from contextlib import contextmanager
from django.conf import settings


def _conn_params():
    db = settings.DATABASES['default']
    return {
        'dbname':   db['NAME'],
        'user':     db['USER'],
        'password': db['PASSWORD'],
        'host':     db['HOST'],
        'port':     db['PORT'],
        'sslmode':  db.get('OPTIONS', {}).get('sslmode', 'require'),
    }


@contextmanager
def get_cursor():
    conn = psycopg2.connect(**_conn_params())
    try:
        with conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                yield cur
    finally:
        conn.close()


def new_id() -> str:
    return str(uuid.uuid4())


def fmt_time(dt) -> str:
    """Return a human-readable relative time string."""
    if dt is None:
        return 'unknown'
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    if hasattr(dt, 'tzinfo') and dt.tzinfo is None:
        from datetime import timezone as tz
        dt = dt.replace(tzinfo=tz.utc)
    diff = now - dt
    seconds = int(diff.total_seconds())
    if seconds < 60:
        return 'just now'
    if seconds < 3600:
        return f'{seconds // 60} minutes ago'
    if seconds < 86400:
        return f'{seconds // 3600} hours ago'
    return f'{seconds // 86400} days ago'