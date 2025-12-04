<!-- Generated: tailor guidance to this repo for AI coding agents -->
# Copilot / AI Agent Instructions for LmsTVC

Be concise and follow the project's existing patterns. This file highlights repository-specific conventions, entry points, run commands, and examples so an AI agent can be productive immediately.

- Architecture:
  - **Backend:** `backend/` — Express (ESM) app. Entry points: `backend/src/app.js` (Express app) and `backend/src/server.js` (process start).
  - **Frontend:** `frontend/` — Vite + React. Entry point handled by Vite; run with `npm run dev` in `frontend/`.
  - **API base path:** Backend mounts all routes under `/api` in `backend/src/app.js`.

- Key patterns & conventions:
  - **ESM modules:** `package.json` sets `"type": "module"` in both backend and frontend; use `import`/`export`.
  - **Separation of concerns:** Controllers in `backend/src/controllers/` call services in `backend/src/services/` which use repositories in `backend/src/repositories/` for DB access.
  - **Routing:** Add a route file to `backend/src/routes/` and register it in `backend/src/routes/index.js` (example: `router.use('/users', userRoutes)`).
  - **Async handling:** Controllers wrap handlers with `utils/asyncHandler.js` and return responses via `utils/response.js` (use the same response shape/pagination helpers).
  - **Error handling:** Use the global middleware `backend/src/middlewares/errorHandler.js` — throw errors (set `statusCode`) rather than writing responses inline.

- Authentication & sessions:
  - **Session-based auth** is used. Session setup is in `backend/src/config/session.js` and documented in `backend/SESSION_SETUP.md`.
  - **Cookie name:** `sessionId` (configured in `sessionConfig`). Login endpoint sets `req.session.user` (see `backend/src/controllers/userController.js`).
  - **Important:** Default store is memory (development). For production, follow `SESSION_SETUP.md` to configure `SESSION_STORE` (redis/mongodb/mysql).
  - **Auth middleware:** Look for `backend/src/middlewares/auth.js` to learn how `req.user` is injected for protected routes.

- Database:
  - **ORM:** Sequelize configured in `backend/src/config/db.js` (MySQL dialect). Uses env vars: `DB_NAME`, `DB_USER`, `DB_PASS`, `DB_HOST`.
  - **Models:** `backend/src/models/` — keep model definitions and any associations in `models/index.js` (follow existing style).

- Run / dev commands:
  - Backend (development):
    - `cd backend; npm install` (if needed)
    - `npm run dev` — runs `nodemon src/server.js` (auto-restarts)
    - `npm start` — runs `node src/server.js` (production)
  - Frontend (development):
    - `cd frontend; npm install` (if needed)
    - `npm run dev` — starts Vite dev server

- Request/response conventions & examples:
  - Responses use a consistent JSON envelope: `success`, `message`, `data`, `timestamp`, and `pagination` when applicable. Use `utils/response.js` helpers.
  - Login example: `POST /api/users/login` with `{ email, password }` — successful login sets a session cookie. Use `Cookie: connect.sid=...` for authenticated calls in tests.
  - User creation (admin): `POST /api/users` — response includes generated `id` (IDs follow prefixes `AD`, `GV`, `SV` — see `backend/test_user_api.md`).

- When adding code:
  - Follow the existing folder layout: `controllers` → `services` → `repositories` → `models`.
  - Use `asyncHandler` in controller methods and return responses via `ResponseUtil`.
  - Register new routes in `backend/src/routes/index.js` and export an Express router from the new route file.
  - Do not change global error handler ordering in `backend/src/app.js` (it must be last).

- Integration points & side effects to watch for:
  - Session middleware is mounted early in `app.js`. Changes to session config affect authentication across routes.
  - DB connection and Sequelize options live in `backend/src/config/db.js` — altering dialect/connection details affects all model/repository operations.
  - `utils/idGenerator.js` is used for domain-specific ID formats — reusing it preserves ID patterns.

- Testing & debugging tips:
  - Use `SESSION_SETUP.md` when testing auth to ensure proper session store and env vars.
  - For session debugging, `session.js` includes a dev logger when `NODE_ENV==='development'`.
  - To reproduce API calls, use examples in `backend/test_user_api.md` (login → use returned cookie → call protected endpoints).

If anything in this guidance is unclear or you'd like additional examples (unit-tests, adding a new route, or a concrete refactor), tell me which area to expand. I can iterate on this file.
