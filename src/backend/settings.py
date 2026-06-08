# settings.py
import os

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'postgres'),
        'USER': os.environ.get('DB_USER', 'postgres'),
        'PASSWORD': os.environ.get('DB_PASS', ''),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}
INSTALLED_APPS = [
    ...
    'corsheaders',
    ...
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # ← must be FIRST
    'django.middleware.common.CommonMiddleware',
    ...
]

# Allow your Vercel frontend to call the backend
CORS_ALLOWED_ORIGINS = [
    "https://your-studybot.vercel.app",  # ← replace with your actual Vercel URL
]

ALLOWED_HOSTS = [
    'studybot-backend-dz1r.onrender.com',
    'localhost',
    '127.0.0.1',
]
