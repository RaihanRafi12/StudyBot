import uuid
import psycopg2
import psycopg2.extras
import psycopg2.pool
from contextlib import contextmanager
from datetime import datetime, timezone
from django.conf import settings

_pool = None


def get_pool():
    global _pool
    if _pool is None:
        db = settings.DATABASES['default']
        _pool = psycopg2.pool.SimpleConnectionPool(
            1,
            20,
            database=db['NAME'],  # Fixed: changed 'dbname' to 'database'
            user=db['USER'],
            password=db['PASSWORD'],
            host=db['HOST'],
            port=db['PORT'],
            sslmode=db.get('OPTIONS', {}).get('sslmode', 'require'), # Ensures SSL is required
        )
    return _pool


@contextmanager
def get_cursor():
    pool = get_pool()
    conn = pool.getconn()
    try:
        with conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                yield cur
    finally:
        pool.putconn(conn)


def new_id():
    return str(uuid.uuid4())


def fmt_time(dt):
    if dt is None:
        return 'unknown'
    now = datetime.now(timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    diff = now - dt
    seconds = int(diff.total_seconds())
    if seconds < 60:
        return 'just now'
    if seconds < 3600:
        return f'{seconds // 60} minutes ago'
    if seconds < 86400:
        return f'{seconds // 3600} hours ago'
    return f'{seconds // 86400} days ago'
