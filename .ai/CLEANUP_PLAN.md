# Cleanup Plan

## Scope

- Chỉ audit va cleanup an toan.
- Khong sua HTML/CSS/JS runtime.
- Khong dong vao image assets.
- Khong dong vao `.git/`, `.gitignore`, hoac bo `.ai/`.
- `no hard-delete cleanup needed` neu khong co junk that su.

## Files Kept Nguyen

### Runtime Files

- `index.html` -> `keep`
  - Root login entry dang duoc runtime su dung.
- `home/home.html` -> `keep`
  - Dashboard entry dang active.
- `home/employees.html` -> `keep`
  - Entry cua module `弈鼎員工`.
- `home/edit/index.html` -> `keep`
  - Entry cua module edit schedule.
- `assets/css/base.css` -> `keep`
  - Shared CSS cho login/edit schedule runtime.
- `assets/css/login.css` -> `keep`
  - Login runtime CSS.
- `assets/css/home.css` -> `keep`
  - Dashboard runtime CSS.
- `assets/css/employees.css` -> `keep`
  - Employees module runtime CSS.
- `assets/css/edit-schedule.css` -> `keep`
  - Edit schedule runtime CSS.
- `assets/js/login.js` -> `keep`
  - Login runtime logic.
- `assets/js/home.js` -> `keep`
  - Dashboard runtime logic.
- `assets/js/employees-data.js` -> `keep`
  - Employees seed/imported runtime data.
- `assets/js/employees-form.js` -> `keep`
  - Employees form schema + helpers.
- `assets/js/employees-page.js` -> `keep`
  - Employees page runtime behavior.
- `assets/js/edit-schedule.js` -> `keep`
  - Edit schedule runtime logic.
- `image/logo.png` -> `keep`
  - Active image asset.
- `image/logoweb.png` -> `keep`
  - Active image asset.

### Support Files

- `.gitignore` -> `keep`
  - Repo support file, khong phai junk.
- `.git/` -> `keep`
  - Git metadata, ngoai pham vi cleanup.

### Source-of-Truth Docs

- `.ai/CURRENT_CODEBASE_SNAPSHOT.json` -> `keep`
  - Snapshot runtime truth hien tai.
- `.ai/FILE_RESPONSIBILITY_MAP.json` -> `keep`
  - Map file ownership/role hien tai.
- `.ai/MODULE_STATUS.json` -> `keep`
  - Trang thai module hien tai.
- `.ai/KNOWN_ISSUES.json` -> `keep`
  - Danh sach issue hien tai.
- `.ai/UI_RULES_EXTRACTED.json` -> `keep`
  - Rule UI thuc te rut ra tu code.
- `.ai/NEXT_CHAT_HANDOFF.md` -> `keep`
  - Human handoff moi nhat.
- `.ai/SYSTEM_SPEC.md` -> `keep`
  - Stable system rules cho AI.
- `.ai/UI_RULES.md` -> `keep`
  - Stable UI rules cho AI.
- `.ai/WORKFLOW_RULES.md` -> `keep`
  - Stable workflow rules cho AI.

## Files Nghi Legacy/Stale

- `README.md` -> `move to archive`
  - Noi dung mo ta cau truc cu; khong con phan anh module `employees`, `.ai/`, va state runtime hien tai.
- `PROJECT_RULES.md` -> `move to archive`
  - Policy cu da lech voi code/runtime hien tai; hien tai `.ai/` moi la bo source-of-truth cho AI.

## True Junk Files

- Khong xac nhan duoc file rac that su nao trong workspace runtime.
- `no hard-delete cleanup needed`

## Planned Actions

- Tao thu muc `.ai/archive/legacy-root-docs/` -> `keep archive structure`
  - De luu root docs cu thay vi xoa cung.
- Move `README.md` vao `.ai/archive/legacy-root-docs/README.md` -> `move to archive`
  - Giu lich su nhung dua khoi root de giam nham lan.
- Move `PROJECT_RULES.md` vao `.ai/archive/legacy-root-docs/PROJECT_RULES.md` -> `move to archive`
  - Giu lich su nhung khong de no tiep tuc dong vai tro runtime truth.
- Khong delete bat ky runtime file nao -> `keep`
  - Hard constraint cua task.
- Khong delete bat ky image asset nao -> `keep`
  - Hard constraint cua task.
- Khong delete bat ky file `.ai/` dang active nao -> `keep`
  - Day la source-of-truth docs hien tai.

## Notes

- Danh muc `.git/` co nhieu file sample/noi bo, nhung ngoai pham vi cleanup va khong duoc dong vao.
- Neu can don tiep tai lieu lich su sau nay, phai tiep tuc doi chieu voi runtime truoc khi move them.
