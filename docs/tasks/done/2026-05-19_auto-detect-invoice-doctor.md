# Task: Auto-Detect Attending Doctor and Department on New Invoice Page

**Status**: DONE
**Created**: 2026-05-19
**Module(s)**: billing, patients

---

## Goal

Automatically detect the attending doctor and department when a patient is selected on the `NewInvoicePage`, retrieving details from their active IPD admission, recent appointments, prescriptions, queue tokens, or lab orders, and displaying them with a professional auto-detected badge.

## Implementation Plan

1. Modify `server/controllers/patientHistoryController.js` to deep-populate `doctor` in all clinical lists with `user` and `department` fields.
2. Update `NewInvoicePage.jsx` to fetch the selected patient's clinical history when a patient is selected.
3. Pre-populate the `doctorName` and `department` states using a hierarchical lookup chain.
4. Show a visual indicator/badge if a doctor/department was auto-detected.

## Files Affected

- `server/controllers/patientHistoryController.js` — MODIFY
- `client/src/pages/billing/NewInvoicePage.jsx` — MODIFY

## Acceptance Criteria

- [x] Static analysis passes with zero warnings/errors (`npm run build` succeeds)
- [x] Selecting a patient automatically fills `doctorName` and `department` if they have a history
- [x] Sleek visual badge showing the auto-detection source (e.g. "Latest Appointment") is shown
- [x] No regressions in related modules (e.g. PatientDetailPage works perfectly)

## Task Checklist

- [x] Modify `patientHistoryController.js` for deep population
- [x] Implement `useEffect` for fetching patient history on select in `NewInvoicePage.jsx`
- [x] Implement hierarchical lookup logic for doctor & department
- [x] Add visual badge for auto-detected doctor/department in the UI
- [x] Verify static analysis passes and run verification build

## Progress Log

| Timestamp        | Step Completed | Notes                           |
| ---------------- | -------------- | ------------------------------- |
| 2026-05-19 05:17 | —              | Task created, awaiting approval |
| 2026-05-19 05:19 | Step 1         | Deep population added to backend patient history controller. |
| 2026-05-19 05:20 | Steps 2-4      | Implemented frontend `useEffect` history fetching, fallback lookup logic, and dynamic badge UI in `NewInvoicePage.jsx`. |
| 2026-05-19 05:21 | Step 5         | Ran `npm run build` for verification. Build succeeded with zero errors/warnings. |
