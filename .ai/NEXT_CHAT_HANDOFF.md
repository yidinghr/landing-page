# Next Chat Handoff

## What This Project Is

- `YiDing_Web` is a static multi-page internal web app.
- There is no backend code in the current workspace.
- Runtime pages are plain HTML with page-specific CSS and JavaScript.
- Local test setup now uses a static server plus Playwright against `http://127.0.0.1:4173`.
- Local smoke coverage exists for `/`, `/home/home.html`, `/home/employees.html`, and `/home/edit/index.html`.
- Production remains unchanged; treat all current verification as local-only unless explicitly deployed.

## Read These First

1. `./CURRENT_CODEBASE_SNAPSHOT.json`
2. `./MODULE_STATUS.json`
3. `./KNOWN_ISSUES.json`

Then read:

4. `./CURRENT_CODEBASE_SNAPSHOT.md`
5. `./UI_RULES.md`
6. `./WORKFLOW_RULES.md`

## Real Runtime Entry Points

- `index.html` -> login
- `home/home.html` -> dashboard
- `home/employees.html` -> employees module
- `home/edit/index.html` -> edit schedule page

## Current Module Reality

### login

- Frontend-only temp login.
- Hardcoded account/password in `assets/js/login.js`.
- Writes `yd_temp_auth` to `sessionStorage`.
- No real route enforcement.

### dashboard

- Dynamic greeting.
- Menu and top actions are config-driven.
- `弈鼎員工` navigates to `employees.html`.
- `班表` now navigates to `edit/index.html`.
- Other actions remain placeholders.

### employees

- Most advanced module.
- Three-panel layout:
  - left sidebar
  - center workspace
  - right detail panel
- Uses:
  - `employees-data.js` for seed/options
  - `employees-form.js` for schema/helpers
  - `employees-page.js` for controller/render/events
- Persists to `localStorage`.
- Seed comes from imported Airtable CSV snapshot embedded in frontend code.
- 4 onboarding fields are auto-synced in form logic:
  - `入職日期 + 試用天數 -> 試用期結束日 + 轉正日期`
  - `入職日期 + 試用期結束日 -> 試用天數 + 轉正日期`
  - `入職日期 + 轉正日期 -> 試用天數 + 試用期結束日`
  - `試用天數 + 試用期結束日 -> 入職日期 + 轉正日期`
  - `試用天數 + 轉正日期 -> 入職日期 + 試用期結束日`
  - `試用期結束日 + 轉正日期` only normalizes the pair itself; do not regress this behavior
- Current business rule:
  - `試用期結束日 = 入職日期 + 試用天數 - 1`
  - `轉正日期 = 試用期結束日 + 1`
  - `試用天數 = 入職日期 到 轉正日期 的天數`
  - `試用天數 = 入職日期 到 試用期結束日 的天數 + 1`

### editSchedule

- Now the real local schedule module for `班表`.
- Uses `Shift.xlsx` as the audited source of truth for:
  - valid shift codes from `Sheet2`
  - dynamic day count by selected year/month
  - active-code summary columns
  - paid hours / night hours calculations
  - bottom daily major-shift counts
- Pulls active employee options from `employees` localStorage first, then falls back to `employees-data.js` seed data.
- Persists schedule state in `localStorage` under `yiding_schedule_module_v1`.
- Supports:
  - dashboard route entry
  - year/month switching
  - dynamic employee rows
  - employee auto-fill columns
  - right slide legend panel from `Sheet2`
  - multi-cell selection + batch apply
  - Delete / Backspace clear
  - Ctrl+Z undo
  - bottom daily summary visibility rules
  - local Playwright coverage for schedule flows

## Biggest Things To Not Get Wrong

- Runtime code is the top source of truth.
- Do not trust archived root docs over code.
- Do not collapse module split, especially not `employees`.
- Do not add backend/API assumptions unless explicitly requested.
- Do not expand scope across modules without user request.

## Known Important Bugs / Gaps

- No auth guard on protected pages.
- Dashboard info/help/settings actions are still no-op.
- Employees seed contains many blankish records.
- Employees labels are not fully normalized to Traditional Chinese.
- Employees data is browser-local only.
- Workbook conflict remains around `加班`:
  - `Sheet1` summary formulas count literal `加`
  - `ValidShiftCodes` validation only allows `Sheet2` codes and does not include `加`
  - current web module keeps the metric, but UI does not invent a new invalid code path

## Recommended Next Work

1. Decide whether auth guard must become real now.
2. Clarify the business rule for workbook `加班` versus `ValidShiftCodes`.
3. Clean `employees` seed data before adding more employee features.
4. Decide whether `employees` and `schedule` stay localStorage-only or move toward backend sync.

## Unknown / Unresolved

- No backend contract exists in current workspace.
- No deployment config exists in runtime source.
- No verified multi-user persistence path exists.
