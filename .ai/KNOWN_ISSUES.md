# Known Issues

## AUTH-001

- Module: `login/access`
- Severity: `high`
- Description:
  - Protected pages do not verify the temporary login flag.
  - `home/home.html`, `home/employees.html`, and `home/edit/index.html` can be opened directly.
- Affected files:
  - `assets/js/login.js`
  - `home/home.html`
  - `home/employees.html`
  - `home/edit/index.html`
- Reproducible steps:
  1. Open `home/home.html` directly.
  2. Observe that the dashboard loads without checking `sessionStorage`.
  3. Repeat with `home/employees.html` or `home/edit/index.html`.
- Note:
  - This is not a bug in page rendering.
  - It is an access-control gap.

## AUTH-002

- Module: `login`
- Severity: `high`
- Description:
  - Admin credentials are hardcoded in frontend source.
- Affected files:
  - `assets/js/login.js`
- Reproducible steps:
  1. Open `assets/js/login.js`.
  2. Inspect `TEMP_ADMIN_ACCOUNT` and `TEMP_ADMIN_PASSWORD`.

## DASH-001

- Module: `homeDashboard`
- Severity: `medium`
- Description:
  - Dashboard renders multiple visible actions, but only `弈鼎員工` has a real navigation action.
- Affected files:
  - `assets/js/home.js`
- Reproducible steps:
  1. Open `home/home.html`.
  2. Click `班表`, `打卡`, `弈鼎资料`, `?`, or `⚙`.
  3. Observe that nothing happens.

## DASH-002

- Module: `homeDashboard/editSchedule`
- Severity: `medium`
- Description:
  - The edit-schedule page exists as a runtime entry, but the dashboard does not route to it.
- Affected files:
  - `home/home.html`
  - `assets/js/home.js`
  - `home/edit/index.html`
- Reproducible steps:
  1. Open `home/home.html`.
  2. Click `班表`.
  3. Observe that there is no navigation.
  4. Open `home/edit/index.html` directly and observe that the page exists.

## EMP-001

- Module: `employees/data`
- Severity: `medium`
- Description:
  - The imported employee seed contains `25` records with no meaningful YDI ID, English name, or Vietnamese name.
  - These become near-empty cards in the UI.
- Affected files:
  - `assets/js/employees-data.js`
- Reproducible steps:
  1. Open `home/employees.html`.
  2. Scroll through the employee card grid.
  3. Observe cards where core fields show `未設定` or are effectively blank.

## EMP-002

- Module: `employees/data/ui`
- Severity: `medium`
- Description:
  - Visible values are not fully normalized to Traditional Chinese.
  - Current runtime still exposes raw imported strings such as `Operation`, `Cage`, `Hr`, `MOM`, `DADDY`, and `Bạn`.
- Affected files:
  - `assets/js/employees-data.js`
  - `assets/js/employees-page.js`
  - `assets/js/employees-form.js`
- Reproducible steps:
  1. Open `home/employees.html`.
  2. Inspect department names and form option lists.
  3. Observe mixed-language values.

## EMP-003

- Module: `employees`
- Severity: `high`
- Description:
  - Employee edits are stored only in browser `localStorage`.
  - There is no shared persistence or API sync in the runtime code.
- Affected files:
  - `assets/js/employees-page.js`
  - `assets/js/employees-data.js`
- Reproducible steps:
  1. Edit or add an employee in one browser profile.
  2. Reload and observe the change persists in that browser.
  3. Open the same page in another browser/profile.
  4. Observe that the change is not shared.

## EMP-004

- Module: `employees/data`
- Severity: `medium`
- Description:
  - `employees-data.js` is a large generated frontend data dump.
  - Runtime UI, options, and imported seed are coupled in one frontend file.
- Affected files:
  - `assets/js/employees-data.js`
- Reproducible steps:
  1. Open `assets/js/employees-data.js`.
  2. Observe that it embeds the full imported dataset and many runtime option lists.

## SCHED-001

- Module: `editSchedule`
- Severity: `medium`
- Description:
  - The `每日統計` section exists in HTML, but `edit-schedule.js` does not populate it.
- Affected files:
  - `home/edit/index.html`
  - `assets/js/edit-schedule.js`
- Reproducible steps:
  1. Open `home/edit/index.html`.
  2. Generate a schedule.
  3. Observe that the `每日統計` table remains empty.
