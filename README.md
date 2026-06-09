# StudyBot 📚

An intelligent, multi-role platform for managing, sharing, and discovering educational resources.

## 🚀 Deployment Status

- **Frontend**: [Vercel](https://vercel.com)
- **Backend**: [Render](https://studybot-backend-dz1r.onrender.com/api/docs)
- **Database**: [Supabase](https://supabase.com)

## 🛠️ Tech Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS, Axios.
- **Backend**: Python, Django, Django-Ninja, Waitress.
- **Database**: PostgreSQL (Supabase).

## 📦 Project Structure

- `/src/app`: React Frontend application.
- `/src/backend`: Python Django-Ninja API.
- `/src/backend/api`: API Route definitions and business logic.
- `/src/backend/studybot`: Django core settings and configurations.

## 🔧 Setup & Development

### Backend
1. `cd src/backend`
2. `pip install -r requirements.txt`
3. `python run_api.py`

### Frontend
1. `npm install`
2. `npm run dev`

## 🌐 Production Instructions

1. **Supabase**: Run `src/backend/schema.sql` in your SQL Editor.
2. **Render**: Use the provided `render.yaml` or set Root Directory to `src/backend`.
3. **Environment Variables**:
   - `DATABASE_URL` or individual `DB_*` vars in Render.
   - `VITE_API_URL` in Vercel.
