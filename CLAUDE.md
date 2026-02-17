# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development environment with Docker (recommended)
docker-compose up

# Start development server locally (requires local PostgreSQL + .env with DATABASE_URL)
npm run dev

# Run all tests (requires local PostgreSQL running)
npm test

# Run a single test file
npx jest tests/validation.test.js

# Install dependencies
npm install
```

## Architecture

Node.js/Express REST API for job tracking with PostgreSQL database and JWT authentication.

**Tech Stack:** Express.js (CommonJS), PostgreSQL 15 via `pg`, Jest + Supertest for testing, Docker Compose for local dev.

**Entry Points:**
- `src/index.js` - Server startup (port 3000). Only used for running the server.
- `src/app.js` - Express app setup, mounts routers, exports `app` for testing with supertest.

**Database:** PostgreSQL via `DATABASE_URL` env var. Schema defined in `src/db/init.sql` (auto-loaded by Docker). Two tables: `users` (id, email, password_hash) and `jobs` (id, user_id FK, company, position, status, applied_date, notes, created_at).

**Layered Structure:**
```
src/app.js            → Express app setup, mounts routers
src/routes/           → Route definitions (HTTP method + path → controller)
src/controllers/      → Request handling, validation, response formatting
src/data/             → Data access layer (PostgreSQL queries via pg pool)
src/db/connection.js  → pg Pool singleton
src/db/init.sql       → Database schema
src/middleware/        → errorHandler, asyncHandler wrapper, verifyToken JWT middleware
```

**Authentication Flow:** JWT-based. Auth routes (`/api/auth/register`, `/api/auth/login`) are public. Job routes (`/api/jobs/*`) are protected by `verifyToken` middleware which extracts `req.user.userId` from the Bearer token. Passwords hashed with bcryptjs (salt rounds: 10).

**API Endpoints:**
- `GET /` - Health check
- `GET /health` - Health status with timestamp
- `POST /api/auth/register` - Register (email + password with strength validation)
- `POST /api/auth/login` - Login, returns JWT token
- `POST /api/jobs` - Create job (requires auth; fields: company, position, status, appliedDate, notes)
- `GET /api/jobs` - List all jobs (requires auth)
- `GET /api/jobs/:id` - Get job by ID (requires auth)
- `PUT /api/jobs/:id` - Update job (requires auth; whitelisted fields only)
- `DELETE /api/jobs/:id` - Delete job (requires auth)

**Key Patterns:**
- **camelCase ↔ snake_case mapping**: `jobStore.js` uses a `fieldMap` to translate between JS camelCase (API) and PostgreSQL snake_case (DB). `formatJob()` converts DB rows to API format.
- **Response format**: All endpoints return `{ success: true/false, data: ... }`. Errors include `message` or `errors` array.
- **Valid job statuses**: `applied`, `interview`, `offer`, `rejected`
- **asyncHandler**: Wraps async route handlers to catch promise rejections and forward to error middleware.

**Testing:** Tests live in `tests/` directory. Uses Jest + Supertest against the `app.js` export (no server startup needed). Tests require a running PostgreSQL instance.

# Mentorship Instructions

"Act as a Senior Backend Architect and Mentor. My goal is to become a professional backend engineer, so I need you to focus on teaching, not just doing.

Our Interaction Rules:

  1.  No Spoiling: Never give me a full block of code immediately. Start by explaining the high-level logic and the 'Why' behind the solution.

  2.  Socratic Method: If I make a mistake, ask me a guiding question to help me find the error myself before you correct it.

  3.  Architecture First: For every feature, discuss the database schema, API design (REST/GraphQL), and security implications (authentication, validation) before we write code.

   4. Standard Practices: Always enforce industry standards (clean code, SOLID principles, DRY, and proper error handling).

   5. Review Mode: When I finish a task, provide a 'Senior Review' where you point out one thing I did well and two things I could optimize for scale or security."
