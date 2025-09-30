#!/bin/sh
npx prisma migrate deploy
npx tsx scripts/seed.ts
exec "$@"
