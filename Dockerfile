# ==========================================
# Stage 1: Build the Vue 3 Frontend
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /frontend
COPY ./frontend/package*.json ./
RUN npm install
COPY ./frontend/ ./
# Build the production frontend (prefixes assets with /static/ using NODE_ENV=production)
RUN npm run build

# ==========================================
# Stage 2: Package the Django ASGI App
# ==========================================
FROM python:3.11-slim

# Install system dependencies required for psycopg2 compilation
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Set python environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Create a non-root user (Hugging Face Spaces runs as user 1000)
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /app

# Install dependencies
COPY --chown=user ./backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy Django backend code
COPY --chown=user ./backend /app/backend

# Copy the built Vue frontend from Stage 1
COPY --chown=user --from=frontend-builder /frontend/dist /app/frontend/dist

WORKDIR /app/backend

# Collect all static files (Django admin + Vue SPA)
# Uses development settings to fallback to SQLite and avoid needing a live DB during build
RUN python manage.py collectstatic --noinput --settings=config.settings

# Expose the port Hugging Face expects (7860)
EXPOSE 7860

# Run Daphne to serve the ASGI application
CMD ["daphne", "-b", "0.0.0.0", "-p", "7860", "config.asgi:application"]
