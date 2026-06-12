-- ============================================================
-- StudyBot Supabase Schema
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Users (extends Supabase auth.users) ─────────────────────
create table if not exists public.users (
  id           uuid primary key references auth.users(id) on delete cascade,
  name         text not null,
  email        text not null unique,
  role         text not null default 'student'
               check (role in ('student','faculty','researcher','visitor','admin')),
  institution  text,
  major        text,
  study_year   text,
  points       int  not null default 20,
  upload_count int  not null default 0,
  access_count int  not null default 0,
  monthly_access int not null default 0,
  status       text not null default 'active'
               check (status in ('active','suspended')),
  created_at   timestamptz default now()
);

-- ── Resources ────────────────────────────────────────────────
create table if not exists public.resources (
  id           uuid primary key default uuid_generate_v4(),
  title        text not null,
  category     text not null
               check (category in ('Courses','Projects','Research','Documents')),
  uploader_id  uuid not null references public.users(id) on delete cascade,
  description  text,
  full_details text,
  is_public    boolean not null default true,
  external_link text,
  rating       numeric(3,2) not null default 0,
  review_count int not null default 0,
  status       text not null default 'approved'
               check (status in ('pending','approved','rejected')),
  created_at   timestamptz default now()
);

-- ── Resource topics ──────────────────────────────────────────
create table if not exists public.resource_topics (
  resource_id  uuid not null references public.resources(id) on delete cascade,
  topic_name   text not null,
  primary key (resource_id, topic_name)
);

-- ── Resource files ───────────────────────────────────────────
create table if not exists public.resource_files (
  id           uuid primary key default uuid_generate_v4(),
  resource_id  uuid not null references public.resources(id) on delete cascade,
  file_name    text not null,
  file_size    text,
  file_type    text,
  file_url     text not null default ''
);

-- ── User resource access ─────────────────────────────────────
create table if not exists public.user_resource_access (
  user_id      uuid not null references public.users(id) on delete cascade,
  resource_id  uuid not null references public.resources(id) on delete cascade,
  points_spent int  not null default 4,
  unlocked_at  timestamptz default now(),
  primary key (user_id, resource_id)
);

-- ── Reviews ──────────────────────────────────────────────────
create table if not exists public.reviews (
  id           uuid primary key default uuid_generate_v4(),
  resource_id  uuid not null references public.resources(id) on delete cascade,
  user_id      uuid not null references public.users(id) on delete cascade,
  rating       int  not null check (rating >= 1 and rating <= 5),
  comment      text,
  created_at   timestamptz default now(),
  unique (resource_id, user_id)
);

-- ── Access requests ───────────────────────────────────────────
create table if not exists public.access_requests (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.users(id) on delete cascade,
  resource_id  uuid not null references public.resources(id) on delete cascade,
  message      text,
  status       text not null default 'pending'
               check (status in ('pending','approved','rejected')),
  created_at   timestamptz default now()
);

-- ── Reports ───────────────────────────────────────────────────
create table if not exists public.reports (
  id           uuid primary key default uuid_generate_v4(),
  resource_id  uuid not null references public.resources(id) on delete cascade,
  reported_by  uuid not null references public.users(id) on delete cascade,
  reason       text not null,
  status       text not null default 'pending'
               check (status in ('pending','resolved','dismissed')),
  created_at   timestamptz default now()
);

-- ── Calendar events ───────────────────────────────────────────
create table if not exists public.calendar_events (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.users(id) on delete cascade,
  title        text not null,
  description  text,
  event_type   text not null
               check (event_type in ('exam','deadline','reminder','class')),
  event_date   timestamptz not null,
  created_at   timestamptz default now()
);

-- ── Activity logs ─────────────────────────────────────────────
create table if not exists public.activity_logs (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.users(id) on delete cascade,
  activity_type text not null
               check (activity_type in ('request','review','upload')),
  message      text not null,
  created_at   timestamptz default now()
);

-- ── Notifications ─────────────────────────────────────────────
create table if not exists public.notifications (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.users(id) on delete cascade,
  message      text not null,
  is_read      boolean not null default false,
  created_at   timestamptz default now()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

alter table public.users               enable row level security;
alter table public.resources           enable row level security;
alter table public.resource_topics     enable row level security;
alter table public.resource_files      enable row level security;
alter table public.user_resource_access enable row level security;
alter table public.reviews             enable row level security;
alter table public.access_requests     enable row level security;
alter table public.reports             enable row level security;
alter table public.calendar_events     enable row level security;
alter table public.activity_logs       enable row level security;
alter table public.notifications       enable row level security;

-- Users: anyone can read; only owner can update own row
create policy "Public profiles are viewable by everyone"
  on public.users for select using (true);
create policy "Users can update own profile"
  on public.users for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on public.users for insert with check (auth.uid() = id);

-- Resources: public ones visible to all; private only to owner or access holders
create policy "Public resources are viewable by everyone"
  on public.resources for select using (
    is_public = true or uploader_id = auth.uid() or
    exists (select 1 from public.user_resource_access ura
            where ura.resource_id = id and ura.user_id = auth.uid())
  );
create policy "Authenticated users can insert resources"
  on public.resources for insert with check (auth.uid() = uploader_id);
create policy "Owners can update their resources"
  on public.resources for update using (auth.uid() = uploader_id);
create policy "Owners can delete their resources"
  on public.resources for delete using (auth.uid() = uploader_id);

-- Resource topics & files: same visibility as parent resource
create policy "Topics readable with resource"
  on public.resource_topics for select using (
    exists (select 1 from public.resources r where r.id = resource_id and (
      r.is_public = true or r.uploader_id = auth.uid()
    ))
  );
create policy "Files readable with resource"
  on public.resource_files for select using (
    exists (select 1 from public.resources r where r.id = resource_id and (
      r.is_public = true or r.uploader_id = auth.uid() or
      exists (select 1 from public.user_resource_access ura
              where ura.resource_id = r.id and ura.user_id = auth.uid())
    ))
  );

-- Access: users see own access records
create policy "Users see own access"
  on public.user_resource_access for select using (auth.uid() = user_id);
create policy "Users insert own access"
  on public.user_resource_access for insert with check (auth.uid() = user_id);

-- Reviews: all can read; own rows writable
create policy "Reviews readable by everyone"
  on public.reviews for select using (true);
create policy "Users insert own reviews"
  on public.reviews for insert with check (auth.uid() = user_id);
create policy "Users update own reviews"
  on public.reviews for update using (auth.uid() = user_id);

-- Access requests: own rows
create policy "Users see own access requests"
  on public.access_requests for select using (auth.uid() = user_id);
create policy "Users insert own access requests"
  on public.access_requests for insert with check (auth.uid() = user_id);

-- Calendar: own rows
create policy "Users manage own calendar"
  on public.calendar_events for all using (auth.uid() = user_id);

-- Activity logs: own rows
create policy "Users see own activity"
  on public.activity_logs for select using (auth.uid() = user_id);
create policy "Users insert own activity"
  on public.activity_logs for insert with check (auth.uid() = user_id);

-- Notifications: own rows
create policy "Users manage own notifications"
  on public.notifications for all using (auth.uid() = user_id);

-- Reports: authenticated users can insert
create policy "Authenticated users can report"
  on public.reports for insert with check (auth.uid() = reported_by);

-- ============================================================
-- Admin bypass policy (for users with role = 'admin')
-- ============================================================
create policy "Admins can read all users"
  on public.users for select using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );
create policy "Admins can update all users"
  on public.users for update using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );
create policy "Admins can read all resources"
  on public.resources for select using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );
create policy "Admins can update all resources"
  on public.resources for update using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );
create policy "Admins can delete all resources"
  on public.resources for delete using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );
create policy "Admins can read all access requests"
  on public.access_requests for all using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );
create policy "Admins can read all reports"
  on public.reports for all using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );
create policy "Admins can insert notifications for any user"
  on public.notifications for insert with check (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );
