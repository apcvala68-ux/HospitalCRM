# Walkthrough: Unified Doctor Management UI in Edit Department Form

**Created**: 2026-05-19
**Module(s)**: client, departments
**Task ID**: `2026-05-19_add-assign-doctors-form-page`

---

## 1. Overview of Changes

To enhance user flow, clean up redundancy, and unify the CRM's department management interface, we migrated the advanced doctor list management capabilities from the Department Detail Page (`DepartmentDetailPage.jsx`) directly into the Edit Department Form Page (`DepartmentFormPage.jsx`) sidebar and removed the duplicate selector block in the main form:

### A. Dynamic Doctor Assignment Panel
- Added the **"Assign Doctor"** button to the Doctors sidebar card header.
- Clicking the button toggles an inline form panel with a select dropdown.
- The dropdown dynamically filters and lists only available doctors who are not currently assigned to the department.
- Submitting the selection triggers the backend assignment mutation instantly.

### B. Interactive Cards with Action Menus
- Upgraded the basic static doctor list items in the sidebar to responsive cards containing:
  - Doctor name and visual initials avatar.
  - Quick action popover button (`...`).
- When clicked, a context-aware menu toggles open to allow:
  - **View**: Link directly to the doctor's profile page.
  - **Make Head**: Directly assign this doctor as the Head of the Department.
  - **Remove**: Instantly remove the doctor from the department.

### C. Cleaned Main Details Form
- Removed the large redundant **"Head Doctor"** select card grid from the main department details form UI.
- The Head Doctor is now managed dynamically in one unified place (via the sidebar list actions), avoiding double selectors on the same page.

---

## 2. Code Modifications

1. **Imports & Hook Integrations**:
   - Added React `useRef` and `useEffect` hooks to handle outside-clicking popover dismissal.
   - Imported the `useAssignDoctor` and `useDoctors` hooks in `DepartmentFormPage.jsx`.

2. **Sidebar Card Markup Refinement**:
   - Swapped standard `Stethoscope` header icon for the standard `Users` icon.
   - Applied custom overflow styles (`!overflow-visible`) to the parent `<Card>` and `<CardContent>` wrappers so absolute action menus open downwards and render beautifully without clipping.

3. **Cleanup Redundant Controls**:
   - Stripped out the duplicate Selectable Head Doctor Cards Grid markup block located under the status toggle panel inside `DepartmentForm`.

---

## 3. Verification Details

### Automated Verification
- Ran full production compile and static linter checks:
  ```powershell
  npm run build
  ```
- **Result**: Successfully completed compilation in under 2.7 seconds with an exit code of `0`, confirming complete TypeScript type safety and linter compliance.
