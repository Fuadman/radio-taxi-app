#!/usr/bin/env zsh
# Clear the core app tables in the database.
# Usage: ./scripts/clear_db.sh [DATABASE_URL]
# If DATABASE_URL not provided, uses $DATABASE_URL env var or defaults to postgresql://localhost:5432/taxi

set -euo pipefail

DB_URL=${1:-${DATABASE_URL:-"postgresql://localhost:5433/taxi"}}

cat <<EOF
About to TRUNCATE core tables in the database:
  $DB_URL
This operation is destructive and cannot be undone.
EOF

read "-r?Type 'yes' to continue: " CONFIRM
if [[ "$CONFIRM" != "yes" ]]; then
  echo "Aborted by user."
  exit 1
fi

psql "$DB_URL" -v ON_ERROR_STOP=1 <<'SQL'
BEGIN;
TRUNCATE TABLE rides, driver_info, profiles, users RESTART IDENTITY CASCADE;
COMMIT;
SQL

echo "Database tables truncated successfully."
