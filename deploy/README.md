# Production Deployment (Docker + Caddy TLS)

This stack runs Postgres, the API, and a Caddy reverse proxy that terminates TLS and exposes the API at `api.parkipal.com` with automatic HTTPS via Let's Encrypt. Your static frontend should be hosted on Cloudflare Pages at `parkipal.com`.

## Prerequisites
- A Linux VM or NAS that can run Docker and expose ports 80/443
- A public DNS A record for your domain pointing to the server (e.g., `example.com` → your server IP)
- Email address for ACME (Let’s Encrypt) registration

## Quick Start
1. Copy env template and edit values (API subdomain):
   ```bash
   cd deploy
   cp .env.example .env
   # edit DOMAIN, EMAIL, ALLOWED_ORIGINS, JWT_SECRET, PG_* values
   ```
2. Start the stack:
   ```bash
   docker compose up -d --build
   docker compose ps
   ```
3. First run checks:
   - API health: https://api.parkipal.com/api/health

## How it Works
- Caddy listens on `api.parkipal.com` and reverse proxies to `api:3000`.
- The API uses Postgres via `DB_URL` constructed from `PG_*` variables and creates tables automatically.
- CORS is enforced in the API using `ALLOWED_ORIGINS` — include your frontend origins (e.g., `https://parkipal.com`).

## Environment Variables
- DOMAIN: The API subdomain (e.g., `api.parkipal.com`)
- EMAIL: Contact email used by ACME
- ALLOWED_ORIGINS: Comma-separated list of allowed origins for the API
- JWT_SECRET: Strong random secret for JWT signing
- PG_DB/PG_USER/PG_PASSWORD: Postgres credentials

## Data & Volumes
- Postgres data: `deploy/data/postgres` (persistent)
- Caddy certificates/config: Docker named volumes `caddy_data`, `caddy_config`

## Logs and Troubleshooting
- View logs:
  ```bash
  docker compose logs -f caddy
  docker compose logs -f api
  docker compose logs -f db
  ```
- CORS error? Ensure `ALLOWED_ORIGINS` includes `https://YOUR_DOMAIN` (and `https://www.YOUR_DOMAIN` if used).
- TLS fails? Confirm DNS points to the server and ports 80/443 are open.
- API unreachable? Check `docker compose ps` and `docker compose logs api`.

## Local HTTPS Alternatives
If you don’t have a public DNS yet, you can:
- Run Caddy with a `:80` HTTP-only site by setting `DOMAIN=:80` (development only), or
- Host the frontend elsewhere (Netlify) and point it at your API domain once ready.
