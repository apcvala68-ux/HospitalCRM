# Task: Refactor Patients Table Styles and Controls

**Status**: DONE
**Created**: 2026-05-18
**Module(s)**: client-patients-list

---

## Goal

Add premium styling to the Patient List page table actions, custom column management, dynamic copy utility, and vibrant gradient spheres. Specifically:
1. Arrange **Search Bar on the Left** and the **Filter Button on the Right** of the controls header.
2. Remove Sort and Columns buttons and their option drawers to streamline the user interface.
3. Move the **Rows per page limit selector dropdown** down into the bottom pagination footer row.
4. Implement initials inside unique gradient abstract spheres for each member avatar.
5. Display the Worker ID in a beautiful, non-interactive monospace tag badge (without a copy button).
6. Implement a highly responsive real-time search that updates table results on typing without requiring an Enter key click (with a 350ms debounce).
7. Replace standard text buttons in the table's "Actions" column with dark circular container action buttons (View, Edit, Delete).
8. Fully wire the delete action to a dynamic React Query mutation (`useDeletePatient`) utilizing backend delete APIs.

## Files Affected

- `client/src/hooks/usePatients.js` — MODIFY
- `client/src/pages/patients/PatientListPage.jsx` — MODIFY

## Acceptance Criteria

- [x] Static analysis passes with zero warnings/errors
- [x] Search input correctly aligns left and Filter pill correctly aligns right
- [x] Rows selector correctly moves to the bottom pagination footer
- [x] Collapsible filter panel correctly toggles on right-aligned Filter button click
- [x] Patients render initials inside randomized, visually pleasing pastel gradient sphere backgrounds
- [x] Worker ID correctly displays as a clean, non-interactive badge (no clipboard copy utility)
- [x] Real-time debounced search works instantly on keystroke changes without hitting Enter
- [x] Actions column displays three premium round buttons (View, Edit, Delete) in circular layouts
- [x] Delete button is fully wired to query invalidation with automatic cache updates

## Progress Log

| Timestamp        | Step Completed | Notes                           |
| ---------------- | -------------- | ------------------------------- |
| 2026-05-18 20:31 | —              | Task created, awaiting design approval |
| 2026-05-18 20:32 | DONE           | Added `useDeletePatient` mutation hook to frontend |
| 2026-05-18 20:33 | DONE           | Implemented premium styling and collapsible panels, static analysis fully passed |
| 2026-05-19 02:06 | DONE           | Refined controls layout: Search on left, Filter on right, moved Rows select to bottom |
| 2026-05-19 02:08 | DONE           | Removed the copy utility button from the Worker ID column |
| 2026-05-19 02:11 | DONE           | Integrated debounced real-time search with zero warnings/errors |
