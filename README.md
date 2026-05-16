# Job Tracker API

REST API for tracking job applications, built with Node.js/Express and PostgreSQL.

**Live:** https://job-application-tracker-g2m8.onrender.com

## Tech Stack

- **Runtime:** Node.js (CommonJS)
- **Framework:** Express.js
- **Database:** PostgreSQL via `pg`, migrations with `node-pg-migrate`
- **Auth:** JWT access tokens (15 min) + httpOnly refresh token cookies (7 days)
- **Testing:** Jest + Supertest

## Getting Started

```bash
# With Docker (recommended — runs migrations automatically)
docker-compose up

# Locally (requires PostgreSQL + .env with DATABASE_URL and JWT_SECRET)
npm install
npm run migrate
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing access tokens |
| `REFRESH_TOKEN_SECRET` | Secret for refresh token operations |

## API Endpoints

All job endpoints require `Authorization: Bearer <token>`.

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register with email + password |
| `POST` | `/api/auth/login` | Login, returns access token + sets refresh cookie |
| `POST` | `/api/auth/refresh` | Get new access token via refresh cookie |
| `POST` | `/api/auth/logout` | Invalidate refresh token |
| `GET` | `/api/jobs` | List jobs (supports `?status=`, `?priority=`, `?page=`, `?limit=`) |
| `POST` | `/api/jobs` | Create a job |
| `GET` | `/api/jobs/:id` | Get a job by ID |
| `PUT` | `/api/jobs/:id` | Update a job |
| `DELETE` | `/api/jobs/:id` | Delete a job |

### Job Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `company` | string | yes | |
| `position` | string | yes | |
| `status` | string | yes | `applied`, `interview`, `offer`, `rejected` |
| `appliedDate` | date string | yes | |
| `priority` | string | no | `low`, `medium` (default), `high` |
| `platform` | string | no | Max 100 chars, nullable |
| `location` | string | no | |
| `salary` | string | no | |
| `jobUrl` | string | no | |
| `deadlineDate` | date string | no | |
| `notes` | string | no | |

## Testing

```bash
npm test

# Single file
npx jest tests/jobs.test.js
```

Tests require a running PostgreSQL instance with `DATABASE_URL` in `.env`.

## Database Migrations

```bash
npm run migrate       # apply all pending migrations
npm run migrate:down  # roll back last migration
```

Migrations live in `migrations/`. Docker Compose runs them automatically on startup.
