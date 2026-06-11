"""
Consolidated Django settings.
"""
from pathlib import Path
from datetime import timedelta
# pyrefly: ignore [missing-import]
from decouple import config

# Build paths inside the project like this: BASE_DIR / 'subdir'.
# Since settings.py is in backend/config/settings.py, BASE_DIR should point to backend/.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY', default='django-insecure-change-me-in-production')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=True, cast=bool)

# ALLOWED_HOSTS
ALLOWED_HOSTS = config(
    'ALLOWED_HOSTS', 
    default='*', 
    cast=lambda v: [s.strip() for s in v.split(',') if s.strip()] if v else ['*']
)

# Application definition
DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',
    'drf_spectacular',
]

LOCAL_APPS = [
    'apps.users',
    'apps.branches',
    'apps.products',
    'apps.inventory',
    'apps.sales',
    'apps.customers',
    'apps.reports',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

# TEMPLATES configuration (searching frontend/dist if it exists)
FRONTEND_DIR = BASE_DIR.parent / 'frontend' / 'dist'
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [FRONTEND_DIR] if FRONTEND_DIR.exists() else [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

# Database Setup
# Dynamically switch between PostgreSQL (Supabase) and local SQLite
DB_HOST = config('DB_HOST', default=None)
if DB_HOST:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': config('DB_NAME', default='postgres'),
            'USER': config('DB_USER', default='postgres'),
            'PASSWORD': config('DB_PASSWORD', default=''),
            'HOST': DB_HOST,
            'PORT': config('DB_PORT', default='6543'),
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Auth Model
AUTH_USER_MODEL = 'users.CustomUser'

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# JWT
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=8),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# Internationalization
LANGUAGE_CODE = 'ar'
TIME_ZONE = 'Africa/Cairo'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Serve Vue built assets in Django static files
if FRONTEND_DIR.exists():
    STATICFILES_DIRS = [
        FRONTEND_DIR,
    ]

# CORS settings
CORS_ALLOW_ALL_ORIGINS = config('CORS_ALLOW_ALL_ORIGINS', default=True, cast=bool)
if not CORS_ALLOW_ALL_ORIGINS:
    CORS_ALLOWED_ORIGINS = config(
        'CORS_ALLOWED_ORIGINS',
        cast=lambda v: [s.strip() for s in v.split(',')],
        default='http://localhost:5173',
    )

# Security headers for production behind HTTPS proxies (like Hugging Face)
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Power BI Embedded Configuration
POWERBI_TENANT_ID = config('POWERBI_TENANT_ID', default='')
POWERBI_CLIENT_ID = config('POWERBI_CLIENT_ID', default='')
POWERBI_CLIENT_SECRET = config('POWERBI_CLIENT_SECRET', default='')
POWERBI_WORKSPACE_ID = config('POWERBI_WORKSPACE_ID', default='')
POWERBI_REPORT_ID = config('POWERBI_REPORT_ID', default='')

# ─── Swagger / OpenAPI Documentation (drf-spectacular) ───────────────────────
SPECTACULAR_SETTINGS = {
    'TITLE': 'Fashion Chain API',
    'DESCRIPTION': (
        'REST API for Fashion Chain — a multi-branch retail management system.\n\n'
        '**Authentication:** All endpoints (except login) require a JWT Bearer token. '
        'Obtain a token from `POST /api/v1/auth/login/` then set the `Authorization` header '
        'to `Bearer <access_token>`.'       
    ),
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
    'TAGS': [
        {'name': 'Auth',      'description': 'Authentication & user management'},
        {'name': 'Branches',  'description': 'Branch CRUD (Owner only)'},
        {'name': 'Products',  'description': 'Products, variants & categories'},
        {'name': 'Inventory', 'description': 'Stock levels, movements & transfers'},
        {'name': 'Sales',     'description': 'Sales transactions'},
        {'name': 'Customers', 'description': 'Customer management'},
        {'name': 'Reports',   'description': 'Dashboard analytics & reports'},
    ],
}

