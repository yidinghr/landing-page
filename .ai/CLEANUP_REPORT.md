# Cleanup Report

## Files Moved

- `README.md` -> `.ai/archive/legacy-root-docs/README.md`
  - Root doc nay da stale so voi runtime thuc te: thieu `employees` module, thieu `.ai/` source-of-truth, va mo ta cau truc cu.
- `PROJECT_RULES.md` -> `.ai/archive/legacy-root-docs/PROJECT_RULES.md`
  - Root rule doc nay khong con la runtime/source-of-truth doc; mot so phat bieu da lech voi he thong hien tai va bi thay the boi `.ai/`.

## Files Deleted

- Khong co file nao bi hard-delete.
- `no hard-delete cleanup needed`

## Files Co Tinh Giu Lai Du Nhung Co Ve Cu

- `.gitignore`
  - Van la support file hop le cua repo.
- Toan bo runtime HTML/CSS/JS trong `index.html`, `home/`, `assets/`
  - Dang active thuc te; cleanup nay khong duoc dong vao runtime.
- Toan bo image assets trong `image/`
  - Dang active trong runtime.
- Toan bo `.ai/*.json` va `.ai/*.md` hien co
  - Dang la source-of-truth docs moi cho AI va phan anh code runtime hien tai.
- `.git/` va noi dung ben trong
  - Ngoai pham vi cleanup; khong duoc dong vao.

## Why These Were Kept

- Workspace hien tai khong co OS junk/editor temp junk duoc xac nhan.
- Cac file con lai deu hoac la runtime dang su dung, hoac la support/source-of-truth docs dang active.

## Unresolved / Not Fully Certain

- Chua co co so de archive them bat ky file trong `.ai/`, vi cac file nay van khop voi code hien tai va dang duoc dung lam handoff/spec.
- Khong audit noi dung noi bo `.git/` de cleanup, vi ngoai pham vi va co rui ro cao.
