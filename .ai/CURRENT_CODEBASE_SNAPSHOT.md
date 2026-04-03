# Current Codebase Snapshot

## Project Overview

- Project name: `YiDing_Web`
- App type: static multi-page internal web app
- Runtime model: plain HTML pages with page-specific CSS and JavaScript
- Build tooling: none found
- Backend/API in current workspace: none found

## Real Runtime Entry Points

- `index.html`
  - login
- `home/home.html`
  - dashboard
- `home/employees.html`
  - employees module
- `home/edit/index.html`
  - edit schedule page

## Module Architecture

- `login`
  - `index.html`
  - `assets/css/base.css`
  - `assets/css/login.css`
  - `assets/js/login.js`
- `homeDashboard`
  - `home/home.html`
  - `assets/css/home.css`
  - `assets/js/home.js`
- `employees`
  - `home/employees.html`
  - `assets/css/employees.css`
  - `assets/js/employees-data.js`
  - `assets/js/employees-form.js`
  - `assets/js/employees-page.js`
- `editSchedule`
  - `home/edit/index.html`
  - `assets/css/base.css`
  - `assets/css/edit-schedule.css`
  - `assets/js/edit-schedule.js`

## Data Reality

- Employees data is frontend-embedded in `assets/js/employees-data.js`.
- No live Airtable fetch exists in runtime code.
- Initial employee seed count: `102`
- Seed departments:
  - `Operation`
  - `Cage`
  - `Booking & Service`
  - `Finance`
  - `Marketing`
  - `Hr`
- Fixed retired department:
  - `離職`
- Room type options in runtime:
  - `員工宿舍` only
- Seed quality realities visible in code/data:
  - `25` blankish employee records
  - `17` retired employees
  - `52` employees with attachments

## Auth Reality

- Login is temporary frontend-only logic.
- Hardcoded credentials in `assets/js/login.js`:
  - account: `YiDing Admin`
  - password: `YDI0006`
- Successful login writes `yd_temp_auth=admin` into `sessionStorage`.
- No protected page checks that flag.

## Storage Reality

- `login`
  - `sessionStorage`: `yd_temp_auth`
- `employees`
  - `localStorage`: `yiding_employees_module_state_v3_airtable_import`
- `dashboard`
  - no persistent storage in current code
- `editSchedule`
  - in-memory page state only

## Employees: Panel 1 / Panel 2 / Panel 3 Reality

### Panel 1: Sidebar

- Shows interface icon, title, subtitle.
- Title and subtitle support inline edit.
- Interface icon can be changed locally and reset to default logo.
- Normal departments can be reordered by drag and drop.
- `離職` is fixed and always rendered after normal departments.
- `新增部門` is a dedicated inline add flow at the bottom.

### Panel 2: Main Workspace

- Shows selected department title plus a per-department note.
- Normal departments:
  - tabs
  - tab composer
  - search
  - filter
  - display/sort controls
  - card grid
- `離職` view:
  - no tab system
  - search + filter only
  - sort forced to retired-soonest behavior
- Card grid on wide desktop:
  - detail closed: 5 fixed-width cards per row
  - detail open: 3 fixed-width cards per row

### Panel 3: Detail Panel

- Modes:
  - `hidden`
  - `view`
  - `edit`
  - `add`
- Opened from card selection or add action.
- Top actions remain outside the scrollable detail content region.
- Includes avatar preview area, full employee form, and save/edit/delete flows.
- Uses modal flows for:
  - employee delete confirm/password
  - attachment delete password
  - close-with-unsaved-changes confirm
  - avatar preview
  - notices

## Biggest Code Realities To Preserve

- Runtime is page-isolated; there is no router or bundler.
- `employees` is intentionally split into data/form/page layers.
- `employees-page.js` is the real employees controller; it should not absorb unrelated modules.
- `employees-data.js` is both seed source and option source.
- Dashboard is mostly a launcher; only the employees action navigates today.
- Root legacy docs were archived; `.ai/` is the maintained doc layer.

## Current Constraints

- No backend source exists in the workspace.
- No API client exists in the runtime code.
- No auth guard exists.
- Some visible employee values remain mixed-language imported values.
- Current docs must follow runtime code, not old spec text.

## Current Recommended Next Work

1. Decide whether auth guard should become real before expanding more modules.
2. Decide whether dashboard `班表` should point to the existing schedule page.
3. Clean employees seed data before building more employee-facing UX.
4. Decide whether employee persistence should remain local-only or move toward backend sync.
