# Test Workflow

## Scope

- Mục tiêu của setup này là verify web local của repo `YiDing_Web`.
- Đây là local-only workflow.
- Production website không thay đổi khi chạy các bước dưới đây.

## Local Server

- Base URL local chuẩn để test: `http://127.0.0.1:4173`
- 4 entry pages local:
  - `/`
  - `/home/home.html`
  - `/home/employees.html`
  - `/home/edit/index.html`

### Chạy local server thủ công

```bash
npm install
npm run dev
```

- Script `dev` dùng static server, không đổi kiến trúc runtime hiện tại.
- Server này phục vụ đúng file tĩnh trong repo hiện tại.

## Playwright

### Cài dependency và browser

```bash
npm install
npx playwright install chromium
```

### Chạy test

```bash
npm run test:e2e
```

### Chạy test có mở browser

```bash
npm run test:e2e:headed
```

## Agent Verify Rule

Với mọi task sau này có đụng tới web UI hoặc logic chạy trên browser, agent phải làm theo vòng lặp này:

1. Sửa code local.
2. Đảm bảo local server chạy được, hoặc để Playwright tự khởi động qua `webServer`.
3. Chạy Playwright test phù hợp trên local URL, hoặc mở browser local để verify trực tiếp nếu cần quan sát UI.
4. Nếu fail, tiếp tục sửa local rồi test lại.
5. Chỉ kết luận khi local verify pass, hoặc nêu rõ test/local step nào còn fail.

## Guardrails

- Luôn phân biệt rõ local và production.
- Không dùng production URL cho smoke test.
- Không kết luận rằng website đã deploy thay đổi chỉ vì local test pass.
- Nếu có thay đổi code: phải báo rõ `Local changed`.
- Nếu local server chạy được: phải báo rõ `Local server ready`.
- Nếu Playwright đã cài và test chạy được: phải báo rõ `Playwright installed` và `Browser verified`.
