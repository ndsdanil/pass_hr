#!/bin/bash
# wait-for-postgres.sh

set -e

host="${POSTGRES_HOST:-postgres}"
port="${POSTGRES_PORT:-5432}"
user="${POSTGRES_USER:-postgres}"
password="${POSTGRES_PASSWORD}"
db="${POSTGRES_DB:-resume_tuner}"

echo "Waiting for PostgreSQL..."

until PGPASSWORD=$password psql -h "$host" -p "$port" -U "$user" -d "$db" -c '\q'; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL is up - executing command" 