import uuid
import psycopg2
import psycopg2.extras
from contextlib import contextmanager
from datetime import datetime, timezone
from django.conf import settings

@contextmanager
def get_cursor():
    """Establishes a single database connection per API call (Serverless friendly)"""
    db = settings.DATABASES['default']

    # Open a single clean connection
    conn = psycopg2.connect(
        database=db['NAME'],
        user=db['USER'],
        password=db['PASSWORD'],
        host=db['HOST'],
        port=db['PORT'],
        sslmode=db.get('OPTIONS', {}).get('sslmode', 'require')
    )
    try:
        with conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                yield cur
    finally:
        # Explicitly close the connection immediately when the request is done
        conn.close()

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
