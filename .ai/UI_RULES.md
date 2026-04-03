# UI RULES

## Core Theme

- Nền chính: đen.
- Chữ chính: vàng.
- Viền chính: vàng hoặc vàng alpha.
- Danger action: đỏ nhạt, chỉ dùng cho delete/reset dạng nguy hiểm.
- Không chuyển sang theme trắng/xanh/tím.

## Fonts

- `employees`: dùng `Source Han Sans VF` / nhóm sans tương ứng đang có trong code.
- `dashboard`: tiêu đề lớn dùng `Noto Serif TC`, phần UI/action dùng sans.
- Không tự ý thay font module `employees` sang font khác nếu không có yêu cầu rõ.

## Layout Rules

- `employees` luôn theo mô hình 3 phần:
  - sidebar trái
  - main workspace giữa
  - detail panel phải
- Khi panel phải mở/đóng, chỉ thay đổi cột layout theo hệ đang có.
- Không đập lại layout thành kiểu mới nếu chỉ đang refine UI.

## Scroll Rules

- `employees` desktop:
  - body không scroll
  - sidebar scroll riêng
  - card list scroll riêng
  - detail panel scroll riêng
- Trong `employees`, mọi vùng scroll stylable trong DOM phải dùng scrollbar mảnh, tông vàng, cùng ngôn ngữ thiết kế:
  - `sidebar`
  - `card list`
  - `detail panel content`
  - `textarea` trong form
  - `popover` / `modal card` nếu vùng đó có scroll
- Toolbar và main header của `employees` phải giữ cảm giác đứng yên khi card list scroll.
- Scrollbar phải mảnh, tông vàng, không để mặc định trắng xám thô.
- Native popup list của `select` phụ thuộc browser/OS; không được khẳng định đã theme full popup native nếu CSS hiện tại không kiểm soát được.

## Dropdown Rules

- Dropdown/input/select trong `employees` phải nền đen, chữ vàng, viền vàng.
- Mũi tên dropdown chỉ hiện nhẹ khi hover/focus trong vùng select wrap.
- Field ngày tháng năm:
  - dropdown riêng cho năm/tháng/ngày
  - chữ `年 / 月 / 日` nằm ngoài khung dropdown
  - 3 ô năm/tháng/ngày phải đồng bộ height, radius, padding, line-height
  - arrow phải đè gọn về mép phải, không tạo khoảng trống thô làm số bị lệch
  - `年 / 月 / 日` phải dễ đọc, đồng đều, không quá nhỏ
- Không để dropdown trắng xám lạc tông.

## Hover Rules

- Hover phải nhẹ, gọn, không làm UI nặng mắt.
- Chủ yếu dùng:
  - đổi background nhẹ
  - tăng border visibility
  - translateY nhẹ
  - tooltip nhỏ kiểu pill nếu đang có trong code
- Không dùng hover kiểu bật modal lớn hoặc rung layout.

## Icon Rules

- Icon nhỏ dạng ghost/clean là mặc định cho action phụ.
- Ở `employees`, icon edit/menu/tool chỉ nên hiện rõ khi hover vùng liên quan nếu code đang làm vậy.
- Không bọc icon trong khung thừa nếu action đó được yêu cầu gọn.

## Panel / Modal Rules

- Detail panel top action nằm ngoài vùng scroll nội dung.
- Avatar preview phải sạch, tập trung vào ảnh, không modal khung to thừa nếu không cần.
- Modal xác nhận/mật khẩu giữ cùng theme đen-vàng.

## Inline Edit Rules

- Inline edit phải tại chỗ, không bật form thô nếu chỉ sửa text ngắn.
- Enter để xác nhận.
- Escape để hủy.
- Blur chỉ được tự xác nhận/hủy theo đúng logic đang có; không được làm rơi sang state lạ.

## Sticky / Fixed Rules

- Dashboard top actions đang fixed góc phải trên, phải giữ nguyên tinh thần đó nếu refine dashboard.
- `employees` không dùng sticky CSS nặng cho header, mà dựa vào scroll riêng của card/detail area.

## Absolutely Do Not Break

- Không phá theme đen/vàng.
- Không biến card `employees` thành bảng trắng kiểu admin phổ thông.
- Không làm scrollbar hệ thống lòi ra thô ở desktop nếu module hiện đang custom.
- Không để button/icon/action phụ lộ dày đặc từ đầu làm UI rối.
- Không làm panel 2 và panel 3 cùng scroll cả trang ở desktop.
