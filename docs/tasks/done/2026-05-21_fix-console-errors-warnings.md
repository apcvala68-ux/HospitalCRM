# Task: Fix Client Console Errors and Warnings

**Status**: DONE
**Created**: 2026-05-21
**Module(s)**: client, appointments, layout

---

## Goal

Resolve three critical frontend console errors/warnings:
1. Vite dev server uncaught import syntax error in `BookingModal.jsx`: `@heroui/react` does not provide an export named `ModalContent`.
2. Vite dev server uncaught import syntax error in `EventDetailsModal.jsx`: `@heroui/react` does not provide exports like `ModalContent`, `ModalHeader`, `ModalBody`, `ModalFooter`.
3. PWA Manifest Syntax Error: `/manifest.json` returns a 404 falling back to `index.html` (which returns a `<` leading to syntax error).
4. Deprecation warning in `index.html`: `<meta name="apple-mobile-web-app-capable" content="yes">` is deprecated in favor of `<meta name="mobile-web-app-capable" content="yes">`.

## Implementation Plan

1. **Refactor `BookingModal.jsx`**:
   - Update imports to only import `{ Modal }` from `@heroui/react` (and keep other necessary imports like `Select`, `ListBox`, `DatePicker`).
   - Reconstruct the JSX using the HeroUI v3 Compound Component API:
     - Use `<Modal>` as root.
     - Wrap content in `<Modal.Backdrop isOpen={isOpen} onOpenChange={(open) => !open && onClose()} className="backdrop-blur-sm bg-black/40">`.
     - Use `<Modal.Container>` and `<Modal.Dialog className="bg-card border border-border/50 rounded-2xl shadow-2xl max-w-2xl w-full relative">`.
     - Add `<Modal.CloseTrigger className="absolute right-4 top-4 opacity-75 hover:opacity-100 transition-opacity cursor-pointer text-muted-foreground hover:text-foreground" />`.
     - Use `<Modal.Header className="border-b border-border/20 py-4 px-6 flex flex-col gap-0.5">` with `<Modal.Heading className="text-lg font-bold text-foreground">Book Appointment</Modal.Heading>`.
     - Use `<Modal.Body className="py-6 px-6 grid gap-4 md:grid-cols-2">` for form content.
     - Use `<Modal.Footer className="border-t border-border/20 py-4 px-6 flex justify-end gap-2">` for actions.

2. **Refactor `EventDetailsModal.jsx`**:
   - Update imports to only import `{ Modal }` from `@heroui/react` (plus other UI dependencies).
   - Reconstruct the JSX using the same HeroUI v3 Compound Component API:
     - Wrap in `<Modal.Backdrop isOpen={!!selectedEvent} onOpenChange={(open) => !open && onClose()} className="backdrop-blur-sm bg-black/40">`.
     - Use `<Modal.Container>` and `<Modal.Dialog className="bg-card border border-border/50 rounded-2xl shadow-2xl max-w-sm w-full relative">`.
     - Add `<Modal.CloseTrigger className="absolute right-4 top-4 opacity-75 hover:opacity-100 transition-opacity cursor-pointer text-muted-foreground hover:text-foreground" />`.
     - Use `<Modal.Header className="border-b border-border/20 py-4 px-5">` with `<Modal.Heading className="font-bold text-foreground">Appointment Details</Modal.Heading>`.
     - Use `<Modal.Body className="py-5 px-5 space-y-3.5 text-sm">` for details.
     - Use `<Modal.Footer className="border-t border-border/20 py-3.5 px-5 flex flex-col gap-2 w-full">` for action buttons.

3. **Fix Manifest Error and Metadata Deprecation**:
   - In `client/index.html`, replace the deprecated `<meta name="apple-mobile-web-app-capable" content="yes" />` with `<meta name="mobile-web-app-capable" content="yes" />` (or include both to avoid any iOS issues but avoid warnings if possible, or just include both).
   - To avoid conflicts between static `public/manifest.json` and VitePWA's dynamic configuration in dev mode, check why PWA is throwing syntax error. Let's enable `devOptions.enabled` in `client/vite.config.js` or verify how it serves `/manifest.json`.

## Files Affected

- `client/src/pages/appointments/components/BookingModal.jsx` — MODIFY
- `client/src/pages/appointments/components/EventDetailsModal.jsx` — MODIFY
- `client/index.html` — MODIFY
- `client/vite.config.js` — MODIFY

## Acceptance Criteria

- [x] `BookingModal` and `EventDetailsModal` compile and display correctly using the HeroUI v3 compound API.
- [x] Uncaught SyntaxError regarding `ModalContent` or other Modal elements is fully resolved.
- [x] PWA manifest and deprecated metadata warnings are resolved in the browser console.
- [x] Client project passes `npm run lint` and `npm run build` with zero errors/warnings.

## Task Checklist

- [x] Step 1: Create Task Document and obtain approval.
- [x] Step 2: Refactor `BookingModal.jsx` to use HeroUI v3 compound component markup.
- [x] Step 3: Refactor `EventDetailsModal.jsx` to use HeroUI v3 compound component markup.
- [x] Step 4: Fix deprecated `apple-mobile-web-app-capable` meta and add `mobile-web-app-capable`.
- [x] Step 5: Configure `vite-plugin-pwa` to enable manifest resolution in dev mode (`devOptions: { enabled: true }`) or fix manifest.json routing.
- [x] Step 6: Verify and run static analysis checks.

## Progress Log

| Timestamp        | Step Completed | Notes                           |
| ---------------- | -------------- | ------------------------------- |
| 2026-05-21 00:40 | Step 1         | Task created, awaiting approval |
| 2026-05-21 00:50 | Step 2-6       | All steps implemented, build verification completed successfully. |
