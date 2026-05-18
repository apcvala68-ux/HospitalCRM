---
description: Execute a task following a structured 3-phase Agent Execution Protocol (PLAN, IMPLEMENT, VERIFY).
---

# Agent Execution Protocol (Mandatory Workflow)

Every session follows three phases. Skipping any phase is a protocol violation.

## Phase 1 — PLAN

1. Run `ls docs/tasks/` to check for any `IN_PROGRESS` task matching the current request.
   - **In-progress task found** → load it, read the Progress Log, resume from the first unchecked `[ ]` item (see §7.3).
   - **No task found** → create one now using the template in §7.1. Do not write a single line of feature code first.
2. File path: `docs/tasks/<YYYY-MM-DD>_<slug>.md`.
3. **Approval gate** (§8): do not begin Phase 2 until the user confirms the plan or the doc contains `<!-- ✅ Approved -->`.

## Phase 2 — IMPLEMENT

4. Work through the task checklist step-by-step. Mark each item `[x]` **immediately** after completion — not at the end.
5. After every logical unit of work, append a timestamped entry to the **Progress Log**.
6. On interruption the Progress Log is your recovery point. The next agent session must not re-execute already-checked steps.

## Phase 3 — VERIFY

7. Run the project's analyzer (e.g., `flutter analyze` or `npm run lint`) and fix **all** warnings and errors.
8. Smoke-test on a simulator or physical device/environment.
9. Set task status to `DONE`, move the file to `docs/tasks/done/`.

---

## 4. Critical Coding Standards

### 4.1 Never-Break Rules

| ❌ Forbidden                                | ✅ Required                                    |
| ------------------------------------------- | ---------------------------------------------- |
| Business logic inside a View/UI component   | Move all logic to the state management layer   |
| Hardcoded magic numbers, strings, or colors | Use tokens, constants, and localization files  |
| Large components (> 200 lines)              | Decompose into smaller, focused sub-components |
| Starting code before task doc exists        | Create task doc first (Audit trail)            |

### 4.2 Code Style Guidelines

- Use the project's primary language for all new files.
- Follow the project's existing linting and formatting rules.
- Enforce consistent indentation (default: 2 spaces).
- Prefer explicit types and readable naming; avoid `dynamic` and unclear abbreviations.

---

## 7. Task Document Specification

### 7.1 Template

`docs/tasks/<YYYY-MM-DD>_<feature-slug>.md`

```markdown
# Task: <Short Title>

**Status**: IN_PROGRESS | DONE | BLOCKED
**Created**: <YYYY-MM-DD>
**Module(s)**: <e.g. feature-name, module-name>

---

## Goal

One paragraph. What problem does this solve, and what is the desired outcome?

## Implementation Plan

Step-by-step. Detailed enough for a different agent to execute cold.

## Files Affected

- `path/to/file.ext` — MODIFY | CREATE

## Acceptance Criteria

- [ ] Static analysis passes with zero warnings/errors
- [ ] Feature behaves as described in Goal
- [ ] No regressions in related modules

## Task Checklist

- [ ] Step 1: ...
- [ ] Step 2: ...

## Progress Log

| Timestamp        | Step Completed | Notes                           |
| ---------------- | -------------- | ------------------------------- |
| 2026-03-10 11:30 | —              | Task created, awaiting approval |
```

### 7.3 Resuming an Interrupted Task

1. Read the full task document.
2. Find the last entry in the **Progress Log** — that is your last known state.
3. Find the first unchecked `[ ]` item in the **Task Checklist** — that is your next action.
4. Say aloud: _"Resuming task '<title>' from step: <step description>"_.

---

## 8. Approval Gate

All three must be true before any implementation begins:

- [ ] Task document exists at the correct path.
- [ ] Goal, Implementation Plan, and Files Affected sections are complete.
- [ ] User has confirmed **or** the doc contains `<!-- ✅ Approved -->`.

---

## 9. Quality Gates (Mandatory Before Marking DONE)

1. **Static Analysis** — zero errors, zero warnings.
2. **Smoke Test** — manually verified in the appropriate environment.
3. **Acceptance Criteria** — every item in the task document is checked off.
4. **Code Gen** — run the build runner/scripts if any models or providers changed.
5. **File Moved** — task document is moved to `docs/tasks/done/`.

---

## 11. AI Agent Tips for Highest-Quality Output

- **Think before you type.** If the goal is ambiguous, ask clarifying questions before creating the task doc.
- **Prefer small, focused changes.** One task document = one logical change.
- **Read before you write.** Before modifying any file, view it first to understand the current state.
- **Progress Log entries are cheap, rework is expensive.** Log every pause, even short ones.
