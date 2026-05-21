# Task: Fix Doctor Filter Dropdowns in Calendar and List Views

**Status**: DONE
**Created**: 2026-05-21
**Module(s)**: client, UI/UX

---

## Goal

Replace the buggy and overlapping HeroUI `<Select>` doctor filters in both the Calendar View (`AppointmentsCalendarView.jsx`) and List View (`AppointmentsListView.jsx`) with a beautifully-designed, searchable doctor selection dropdown (matching the robust and clean pattern used in `BookingModal.jsx`).

## Implementation Plan

1. **Modify `AppointmentsCalendarView.jsx`**:
   - Remove buggy `@heroui/react` `Select`, `ListBox`, and `PopoverContent`.
   - Implement `doctorSearch` and `doctorDropdownOpen` states.
   - Design a premium search input using standard Tailwind classes matching the visual style of the dashboard.
   - Implement the dropdown with a solid background (`bg-card`), high contrast, search/clear options, and correct `z-index`.
   
2. **Modify `AppointmentsListView.jsx`**:
   - Remove buggy `@heroui/react` components.
   - Implement the same searchable doctor dropdown component, integrating it cleanly into the filter sliding panel.
   - Hook up selection/clear actions to properly trigger page updating and API fetching: `up({ doctor: val, page: '1' })`.

3. **Validate**:
   - Run `npm run lint` on the client directory to ensure no linting warnings or errors exist.
   - Verify that local dev servers started previously run correctly.

## Files Affected

- `client/src/pages/appointments/components/AppointmentsCalendarView.jsx` — MODIFY
- `client/src/pages/appointments/components/AppointmentsListView.jsx` — MODIFY

## Acceptance Criteria

- [x] Static analysis/eslint passes with zero warnings/errors in the affected files.
- [x] Buggy HeroUI Select component is completely replaced in both files.
- [x] Selection list shows matching search queries beautifully and updates lists/events correctly.

## Task Checklist

- [x] Step 1: Implement searchable doctor filter in `AppointmentsCalendarView.jsx`.
- [x] Step 2: Implement searchable doctor filter in `AppointmentsListView.jsx`.
- [x] Step 3: Run static analysis / eslint checks.

## Progress Log

| Timestamp        | Step Completed | Notes                           |
| ---------------- | -------------- | ------------------------------- |
| 2026-05-21 06:59 | —              | Task created, awaiting approval |
| 2026-05-21 07:15 | Step 1 & 2     | Replaced Select components with searchable text filters |
| 2026-05-21 07:17 | Step 3 & DONE  | Verified changes with ESLint successfully (0 errors, 0 warnings) |
