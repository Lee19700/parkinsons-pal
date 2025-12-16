# Deploy to Cloud (Cloudflare Pages + Railway)

This guide deploys the frontend to Cloudflare Pages and the backend API to Railway, with strict CORS and NAS backups.

## Prerequisites
- Cloudflare account with `parkipal.com` domain.
- Railway account.
- JWT secret prepared.
- NAS path and encryption key (see `BACKUP_PLAN.md`).

## Backend (Railway)
1. Create a new Railway project; add a Node.js service from `backend`.
2. Environment variables:
   - `PORT=3000`
   - `JWT_SECRET=your-long-secret`
   - `ALLOWED_ORIGINS=https://parkipal.com,https://www.parkipal.com`
   - `DB_URL=postgres://USER:PASS@HOST:5432/DBNAME` (provision Railway Postgres and use its connection string)
3. Deploy. Copy the public API URL and map it to `api.parkipal.com` via Cloudflare DNS (A or CNAME). Use Full (strict) TLS.
4. Verify health:
   - `GET https://.../api/health` should return `{ status: 'ok' }`.

## Frontend (Cloudflare Pages)
1. Create a new Pages project and point to your frontend repo/folder.
2. Configure the app to call your API:
   - Set `window.API_BASE_URL = 'https://api.parkipal.com/api'` in a small inline script tag in your HTML, or update `api-client.js` accordingly.
3. Add custom domain:
   - `parkipal.com` → Pages project; enable HTTPS.
4. Deploy and test.

## Strict CORS
- Ensure backend env contains `ALLOWED_ORIGINS=https://parkipal.com,https://www.parkipal.com`.
- CORS errors indicate origin mismatch; update and redeploy.

## NAS Backups
- Use `scripts/backup.ps1` with `.env.example` variables.
- Schedule nightly via Task Scheduler on a Windows machine with network access to the NAS.

## Sharing Records (Doctors)
- Patient creates grant: `POST /api/access/grants { doctor_id, expires_at }`.
- Doctor lists grants: `GET /api/access/patients`.
- Doctor reads records: `GET /api/access/patient/:patientId/records` (requires active grant).
- Revoke: `DELETE /api/access/grants/:id`.

## Smoke Test
- Register → login → add a medication → take dose → verify med log.
- Create doctor user → patient grants access → doctor views records.
- Run a backup → confirm encrypted files on NAS.

## Troubleshooting
- CORS blocked: check `ALLOWED_ORIGINS` and domain.
- Auth failing: verify `JWT_SECRET` set on Railway.
- Backup errors: check OpenSSL availability and NAS path permissions.
