FROM python:3.12-slim

# Install system dependencies required for database client libraries
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy Django backend application files
COPY . /app/

EXPOSE 8000

# Command to run local development server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
