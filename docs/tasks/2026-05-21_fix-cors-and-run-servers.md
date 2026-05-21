# Task: Fix CORS and Run Both Servers

**Status**: IN_PROGRESS
**Created**: 2026-05-21
**Module(s)**: server, client, infrastructure

---

## Goal

Resolve the production CORS issue blocking the frontend (`https://royalecrm.web.app`) from communicating with the backend (`https://hospitalcrm-production.up.railway.app`), and run both client and server development servers locally for the user.

## Implementation Plan

1. **Fix production CORS default fallback**: Update `server/index.js` to fallback to `'http://localhost:5173,https://royalecrm.web.app'` when `process.env.CORS_ORIGINS` is not defined.
2. **Handle CORS headers correctly for all requests**: Ensure that during dev/production, the `Access-Control-Allow-Origin` header works gracefully and allows the preflight pre-requisites.
3. **Verify locally**: Make sure that the backend and frontend run locally.
4. **Instruct user to push and configure Railway environment variables**: Explain to the user how to configure their Railway dashboard `CORS_ORIGINS` environment variable and how to push their Git commit to deploy the fix.
5. **Run both servers**: Start the server and client concurrently or in parallel tasks so both run.

## Files Affected

- `server/index.js` — MODIFY

## Acceptance Criteria

- [ ] Static analysis / lint passes with zero warnings/errors
- [ ] Backend CORS fallback includes production URL `https://royalecrm.web.app`
- [ ] Both local servers (client and server) are successfully launched

## Task Checklist

- [x] Step 1: Modify `server/index.js` to update `allowedOrigins` default list.
- [x] Step 2: Run static analysis / lint check on the server code.
- [x] Step 3: Launch local backend server.
- [x] Step 4: Launch local frontend (Vite) client server.
- [ ] Step 5: Instruct the user on Git push and Railway environment configuration.

## Progress Log

| Timestamp        | Step Completed | Notes                           |
| ---------------- | -------------- | ------------------------------- |
| 2026-05-21 06:40 | —              | Task created, awaiting approval |
| 2026-05-21 06:41 | Step 1         | Updated default CORS fallback origins list in server/index.js. |
| 2026-05-21 06:42 | Step 2         | Verified server code syntax using node --check index.js (passed cleanly). |
| 2026-05-21 06:43 | Step 3         | Launched backend server using npm run dev. Successfully listening on port 5000 and connected to MongoDB. |
| 2026-05-21 06:44 | Step 4         | Launched frontend client server using npm run dev. Successfully running at http://localhost:5173/. |




