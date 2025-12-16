# Backup Plan (Cloud API + NAS Offsite)

This plan defines how medical records data is backed up, encrypted, retained, monitored, and restored when hosting the API on Railway and the frontend on Cloudflare Pages.

## Objectives
- Protect patient records with encrypted, redundant backups.
- Enable fast recovery (RTO ≤ 1 hour) and minimal data loss (RPO ≤ 15 minutes).
- Keep costs near zero by using your NAS as the primary offsite.

## Scope
- Database (e.g., Postgres on Railway or SQLite if applicable).
- Application configuration (environment variables, secrets are NOT backed up in plaintext).
- No client-side PII stored in backups besides what is stored in the DB.

## Strategy
- Nightly full backup at 02:00 UTC; weekly backup every Sunday retained for 12 months.
- Optional hourly incremental (if Postgres WAL archiving is enabled).
- 3-2-1: 3 copies (Primary DB, NAS encrypted dump, cloud provider internal snapshot), 2 storage types, 1 offsite (NAS).

## Encryption
- Use AES-256 via OpenSSL. Keys are stored outside the repo and rotated annually.
- Backups are encrypted at rest on the NAS.

## Retention
- Daily: keep last 7.
- Weekly: keep last 4.
- Monthly: keep last 12.

## Monitoring
- Backup script writes a status file and sends an email alert on failure (optional).
- Uptime checks monitor `/api/health`.

## Restore Procedure (Staging)
1. Identify the desired backup file on NAS (latest or specific date).
2. Decrypt locally using the encryption key.
3. Restore into a staging DB (Railway or local Docker) and run smoke tests.
4. Measure time-to-recover and document any gaps.

## Security Considerations
- Never store encryption keys in source control.
- NAS share should require authentication and restrict write access to the backup user.
- Verify checksums after upload.

## Files
- `scripts/backup.ps1` — Windows PowerShell backup (dump, encrypt, upload to NAS or GitHub).
- `scripts/backup.sh` — Linux/Docker backup variant.
- `.env.example` — example env variables used by scripts.
