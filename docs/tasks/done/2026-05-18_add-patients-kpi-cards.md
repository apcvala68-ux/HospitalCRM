# Task: Add KPI Cards to Patient List Page

**Status**: DONE
**Created**: 2026-05-18
**Module(s)**: client-patients-list

---

## Goal

Add beautiful, premium, and dynamic KPI stat cards above the patient records table on the Patient List Page. These cards must match the design, shadows, colors, interactions, and edge-to-edge sparklines of the main dashboard cards, featuring:
1. Total Patients: `#f43f5e` (Rose), Users icon
2. New This Month: `#0d9488` (Teal), UserPlus icon
3. Critical Cases: `#ef4444` (Red), AlertTriangle icon
4. Avg Stay: `#6366f1` (Indigo), Clock icon

## Implementation Plan

1. **Import Requirements**:
   - Import necessary React hooks and components in `PatientListPage.jsx`: `cn`, `Sparkline`, `generateSparkline`, `useDashboardStats`, and `useQuickStats`.
   - Add new Lucide icons: `Users`, `UserPlus`, `AlertTriangle`, `Clock`, `TrendingUp`, `TrendingDown`.

2. **Define StatCard Component**:
   - Define a highly stylized, responsive, and interactive `StatCard` inside `PatientListPage.jsx` identical to the premium dashboard cards (shadows, hover translations, edge-to-edge sparklines).

3. **Fetch & Map Live Statistics**:
   - Call `useDashboardStats` and `useQuickStats` hooks to populate the dynamic fields:
     - Total Patients (from `s.totalPatients`)
     - New This Month (from `s.monthPatients`)
     - Critical Cases (from `s.activeAdmissions` as the live proxy metric)
   - Layout the 4 cards in a beautiful grid at the top of `PatientListPage.jsx`.

## Files Affected

- `client/src/pages/patients/PatientListPage.jsx` — MODIFY

## Acceptance Criteria

- [x] Static analysis passes with zero warnings/errors
- [x] 4 premium KPI cards are rendered with exact Lucide icons and colors
- [x] Hover translations, shadows, and overall styling are functional and premium (sparklines removed per request)
- [x] The cards display dynamic real data where available

## Task Checklist

- [x] Import utility files, Lucide icons, and API hooks in `PatientListPage.jsx`
- [x] Define a high-quality, reusable `StatCard` component matching the dashboard's design
- [x] Call dashboard and quick stats hooks in `PatientListPage`
- [x] Map the data for the 4 KPI cards and render the grid above the search bar
- [x] Verify static analysis passes and everything is visual-excellence approved

## Progress Log

| Timestamp        | Step Completed | Notes                           |
| 2026-05-18 20:25 | —              | Task created, awaiting approval |
| 2026-05-18 20:26 | DONE           | Implemented KPI cards, passed static analysis |
| 2026-05-18 20:27 | UPDATED        | Removed sparkline charts from the cards per user request |
| 2026-05-18 20:29 | UPDATED        | Removed "{total} Patients" header row from the table card per user request |

