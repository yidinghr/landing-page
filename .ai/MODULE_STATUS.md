# Module Status

## login

- Maturity: usable prototype
- Related files:
  - `index.html`
  - `assets/css/base.css`
  - `assets/css/login.css`
  - `assets/js/login.js`
- Implemented features:
  - branded login UI
  - enter-to-submit form handling
  - hardcoded admin credential check
  - success redirect to `home/home.html`
  - clears inputs/message when the page is shown again via browser back
- Placeholder features:
  - real auth backend
  - registration
  - role model
  - route protection
- Broken behaviors:
  - sessionStorage login flag is not enforced by downstream pages
  - credentials are hardcoded in frontend
- Next recommended work:
  - implement route/auth guard logic before depending on login for access control

## homeDashboard

- Maturity: launcher UI with two real navigation paths
- Related files:
  - `home/home.html`
  - `assets/css/home.css`
  - `assets/js/home.js`
- Implemented features:
  - logo + dynamic time-based greeting
  - menu buttons rendered from config
  - top-right icon buttons rendered from config
  - `弈鼎員工` navigates to `home/employees.html`
  - `班表` navigates to `home/edit/index.html`
- Placeholder features:
  - `打卡`
  - `弈鼎资料`
  - help icon
  - settings icon
- Broken behaviors:
  - visible buttons/icons still suggest actions, but most remain no-op
- Next recommended work:
  - decide whether to wire `打卡` and `弈鼎资料` next or keep them visibly disabled

## employees

- Maturity: most advanced module; feature-rich client-side prototype
- Related files:
  - `home/employees.html`
  - `assets/css/employees.css`
  - `assets/js/employees-data.js`
  - `assets/js/employees-form.js`
  - `assets/js/employees-page.js`
- Implemented features:
  - three-panel desktop layout
  - sidebar interface icon/title/subtitle editing
  - department select/reorder/add/edit/delete
  - fixed retired department behavior
  - per-department notes
  - search/filter/display/sort controls
  - per-department tabs with multi-condition AND logic
  - employee card grid
  - detail panel modes: hidden/view/edit/add
  - add/edit/save/delete employee
  - password-gated delete flows
  - avatar preview and replacement
  - multi-file attachment flow with pending confirmation
  - auto-sync for onboarding fields:
    - `入職日期`
    - `試用天數`
    - `試用期結束日`
    - `轉正日期`
  - localStorage persistence
- Placeholder features:
  - backend persistence
  - live Airtable fetch through backend
  - multi-user sync
  - advanced tab builder beyond current AND-condition composer
- Broken behaviors:
  - imported seed includes many blankish records
  - visible values are not fully normalized to Traditional Chinese
  - no auth guard before entering module
- Next recommended work:
  - clean seed data
  - normalize visible labels while preserving source mapping
  - decide backend strategy before making employee CRUD “real”

## editSchedule

- Maturity: functional client-side internal schedule module
- Related files:
  - `home/edit/index.html`
  - `assets/css/base.css`
  - `assets/css/edit-schedule.css`
  - `assets/js/edit-schedule.js`
- Implemented features:
  - dashboard navigation from `班表`
  - workbook-derived year/month schedule workspace using `Shift.xlsx`
  - dynamic day columns by selected year/month
  - active employee dropdown sourced from employees localStorage first, then seed fallback
  - auto-fill for `工號 / YDI ID`, `部門`, `越名字`, `英名字`, `职位`
  - dynamic row creation
  - right slide legend panel based on `Sheet2`
  - valid shift code enforcement from workbook code list
  - multi-cell selection and batch apply
  - Delete / Backspace clear
  - Ctrl+Z undo for grid edits
  - right-side per-employee summary with active codes, `加班`, `应上时数`, `实际时数`, `夜班补贴(时数)`
  - bottom daily summary for active major shifts
  - localStorage persistence under `yiding_schedule_module_v1`
  - Playwright coverage for route, month/day logic, roster sync, validation, batch fill, undo, panel, and workbook math
- Placeholder features:
  - backend persistence
  - official shortcut map beyond the empty centralized config
- Broken behaviors:
  - workbook contains a `加班` count formula for literal `加`, but `ValidShiftCodes` from `Sheet2` does not include `加`
- Next recommended work:
  - clarify the business rule for overtime marker `加`
  - decide whether schedule data should remain browser-local or move toward backend sync
