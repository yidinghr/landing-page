# SYSTEM SPEC

## System Type

- Project hiện là web nội bộ dạng static multi-page.
- Không có backend source trong workspace hiện tại.
- Không có bundler, router hay framework runtime.
- Mỗi trang HTML tự load CSS và JS riêng.

## Real Runtime Structure

- `index.html`: login
- `home/home.html`: dashboard
- `home/employees.html`: module `弈鼎員工`
- `home/edit/index.html`: trang `修改工作排班`

## Module Architecture

- `login`: `index.html` + `assets/css/login.css` + `assets/js/login.js`
- `dashboard`: `home/home.html` + `assets/css/home.css` + `assets/js/home.js`
- `employees`:
  - data layer: `assets/js/employees-data.js`
  - form layer: `assets/js/employees-form.js`
  - page/controller layer: `assets/js/employees-page.js`
  - entry page: `home/employees.html`
- `editSchedule`: `home/edit/index.html` + `assets/css/edit-schedule.css` + `assets/js/edit-schedule.js`

## Data Reality

- `employees` hiện dùng data frontend embed trong `assets/js/employees-data.js`.
- State của `employees` được persist bằng `localStorage`.
- Login chỉ là tạm thời bằng frontend logic; không có auth backend thật.

## Development Mode

- Cách phát triển hiện tại là iterative.
- Sửa theo từng module, refine dần trên module đang active.
- Không mở rộng lan sang module khác nếu prompt không yêu cầu.
- Không phá tách lớp đang có, đặc biệt ở module `employees`.

## Stability Rules

- Không nhét lại logic nhiều module vào một file.
- Không đổi framework.
- Không tự dựng backend giả trong frontend để “trông như hoàn chỉnh”.
- Không đổi entry point hay cấu trúc page nếu không thật sự cần.
- Khi sửa một module, ưu tiên giữ nguyên hành vi của các module khác.

## Scope Guard

- Nếu task chỉ nói về `employees`, chỉ động các file của `employees`.
- Nếu task chỉ nói về `dashboard`, không đụng `login` hay `editSchedule`.
- Nếu cần đổi shared asset hoặc shared CSS, phải chắc là không làm lệch module khác.

## Known Current Direction

- `employees` là module đang phát triển sâu nhất và là trung tâm của hệ thống hiện tại.
- `dashboard` hiện đóng vai trò launcher nội bộ, nhưng phần lớn action còn placeholder.
- `editSchedule` đã có entry riêng nhưng chưa nối đầy đủ vào luồng dashboard.
