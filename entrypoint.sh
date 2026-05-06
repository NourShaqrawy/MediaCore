#!/bin/sh
set -e

echo "Running Database Migrations..."
npx prisma migrate deploy

echo "Running Database Seeders..."
npx prisma db seed

echo "Starting the application..."
node dist/main.js
