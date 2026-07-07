#!/bin/bash
# wait-for-postgres.sh

set -e

host="postgres"
port="5432"
user="postgres"
password="postgresQ0w9e8r7t6y5"
db="resume_tuner"

echo "Waiting for PostgreSQL..."

until PGPASSWORD=$password psql -h "$host" -p "$port" -U "$user" -d "$db" -c '\q'; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL is up - executing command" 