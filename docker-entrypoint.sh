#!/bin/sh
# Container startup for production. Runs BEFORE the Next.js server so the prod
# database is always on the current schema and the baseline admin/settings exist.
#
#   1. drizzle-kit migrate — applies any pending migrations (idempotent; only new
#      migrations run, tracked in the __drizzle_migrations table). FATAL on error:
#      we must not serve the new app against a stale schema.
#   2. db:seed — idempotent. Creates (or refreshes) the ADMIN account + branding /
#      finance-settings singletons. Non-fatal: a seed hiccup shouldn't take the
#      app down once the schema is good.
#   3. next start.
#
# DATABASE_URL / SENDGRID_API_KEY / EMAIL_FROM / JWT_SECRET come from the compose
# environment (see docker-compose.prod.yml). The local .env is .dockerignored, so
# it never leaks into the image.
set -e

echo "▶ [entrypoint] Applying database migrations (drizzle-kit migrate)…"
npm run db:migrate

echo "▶ [entrypoint] Seeding baseline data (idempotent)…"
if npm run db:seed; then
  echo "✓ [entrypoint] Seed complete."
else
  echo "⚠ [entrypoint] Seed step failed — continuing to start the app."
fi

echo "▶ [entrypoint] Starting Next.js…"
exec npm start
