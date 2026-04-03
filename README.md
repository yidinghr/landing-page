# YiDing_Web

Static multi-page internal web app built with plain HTML, CSS, and JavaScript.

## Runtime Entry Points

- `index.html` -> login
- `home/home.html` -> dashboard
- `home/employees.html` -> employees module
- `home/edit/index.html` -> edit schedule page

## Current Architecture

- No framework
- No bundler
- No router
- No backend code in current workspace
- Page-specific CSS/JS per module
- `employees` is split into:
  - `assets/js/employees-data.js`
  - `assets/js/employees-form.js`
  - `assets/js/employees-page.js`

## Important Constraints

- Runtime code is the highest source of truth.
- `.ai/` is the maintained documentation layer.
- Do not assume archived root docs describe current runtime truth.
- Do not add backend/API assumptions unless explicitly requested.

## Read First

1. `.ai/CURRENT_CODEBASE_SNAPSHOT.json`
2. `.ai/MODULE_STATUS.json`
3. `.ai/KNOWN_ISSUES.json`
4. `.ai/CURRENT_CODEBASE_SNAPSHOT.md`
5. `.ai/WORKFLOW_RULES.md`

## Important Warning

- There is no backend in the current workspace.
- Login is temporary frontend-only logic.
- Employees data currently persists in browser storage, not a shared server source.
