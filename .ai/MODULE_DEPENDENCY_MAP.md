# Module Dependency Map

## Top-Level Module Dependencies

## login

- `index.html`
  - loads `assets/css/base.css`
  - loads `assets/css/login.css`
  - loads `assets/js/login.js`
- `assets/js/login.js`
  - depends only on DOM elements in `index.html`
  - writes to `sessionStorage`
  - redirects to `home/home.html`

## homeDashboard

- `home/home.html`
  - loads `assets/css/home.css`
  - loads `assets/js/home.js`
- `assets/js/home.js`
  - depends only on dashboard DOM mounts
  - computes greeting from browser time
  - uses config arrays for menu buttons and top icons
  - navigates to `employees.html` for employees action

## editSchedule

- `home/edit/index.html`
  - loads `assets/css/base.css`
  - loads `assets/css/edit-schedule.css`
  - loads `assets/js/edit-schedule.js`
- `assets/js/edit-schedule.js`
  - depends only on local page DOM
  - uses in-memory state only

## employees

### Load Order

1. `home/employees.html`
2. `assets/js/employees-data.js`
3. `assets/js/employees-form.js`
4. `assets/js/employees-page.js`

### Dependency Chain

- `home/employees.html`
  - creates only the root mount
- `assets/js/employees-data.js`
  - exports `window.YiDingEmployeesData`
  - provides:
    - seed state
    - departments
    - option lists
    - storage key
    - empty draft factories
- `assets/js/employees-form.js`
  - depends on `window.YiDingEmployeesData`
  - exports `window.YiDingEmployeesForm`
  - provides:
    - field schema
    - derived-field logic
    - form rendering helpers
    - serialization helpers
- `assets/js/employees-page.js`
  - depends on:
    - `window.YiDingEmployeesData`
    - `window.YiDingEmployeesForm`
    - root mount from `home/employees.html`
  - owns:
    - UI state
    - rendering
    - event delegation
    - localStorage persistence

## Employees Data Flow

- Initial load:
  - `employees-page.js` calls `loadState()`
  - `loadState()` reads `localStorage`
  - if missing or invalid, it falls back to `dataApi.createInitialState()`
  - `hydrateState()` normalizes runtime state
- Detail editing:
  - input/change events are delegated through the root
  - field updates go through `updateDraftEmployee()`
  - draft data is normalized via `formApi.applyDerivedFields()`
- Save:
  - `saveEmployee()` serializes draft data with `formApi.serializeDraft()`
  - state array is updated in memory
  - `persistState()` writes full state back to `localStorage`

## Employees Render Flow

- `buildShell()`
  - creates the three-panel app shell and hidden file inputs
- `renderAll()`
  - `renderSidebar()`
  - `renderMainHeader()`
  - `renderToolbar()`
  - `renderCards()`
  - `renderDetailPanel()`
  - `renderModal()`
  - `focusPendingInputs()`

## Employees Event Flow

- Root listeners:
  - `click`
  - `input`
  - `change`
  - `keydown`
  - `focusout`
  - drag/drop listeners for department reordering
- Dispatch model:
  - actions use `data-action`
  - form values use `data-path`
  - settings use `data-setting`
  - tab composer uses `data-tab-condition-*`

## Employees Panel Dependency Notes

### Panel 1

- Renders from state:
  - `interfaceMeta`
  - `departments`
  - `selectedDepartmentId`
  - inline edit flags in `uiState`

### Panel 2

- Depends on:
  - selected department
  - active tab
  - filters
  - search query
  - card display config
  - sort mode
- Card list is computed by `getVisibleEmployees()`

### Panel 3

- Depends on:
  - `detailMode`
  - `selectedEmployeeId`
  - `draftEmployee`
  - `referenceEmployee`
  - attachment pending state
  - modal state

## Cross-Module Reality

- There is no shared event bus.
- There is no centralized store shared across modules.
- Modules communicate only through page navigation and browser storage.
