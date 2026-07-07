FROM python:3.11-slim

WORKDIR /app

# Установка PostgreSQL клиента
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY alembic ./alembic
COPY alembic.ini .
COPY wait-for-postgres.sh .
RUN chmod +x wait-for-postgres.sh

ENV PYTHONPATH=/app

#ENTRYPOINT ["sh", "-c", "./wait-for-postgres.sh && alembic upgrade heads && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
ENTRYPOINT ["sh", "-c", "sleep 30 && alembic upgrade heads && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
