#!/bin/sh
# Pass Fly Postgres DATABASE_URL to Invidious config (for Fly.io deployment)
[ -n "$DATABASE_URL" ] && export INVIDIOUS_DATABASE_URL="$DATABASE_URL"
exec /sbin/tini -- ${1+"$@"}
