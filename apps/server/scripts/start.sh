#!/bin/sh

echo "Waiting for PostgreSQL..."
while ! nc -z postgres 5432; do
  sleep 1
done
echo "PostgreSQL is up!"

echo "Running migrations and seed..."
npx prisma generate --schema=./prisma/schema.prisma
npx prisma migrate deploy
pnpm db:seed

echo "Starting application..."
pnpm start 