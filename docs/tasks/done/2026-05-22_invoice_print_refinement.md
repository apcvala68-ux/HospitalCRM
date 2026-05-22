# Task: A4 Invoice Print Refinement and Signature Sizing

**Status**: DONE
**Created**: 2026-05-22
**Module(s)**: client / billing / invoice

---

## Goal

Refine the A4 print version of the Tax Invoice page to eliminate micro-typography errors:
1. Fix the signature wrapping issue by reducing its font size and locking it to a single line using `whitespace-nowrap`.
2. Standardize column alignments across patient details, clinical details, and payment details using CSS Grid.
3. Replace raw emojis with high-resolution vector icons (`lucide-react`) to ensure clean monochrome prints.
4. Correct totals box sub-pixel alignment by adding a matching border-sizing property.
5. Enhance text contrast for print-safe legibility.

## Implementation Plan

1. **Import Icons**: Import `User`, `Activity`, `FileText`, `Clock`, `Phone`, `MapPin` from `lucide-react`.
2. **Update Print CSS**:
   * Set signature font size to `18pt` or `20pt` and add `white-space: nowrap !important;`.
   * Add a `border: 1px solid #0b2545` to `.total-amount-row` to match the box dimensions of `.balance-due-row`.
3. **Refactor Detail Cards to CSS Grid**:
   * Change patient details lists to a clean `grid grid-cols-[112px_12px_1fr] gap-y-2 text-[9.5px] font-semibold`.
   * Change clinical details lists to the same grid system.
   * Change payment details lists to the same grid system.
4. **Replace Emojis with Vectors**:
   * Replace `👤` with styled `<User className="h-3.5 w-3.5 text-blue-900 shrink-0" />`.
   * Replace `⚕️` with styled `<Activity className="h-3.5 w-3.5 text-blue-900 shrink-0" />`.
   * Replace `📋` with styled `<FileText className="h-3.5 w-3.5 text-blue-900 shrink-0" />`.
   * Replace `💳` with styled `<CreditCard className="h-3.5 w-3.5 text-blue-900 shrink-0" />`.
   * Replace `🕒` with styled `<Clock className="h-3.5 w-3.5 text-gray-500 shrink-0" />`.
   * Replace `📞` with styled `<Phone className="h-3.5 w-3.5 text-rose-600 shrink-0" />`.
   * Replace `📍` with styled `<MapPin className="h-3.5 w-3.5 text-blue-900 shrink-0" />`.
5. **Boost Print Contrast**: Ensure small print text elements use explicit high-contrast grays like `print:text-gray-700` and `print:text-gray-900`.
6. **Lint & Verify**: Run `npm run lint` and verify output.

## Files Affected

- `client/src/pages/billing/InvoiceDetailPage.jsx` — MODIFY

## Acceptance Criteria

- [x] Cursive signature renders beautifully on a single line without wrapping.
- [x] Colons are perfectly aligned across cards and do not wrap or clip.
- [x] No raw system emojis are present in the print version.
- [x] Table footer notes and calculation rows align perfectly to sub-pixel borders.
- [x] Client static analysis passes with zero warnings/errors.

## Task Checklist

- [x] Step 1: Update imports of Lucide icons.
- [x] Step 2: Refactor print CSS styling for signature, borders, and margins.
- [x] Step 3: Refactor detail cards (Patient, Clinical, and Payment Details) to CSS Grid.
- [x] Step 4: Replace raw emojis with high-resolution Lucide components.
- [x] Step 5: Verify contrast adjustments and signature line overlap.
- [x] Step 6: Run `npm run lint` to guarantee zero warnings.

## Progress Log

| Timestamp        | Step Completed | Notes                           |
| ---------------- | -------------- | ------------------------------- |
| 2026-05-22 11:42 | —              | Task created, awaiting approval |
| 2026-05-22 11:45 | Step 1 & 2     | Imports updated, CSS customized |
| 2026-05-22 11:48 | Step 3 & 4     | CSS Grid implemented, emojis replaced with Lucide icons |
| 2026-05-22 11:51 | Step 5 & 6     | Contrast tested, ESLint static check: 100% clean |
