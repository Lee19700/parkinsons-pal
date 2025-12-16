# Windows Setup (Local Dev)

This project uses Node.js + PostgreSQL. Follow these steps to run locally on Windows:

## 1. Install prerequisites

- Node.js LTS from nodejs.org
- PostgreSQL 15+ from EDB installer or use Docker Desktop

## 2. Create a Postgres database and user

- Using pgAdmin or psql, create database `parkipal`, user `parkipal` with password, and grant privileges.

## 3. Configure environment variables (create `backend/.env` or set system vars)

```dotenv
DB_URL=postgres://parkipal:yourpassword@localhost:5432/parkipal
JWT_SECRET=replace-with-strong-secret
PORT=3000
ALLOWED_ORIGINS=http://localhost:8080
```

## 4. Start the backend

```powershell
cd backend
npm install
npm run dev
```

## 5. Health check

```powershell
curl http://localhost:3000/api/health
```

Optional: Docker (Postgres + API) using `backend/docker-compose.yml`:

```powershell
cd backend
docker-compose up -d --build
docker-compose ps
```

Troubleshooting:

- ECONNREFUSED: verify Postgres running and `DB_URL` correct.
- CORS blocked: add your frontend origin to `ALLOWED_ORIGINS`.
- Token errors: ensure `JWT_SECRET` set and consistent across restarts.
