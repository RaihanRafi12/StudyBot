from ninja import Router
from django.conf import settings
from .schemas import SignupSchema, LoginSchema, TokenSchema, UserOut, UpdateProfileSchema
from .auth import hash_password, verify_password, create_token, auth
from .db import get_cursor, new_id
from .utils import serialize_user, schema_payload

router = Router(tags=['Authentication'])

USER_RETURNING = """
    id, name, email, role, points, monthly_access_count, is_active,
    institution, major, year
"""


@router.post('/register', response={200: TokenSchema, 400: dict})
def register(request, data: SignupSchema):
    if data.role not in ('student', 'faculty', 'researcher', 'visitor', 'admin'):
        return 400, {'detail': 'Invalid role.'}

    bonus = 0 if data.role == 'visitor' else settings.SIGNUP_BONUS_POINTS

    with get_cursor() as cur:
        cur.execute('SELECT id FROM users WHERE email = %s', (data.email,))
        if cur.fetchone():
            return 400, {'detail': 'Email already exists.'}

        user_id = new_id()
        cur.execute(
            f"""
            INSERT INTO users (
                id, name, email, password_hash, role,
                institution, major, year, points
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING {USER_RETURNING}
            """,
            (
                user_id,
                data.name,
                data.email,
                hash_password(data.password),
                data.role,
                data.institution,
                data.major,
                data.year,
                bonus,
            ),
        )
        user = cur.fetchone()

        if bonus > 0:
            cur.execute(
                """
                INSERT INTO activities (id, user_id, type, message, points_delta)
                VALUES (%s, %s, 'signup', %s, %s)
                """,
                (new_id(), user_id, f'Welcome bonus: {bonus} points', bonus),
            )

    user_out = serialize_user(user)
    token = create_token(user_out['id'], user_out['role'])
    return {
        'access_token': token,
        'token_type': 'bearer',
        'user': user_out,
    }


@router.post('/login', response={200: TokenSchema, 401: dict})
def login(request, data: LoginSchema):
    with get_cursor() as cur:
        cur.execute(
            f"""
            SELECT id, name, email, role, points, monthly_access_count,
                   is_active, institution, major, year, password_hash, is_suspended
            FROM users WHERE email = %s
            """,
            (data.email,),
        )
        user = cur.fetchone()

        if not user or not verify_password(data.password, user['password_hash']):
            return 401, {'detail': 'Invalid credentials.'}
        if user.get('is_suspended'):
            return 401, {'detail': 'Account suspended.'}
        if not user.get('is_active', True):
            return 401, {'detail': 'Account inactive.'}

    user_out = serialize_user(user)
    token = create_token(user_out['id'], user_out['role'])
    return {
        'access_token': token,
        'token_type': 'bearer',
        'user': user_out,
    }


@router.get('/me', response=UserOut, auth=auth)
def get_me(request):
    user_id = request.auth['sub']
    with get_cursor() as cur:
        cur.execute(
            f'SELECT {USER_RETURNING} FROM users WHERE id = %s',
            (user_id,),
        )
        user = cur.fetchone()
    return serialize_user(user)


@router.put('/me', response=UserOut, auth=auth)
def update_me(request, data: UpdateProfileSchema):
    user_id = request.auth['sub']
    updates = schema_payload(data)
    if not updates:
        return get_me(request)

    set_clause = ', '.join(f'{k} = %s' for k in updates)
    values = list(updates.values()) + [user_id]

    with get_cursor() as cur:
        cur.execute(
            f"""
            UPDATE users SET {set_clause}, updated_at = NOW()
            WHERE id = %s
            RETURNING {USER_RETURNING}
            """,
            values,
        )
        user = cur.fetchone()
    return serialize_user(user)
