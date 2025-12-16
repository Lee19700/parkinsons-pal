#!/usr/bin/env bash
set -euo pipefail
# Purpose: Dump DB, encrypt, upload to NAS or remote storage

DB_URL="${DB_URL:-}"
DB_TYPE="${DB_TYPE:-postgres}" # postgres|sqlite
BACKUP_DIR="${BACKUP_DIR:-./.backups}"
NAS_PATH="${NAS_PATH:-}" # e.g. /mnt/nas/backups/parkipal
ENC_KEY_FILE="${ENC_KEY_FILE:-}" # path to encryption key file

mkdir -p "$BACKUP_DIR"
TS=$(date +%Y%m%d_%H%M%S)
NAME="db_${TS}"
DUMP_FILE="$BACKUP_DIR/${NAME}.sql"
ENC_FILE="$BACKUP_DIR/${NAME}.enc"
SHA_FILE="$BACKUP_DIR/${NAME}.sha256"

echo "Starting backup: $NAME"

if [[ "$DB_TYPE" == "postgres" ]]; then
  # Requires pg_dump; DB_URL like postgres://user:pass@host:port/db
  PG_USER=$(echo "$DB_URL" | sed -E 's#postgres://([^:]+):([^@]+)@.*#\1#')
  PG_PASS=$(echo "$DB_URL" | sed -E 's#postgres://([^:]+):([^@]+)@.*#\2#')
  PG_HOST=$(echo "$DB_URL" | sed -E 's#postgres://[^@]+@([^:/]+).*#\1#')
  PG_PORT=$(echo "$DB_URL" | sed -E 's#postgres://[^@]+@[^:]+:(\d+).*#\1#')
  PG_DB=$(echo "$DB_URL" | sed -E 's#postgres://[^/]+/([^?]+).*#\1#')
  export PGPASSWORD="$PG_PASS"
  pg_dump -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DB" -Fc -f "$DUMP_FILE"
elif [[ "$DB_TYPE" == "sqlite" ]]; then
  cp "$DB_URL" "$DUMP_FILE"
else
  echo "Unknown DB_TYPE: $DB_TYPE"; exit 1
fi

if [[ ! -f "$ENC_KEY_FILE" ]]; then
  echo "Encryption key not found: $ENC_KEY_FILE"; exit 1
fi

openssl enc -aes-256-cbc -salt -in "$DUMP_FILE" -out "$ENC_FILE" -pass file:"$ENC_KEY_FILE"
sha256sum "$ENC_FILE" | awk '{print $1}' > "$SHA_FILE"

if [[ -n "$NAS_PATH" ]]; then
  mkdir -p "$NAS_PATH"
  cp "$ENC_FILE" "$NAS_PATH/"
  cp "$SHA_FILE" "$NAS_PATH/"
fi

echo "Backup complete: $NAME"
