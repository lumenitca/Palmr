#!/bin/sh

echo "Starting Palmr Server with SQLite..."

# Set proper environment
export HOME=/home/palmr
export NPM_CONFIG_CACHE=/home/palmr/.npm
export PNPM_HOME=/home/palmr/.pnpm

cd /app/server

echo "Generating Prisma client..."
npx prisma generate --schema=./prisma/schema.prisma

echo "Pushing database schema..."
npx prisma db push --accept-data-loss

echo "Running database seeds..."
node prisma/seed.js || echo "Seeds failed or already exist, continuing..."

echo "Starting server application..."
exec node dist/server.js 