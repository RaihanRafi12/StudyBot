# Supabase Connection Setup Guide for StudyBot

## ✅ Status: Your project is ready for Supabase!

Your backend is already configured to use Supabase PostgreSQL. Follow these steps to complete the setup:

---

## 1. Environment Configuration ✓

A `.env` file has been created with your Supabase credentials:

```env
DB_HOST=db.btqgsrlhqpmgnlexrdka.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=StudyBotSELab
DB_SSLMODE=require
```

**⚠️ Security Warning:** 
- Never commit `.env` file (already in `.gitignore`)
- Change `SECRET_KEY` and `JWT_SECRET` in production
- Use strong passwords in production

---

## 2. Set Up the Database Schema

### Option A: Using Supabase Dashboard (Recommended for First Time)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor**
4. Click **New Query**
5. Copy and paste the entire contents of `src/backend/schema.sql`
6. Click **Run**

### Option B: Using psql Command Line

```bash
psql postgresql://postgres:StudyBotSELab@db.btqgsrlhqpmgnlexrdka.supabase.co:5432/postgres < src/backend/schema.sql
```

---

## 3. Install Backend Dependencies

```bash
pip install -r src/backend/requirements.txt
```

**Dependencies included:**
- `Django==4.2.11` - Web framework
- `psycopg2-binary==2.9.9` - PostgreSQL adapter
- `django-ninja==1.1.0` - API framework
- `PyJWT==2.8.0` - JWT authentication
- `bcrypt==4.1.2` - Password hashing

---

## 4. Run the Backend Server

### Development (Local)

```bash
cd src/backend
python manage.py runserver
```

The server will run at `http://localhost:8000`

### Production (Gunicorn)

```bash
pip install gunicorn
gunicorn --workers 4 --bind 0.0.0.0:8000 studybot.wsgi:application
```

---

## 5. Verify Connection

Test the database connection:

```bash
python -c "
import psycopg2
import os
from decouple import config

conn = psycopg2.connect(
    dbname=config('DB_NAME'),
    user=config('DB_USER'),
    password=config('DB_PASSWORD'),
    host=config('DB_HOST'),
    port=config('DB_PORT'),
    sslmode=config('DB_SSLMODE')
)
print('✅ Connected to Supabase successfully!')
conn.close()
"
```

---

## 6. Backend Configuration Details

### Database Connection (settings.py)

Your Django backend automatically reads from environment variables:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME':     config('DB_NAME'),
        'USER':     config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST':     config('DB_HOST'),
        'PORT':     config('DB_PORT'),
        'OPTIONS':  {'sslmode': config('DB_SSLMODE')},
    }
}
```

### Database Wrapper (db.py)

Your backend uses direct `psycopg2` connection with:
- Real dictionary cursor for JSON-friendly responses
- Connection pooling support
- Proper SSL configuration for Supabase

### Endpoints Available

- **Auth**: `POST /api/auth/register`, `POST /api/auth/login`
- **Resources**: `GET /api/resources`, `POST /api/resources`
- **Users**: `GET /api/users`, `PUT /api/users/{id}`
- **Admin**: `GET /api/admin/users`, `POST /api/admin/approve`

---

## 7. Deployment

### Deploy to Vercel (Frontend + Backend)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard:
   - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_SSLMODE`
   - `SECRET_KEY`, `JWT_SECRET`

### Deploy Backend Only (Render, Railway, Heroku)

```bash
# Render.com example
vercel deploy --prod

# Or via Gunicorn
gunicorn --workers 4 --bind 0.0.0.0:$PORT studybot.wsgi:application
```

---

## 8. Frontend Setup

Your frontend is already configured with Vite and connects to the backend via environment variables:

```bash
npm install
npm run dev   # Start development server on localhost:5173
npm run build # Build for production
```

---

## 9. Database Tables Overview

| Table | Purpose |
|-------|---------|
| `users` | Student, faculty, admin profiles |
| `resources` | Course materials, documents, projects |
| `reviews` | Ratings and feedback on resources |
| `access_requests` | Student requests for private content |
| `activities` | User activity logging and points |
| `calendar_events` | Study schedule and deadlines |
| `notifications` | User alerts and messages |
| `upload_approvals` | Admin workflow for content review |

---

## 10. Troubleshooting

### Connection Refused
- Check your Supabase status: https://status.supabase.com
- Verify credentials in `.env`
- Ensure your IP is whitelisted (Supabase allows all by default)

### SSL/TLS Errors
- Ensure `DB_SSLMODE=require` in `.env`
- Update `psycopg2`: `pip install --upgrade psycopg2-binary`

### Django Errors
- Check Django logs: `python manage.py runserver --verbosity 3`
- Verify migrations: Database schema from `schema.sql` is already applied

### Port Already in Use
- Change port: `python manage.py runserver 8001`
- Or kill existing process: `lsof -ti:8000 | xargs kill -9`

---

## 📚 Next Steps

1. ✅ Database configured
2. ✅ Environment variables set
3. 🔲 Run schema.sql in Supabase SQL Editor
4. 🔲 Start backend server
5. 🔲 Test API endpoints
6. 🔲 Deploy to production

---

**Need help?** Check the Supabase docs: https://supabase.com/docs
