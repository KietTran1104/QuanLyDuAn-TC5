# DANH SÁCH CÁC TÍNH NĂNG CHƯA HOÀN THIỆN & ROADMAP DỰ ÁN (JIRA CLONE)

Dưới đây là thiết kế lộ trình phát triển và **Bộ Quy tắc chống Conflict** dành cho toàn team để ai cũng có thể code mượt mà không dẫm chân nhau.

---

## ⚖️ 0. QUY CHUẨN CODE & TRÁNH CONFLICT (ALL DEV PHẢI ĐỌC)

Để chấm dứt tình trạng sửa đè code nhau khi team đông người, toàn bộ Controller và API phải tuân thủ chuẩn sau:

1. **Chuẩn hóa Đầu ra API (Response):** 
   - Không trả về `Map` hay Entity thô. Bắt buộc tạo một class `ApiResponse<T>` dùng chung cho toàn dự án gồm: `status` (int), `message` (String), `data` (T). Gọi ở mọi controller: `return ResponseEntity.ok(new ApiResponse<>(data, "Thành công"));`
2. **Quản lý Lỗi (Exception Handling) tập trung:**
   - Cấm viết `try-catch` lắt nhắt trong Controller. Phải tạo một file `@RestControllerAdvice` duy nhất để tóm mọi Exception ném ra từ Service và trả về mã lỗi 400/500 kèm tin nhắn chuẩn.
3. **Phân chia ranh giới Service (Quy tắc "Không sửa file của người khác"):**
   - **Phong** làm `Issue`, **Kiệt** làm `Sprint`. Nếu Kiệt cần cập nhật Issue, Kiệt KHÔNG ĐƯỢC viết code vào `SprintServiceImpl`, mà phải gọi API/hàm do Phong đã viết sẵn bên `IssueService` (VD: Hàm `moveIssue()`).
4. **Luồng Git (Git Flow) cho Team:**
   - Mỗi người tự tạo nhánh riêng: `feature/phong-board`, `feature/kiet-sprint`.
   - Mỗi sáng trước khi code: Chạy `git pull origin develop`. Ai bị báo lỗi đỏ tự resolve ở máy mình trước. Hết ngày mới gộp nhâm.

---

## 🚀 1. Kéo thả & Quản lý Công việc (Issues) - **[Phụ trách: Phong]**
- [ ] **Kéo thả Issue chuẩn LexoRank:** API `PUT /api/issues/{id}/move` CHUNG đã được viết. Nhiệm vụ của Phong là tích hợp `dnd-kit` bên Frontend màn hình Kanban, và bắn tọa độ `newBoardPosition`, `newStatusId` để thẻ nhảy cột chuẩn.
- [ ] **Quản lý Cột thẻ (Di chuyển Column giống Jira):** Không chỉ kéo thả Issue, cần tính năng kéo thả Cột (Status) để cấu hình workflow.
- [ ] **Tạo Issue (Nhanh):** Nút "+ Tạo issue" dưới cột Kanban cần là ô textarea inline.
- [ ] **Sub-tasks (Công việc con) & CRUD:** Thiết kế và nối API cho phần Task con bên trong màn `IssueDetailDrawer`.
- [ ] **Story Points và Due Date:** Form nhập Điểm ảo và Hạn chót ở khung chi tiết.

## 🏃‍♂️ 2. Quản trị Sprint (Backlog) - **[Phụ trách: Kiệt]**
- [ ] **Kéo thả Backlog ↔ Sprint:** Tái sử dụng chung API `PUT /api/issues/{id}/move` đã có. Khi Kiệt bốc Issue ném vào Sprint thì chỉ cần cài tham số `{newSprintId}` (hoặc `{removeFromSprint}` nếu đẩy ném ra ngoài). Không cần viết lại backend!
- [ ] **RUD (Read - Update - Delete):** Bổ sung nút sửa tên, thời gian, và xóa các Sprint bị lỗi.
- [ ] **Chức năng "Hoàn thành Sprint":** Logic chuyển giao các Issue chưa hoàn thành vắt sang Sprint tới, và thay đổi trạng thái của thẻ Sprint.

## 👥 3. Nhân sự, Phân quyền & Vai trò (Team Members & Roles) - **[Phụ trách: Thành viên 3 / Nhóm Hệ thống]**
*(⚠️ Lưu ý ranh giới: Nhóm này chịu trách nhiệm "gác cổng". Cần viết 1 bộ Security Interceptor (AOP / Spring Security) để mọi Request của Phong và Kiệt chạy qua đều bị kiểm tra quyền, thay vì bắt Phong/Kiệt tự nhúng code check quyền vào API của họ).*

- [ ] **Khuyết chỗ chọn Role (Vai trò) khi mời người mới:** Bổ sung `<select>` Role (`Developer`, `Viewer`, `Scrum Master`) vào form mời thành viên.
- [ ] **Luồng kiểm tra Quyền (Permission Control) chưa hoạt động:** Định nghĩa rõ Role nào được làm gì (VD: Viewer không được hiện nút Xóa Issue). Viết Annotation kiểu `@CheckProjectPermission` cắm lên đầu các Controller.
- [ ] **Lỗi hiển thị / Mapping Member:** Ráp lại UI danh sách thành viên cho đúng dữ liệu từ DB (hiện đủ avatar / role).

## 🏷️ 4. Quản lý Tag/Nhãn (Labels) - **[Phụ trách: Thành viên 4 / Nhóm Core Data]**
*(⚠️ Lưu ý ranh giới: Nhóm này viết API CRUD Label độc lập. Khi hoàn thành, cung cấp API `GET /api/labels` để Phong tự động nhúng vào mảng Dropdown bên trong `IssueDetailDrawer` của Phong).*

- [ ] **Thiếu CRUD cho Label:** Cần 1 màn hình quản lý chung (Setting > Labels) để Tạo / Đổi màu / Xóa nhãn.
- [ ] **Gắn Label vào Issue:** Xử lý logic bảng trung gian `@ManyToMany` (issue_labels). Cho phép thêm/xóa tag trên từng thẻ Issue tĩnh.

## 🖼️ 5. Cài đặt Dự án & Lưu trữ (Project Settings & Storage) - **[Phụ trách: Thành viên 3 / Nhóm Hệ thống]**
*(⚠️ Lưu ý ranh giới: Tránh code upload rác. Phải viết 1 class `FileStorageService` chung duy nhất. Bất kể sau này Avatar hay Đính kèm (Attachment) cần lưu file, đều gọi chung 1 service này).*

- [ ] **Lưu ảnh (Avatar Upload System):** Backend cần nhận `MultipartFile` và tải lên ổ cứng Server hoặc Cloudinary/S3. Trả về String URL.
- [ ] **Cập nhật Setting:** Trang `ProjectSettingsPage` cần nối API cập nhật thông tin thực (Tên, Key, Avatar) thay vì chỉ Toast ảo.

## 📈 6. Báo cáo & Thống kê (Reports) - **[Phụ trách: Nhóm Frontend + SQL]**
*(⚠️ Lưu ý ranh giới: Mảng này TUYỆT ĐỐI không được gọi lệnh Update/Delete. Chỉ viết các câu Query/JPA `@Query` thuần `SELECT ... GROUP BY` siêu tốc độ để vẽ biểu đồ, tránh làm chậm Service của Kiệt/Phong).*

- [ ] **Báo cáo Dữ liệu giả (Mock UI):** Biểu đồ Velocity / Burndown đang tĩnh. Cần viết SQL đếm số Issue theo Status và Sprint để nhúng vào Chart.js / Recharts.

---

## 💎 7. NHỮNG "VŨ KHÍ ẨN" TRONG BACKEND (FEATURES NÂNG CAO)
*(Phần này phân chia tùy theo nguồn lực còn lại của Team - Sprint 2 hoặc Sprint 3)*

- [ ] **🤖 Tích hợp AI (Trí tuệ Nhân tạo):** UI chưa có nút Gen Mô tả / Subtask tự động bằng AI dù DB có bảng `AiUsageLog`.
- [ ] **🔗 Mối quan hệ Chéo (Issue Links):** Bảng `IssueLink` (Blocks / Relates to) có ở DB, Frontend cần code mục *Linked Issues* trong Drawer.
- [ ] **⏱️ Lịch sử Hoạt động (Audit Log):** Bảng `IssueActivityLog`. Ai đã làm gì lúc mấy giờ? Cần đổ ra Tab "Lịch sử" của Issue.
- [ ] **📎 Đính kèm Tệp (Attachments):** Dùng chung `FileStorageService` ở mục 5 để sinh nút Đính kèm PDF/Ảnh.
- [ ] **🔔 Notification (Quả chuông thông báo) + STOMP:** Chuông góc trên chưa nảy số đỏ khi bị gán Task.
- [ ] **⭐ Đánh dấu Yêu thích (User Stars):** Cắm cờ Dự án yêu thích đẩy lên thanh Header Nav.

---

## 📊 8. GIAO DIỆN TIMELINE / GANTT CHART
*(UI tui đã giúp bạn code bằng CSS biến nội bộ xong rồi, chuẩn 100% Jira Layout! Dev chỉ cần làm Backend)*

- [ ] **Thêm `startDate` (Cực Kỳ Quan Trọng):** Backend hiện chỉ có `dueDate` (Ngày đến hạn), cấu hình thiếu mốc bắt đầu. **BẮT BUỘC** bổ sung `@Column startDate` vào `Issue.java` để UI Timeline có tọa độ ngõ ra.
- [ ] **Ráp API Data thực:** Thay thế mảng `mockData` tĩnh tui viết ở `ProjectTimelinePage` bằng data lấy từ API Fetch `Issue` (Sắp xếp theo Parent-Child Epic).
- [ ] **Vẽ Dây Dependency (Mũi tên liên kết):** Dựa vào data từ bảng `IssueLink` (Mục 7) để tính toán vẽ đường dẫn cong ngang nối 2 mép thanh Task trên biểu đồ.

---
**💡 Gợi ý tiến độ (Sprint Planning) cho Developer:**
Nên ưu tiên giải quyết **Kéo thả thả LexoRank**, **Tạo Issue nhanh** và **Sửa Sprint** để hoàn trả lại logic vòng đời cơ bản nhất của một hệ thống Agile. Các tính năng như Upload Ảnh hay AI, Biểu đồ thống kê nên dành cho Giai đoạn (Phase) sau vì cấu hình Infrastructure tốn khá nhiều thời gian.
