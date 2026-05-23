"""
User-facing endpoints: activities, calendar, notifications
"""
from __future__ import annotations
from typing import List
from ninja import Router
from django.http import HttpRequest
from ..schemas import (
    ActivityOut, CalendarEventOut, CreateEventSchema,
    NotificationOut, MessageOut, ErrorOut,
)
from ..auth import auth
from ..db import get_cursor, new_id, fmt_time

router = Router(tags=['User'])


# ── Activity Log ───────────────────────────────────────────────

@router.get('/activities', auth=auth, response=List[ActivityOut])
def get_activities(request: HttpRequest):
    uid = request.auth['sub']
    with get_cursor() as cur:
        cur.execute("""
            SELECT a.*, r.title AS resource_title
            FROM activities a
            LEFT JOIN resources r ON r.id = a.resource_id
            WHERE a.user_id = %s
            ORDER BY a.created_at DESC
            LIMIT 100
        """, (uid,))
        rows = cur.fetchall()
    return [
        {
            'id':             str(r['id']),
            'type':           r['type'],
            'message':        r['message'],
            'resource_title': r.get('resource_title'),
            'points':         r.get('points_delta'),
            'time':           fmt_time(r['created_at']),
        }
        for r in rows
    ]


# ── Calendar ───────────────────────────────────────────────────

@router.get('/calendar', auth=auth, response=List[CalendarEventOut])
def get_events(request: HttpRequest):
    uid = request.auth['sub']
    with get_cursor() as cur:
        cur.execute(
            'SELECT * FROM calendar_events WHERE user_id = %s ORDER BY event_date',
            (uid,)
        )
        rows = cur.fetchall()
    return [
        {
            'id':          str(r['id']),
            'title':       r['title'],
            'description': r.get('description'),
            'event_date':  r['event_date'],
            'type':        r['type'],
        }
        for r in rows
    ]


@router.post('/calendar', auth=auth, response={201: CalendarEventOut, 400: ErrorOut})
def create_event(request: HttpRequest, body: CreateEventSchema):
    uid = request.auth['sub']
    eid = new_id()
    with get_cursor() as cur:
        cur.execute("""
            INSERT INTO calendar_events (id, user_id, title, description, event_date, type)
            VALUES (%s,%s,%s,%s,%s,%s) RETURNING *
        """, (eid, uid, body.title, body.description, body.event_date, body.type))
        row = cur.fetchone()
    return 201, {
        'id':          str(row['id']),
        'title':       row['title'],
        'description': row.get('description'),
        'event_date':  row['event_date'],
        'type':        row['type'],
    }


@router.delete('/calendar/{event_id}', auth=auth, response={200: MessageOut, 404: ErrorOut})
def delete_event(request: HttpRequest, event_id: str):
    uid = request.auth['sub']
    with get_cursor() as cur:
        cur.execute('DELETE FROM calendar_events WHERE id=%s AND user_id=%s RETURNING id',
                    (event_id, uid))
        if not cur.fetchone():
            return 404, {'detail': 'Event not found.'}
    return 200, {'message': 'Event deleted.'}


# ── Notifications ──────────────────────────────────────────────

@router.get('/notifications', auth=auth, response=List[NotificationOut])
def get_notifications(request: HttpRequest):
    uid = request.auth['sub']
    with get_cursor() as cur:
        cur.execute(
            'SELECT * FROM notifications WHERE user_id=%s ORDER BY created_at DESC LIMIT 50',
            (uid,)
        )
        rows = cur.fetchall()
    return [
        {
            'id':      str(r['id']),
            'message': r['message'],
            'read':    r['is_read'],
            'time':    fmt_time(r['created_at']),
        }
        for r in rows
    ]


@router.post('/notifications/{notif_id}/read', auth=auth, response=MessageOut)
def mark_read(request: HttpRequest, notif_id: str):
    uid = request.auth['sub']
    with get_cursor() as cur:
        cur.execute('UPDATE notifications SET is_read=TRUE WHERE id=%s AND user_id=%s',
                    (notif_id, uid))
    return {'message': 'Marked as read.'}


@router.post('/notifications/read-all', auth=auth, response=MessageOut)
def mark_all_read(request: HttpRequest):
    uid = request.auth['sub']
    with get_cursor() as cur:
        cur.execute('UPDATE notifications SET is_read=TRUE WHERE user_id=%s', (uid,))
    return {'message': 'All notifications marked as read.'}