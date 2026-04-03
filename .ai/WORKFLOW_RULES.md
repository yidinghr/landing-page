# WORKFLOW RULES

## Before Editing

AI phải đọc theo thứ tự này trước khi sửa code:

1. `.ai/CURRENT_CODEBASE_SNAPSHOT.json`
2. `.ai/MODULE_STATUS.json`
3. `.ai/KNOWN_ISSUES.json`
4. `.ai/UI_RULES_EXTRACTED.json`
5. `.ai/SYSTEM_SPEC.md`
6. `.ai/UI_RULES.md`
7. `.ai/WORKFLOW_RULES.md`

Sau đó mới đọc các file runtime liên quan trực tiếp đến task.

## Before Changing Files

- Phải nói rõ sẽ sửa file nào.
- Phải nói rõ có tạo file nào hay không.
- Chỉ động vào đúng module liên quan.
- Không mở rộng scope sang module khác chỉ vì “tiện”.

## Scope Control

- Nếu prompt chỉ nói về UI của một module, không sửa data/import/auth/module khác.
- Nếu prompt chỉ nói về hành vi, không tự redesign lại toàn bộ giao diện.
- Nếu task chưa yêu cầu backend, không tự bịa API/backend flow.

## Source Of Truth

- Ưu tiên code runtime hiện tại trong workspace.
- Ưu tiên các file `.ai/` đã trích từ code.
- Không dựa vào spec cũ nếu nó lệch với code hiện tại.
- Chỗ nào chưa chắc phải ghi `unknown` / `unresolved`, không tự bịa.

## How To Work

- Giữ cấu trúc page-specific CSS/JS hiện tại.
- Giữ split layer của module `employees`: data / form / page.
- Sửa tối thiểu nhưng đủ đúng.
- Nếu chỉ cần chỉnh một file thì không lan sang nhiều file.
- Nếu phải sửa nhiều file, phải có lý do rõ ràng theo kiến trúc hiện tại.

## After Editing

AI phải báo lại:

- file nào đã sửa
- file nào đã tạo
- hành vi nào đã thay đổi
- phần nào vẫn còn placeholder / unresolved
- cách test nhanh phần vừa sửa

## When To Ask Back

- Khi user mô tả mâu thuẫn trực tiếp với code hiện tại và có nhiều cách hiểu hợp lý.
- Khi thay đổi có nguy cơ làm lệch module khác hoặc phá kiến trúc hiện tại.
- Khi dữ liệu/source thật không có trong workspace và việc đoán sẽ làm sai hệ thống.

## When Not To Ask Back

- Khi có thể xác minh trực tiếp từ code hiện tại.
- Khi prompt đã nói phạm vi rõ.
- Khi chỉ cần sửa cục bộ, không ảnh hưởng module khác.

## Hard Constraints

- Không đổi framework.
- Không nhét mọi thứ vào một file lớn.
- Không phá layout hiện tại chỉ để “dọn đẹp”.
- Không tự ý chuẩn hóa dữ liệu hiển thị nếu chưa rõ mapping nguồn và nguy cơ lệch business meaning.
