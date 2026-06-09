"""Development settings — SQLite or PostgreSQL, DEBUG on, CORS open."""
from .base import *  # noqa: F403
from decouple import config

DEBUG = True

ALLOWED_HOSTS = ['*']

# Check if PostgreSQL settings are provided in environment or .env
DB_HOST = config('DB_HOST', default=None)
if DB_HOST:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': config('DB_NAME', default='postgres'),
            'USER': config('DB_USER', default='postgres'),
            'PASSWORD': config('DB_PASSWORD', default=''),
            'HOST': DB_HOST,
            'PORT': config('DB_PORT', default='5432'),
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',  # noqa: F405
        }
    }

# Allow all origins in development
CORS_ALLOW_ALL_ORIGINS = True

# Django Debug Toolbar (optional — install separately if needed)
INTERNAL_IPS = ['127.0.0.1']
