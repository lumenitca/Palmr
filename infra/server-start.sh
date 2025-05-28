#!/bin/sh

echo "Starting Palmr Server..."

# Set proper environment
export HOME=/home/palmr
export NPM_CONFIG_CACHE=/home/palmr/.npm
export PNPM_HOME=/home/palmr/.pnpm

# Wait for PostgreSQL - use environment variable or default to postgres
DB_HOST=${DB_HOST:-postgres}
DB_PORT=${DB_PORT:-5432}
echo "Waiting for PostgreSQL at $DB_HOST:$DB_PORT..."
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 1
done
echo "PostgreSQL is up!"

cd /app/server

echo "Generating Prisma client..."
npx prisma generate --schema=./prisma/schema.prisma

echo "Running migrations..."
npx prisma migrate deploy

echo "Running database seeds..."
node prisma/seed.js || echo "Seeds failed or already exist, continuing..."

echo "Starting server application..."
exec node dist/server.js 