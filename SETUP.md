# StudyBot — Local & GitHub Pages Setup Guide

## Architecture

```
Frontend (React + Vite)  ←→  Supabase (cloud database + auth)
     runs locally               accessible from anywhere
  deployed to GitHub Pages
```

No separate local backend needed — Supabase replaces it entirely.

---

## Step 1 — Create a Supabase Project (free)

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Name it `studybot`, choose a region close to you
3. Wait ~2 minutes for it to provision

---

## Step 2 — Run the Database Schema

1. In Supabase dashboard → **SQL Editor**
2. Open `database/supabase-schema.sql` from this project
3. Paste the entire file and click **Run**
4. All tables, RLS policies, and indexes are created

---

## Step 3 — Get Your Credentials

In Supabase dashboard → **Project Settings** → **API**:
- Copy **Project URL** → `https://xxxx.supabase.co`
- Copy **anon / public** key → long `eyJ...` string

---

## Step 4 — Run Locally

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

Install dependencies and start:

```cmd
npm install
npm run dev
```

Open `http://localhost:5173` — sign up, and data persists in Supabase.

---

## Step 5 — Push to GitHub (two-branch strategy)

### Branch structure:
| Branch | Purpose |
|--------|---------|
| `main` | Your working/development code |
| `deploy` | Triggers the live GitHub Pages deployment |

### First push:

```cmd
git remote add origin https://github.com/YOUR_USERNAME/StudyBot.git
git add .
git commit -m "feat: add Supabase integration"
git branch -M main
git push -u origin main
```

### Create the deploy branch:

```cmd
git checkout -b deploy
git push -u origin deploy
git checkout main
```

---

## Step 6 — Add GitHub Secrets

In your GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Secret name | Value |
|-------------|-------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |

---

## Step 7 — Enable GitHub Pages

1. Repo → **Settings** → **Pages**
2. Under **Source** → select **GitHub Actions**
3. Done — the workflow in `.github/workflows/deploy.yml` handles everything

---

## Step 8 — Deploy

Whenever you want to push a new version live:

```cmd
git checkout deploy
git merge main
git push origin deploy
git checkout main
```

GitHub Actions will build and deploy to:
```
https://YOUR_USERNAME.github.io/StudyBot/
```

Anyone in the world visiting this URL connects to the same Supabase database.

---

## Seeding Initial Resources (optional)

To add the sample resources from the original app into Supabase:

1. Supabase dashboard → **SQL Editor**
2. Open `database/seed.sql` (create it with INSERT statements) or use the **Table Editor** to add rows manually

Or just let users upload resources after signing up.

---

## Admin Account

To make a user an admin:
1. Sign up normally with any email
2. In Supabase **Table Editor** → `users` table
3. Find that user's row → change `role` column to `admin`
4. Log out and log back in → admin dashboard appears

---

## Local Development Summary

```cmd
npm run dev          # start frontend on http://localhost:5173
npm run build        # build for production
```

No backend server to run. Supabase handles auth, database, and realtime.
