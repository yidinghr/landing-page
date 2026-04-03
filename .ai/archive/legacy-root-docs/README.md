# YiDing Web

Web nội bộ của 弈鼎, giữ nền đen, khung vàng, chữ vàng và dùng HTML/CSS/JS thuần.

## Cấu trúc hiện tại

```text
YiDing_Web/
|-- assets/
|   |-- css/
|   |   |-- base.css
|   |   |-- edit-schedule.css
|   |   |-- home.css
|   |   `-- login.css
|   `-- js/
|       |-- edit-schedule.js
|       `-- home.js
|-- home/
|   |-- edit/
|   |   `-- index.html
|   `-- home.html
|-- image/
|   |-- logo.png
|   `-- logoweb.png
|-- .gitignore
|-- PROJECT_RULES.md
|-- README.md
`-- index.html
```

## Entry hiện tại

- `index.html`: trang vào chính ở root.
- `home/home.html`: trang menu nội bộ.
- `home/edit/index.html`: trang chỉnh sửa排班.

## Quy ước dọn nền

- Không đổi framework: tiếp tục dùng HTML/CSS/JS thuần.
- Không nhét toàn bộ style và logic vào một file HTML.
- Style chung đặt trong `assets/css/base.css`.
- Logic riêng từng trang đặt trong `assets/js/`.
- Ảnh giữ trong `image/`.

## Mở local

Có thể mở trực tiếp bằng trình duyệt:

- `index.html`
- `home/home.html`
- `home/edit/index.html`

Hoặc dùng VS Code Live Server nếu muốn reload nhanh hơn.

## Ghi chú

- Chưa thêm backend thật vào project này.
- Không đặt Airtable token ở frontend.
- Khi cần mở rộng API nội bộ, có thể bổ sung thư mục `server/` sau, không cần tạo placeholder từ bây giờ.
