# Task: Unify Doctor Management UI in Edit Department Form

**Status**: DONE
**Created**: 2026-05-19
**Module(s)**: client, departments

---

## Goal

Bring the advanced doctor assignment and action management capabilities present on the Department Detail Page (`DepartmentDetailPage.jsx`) directly to the Edit Department Form Page (`DepartmentFormPage.jsx`). This allows managing department doctors (assigning, setting as Head, viewing, and removing) right from the form sidebar. In doing so, also remove the redundant Head Doctor select grid inside the main department form.

## Implementation Plan

1. Import React hooks (`useRef`, `useEffect`) and service queries/mutations (`useAssignDoctor`, `useDoctors`).
2. Implement local state management for showing the inline assign doctor dropdown, selected doctor, and active action popup.
3. Design dynamic dropdown filtering to display only unassigned available doctors.
4. Replace basic static list items in the sidebar card with the fully interactive doctor card grid, dropdown trigger, and options menu matching the Detail Page.
5. Remove the redundant Head Doctor select grid inside the main department details form since setting the Head Doctor is now elegantly handled through the "Make Head" action in the sidebar doctors list.
6. Confirm successful production build compilation and code standard compliance.

## Files Affected

- `client/src/pages/departments/DepartmentFormPage.jsx` — MODIFY

## Acceptance Criteria

- [x] Static analysis passes with zero warnings/errors
- [x] "Assign Doctor" button is present and functional in the form sidebar card
- [x] Clicking "Assign Doctor" displays an inline selector with only available, unassigned doctors
- [x] Standard list items are upgraded to premium cards with an interactive action popover (`...`)
- [x] Doctor Action menu correctly supports "View", "Make Head", and "Remove" options
- [x] Redundant Head Doctor select grid is successfully removed from the main details form UI
- [x] Production build compiles successfully

## Task Checklist

- [x] Step 1: Import dependency hooks and icons for interactive doctor management
- [x] Step 2: Implement available doctors filter query and local interactive state hooks
- [x] Step 3: Implement popover menu interaction handlers and outside clicking listener
- [x] Step 4: Redesign the sidebar card UI to support the dynamic Assign Doctor panel and select box
- [x] Step 5: Implement action popover menu on doctor cards containing View, Make Head, and Remove
- [x] Step 6: Remove redundant Head Doctor selection grid from the main form inputs view
- [x] Step 7: Verify linter compliance and run production build verification

## Progress Log

| Timestamp        | Step Completed | Notes                           |
| ---------------- | -------------- | ------------------------------- |
| 2026-05-19 10:24 | —              | Task created                    |
| 2026-05-19 10:24 | 1, 2, 3, 4, 5  | Unified UI components written   |
| 2026-05-19 10:25 | 6              | Redundant selector removed      |
| 2026-05-19 10:26 | 7              | Build verified successfully     |
