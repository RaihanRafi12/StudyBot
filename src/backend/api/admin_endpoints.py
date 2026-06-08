from typing import List
from ninja import Router
from .schemas import (
    AccessRequestOut,
    UploadApprovalOut,
    ReportOut,
    AdminUserOut,
    MessageOut,
)
from .auth import admin_auth
from .db import get_cursor, new_id, fmt_time

router = Router(tags=['Admin'])


@router.get('/access-requests', auth=admin_auth, response=List[AccessRequestOut])
def list_access_requests(request, status: str = 'pending'):
    with get_cursor() as cur:
        cur.execute(
            """
            SELECT ar.*, u.name AS user_name, r.title AS resource_title
            FROM access_requests ar
            JOIN users u ON u.id = ar.user_id
            JOIN resources r ON r.id = ar.resource_id
            WHERE ar.status = %s
            ORDER BY ar.created_at DESC
            """,
            (status,),
        )
        rows = cur.fetchall()
    return [
        {
            'id': str(r['id']),
            'user_id': str(r['user_id']),
            'user_name': r['user_name'],
            'resource_id': str(r['resource_id']),
            'resource_title': r['resource_title'],
            'message': r.get('message'),
            'status': r['status'],
            'timestamp': fmt_time(r['created_at']),
        }
        for r in rows
    ]


@router.post(
    '/access-requests/{req_id}/approve',
    auth=admin_auth,
    response={200: MessageOut, 400: dict, 404: dict},
)
def approve_access(request, req_id: str):
    admin_id = request.auth['sub']
    cost = 4
    with get_cursor() as cur:
        cur.execute(
            """
            SELECT ar.*, u.points, r.title
            FROM access_requests ar
            JOIN users u ON u.id = ar.user_id
            JOIN resources r ON r.id = ar.resource_id
            WHERE ar.id = %s
            FOR UPDATE
            """,
            (req_id,),
        )
        req = cur.fetchone()
        if not req:
            return 404, {'detail': 'Request not found.'}
        if req['status'] != 'pending':
            return 400, {'detail': 'Request already processed.'}
        if req['points'] < cost:
            return 400, {'detail': 'User has insufficient points.'}

        cur.execute(
            'UPDATE users SET points = points - %s WHERE id = %s',
            (cost, req['user_id']),
        )
        cur.execute(
            """
            INSERT INTO user_resource_access (id, user_id, resource_id, points_spent)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (user_id, resource_id) DO NOTHING
            """,
            (new_id(), req['user_id'], req['resource_id'], cost),
        )
        cur.execute(
            """
            UPDATE access_requests
            SET status = 'approved', reviewed_by = %s, reviewed_at = NOW()
            WHERE id = %s
            """,
            (admin_id, req_id),
        )
        cur.execute(
            """
            INSERT INTO notifications (id, user_id, message)
            VALUES (%s, %s, %s)
            """,
            (
                new_id(),
                req['user_id'],
                f'Your access request for "{req["title"]}" was approved. {cost} points deducted.',
            ),
        )
        cur.execute(
            """
            INSERT INTO activities (id, user_id, type, message, resource_id, points_delta)
            VALUES (%s, %s, 'approved', %s, %s, %s)
            """,
            (
                new_id(),
                req['user_id'],
                f'Access approved for "{req["title"]}"',
                req['resource_id'],
                -cost,
            ),
        )
    return 200, {'message': 'Access approved.'}


@router.post(
    '/access-requests/{req_id}/reject',
    auth=admin_auth,
    response={200: MessageOut, 404: dict},
)
def reject_access(request, req_id: str):
    admin_id = request.auth['sub']
    with get_cursor() as cur:
        cur.execute(
            """
            SELECT ar.*, r.title
            FROM access_requests ar
            JOIN resources r ON r.id = ar.resource_id
            WHERE ar.id = %s
            """,
            (req_id,),
        )
        req = cur.fetchone()
        if not req:
            return 404, {'detail': 'Request not found.'}
        cur.execute(
            """
            UPDATE access_requests
            SET status = 'rejected', reviewed_by = %s, reviewed_at = NOW()
            WHERE id = %s
            """,
            (admin_id, req_id),
        )
        cur.execute(
            """
            INSERT INTO notifications (id, user_id, message)
            VALUES (%s, %s, %s)
            """,
            (
                new_id(),
                req['user_id'],
                f'Your access request for "{req["title"]}" was rejected.',
            ),
        )
    return 200, {'message': 'Access rejected.'}


@router.get('/upload-approvals', auth=admin_auth, response=List[UploadApprovalOut])
def list_upload_approvals(request, status: str = 'pending'):
    with get_cursor() as cur:
        cur.execute(
            """
            SELECT ua.*, u.name AS user_name, r.title AS resource_title, r.category
            FROM upload_approvals ua
            JOIN users u ON u.id = ua.uploader_id
            JOIN resources r ON r.id = ua.resource_id
            WHERE ua.status = %s
            ORDER BY ua.created_at DESC
            """,
            (status,),
        )
        rows = cur.fetchall()
    return [
        {
            'id': str(r['id']),
            'user_id': str(r['uploader_id']),
            'user_name': r['user_name'],
            'resource_title': r['resource_title'],
            'category': r['category'],
            'status': r['status'],
            'timestamp': fmt_time(r['created_at']),
        }
        for r in rows
    ]


@router.post(
    '/upload-approvals/{approval_id}/approve',
    auth=admin_auth,
    response={200: MessageOut, 404: dict},
)
def approve_upload(request, approval_id: str):
    admin_id = request.auth['sub']
    with get_cursor() as cur:
        cur.execute(
            """
            SELECT ua.*, r.title, r.uploader_id
            FROM upload_approvals ua
            JOIN resources r ON r.id = ua.resource_id
            WHERE ua.id = %s
            """,
            (approval_id,),
        )
        ua_row = cur.fetchone()
        if not ua_row:
            return 404, {'detail': 'Approval not found.'}
        cur.execute(
            'UPDATE resources SET is_approved = TRUE, updated_at = NOW() WHERE id = %s',
            (ua_row['resource_id'],),
        )
        cur.execute(
            """
            UPDATE upload_approvals
            SET status = 'approved', reviewed_by = %s, reviewed_at = NOW()
            WHERE id = %s
            """,
            (admin_id, approval_id),
        )
        cur.execute(
            """
            INSERT INTO notifications (id, user_id, message)
            VALUES (%s, %s, %s)
            """,
            (
                new_id(),
                ua_row['uploader_id'],
                f'Your resource "{ua_row["title"]}" has been approved and is now live.',
            ),
        )
    return 200, {'message': 'Upload approved.'}


@router.post(
    '/upload-approvals/{approval_id}/reject',
    auth=admin_auth,
    response={200: MessageOut, 404: dict},
)
def reject_upload(request, approval_id: str):
    admin_id = request.auth['sub']
    with get_cursor() as cur:
        cur.execute(
            """
            SELECT ua.*, r.title, r.uploader_id
            FROM upload_approvals ua
            JOIN resources r ON r.id = ua.resource_id
            WHERE ua.id = %s
            """,
            (approval_id,),
        )
        ua_row = cur.fetchone()
        if not ua_row:
            return 404, {'detail': 'Approval not found.'}
        cur.execute(
            """
            UPDATE upload_approvals
            SET status = 'rejected', reviewed_by = %s, reviewed_at = NOW()
            WHERE id = %s
            """,
            (admin_id, approval_id),
        )
        cur.execute(
            """
            INSERT INTO notifications (id, user_id, message)
            VALUES (%s, %s, %s)
            """,
            (
                new_id(),
                ua_row['uploader_id'],
                f'Your resource "{ua_row["title"]}" was not approved.',
            ),
        )
    return 200, {'message': 'Upload rejected.'}


@router.get('/reports', auth=admin_auth, response=List[ReportOut])
def list_reports(request, status: str = 'pending'):
    with get_cursor() as cur:
        cur.execute(
            """
            SELECT rr.*, r.title AS resource_title, u.name AS reporter_name
            FROM resource_reports rr
            JOIN resources r ON r.id = rr.resource_id
            JOIN users u ON u.id = rr.reported_by
            WHERE rr.status = %s
            ORDER BY rr.created_at DESC
            """,
            (status,),
        )
        rows = cur.fetchall()
    return [
        {
            'id': str(r['id']),
            'resource_id': str(r['resource_id']),
            'resource_title': r['resource_title'],
            'reported_by': r['reporter_name'],
            'reason': r['reason'],
            'status': r['status'],
            'timestamp': fmt_time(r['created_at']),
        }
        for r in rows
    ]


@router.post('/reports/{report_id}/resolve', auth=admin_auth, response=MessageOut)
def resolve_report(request, report_id: str):
    admin_id = request.auth['sub']
    with get_cursor() as cur:
        cur.execute(
            """
            UPDATE resource_reports
            SET status = 'resolved', resolved_by = %s, resolved_at = NOW()
            WHERE id = %s
            """,
            (admin_id, report_id),
        )
    return {'message': 'Report resolved.'}


@router.post('/reports/{report_id}/dismiss', auth=admin_auth, response=MessageOut)
def dismiss_report(request, report_id: str):
    admin_id = request.auth['sub']
    with get_cursor() as cur:
        cur.execute(
            """
            UPDATE resource_reports
            SET status = 'dismissed', resolved_by = %s, resolved_at = NOW()
            WHERE id = %s
            """,
            (admin_id, report_id),
        )
    return {'message': 'Report dismissed.'}


@router.get('/users', auth=admin_auth, response=List[AdminUserOut])
def list_users(request, q: str = ''):
    with get_cursor() as cur:
        if q:
            cur.execute(
                """
                SELECT u.*,
                    (SELECT COUNT(*) FROM resources
                     WHERE uploader_id = u.id AND is_deleted = FALSE) AS upload_count,
                    (SELECT COUNT(*) FROM user_resource_access
                     WHERE user_id = u.id) AS access_count
                FROM users u
                WHERE u.name ILIKE %s OR u.email ILIKE %s OR u.role ILIKE %s
                ORDER BY u.created_at DESC
                """,
                (f'%{q}%', f'%{q}%', f'%{q}%'),
            )
        else:
            cur.execute(
                """
                SELECT u.*,
                    (SELECT COUNT(*) FROM resources
                     WHERE uploader_id = u.id AND is_deleted = FALSE) AS upload_count,
                    (SELECT COUNT(*) FROM user_resource_access
                     WHERE user_id = u.id) AS access_count
                FROM users u
                ORDER BY u.created_at DESC
                """
            )
        rows = cur.fetchall()
    return [
        {
            'id': str(r['id']),
            'name': r['name'],
            'email': r['email'],
            'role': r['role'],
            'institution': r.get('institution'),
            'join_date': r['created_at'].strftime('%b %d, %Y'),
            'points': r.get('points', 0),
            'upload_count': r.get('upload_count', 0),
            'access_count': r.get('access_count', 0),
            'status': 'suspended' if r.get('is_suspended') else 'active',
        }
        for r in rows
    ]


@router.post('/users/{user_id}/suspend', auth=admin_auth, response=MessageOut)
def suspend_user(request, user_id: str):
    with get_cursor() as cur:
        cur.execute(
            'UPDATE users SET is_suspended = TRUE, updated_at = NOW() WHERE id = %s',
            (user_id,),
        )
    return {'message': 'User suspended.'}


@router.post('/users/{user_id}/activate', auth=admin_auth, response=MessageOut)
def activate_user(request, user_id: str):
    with get_cursor() as cur:
        cur.execute(
            'UPDATE users SET is_suspended = FALSE, updated_at = NOW() WHERE id = %s',
            (user_id,),
        )
    return {'message': 'User activated.'}


@router.get('/activities', auth=admin_auth)
def admin_activities(request):
    with get_cursor() as cur:
        cur.execute(
            """
            SELECT a.*, u.name AS user_name
            FROM activities a
            JOIN users u ON u.id = a.user_id
            ORDER BY a.created_at DESC
            LIMIT 200
            """
        )
        rows = cur.fetchall()
    return [
        {
            'id': str(r['id']),
            'user_id': str(r['user_id']),
            'user_name': r['user_name'],
            'type': r['type'],
            'message': r['message'],
            'points': r.get('points_delta'),
            'time': fmt_time(r['created_at']),
        }
        for r in rows
    ]
