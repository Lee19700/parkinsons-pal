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
- **Middleware:** `helmet`, CORS, rate limiting (120 req/min per IP), and request body limit configured; allowed origins from `ALLOWED_ORIGINS` env (comma-separated). No hardcoding.
- **Route style:** Each route file exports `(app, db, authenticateToken)` and defines `GET` list (often `LIMIT 100`), `POST` create, `DELETE` remove, sometimes `PUT` update.
- **Error responses:** Return `{ error: '<message>' }` with 400/401/403/500. Keep terse and consistent.
- **Health check:** `GET /api/health` returns `{ status: 'ok' }` and a timestamp.
- **Encryption:** `backend/encryption.js` provides `encrypt(data)` → `{ iv, authTag, encrypted }` and `decrypt(encryptedData)` using AES-256-GCM. Used in `documents.js` for sensitive metadata. Always require `ENCRYPTION_KEY` (64 hex chars) in environment.

## Frontend Patterns
- **Simple fetch:** Scripts call `/api/...` and expect `{ ok: true, id }` on creation or arrays for lists. Update DOM in-place.
- **View pairing:** Each `*.html` has a matching `*.js` for view logic (e.g., `appointments.html` ↔ `appointments.js`). Follow naming/placement when adding features.

## Developer Workflows
- **Environment:** Requires Postgres. Set in `.env`: `DB_URL`, `PORT` (default 3000), `JWT_SECRET` (32+ chars), `ENCRYPTION_KEY` (64 hex), `ALLOWED_ORIGINS` (comma-separated), `NODE_ENV`.
- **Start backend:**
  - Dev: `cd backend && npm install && npm run dev` (uses nodemon)
  - Prod: `cd backend && npm start`
- **Windows:** See `backend/SETUP-WINDOWS.md` and `backend/start.bat` for local run guidance.
- **Docker (local Postgres):** `docker-compose -f backend/docker-compose.yml up`
- **Docker (production):** See `deploy/docker-compose.yml` and `deploy/Caddyfile` in `deploy/README.md`.
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
- Create `backend/routes/newresource.js` exporting `(app, db, authenticateToken)`.
- Implement CRUD operations:
  ```javascript
  module.exports = function(app, db, authenticateToken) {
    app.get('/api/newresource', authenticateToken, async (req, res) => {
      try {
        const items = await db.all('SELECT * FROM newresource WHERE user_id = $1 LIMIT 100', [req.user.id]);
        res.json(items);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch' });
      }
    });
    // POST, DELETE patterns follow same style...
  };
  ```
- Add to `backend/server.js` after other route imports: `require('./routes/newresource')(app, dbAdapter, authenticateToken);`
- Add schema to `createSchemaPg()` in `backend/db.js` with `user_id REFERENCES users(id)`.

## Common Pitfalls
- Do not mix `?` placeholders; always use `$1` style with parameter arrays.
- Do not bypass `dbAdapter`; keep all DB access centralized.
- Use `await` inside `try/catch` in route handlers; send responses from within the block.
- Respect per-user scoping; never return another user's records without an active grant via `access_grants` table.
- Encryption: Validate `ENCRYPTION_KEY` length (64 hex) at startup and fail fast; always store encrypted data as JSON `{ iv, authTag, encrypted }`.
- Never commit `.env` or keys to version control; use environment variables and `.gitignore`.

## Key Files
- `backend/server.js`: App setup, middleware, auth endpoints (`/api/auth/register`, `/api/auth/login`), core CRUD resources, access grant logic (`/api/access/grants`).
- `backend/db.js`: Postgres adapter (`Client` from `pg`), schema creation via `createSchemaPg()`.
- `backend/encryption.js`: AES-256-GCM encrypt/decrypt functions; must be required before use.
- `backend/routes/*`: Resource endpoints (`symptoms.js`, `fluids.js`, `foods.js`, `exercises.js`, `appointments.js`, `documents.js`).
- `api-client.js`: Frontend API wrapper; auto-sets `Authorization` header from JWT token in localStorage; configures endpoint based on hostname.
- Root `*.html` and `*.js`: Frontend views using `api-client.js` to fetch/update data.

---
Questions or gaps? If any workflow, pattern, or endpoint is unclear, call out the specific file or scenario and we’ll refine this doc.