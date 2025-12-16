# Nightly Encrypted Backups

This project includes a PowerShell script to dump the database, encrypt the backup, and copy it to your NAS.

- Script: [scripts/backup.ps1](scripts/backup.ps1)
- Scheduler config (Windows): [scripts/scheduler/backup-task.xml](scripts/scheduler/backup-task.xml)

## Prerequisites
- Set these in `.env` or system environment:
  - `DB_URL` (Postgres connection string)
  - `DB_TYPE=postgres`
  - `BACKUP_DIR` (local temp dir, e.g., `.\.backups`)
  - `NAS_PATH` (NAS share path, e.g., `\\192.168.0.48\backups\parkipal`)
  - `ENC_KEY_FILE` (path to encryption key file)
- Install `pg_dump` (part of PostgreSQL), `openssl` in PATH.

## Manual Run
```powershell
# From project root
$env:DB_URL = "postgres://parkipal:change-me@localhost:5432/parkipal"
$env:DB_TYPE = "postgres"
$env:BACKUP_DIR = ".\\.backups"
$env:NAS_PATH = "\\\\192.168.0.48\\backups\\parkipal"
$env:ENC_KEY_FILE = "C:\\secure\\keys\\parkipal_backup.key"

powershell -File .\scripts\backup.ps1
```

## Schedule on Windows (Task Scheduler)
1. Open Task Scheduler → Import Task
2. Select [scripts/scheduler/backup-task.xml](scripts/scheduler/backup-task.xml)
3. Edit:
   - Start time (default 02:00)
   - Action → Program/Script: `powershell.exe`
   - Add arguments:
     - `-NoProfile -ExecutionPolicy Bypass -File "C:\\Path\\To\\Parkinsons project\\scripts\\backup.ps1"`
   - Start in: `C:\Path\To\Parkinsons project`
4. In “Run whether user is logged on or not” → provide credentials.
5. Ensure environment variables are set system-wide or prepend `setx` in a small wrapper script.

## Verify Backups
- Check `.\.backups` for `.enc` and `.sha256` files.
- Confirm files appear in your NAS share.

## Restore (Postgres)
```powershell
# Decrypt
openssl enc -d -aes-256-cbc -in db_YYYYMMDD_HHMMSS.enc -out dump.sql -pass file:C:\\secure\\keys\\parkipal_backup.key

# Restore (custom format example):
psql -h HOST -U USER -d DBNAME -f dump.sql
```
