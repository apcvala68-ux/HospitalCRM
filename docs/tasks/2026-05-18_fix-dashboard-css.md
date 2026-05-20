# Task: Fix Dashboard CSS Conflicts and Inconsistencies

**Status**: IN_PROGRESS
**Created**: 2026-05-18
**Module(s)**: dashboard, layout, ui/components

---

## Goal

Unify and fix all CSS inconsistencies across the entire dashboard system. Currently AdminDashboard, ReceptionistDashboard, NurseDashboard, PharmacistDashboard, and CashierDashboard all use different spacing, padding, font sizes, grid gaps, and card styling. The main content area (AppLayout) adds `p-6` which conflicts with internal dashboard padding. The result is a visually broken and inconsistent dashboard experience.

## Implementation Plan

1. **Standardize AppLayout main padding** — reduce from `p-6` to `p-4` to avoid double-padding with dashboard internals
2. **Create a unified dashboard wrapper utility** — consistent `space-y-5` across all dashboards (Admin currently uses `space-y-5 px-1 py-0.5`, others use `space-y-6`)
3. **Normalize greeting/header section** — all dashboards should use consistent heading size (`text-xl font-bold`) and subtitle styling (`text-sm text-muted-foreground`)
4. **Fix Card component defaults** — the default `p-6` in CardHeader/CardContent is too large for dense dashboard cards. Dashboard cards override inconsistently. Add a `DashboardCard` variant or normalize overrides.
5. **Standardize stat card grids** — consistent `grid gap-4 md:grid-cols-4` (Admin uses 6-col, others use 4-col — keep per-dashboard but normalize gap and card internals)
6. **Normalize chart container heights** — all chart cards should use consistent `h-64` with proper inner padding
7. **Fix SectionTitle consistency** — Admin uses custom `SectionTitle` component with `text-[13px] font-bold uppercase tracking-widest`, other dashboards use `CardTitle` with various sizes. Unify to a shared pattern.
8. **Normalize CardContent padding in charts** — currently some use `p-4`, some use default `p-6 pt-0`, some have no padding override
9. **Fix border/shadow consistency** — Admin uses `border-border/40 shadow-none` on cards, others use default card shadow. Unify to subtle borders with no shadow for dashboard cards.
10. **Verify all role dashboards render consistently** — check Admin, Receptionist, Nurse, Pharmacist, Cashier, Doctor

## Files Affected

- `client/src/index.css` — MODIFY (add dashboard utility classes)
- `client/src/components/layout/AppLayout.jsx` — MODIFY (main padding)
- `client/src/components/ui/card.jsx` — MODIFY (add DashboardCard variant)
- `client/src/pages/DashboardPage.jsx` — NO CHANGE (routing only)
- `client/src/pages/dashboard/AdminDashboard.jsx` — MODIFY (normalize spacing, cards, sections)
- `client/src/pages/dashboard/ReceptionistDashboard.jsx` — MODIFY (normalize spacing, cards, sections)
- `client/src/pages/dashboard/NurseDashboard.jsx` — MODIFY (normalize spacing, cards, sections)
- `client/src/pages/dashboard/PharmacistDashboard.jsx` — MODIFY (normalize spacing, cards, sections)
- `client/src/pages/dashboard/CashierDashboard.jsx` — MODIFY (normalize spacing, cards, sections)
- `client/src/pages/doctor/DoctorDashboard.jsx` — MODIFY (normalize spacing, cards, sections)

## Acceptance Criteria

- [ ] All dashboards use consistent spacing (gap, padding, margins)
- [ ] All greeting headers use same font size and styling
- [ ] All stat cards have uniform padding, height, and internal layout
- [ ] All chart containers have consistent heights and padding
- [ ] Card borders and shadows are unified across dashboards
- [ ] No visual overlap, clipping, or broken layouts at any breakpoint
- [ ] Static analysis passes with zero warnings/errors

## Task Checklist

- [ ] Step 1: Read all current dashboard files and identify all CSS inconsistencies
- [ ] Step 2: Add dashboard utility classes to index.css
- [ ] Step 3: Fix AppLayout main content padding
- [ ] Step 4: Add DashboardCard component variant to card.jsx
- [ ] Step 5: Refactor AdminDashboard with normalized styling
- [ ] Step 6: Refactor ReceptionistDashboard with normalized styling
- [ ] Step 7: Refactor NurseDashboard with normalized styling
- [ ] Step 8: Refactor PharmacistDashboard with normalized styling
- [ ] Step 9: Refactor CashierDashboard with normalized styling
- [ ] Step 10: Refactor DoctorDashboard with normalized styling
- [ ] Step 11: Run lint/typecheck and fix all warnings
- [ ] Step 12: Visual verification of all dashboards

## Progress Log

| Timestamp        | Step Completed | Notes                           |
| ---------------- | -------------- | ------------------------------- |
| 2026-05-18 00:00 | Step 1         | Read all files, identified inconsistencies |
| 2026-05-18 00:30 | Step 2         | Added dashboard utility classes to index.css |
| 2026-05-18 00:35 | Step 3         | Fixed AppLayout main padding (p-6 → p-4) |
| 2026-05-18 00:40 | Step 4         | Added DashboardCard variant components |
| 2026-05-18 01:00 | Step 5         | Refactored AdminDashboard |
| 2026-05-18 01:15 | Step 6         | Refactored ReceptionistDashboard |
| 2026-05-18 01:20 | Step 7         | Refactored NurseDashboard |
| 2026-05-18 01:25 | Step 8         | Refactored PharmacistDashboard |
| 2026-05-18 01:30 | Step 9         | Refactored CashierDashboard |
| 2026-05-18 01:35 | Step 10        | Refactored DoctorDashboard |
| 2026-05-18 02:00 | Step 11        | Lint: fixed new errors, build passes with 0 errors |
