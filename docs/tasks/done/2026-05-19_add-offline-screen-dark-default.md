# Task: Add Offline Status Overlay and Make Default Theme Dark

**Status**: DONE
**Created**: 2026-05-19
**Module(s)**: client, layout, theme

---

## Goal

Add a premium, dark-themed offline detection overlay in the Hospital CRM that matches the design requested by the user, and change the default application theme to dark mode so that the application is dark by default.

The offline screen must:
- Detect the browser's online/offline status using window event listeners.
- Show a full-screen, visually impressive, dark-themed overlay when offline.
- Display a specific circular icon, the "You're Offline" heading, and descriptive message.
- Provide a responsive "Try Again" button that triggers a manual check or page reload.
- Display a bottom quote box featuring a premium hospital/healthcare quote: `"The good physician treats the disease; the great physician treats the patient who has the disease."` with author `— Sir William Osler`, styled beautifully with custom left-border highlight, light background container, and italic typography.
- Change the default application theme from light to dark in `ThemeContext.jsx`.

## Implementation Plan

1. **Update Default Theme to Dark**:
   - In `client/src/context/ThemeContext.jsx`, change the initial state of the theme to read from localStorage or default to `'dark'`.
   - Update the default value to `'dark'` so new users see dark mode immediately.

2. **Create OfflineOverlay Component**:
   - Create `client/src/components/common/OfflineOverlay.jsx`.
   - Add state tracking for `isOffline` using `navigator.onLine` and `window` event listeners (`online`/`offline`).
   - Implement the elegant dark overlay UI mirroring the exact layout:
     - Outer wrapper: full screen, flex column, items center, justify center, dark background (matching the CRM dark theme background `#111214` or even pure elegant black `#09090b` for standard backdrop contrast).
     - Circular icon: a custom stylized `(x)` or styled icon (`WifiOff` / custom path) matching the design.
     - Title: "You're Offline" with Outfit or Inter font, bold, cream/white text.
     - Description: "It seems you've lost your internet connection. Please check your connection and try again." in soft muted text.
     - Action Button: "Try Again" with warm orange/brown premium background (`#b46a24`), white text, hover micro-animations.
     - Bottom Quote Container:
       - Slightly lighter dark surface matching card backgrounds (`#1c1c20`).
       - Border-l-4 or left highlight colored with orange/brown accent.
       - Inside content: italic quote and author sub-text.
   - Implement "Try Again" functionality: checks `navigator.onLine` manually, hides overlay if back online, shows a sleek toast (Sonner) notifying the user.

3. **Integrate OfflineOverlay into App**:
   - Import and render `<OfflineOverlay />` in `App.jsx` so it is globally active across the CRM.

4. **Verify and Analyze**:
   - Run ESLint to ensure no syntax/import errors.
   - Smoke test offline capabilities.

## Files Affected

- `client/src/context/ThemeContext.jsx` — MODIFY
- `client/src/components/common/OfflineOverlay.jsx` — CREATE
- `client/src/App.jsx` — MODIFY

## Acceptance Criteria

- [x] Static analysis passes with zero warnings/errors (`npm run lint` in client)
- [x] Application is dark mode by default on first load
- [x] Offline status is detected immediately
- [x] Visual overlay matches the user's provided mockup beautifully
- [x] Quote card is styled with the requested quote text and citations
- [x] "Try Again" button works as intended

## Task Checklist

- [x] Step 1: Modify `ThemeContext.jsx` to set `'dark'` as the default theme.
- [x] Step 2: Implement the `OfflineOverlay.jsx` component inside `client/src/components/common/`.
- [x] Step 3: Integrate `OfflineOverlay` in `client/src/App.jsx`.
- [x] Step 4: Run static analysis to verify the implementation.

## Progress Log

| Timestamp        | Step Completed | Notes                           |
| ---------------- | -------------- | ------------------------------- |
| 2026-05-19 09:28 | —              | Task created, awaiting approval |
| 2026-05-19 09:29 | Step 1         | Changed default theme to dark in ThemeContext.jsx |
| 2026-05-19 09:30 | Step 2         | Created OfflineOverlay component with custom medical quote and orange accent styles |
| 2026-05-19 09:31 | Step 3         | Imported and rendered OfflineOverlay globally inside App.jsx |
| 2026-05-19 09:33 | Step 4         | Verified static analysis and successful project build with zero warnings/errors |
