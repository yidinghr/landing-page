# Runtime Entrypoints

## Active Pages

| Path | Purpose | Loaded assets | Active status | Navigation in/out reality |
|---|---|---|---|---|
| `index.html` | Login page | `assets/css/base.css`, `assets/css/login.css`, `assets/js/login.js` | active | In: root open. Out: success redirects to `home/home.html`. |
| `home/home.html` | Dashboard / launcher | `assets/css/home.css`, `assets/js/home.js`, Google Fonts, Source Han Sans CDN | active | In: direct open or redirect from login. Out: only `弈鼎員工` navigates to `home/employees.html`; other actions are no-op. |
| `home/employees.html` | Employees management module | `assets/css/employees.css`, `assets/js/employees-data.js`, `assets/js/employees-form.js`, `assets/js/employees-page.js`, Google Fonts, Source Han Sans CDN | active | In: direct open or dashboard employees button. Out: no built-in back/router logic; page is self-contained. |
| `home/edit/index.html` | Edit schedule page | `assets/css/base.css`, `assets/css/edit-schedule.css`, `assets/js/edit-schedule.js` | active-partial | In: direct open only in current runtime. Out: no dashboard route currently wired. |

## Notes

- Root `README.md` and `PROJECT_RULES.md` are not runtime entrypoints.
- No build/start command exists in current workspace.
- Runtime navigation is static-file navigation, not router-based.
