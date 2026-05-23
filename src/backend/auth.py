"""
JWT utilities for StudyBot
"""
from __future__ import annotations
import jwt
import bcrypt
from datetime import datetime, timedelta, timezone
from typing import Optional
from django.conf import settings
from ninja.security import HttpBearer


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def create_token(user_id: str, role: str) -> str:
    payload = {
        'sub': user_id,
        'role': role,
        'exp': datetime.now(timezone.utc) + timedelta(hours=settings.JWT_EXPIRE_HOURS),
        'iat': datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


class AuthBearer(HttpBearer):
    """Require valid JWT. Attaches decoded payload to request.auth."""
    def authenticate(self, request, token: str):
        payload = decode_token(token)
        if payload:
            return payload
        return None


class AdminBearer(HttpBearer):
    """Require admin role."""
    def authenticate(self, request, token: str):
        payload = decode_token(token)
        if payload and payload.get('role') == 'admin':
            return payload
        return None


# Convenience — attach to request for use in views
auth = AuthBearer()
admin_auth = AdminBearer()