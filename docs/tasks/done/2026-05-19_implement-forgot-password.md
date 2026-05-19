# Task: Implement Forgot Password Flow

**Status**: IN_PROGRESS
**Created**: 2026-05-19
**Module(s)**: server, client, auth

---

## Goal

Implement a complete, production-grade password recovery flow in Royale Hospital CRM. The feature should consist of:
- A new backend API for requesting a password reset code.
- A new backend API for resetting the password using the code.
- A frontend modal or multi-step wizard inside `LoginPage.jsx` for requesting and entering the code to reset the password.
- Verification that it compiles and builds with zero errors.

## Implementation Plan

1. **Database Schema Update**:
   - Update `server/models/User.js` to include:
     - `resetPasswordToken: String`
     - `resetPasswordExpires: Date`

2. **Backend Controllers & Routes**:
   - In `server/controllers/authController.js`, implement:
     - `forgotPassword`: Generates a secure, random 6-digit code, hashes it, sets expiry (e.g., 10 minutes), logs it to console, and returns success.
     - `resetPassword`: Validates the code, hashes the new password, and updates the user record.
   - In `server/routes/auth.js`, register:
     - `router.post('/forgot-password', forgotPassword)`
     - `router.post('/reset-password', resetPassword)`

3. **Frontend API Hook**:
   - In `client/src/hooks/useAuth.js`, add:
     - `useForgotPassword` mutation.
     - `useResetPassword` mutation.

4. **Frontend UI Integration**:
   - Add a premium Dialog or overlay UI inside `LoginPage.jsx` triggered by clicking the "Forgot password?" button.
   - Multi-step flow:
     - **Step 1 (Send Request)**: Ask for the email address. Render a "Send Reset Code" button.
     - **Step 2 (Reset)**: Ask for the 6-digit code and the new password. Render a "Reset Password" button.
     - Add animations, disabled loading states, and error toasts.

5. **Static Analysis & Verification**:
   - Check with ESLint on all changed files.
   - Build client and server.

## Files Affected

- `server/models/User.js` — MODIFY
- `server/controllers/authController.js` — MODIFY
- `server/routes/auth.js` — MODIFY
- `client/src/hooks/useAuth.js` — MODIFY
- `client/src/pages/LoginPage.jsx` — MODIFY

## Acceptance Criteria

- [ ] Static analysis passes with zero warnings/errors (`npm run lint` in client)
- [ ] Users can enter their email to request a reset code
- [ ] 6-digit reset code is printed to server console and stored securely in database
- [ ] Users can reset their password using the valid 6-digit code
- [ ] The code expires in 10 minutes, preventing late reuse
- [ ] UI provides visual states, error feedback, and seamless transition back to login

## Task Checklist

- [x] Step 1: Add reset fields to `User.js` schema.
- [x] Step 2: Implement backend `forgotPassword` and `resetPassword` methods in `authController.js` and register routes in `auth.js`.
- [x] Step 3: Implement react-query hooks `useForgotPassword` and `useResetPassword` in `client/src/hooks/useAuth.js`.
- [x] Step 4: Redesign the "Forgot Password" UI inside `LoginPage.jsx` to render a premium password reset wizard.
- [x] Step 5: Verify the implementation using ESLint and a production build.

## Progress Log

| Timestamp        | Step Completed | Notes                           |
| ---------------- | -------------- | ------------------------------- |
| 2026-05-19 09:34 | —              | Task created, awaiting approval |
| 2026-05-19 09:35 | Step 1         | Added resetPasswordToken and resetPasswordExpires fields to User mongoose schema |
| 2026-05-19 09:36 | Step 2         | Implemented and registered forgotPassword and resetPassword backend controller endpoints |
| 2026-05-19 09:37 | Step 3         | Added useForgotPassword and useResetPassword mutations to client useAuth hook |
| 2026-05-19 09:39 | Step 4         | Redesigned LoginPage.jsx to support password recovery overlay dialog and state transitions |
| 2026-05-19 09:44 | Step 5         | Ran ESLint validation, built the production app, ran E2E browser tests, and verified db hashes |
