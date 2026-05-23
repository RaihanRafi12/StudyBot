"""
StudyBot API Schemas  — django-ninja Pydantic models
"""
from __future__ import annotations
from datetime import datetime
from typing import List, Optional
from ninja import Schema


# ── Auth ───────────────────────────────────────────────────────

class SignupSchema(Schema):
    name: str
    email: str
    password: str
    role: str = 'student'
    institution: Optional[str] = None
    major: Optional[str] = None
    year: Optional[str] = None


class LoginSchema(Schema):
    email: str
    password: str


class TokenSchema(Schema):
    access_token: str
    token_type: str = 'bearer'
    user: 'UserOut'


class UserOut(Schema):
    id: str
    name: str
    email: str
    role: str
    institution: Optional[str]
    major: Optional[str]
    year: Optional[str]
    points: int
    monthly_access_count: int
    is_active: bool


class UpdateProfileSchema(Schema):
    name: Optional[str] = None
    institution: Optional[str] = None
    major: Optional[str] = None
    year: Optional[str] = None


# ── Resources ──────────────────────────────────────────────────

class ResourceFileOut(Schema):
    id: str
    name: str
    size: Optional[str]
    file_type: Optional[str]


class ResourceOut(Schema):
    id: str
    title: str
    description: Optional[str]
    full_details: Optional[str]
    category: str
    uploader: str           # uploader name (joined)
    uploader_id: str
    is_public: bool
    rating: float
    review_count: int
    topics: Optional[List[str]]
    external_link: Optional[str]
    has_access: bool        # computed per-user
    access_requested: bool  # computed per-user
    upload_date: Optional[str]
    files: List[ResourceFileOut] = []


class CreateResourceSchema(Schema):
    title: str
    description: Optional[str] = None
    full_details: Optional[str] = None
    category: str
    is_public: bool = True
    topics: Optional[List[str]] = None
    external_link: Optional[str] = None


class UpdateResourceSchema(Schema):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    is_public: Optional[bool] = None


# ── Reviews ────────────────────────────────────────────────────

class CreateReviewSchema(Schema):
    rating: int
    comment: str


class ReviewOut(Schema):
    id: str
    user_id: str
    reviewer_name: str
    rating: int
    comment: str
    created_at: datetime


# ── Access Requests ────────────────────────────────────────────

class RequestAccessSchema(Schema):
    message: Optional[str] = None


class AccessRequestOut(Schema):
    id: str
    user_id: str
    user_name: str
    resource_id: str
    resource_title: str
    message: Optional[str]
    status: str
    timestamp: str


# ── Activities ─────────────────────────────────────────────────

class ActivityOut(Schema):
    id: str
    type: str
    message: str
    resource_title: Optional[str]
    points: Optional[int]
    time: str


# ── Calendar ───────────────────────────────────────────────────

class CreateEventSchema(Schema):
    title: str
    description: Optional[str] = None
    event_date: datetime
    type: str = 'reminder'


class CalendarEventOut(Schema):
    id: str
    title: str
    description: Optional[str]
    event_date: datetime
    type: str


# ── Notifications ──────────────────────────────────────────────

class NotificationOut(Schema):
    id: str
    message: str
    read: bool
    time: str


# ── Admin ──────────────────────────────────────────────────────

class UploadApprovalOut(Schema):
    id: str
    user_id: str
    user_name: str
    resource_title: str
    category: str
    status: str
    timestamp: str


class ReportOut(Schema):
    id: str
    resource_id: str
    resource_title: str
    reported_by: str
    reason: str
    status: str
    timestamp: str


class AdminUserOut(Schema):
    id: str
    name: str
    email: str
    role: str
    institution: Optional[str]
    join_date: str
    points: int
    upload_count: int
    access_count: int
    status: str


# ── Generic responses ──────────────────────────────────────────

class MessageOut(Schema):
    message: str


class ErrorOut(Schema):
    detail: str