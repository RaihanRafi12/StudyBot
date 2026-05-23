"""
Resources endpoints: /api/resources/...
"""
from __future__ import annotations
from typing import List, Optional
from ninja import Router
from django.http import HttpRequest
from ..schemas import (
    ResourceOut, CreateResourceSchema, UpdateResourceSchema,
    CreateReviewSchema, ReviewOut, RequestAccessSchema,
    AccessRequestOut, MessageOut, ErrorOut,
)
from ..auth import auth
from ..db import get_cursor, new_id, fmt_time

router = Router(tags=['Resources'])


# ── List / Search ──────────────────────────────────────────────

@router.get('', response=List[ResourceOut])
def list_resources(
    request: HttpRequest,
    category: Optional[str] = None,
    q: Optional[str] = None,
    sort: str = 'latest',
):
    uid = _optional_uid(request)
    with get_cursor() as cur:
        where = ["r.is_deleted = FALSE", "r.is_approved = TRUE"]
        params = []
        if category:
            where.append('r.category = %s')
            params.append(category)
        if q:
            where.append("(r.title ILIKE %s OR r.description ILIKE %s)")
            params.extend([f'%{q}%', f'%{q}%'])

        order = {
            'latest':  'r.created_at DESC',
            'oldest':  'r.created_at ASC',
            'popular': 'r.review_count DESC',
            'rating':  'r.rating DESC',
        }.get(sort, 'r.created_at DESC')

        cur.execute(f"""
            SELECT r.*,
                   u.name AS uploader_name,
                   r.created_at AS upload_ts
            FROM resources r
            JOIN users u ON u.id = r.uploader_id
            WHERE {' AND '.join(where)}
            ORDER BY {order}
        """, params)
        rows = cur.fetchall()

        # Fetch per-user access info in bulk
        access_set = set()
        requested_set = set()
        if uid:
            ids = [str(r['id']) for r in rows]
            if ids:
                cur.execute(
                    'SELECT resource_id FROM user_resource_access WHERE user_id = %s AND resource_id = ANY(%s)',
                    (uid, ids)
                )
                access_set = {str(r['resource_id']) for r in cur.fetchall()}
                cur.execute(
                    "SELECT resource_id FROM access_requests WHERE user_id = %s AND resource_id = ANY(%s) AND status='pending'",
                    (uid, ids)
                )
                requested_set = {str(r['resource_id']) for r in cur.fetchall()}

        return [_resource_out(r, uid, access_set, requested_set) for r in rows]


@router.get('/{resource_id}', response={200: ResourceOut, 404: ErrorOut})
def get_resource(request: HttpRequest, resource_id: str):
    uid = _optional_uid(request)
    with get_cursor() as cur:
        cur.execute("""
            SELECT r.*, u.name AS uploader_name, r.created_at AS upload_ts
            FROM resources r
            JOIN users u ON u.id = r.uploader_id
            WHERE r.id = %s AND r.is_deleted = FALSE
        """, (resource_id,))
        row = cur.fetchone()
        if not row:
            return 404, {'detail': 'Resource not found.'}

        has_access = False
        access_requested = False
        if uid:
            cur.execute('SELECT 1 FROM user_resource_access WHERE user_id=%s AND resource_id=%s',
                        (uid, resource_id))
            has_access = bool(cur.fetchone())
            if not has_access:
                cur.execute("SELECT 1 FROM access_requests WHERE user_id=%s AND resource_id=%s AND status='pending'",
                            (uid, resource_id))
                access_requested = bool(cur.fetchone())

        cur.execute('SELECT * FROM resource_files WHERE resource_id = %s', (resource_id,))
        files = cur.fetchall()

    return 200, _resource_out(row, uid, set(), set(), has_access, access_requested, files)


# ── Create / Edit / Delete ─────────────────────────────────────

@router.post('', auth=auth, response={201: ResourceOut, 400: ErrorOut})
def create_resource(request: HttpRequest, body: CreateResourceSchema):
    uid = request.auth['sub']
    role = request.auth['role']
    if role not in ('faculty', 'researcher', 'admin'):
        return 400, {'detail': 'Only faculty/researchers can upload resources.'}

    rid = new_id()
    with get_cursor() as cur:
        cur.execute("""
            INSERT INTO resources (id, title, description, full_details, category,
                                   uploader_id, is_public, topics, external_link, is_approved)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            RETURNING *
        """, (rid, body.title, body.description, body.full_details,
              body.category, uid, body.is_public,
              body.topics, body.external_link,
              role == 'admin'))  # admins auto-approve

        resource = cur.fetchone()

        # Log upload approval if not admin
        if role != 'admin':
            cur.execute("""
                INSERT INTO upload_approvals (id, resource_id, uploader_id)
                VALUES (%s, %s, %s)
            """, (new_id(), rid, uid))

        # Award upload points
        cur.execute(
            'UPDATE users SET points = points + 2 WHERE id = %s',
            (uid,)
        )
        # Log activity
        cur.execute("""
            INSERT INTO activities (id, user_id, type, message, resource_id, points_delta)
            VALUES (%s,%s,'upload',%s,%s,2)
        """, (new_id(), uid, f'Uploaded "{body.title}"', rid))

        # Get uploader name
        cur.execute('SELECT name FROM users WHERE id = %s', (uid,))
        uploader_name = cur.fetchone()['name']

    row = dict(resource)
    row['uploader_name'] = uploader_name
    row['upload_ts'] = row['created_at']
    return 201, _resource_out(row, uid, {rid}, set(), True, False, [])


@router.patch('/{resource_id}', auth=auth, response={200: ResourceOut, 403: ErrorOut, 404: ErrorOut})
def update_resource(request: HttpRequest, resource_id: str, body: UpdateResourceSchema):
    uid = request.auth['sub']
    role = request.auth['role']
    with get_cursor() as cur:
        cur.execute('SELECT * FROM resources WHERE id = %s AND is_deleted = FALSE', (resource_id,))
        resource = cur.fetchone()
        if not resource:
            return 404, {'detail': 'Resource not found.'}
        if str(resource['uploader_id']) != uid and role != 'admin':
            return 403, {'detail': 'Permission denied.'}

        updates = {k: v for k, v in body.dict().items() if v is not None}
        if updates:
            fields = ', '.join(f'{k} = %s' for k in updates)
            cur.execute(
                f'UPDATE resources SET {fields}, updated_at=NOW() WHERE id=%s RETURNING *',
                list(updates.values()) + [resource_id]
            )
            resource = cur.fetchone()

        cur.execute('SELECT name FROM users WHERE id = %s', (str(resource['uploader_id']),))
        uploader_name = cur.fetchone()['name']

    row = dict(resource)
    row['uploader_name'] = uploader_name
    row['upload_ts'] = row['created_at']
    return 200, _resource_out(row, uid, set(), set())


@router.delete('/{resource_id}', auth=auth, response={200: MessageOut, 403: ErrorOut, 404: ErrorOut})
def delete_resource(request: HttpRequest, resource_id: str):
    uid = request.auth['sub']
    role = request.auth['role']
    with get_cursor() as cur:
        cur.execute('SELECT uploader_id FROM resources WHERE id=%s AND is_deleted=FALSE', (resource_id,))
        r = cur.fetchone()
        if not r:
            return 404, {'detail': 'Resource not found.'}
        if str(r['uploader_id']) != uid and role != 'admin':
            return 403, {'detail': 'Permission denied.'}
        cur.execute('UPDATE resources SET is_deleted=TRUE WHERE id=%s', (resource_id,))
    return 200, {'message': 'Resource deleted.'}


# ── Reviews ────────────────────────────────────────────────────

@router.post('/{resource_id}/reviews', auth=auth, response={201: ReviewOut, 400: ErrorOut})
def add_review(request: HttpRequest, resource_id: str, body: CreateReviewSchema):
    uid = request.auth['sub']
    with get_cursor() as cur:
        cur.execute('SELECT 1 FROM user_resource_access WHERE user_id=%s AND resource_id=%s',
                    (uid, resource_id))
        if not cur.fetchone():
            return 400, {'detail': 'You must have access before reviewing.'}

        cur.execute('SELECT 1 FROM reviews WHERE user_id=%s AND resource_id=%s', (uid, resource_id))
        if cur.fetchone():
            return 400, {'detail': 'Already reviewed.'}

        rid = new_id()
        cur.execute("""
            INSERT INTO reviews (id, user_id, resource_id, rating, comment)
            VALUES (%s,%s,%s,%s,%s) RETURNING *
        """, (rid, uid, resource_id, body.rating, body.comment))
        review = cur.fetchone()

        cur.execute('SELECT name FROM users WHERE id=%s', (uid,))
        reviewer_name = cur.fetchone()['name']

        cur.execute('SELECT title FROM resources WHERE id=%s', (resource_id,))
        title = cur.fetchone()['title']

        cur.execute("""
            INSERT INTO activities (id, user_id, type, message, resource_id)
            VALUES (%s,%s,'review',%s,%s)
        """, (new_id(), uid, f'Reviewed "{title}" with {body.rating} stars', resource_id))

    r = dict(review)
    return 201, {
        'id': str(r['id']),
        'user_id': str(r['user_id']),
        'reviewer_name': reviewer_name,
        'rating': r['rating'],
        'comment': r['comment'],
        'created_at': r['created_at'],
    }


# ── Access Requests ────────────────────────────────────────────

@router.post('/{resource_id}/request-access', auth=auth,
             response={201: MessageOut, 400: ErrorOut})
def request_access(request: HttpRequest, resource_id: str, body: RequestAccessSchema):
    uid = request.auth['sub']
    COST = 4
    with get_cursor() as cur:
        cur.execute('SELECT title, is_public FROM resources WHERE id=%s AND is_deleted=FALSE',
                    (resource_id,))
        resource = cur.fetchone()
        if not resource:
            return 400, {'detail': 'Resource not found.'}
        if resource['is_public']:
            # Grant immediately for public resources
            cur.execute("""
                INSERT INTO user_resource_access (id, user_id, resource_id)
                VALUES (%s,%s,%s) ON CONFLICT DO NOTHING
            """, (new_id(), uid, resource_id))
            return 201, {'message': 'Access granted for public resource.'}

        cur.execute('SELECT 1 FROM user_resource_access WHERE user_id=%s AND resource_id=%s',
                    (uid, resource_id))
        if cur.fetchone():
            return 400, {'detail': 'You already have access.'}

        cur.execute("SELECT 1 FROM access_requests WHERE user_id=%s AND resource_id=%s AND status='pending'",
                    (uid, resource_id))
        if cur.fetchone():
            return 400, {'detail': 'Access already requested.'}

        cur.execute('SELECT points FROM users WHERE id=%s', (uid,))
        user = cur.fetchone()
        if user['points'] < COST:
            return 400, {'detail': f'Insufficient points. Need {COST}, have {user["points"]}.'}

        cur.execute("""
            INSERT INTO access_requests (id, user_id, resource_id, message)
            VALUES (%s,%s,%s,%s)
        """, (new_id(), uid, resource_id, body.message))

        cur.execute("""
            INSERT INTO activities (id, user_id, type, message, resource_id, points_delta)
            VALUES (%s,%s,'request',%s,%s,0)
        """, (new_id(), uid, f'Requested access to "{resource["title"]}"', resource_id))

        # Notify resource owner
        cur.execute('SELECT uploader_id FROM resources WHERE id=%s', (resource_id,))
        owner_id = cur.fetchone()['uploader_id']
        cur.execute('SELECT name FROM users WHERE id=%s', (uid,))
        requester_name = cur.fetchone()['name']
        cur.execute("""
            INSERT INTO notifications (id, user_id, message)
            VALUES (%s,%s,%s)
        """, (new_id(), owner_id,
              f'{requester_name} requested access to your resource "{resource["title"]}"'))

    return 201, {'message': 'Access request submitted.'}


# ── helpers ────────────────────────────────────────────────────

def _optional_uid(request) -> Optional[str]:
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        from ..auth import decode_token
        payload = decode_token(auth_header[7:])
        if payload:
            return payload['sub']
    return None


def _resource_out(row, uid, access_set, requested_set,
                  has_access=None, access_requested=None, files=None) -> dict:
    r = dict(row)
    rid = str(r['id'])

    if has_access is None:
        has_access = rid in access_set or r.get('is_public', False)
    if access_requested is None:
        access_requested = rid in requested_set

    return {
        'id':           rid,
        'title':        r['title'],
        'description':  r.get('description'),
        'full_details': r.get('full_details'),
        'category':     r['category'],
        'uploader':     r.get('uploader_name', 'Unknown'),
        'uploader_id':  str(r['uploader_id']),
        'is_public':    r.get('is_public', True),
        'rating':       float(r.get('rating') or 0),
        'review_count': r.get('review_count', 0),
        'topics':       r.get('topics') or [],
        'external_link': r.get('external_link'),
        'has_access':   has_access,
        'access_requested': access_requested,
        'upload_date':  r['upload_ts'].strftime('%b %d, %Y') if r.get('upload_ts') else None,
        'files': [
            {
                'id':        str(f['id']),
                'name':      f['name'],
                'size':      f.get('size'),
                'file_type': f.get('file_type'),
            }
            for f in (files or [])
        ],
    }