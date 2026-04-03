# File Responsibility Map

## HTML

### `index.html`

- Module owner: `login`
- Purpose: root runtime entry page for login
- Manages:
  - login page DOM shell
  - form structure
  - runtime asset loading for login
- Should NOT manage:
  - authentication business logic
  - dashboard logic
  - employees module UI

### `home/home.html`

- Module owner: `homeDashboard`
- Purpose: dashboard entry page
- Manages:
  - dashboard shell
  - logo, greeting mount, menu mount, top-action mount
  - runtime asset loading for dashboard
- Should NOT manage:
  - menu action logic
  - employee data
  - schedule editor behavior

### `home/employees.html`

- Module owner: `employees`
- Purpose: employees module entry page
- Manages:
  - root mount only
  - runtime asset loading order for employees module
- Should NOT manage:
  - employee UI logic directly
  - business rules
  - inline feature implementation

### `home/edit/index.html`

- Module owner: `editSchedule`
- Purpose: standalone schedule editor entry page
- Manages:
  - schedule page shell
  - tool inputs
  - table containers
- Should NOT manage:
  - data generation logic
  - employee module integration

## CSS

### `assets/css/base.css`

- Module owner: shared base layer
- Purpose: shared reset tokens/base styles for pages that opt into it
- Manages:
  - root color vars
  - base typography defaults
  - generic element resets
- Used by:
  - `login`
  - `editSchedule`
- Should NOT manage:
  - employees module layout
  - dashboard-specific layout

### `assets/css/login.css`

- Module owner: `login`
- Purpose: login layout and component styling
- Manages:
  - logo/title sizing
  - auth card/grid layout
  - login message styles
- Should NOT manage:
  - auth logic
  - dashboard or employees visuals

### `assets/css/home.css`

- Module owner: `homeDashboard`
- Purpose: dashboard-only styling
- Manages:
  - home shell layout
  - greeting
  - menu grid
  - top-right actions
- Should NOT manage:
  - dashboard behavior logic
  - employees module styles

### `assets/css/employees.css`

- Module owner: `employees`
- Purpose: full employees module visual system
- Manages:
  - three-panel layout
  - sidebar, toolbar, cards, detail panel
  - popovers, modals, scrollbars, dropdown wrappers
  - form and attachment UI
- Should NOT manage:
  - raw data content
  - business persistence logic
  - other modules

### `assets/css/edit-schedule.css`

- Module owner: `editSchedule`
- Purpose: schedule page styling
- Manages:
  - page header
  - toolbar
  - tables and scroll wrappers
- Should NOT manage:
  - schedule data logic
  - employees module visuals

## JavaScript

### `assets/js/login.js`

- Module owner: `login`
- Purpose: login behavior controller
- Manages:
  - hardcoded temp credential check
  - success/failure messages
  - redirect
  - reset on `pageshow`
- Should NOT manage:
  - protected-route enforcement across other pages
  - dashboard state
  - employees state

### `assets/js/home.js`

- Module owner: `homeDashboard`
- Purpose: dashboard behavior controller
- Manages:
  - greeting by browser local time
  - menu config + render
  - top icon config + render
  - button/icon click dispatch
- Should NOT manage:
  - employee module state
  - schedule editor state
  - auth validation

### `assets/js/employees-data.js`

- Module owner: `employees`
- Purpose: source of runtime seed data and shared option lists
- Manages:
  - default interface strings
  - storage key
  - default departments
  - option arrays
  - seed employee dataset
  - factory helpers for initial state and empty drafts
- Should NOT manage:
  - DOM rendering
  - click handlers
  - page wiring

### `assets/js/employees-form.js`

- Module owner: `employees`
- Purpose: form schema and data transformation helpers
- Manages:
  - section/field definitions
  - field rendering markup
  - derived field logic
  - date helpers
  - phone/attachment normalization
  - serialization helpers
- Should NOT manage:
  - page-level DOM event orchestration
  - panel open/close state
  - localStorage writes

### `assets/js/employees-page.js`

- Module owner: `employees`
- Purpose: main page controller for the employees module
- Manages:
  - UI state
  - shell build
  - render cycle for sidebar/main/detail/modal
  - event delegation
  - drag/drop reorder
  - tab/filter/search/display logic
  - add/edit/save/delete employee flows
  - localStorage persistence
- Should NOT manage:
  - source seed definitions
  - field schema definitions
  - unrelated module routing beyond its own page behavior

### `assets/js/edit-schedule.js`

- Module owner: `editSchedule`
- Purpose: schedule editor controller
- Manages:
  - date range processing
  - table header generation
  - employee row creation
  - cell input handling
  - summary table updates
- Should NOT manage:
  - employee roster source
  - dashboard routing
  - backend sync

## Assets

### `image/logo.png`

- Module owner: shared asset
- Purpose: default logo/runtime image used by multiple pages and employees defaults
- Used by:
  - login
  - dashboard
  - employees defaults
- Should NOT manage:
  - any logic

### `image/logoweb.png`

- Module owner: shared asset
- Purpose: favicon/web logo asset
- Used by:
  - login favicon
- Should NOT manage:
  - any logic
