# AI Coding Agent Instructions for Parkinson's Pal

These instructions help AI agents work productively in this codebase. Keep changes minimal, align with existing patterns, and prefer incremental improvements over sweeping refactors.

## Architecture Overview
- **Frontend:** Static HTML/JS in project root (e.g., `medications.html`, `symptoms.js`, `nav.js`). Pages use `api-client.js` to fetch/update JSON from backend; no frameworks.
- **Backend:** Node.js Express API in `backend/server.js` with PostgreSQL via `backend/db.js` adapter.
- **Routes:** Split into two patterns:
  - **Modular routes** in `backend/routes/` (`symptoms.js`, `fluids.js`, `foods.js`, `exercises.js`, `appointments.js`, `documents.js`) — each exports `(app, db, authenticateToken)`.
  - **Inline endpoints** in `backend/server.js` (`/api/medications`, `/api/med_logs`, `/api/vitals`, auth, access grants).
- **Auth:** JWT in `server.js` (`/api/auth/register`, `/api/auth/login`). `authenticateToken` middleware validates bearer tokens and attaches `req.user.id`.
- **Access Grants:** Doctor/caregiver sharing via `/api/access/grants` and `/api/access/revoke` backed by `access_grants` table.

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
- **API wrapper:** `api-client.js` provides `window.pp.api.*` methods (registers, logs in, fetches resources, creates/deletes items). Auto-handles Bearer token from localStorage key `pp_auth_token`.
- **Endpoint discovery:** Scripts use `api-client.js` for all backend calls; fallback logic detects `localhost:3000` vs. same-origin `/api` paths.
- **Simple fetch + DOM update:** No frameworks. Fetch JSON, parse, update DOM in-place. Example: `symptoms.js` loads from `/api/symptoms`, renders list in container.
- **Two storage patterns exist (legacy + migration):**
  - **localStorage-only (legacy):** Some older scripts (e.g., original `symptoms.js`) read/write `STORAGE_KEY` directly without API calls; used during prototyping.
  - **API-backed (current):** New features use `api-client.js` to call backend. Migration script `migrate-to-api.js` moves localStorage data to PostgreSQL on startup.
- **View pairing:** Most `*.html` files have matching `*.js` for view logic (e.g., `appointments.html` ↔ `appointments.js`); some share helpers (e.g., `med_log.js` for medication logging across multiple views).
- **Response expectations:** Backend returns `{ ok: true, id: <inserted-id> }` on create/delete, or arrays for lists. Error responses are `{ error: '<message>' }` with HTTP status 400–500.

## Developer Workflows
- **Environment:** Requires PostgreSQL. Set in `.env`: `DATABASE_URL` (or `DB_URL` for local), `PORT` (default 3000), `JWT_SECRET` (32+ chars), `ENCRYPTION_KEY` (64 hex chars), `ALLOWED_ORIGINS` (comma-separated), `NODE_ENV`.
- **Start backend:**
  - Dev: `cd backend && npm install && npm run dev` (uses nodemon)
  - Prod: `node backend/server.js`
- **Windows setup:** See `backend/SETUP-WINDOWS.md`; Docker alternative: `docker-compose -f backend/docker-compose.yml up`
- **Startup sequence:** `server.js` loads `.env` first, then calls `db.init()` which connects PostgreSQL and runs `createSchemaPg()` to create all tables. Server only starts listening after DB is ready.
- **Data migration:** On first API call from frontend, `migrate-to-api.js` (loaded in HTML) runs silently, moving user's localStorage data (med logs, symptoms, etc.) to PostgreSQL. No user action required.
- **Production checklist:** See `RAILWAY-SETUP-COMPLETE.md`, `DEPLOYMENT_COMPLETE.md`, and `deploy/README.md` for Docker, Caddy reverse proxy, and environment variable setup.

## Integration Points & Adding Features
- **Add modular routes:** Create `backend/routes/newresource.js` exporting `function(app, db, authenticateToken)`. Require it at `backend/server.js` line ~456 after other route imports.
- **Add inline endpoints:** For small endpoints (e.g., vitals, medications), add directly in `backend/server.js` around line 360–450 near similar endpoints.
- **DB queries:** Use `db.get()`, `db.all()`, `db.run()` with `$1`, `$2` placeholders and parameter arrays. Always filter by `req.user.id` for user-scoped resources.
- **Access grants:** Validate cross-user reads via `access_grants` table logic in `server.js` (lines ~490–520) before returning patient data.
- **Frontend API calls:** Use `api-client.js` methods like `window.pp.api.get()`, `.post()`, `.delete()` which handle Bearer token and error parsing automatically.

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