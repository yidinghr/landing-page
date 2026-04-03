# Open Decisions

## 1. Real Auth Guard

- Current reality:
  - Login writes a temporary session flag, but downstream pages do not enforce it.
- Why it matters:
  - Current login does not actually protect the dashboard or employees module.
- Recommended direction:
  - Decide whether route protection is needed before expanding more internal modules.

## 2. Dashboard to Schedule Navigation

- Current reality:
  - `home/edit/index.html` exists and works as a standalone page.
  - Dashboard `班表` button is still a no-op.
- Why it matters:
  - Users can reach the schedule page only by direct URL.
- Recommended direction:
  - Decide whether `班表` should point to the existing schedule page now or remain intentionally inactive.

## 3. Employees Seed Cleanup Before More Features

- Current reality:
  - Imported employee seed includes many blankish records and mixed-language values.
- Why it matters:
  - New features built on top of dirty seed data will inherit confusing UI and edge cases.
- Recommended direction:
  - Clean seed/import normalization before deepening employees UX or reporting features.

## 4. localStorage-Only vs Backend Sync

- Current reality:
  - Employees state is localStorage-only.
  - No backend code exists in workspace.
- Why it matters:
  - Data edits are browser-local and not shared.
- Recommended direction:
  - Decide whether this module stays prototype-local or moves to backend persistence before treating CRUD as production-ready.

## 5. Department and Option Label Normalization

- Current reality:
  - Sidebar departments and some select values still reflect raw imported names.
- Why it matters:
  - UI language is inconsistent and may not match expected business language.
- Recommended direction:
  - Introduce a display-label mapping layer instead of directly mutating imported source values.

## 6. Attachment Strategy

- Current reality:
  - Attachments are stored as data URLs in localStorage-backed state.
- Why it matters:
  - This can grow browser storage quickly and is not shared across environments.
- Recommended direction:
  - Decide whether attachments are temporary prototype data or need real file storage later.

## 7. editSchedule Scope

- Current reality:
  - `editSchedule` is partial and not integrated with employees or dashboard flow.
- Why it matters:
  - Future schedule work may duplicate logic if its role is not decided early.
- Recommended direction:
  - Decide whether to keep it as a standalone prototype page or promote it to the official schedule module.

## 8. Archived Root Docs Policy

- Current reality:
  - Root `README.md` and `PROJECT_RULES.md` were moved to `.ai/archive/legacy-root-docs/`.
- Why it matters:
  - Future contributors may accidentally trust archived docs or recreate stale root docs again.
- Recommended direction:
  - Keep `.ai/` as the documentation source of truth and regenerate root README only from runtime truth.
