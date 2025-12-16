# AI Coding Agent Instructions for Parkinson's Pal

These instructions help AI agents work productively in this codebase. Keep changes minimal, align with existing patterns, and prefer incremental improvements over sweeping refactors.

## Architecture Overview
- **Frontend:** Static HTML/JS in project root (e.g., `medications.html`, `symptoms.js`, `nav.js`). Pages fetch JSON from backend and update DOM directly; no frameworks.
- **Backend:** Node.js Express API in `backend/` with entry `backend/server.js`.
- **Database:** PostgreSQL via `backend/db.js` (`pg`). Adapter exposes `init()`, `get()`, `all()`, `run()` mirroring better-sqlite3 semantics; use `$1` placeholders.
- **Routes:** Resource modules in `backend/routes/` (`symptoms.js`, `fluids.js`, `foods.js`, `exercises.js`, `appointments.js`, `documents.js`) mounted from `server.js`.
- **Auth:** JWT endpoints in `server.js` (`/api/auth/register`, `/api/auth/login`). `authenticateToken` protects user data routes.
- **Access Grants:** Doctor sharing via `/api/access/*` in `server.js`, backed by `access_grants`.

## Data Model & Conventions
- **Schema creation:** `db.init()` calls `createSchemaPg()` at server start; tables include `users`, `medications`, `med_logs`, `vitals`, `symptoms`, `fluids`, `foods`, `exercises`, `appointments`, `documents`, `access_grants`.
- **IDs:** `SERIAL` PKs; `db.run()` returns `{ lastInsertRowid }` for inserts.
- **Timestamps:** Accept ISO strings; DB columns use `TIMESTAMPTZ DEFAULT NOW()`.
- **Queries:** Always use `$1`, `$2`, … with parameter arrays via `db.get/all/run`. Never import `pg` directly in route files.
- **Ownership:** Filter by `user_id = $1` based on `req.user.id` for user-specific resources.

## Backend Patterns
- **Middleware:** `helmet` and CORS configured; allowed origins derived from `ALLOWED_ORIGINS` env (comma-separated). No hardcoding.
- **Route style:** Each route file exports `(app, db, authenticateToken)` and defines `GET` list (often `LIMIT 100`), `POST` create, `DELETE` remove, sometimes `PUT` update.
- **Error responses:** Return `{ error: '<message>' }` with 400/401/403/500. Keep terse and consistent.
- **Health check:** `GET /api/health` returns `{ status: 'ok' }` and a timestamp.

## Frontend Patterns
- **Simple fetch:** Scripts call `/api/...` and expect `{ ok: true, id }` on creation or arrays for lists. Update DOM in-place.
- **View pairing:** Each `*.html` has a matching `*.js` for view logic (e.g., `appointments.html` ↔ `appointments.js`). Follow naming/placement when adding features.

## Developer Workflows
- **Environment:** Requires Postgres. Set `DB_URL`, `PORT`, `JWT_SECRET`, `ALLOWED_ORIGINS` in environment or `.env`.
- **Start backend:**
  - Dev: `cd backend && npm install && npm run dev`
  - Prod: `cd backend && npm start`
- **Windows:** See `backend/SETUP-WINDOWS.md` and `backend/start.bat` for local run guidance.
- **Quick checks:**
  - Smoke test: `scripts/smoke-test.ps1`
  - Backups: `scripts/backup.ps1` / `scripts/backup.sh` (scheduled via `scripts/scheduler/backup-task.xml`)

## Integration Points
- **Add routes:** Create under `backend/routes/` and require from `backend/server.js` after other imports.
- **DB adapter:** Use `db.get`, `db.all`, `db.run` for all SQL access; keep queries centralized and parameterized.
- **Access grants:** For cross-user reads, validate an active grant via `access_grants` logic in `server.js` before returning data.

## Deployment
- **Docker (backend/):** `backend/docker-compose.yml` for local Postgres; configure `DB_URL` accordingly.
- **Docker (deploy/):** `deploy/docker-compose.yml` and `deploy/Caddyfile` for hosting; see `deploy/README.md`.
- **Allowed origins:** Update `ALLOWED_ORIGINS` to include your frontend URL.

## Adding a New Resource (Example)
- Create `backend/routes/documents.js` exporting `(app, db, authenticateToken)`.
- Implement:
  - `GET /api/documents` → `db.all('SELECT * FROM documents WHERE user_id = $1 ORDER BY uploaded_at DESC LIMIT 100', [req.user.id])`
  - `POST /api/documents` → insert `filename`, `file_data` (BYTEA), `file_type`
  - `DELETE /api/documents/:id` → `db.get('DELETE FROM documents WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id])`
- Require from `backend/server.js` and protect with `authenticateToken`.

## Common Pitfalls
- Do not mix `?` placeholders; always use `$1` style.
- Do not bypass `dbAdapter`; keep DB access centralized.
- Use `await` inside `try/catch` in route handlers; send responses from within the block.
- Respect per-user scoping; never return another user’s records without an active grant.

## Key Files
- `backend/server.js`: App setup, auth, core resources, access grant logic.
- `backend/db.js`: Postgres adapter and schema creation.
- `backend/routes/*`: Resource endpoints.
- Root `*.html` and `*.js`: Frontend views using the API.

---
Questions or gaps? If any workflow, pattern, or endpoint is unclear, call out the specific file or scenario and we’ll refine this doc.