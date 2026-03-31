# DANH SÁCH CÁC TÍNH NĂNG CHƯA HOÀN THIỆN & ROADMAP DỰ ÁN (JIRA CLONE)

Dưới đây là bảng phân tích toàn diện dựa trên cả **Giao diện hiện tại (UI)** và **Cấu trúc Cơ sở dữ liệu chìm (Backend Entities)**. Bạn đã thiết kế backend rất đồ sộ và tiệm cận Jira thật, nhưng frontend vẫn còn bỏ ngỏ khá nhiều "mỏ vàng" này.

---

## 🚀 1. Kéo thả & Quản lý Công việc (Issues)
- [ ] **Kéo thả Issue chuẩn LexoRank:** Mặc dù bạn đã có trường `boardPosition` ở entity `Issue` dùng để lưu trữ thuật toán sắp xếp đa tầng (LexoRank), nhưng hiện tại Frontend khi thả chuột không gọi API để cập nhật vị trí này, dẫn tới việc tải lại trang là mất trật tự.
- [ ] **Quản lý Cột thẻ (Di chuyển Column giống Jira):** Không chỉ kéo thả Issue, người dùng còn cần chức năng kéo thả toàn bộ Cột (Status) sang trái/phải để cấu hình quy trình làm việc (Workflow).
- [ ] **Tạo Issue (Nhanh):** Nút "+ Tạo issue" ở dưới cùng mỗi cột Kanban hiện chưa làm gì, cần form nhập text nhanh thay vì bắt mở modal bự.
- [ ] **Sub-tasks (Công việc con) & CRUD:** Dù backend đã cấu hình quan hệ `@ManyToOne parentIssue` và `@OneToMany subtasks`, nhưng bên màn hình `IssueDetailDrawer` vẫn chưa lồng giao diện để người dùng có thể Thêm (C), Đọc (R), Sửa (U), Xóa (D) hay phân công Task con.
- [ ] **Story Points và Due Date:** Trường `estimatePoints` (Điểm ảo cho Sprint) và `dueDate` (Ngày hạn chót) có sẵn trong DB nhưng UI lúc bấm vào chi tiết Công việc không có ô nhập liệu/hiển thị.

## 🏃‍♂️ 2. Quản trị Sprint (Backlog)
- [ ] **RUD (Read - Update - Delete):** Bạn mới chỉ làm được bước "Tạo Sprint" (Create). Còn màn hình để bấm vào sửa tên Sprint, đổi ngày Bắt đầu / Kết thúc, hay Xóa một Sprint bị tạo nhầm thì hoàn toàn chưa có.
- [ ] **Chức năng "Hoàn thành Sprint":** Thiếu logic cực kỳ quan trọng của Agile: Nút "Complete Sprint" đóng băng Sprint hiện tại và tạo pop-up hỏi người dùng muốn đẩy các Issue chưa hoàn thành (Todo/In Progress) sang Sprint mới hay ném trả lại về Backlog.

## 👥 3. Nhân sự, Phân quyền & Vai trò (Team Members & Roles)
- [ ] **Lỗi hiển thị / Mapping Member:** Dữ liệu ở bảng `ProjectMember` trong Backend đã lưu đủ các thành viên và có thể cả Role (Vai trò), nhưng khi đẩy ra API và ráp lên React, hệ thống hiển thị bị lệch (không đúng danh sách DB, hoặc không hiện được avatar/role chuẩn xác).
- [ ] **Khuyết chỗ chọn Role (Vai trò) khi mời người mới:** Trong Form/Pop-up gõ Email hoặc Username mời người mới vào dự án, bạn ĐANG THIẾU một cái Dropdown ( `<select>` ) để ấn định quyền luôn cho họ (VD: Chọn họ làm `Developer`, hay `Viewer`, hay `Scrum Master`).
- [ ] **Luồng kiểm tra Quyền (Permission Control) chưa hoạt động:** Bạn đã có bảng `Role` và `ProjectMember` ở DB, nhưng API chưa chặn quyền. Ví dụ: Một người chỉ là `Viewer` nhưng vẫn đang gọi được API xóa Issue, hoặc nút "Xóa" chưa bị ẩn đi đối với mảng UI của họ. Cần định nghĩa rõ các Role được làm gì và ứng dụng trực tiếp vào UI.

## 🏷️ 4. Quản lý Tag/Nhãn (Labels)
- [ ] **Thiếu CRUD cho Label:** Nhãn chức năng mới dừng ở mảng "Tạo". Không có chỗ quản lý chung để Xóa hay Đổi màu (URD) nhãn.
- [ ] **Gắn Label vào Issue:** Mối quan hệ `@ManyToMany` ở bảng `issue_labels` chưa được tận dụng. Trong thẻ Chi tiết Issue hoàn toàn không có Component Select/Dropdown nào để đính thẻ Bug vàng/đỏ... lên Issue.

## 🖼️ 5. Cài đặt Dự án & Lưu trữ (Project Settings & Storage)
- [ ] **Lưu ảnh (Avatar Upload System):** Hiện tại hệ thống KHÔNG có nơi để chứa tệp vật lý. Việc "Đổi ảnh đại diện dự án" ở Setting chỉ là đổi UI tĩnh. Cần bổ sung logic Backend nhận `MultipartFile` và tải lên ổ cứng Server hoặc cấu hình Amazon S3/Cloudinary, sau đó mới cập nhật URL vào DB.
- [ ] **Cập nhật Setting:** Trang `ProjectSettingsPage` khi ấn Lưu vẫn chỉ đang thả Toast ảo (Mock), chưa nối với Backend để Update tên / Key dự án thực.

## 📈 6. Báo cáo & Thống kê (Reports)
- [ ] **Báo cáo Dữ liệu giả (Mock UI):** Màn hình biểu đồ báo cáo tốc độ (Velocity) hay Burndown chart hoàn toàn dùng thư viện vẽ tĩnh. Cần viết các truy vấn SQL `GROUP BY` đếm số Issue theo Status và theo Sprint để nhét vào biểu đồ này.

---

## 💎 7. NHỮNG "VŨ KHÍ ẨN" TRONG BACKEND BẠN CHƯA KÉO RA UI

Sau khi "soi" cấu trúc DB trong folder `models/entities`, tui phát hiện bạn đã vẽ ra một bản thiết kế cực kỳ xịn nhưng chưa hề lập trình UI cho chúng:

- [ ] **🤖 Tích hợp AI (Trí tuệ Nhân tạo):** Bạn có bảng `AiUsageLog` và `ProjectAiConfig`. Đây là mỏ vàng! Có thể là tính năng Gen Mô tả Issue tự động hoặc Gen Subtask bằng ChatGPT, nhưng ở Frontend chưa có bất kỳ cái nút lấp lánh AI nào.
- [ ] **🔗 Mối quan hệ Chéo (Issue Links):** Bảng `IssueLink`. Jira rất mạnh ở vụ: "Task A chặn Task B" (Blocks) hoặc "Liên quan đến". Backend có rồi, Frontend cần khu vực *Linked Issues*.
- [ ] **⏱️ Lịch sử Hoạt động (Audit Log):** Bảng `IssueActivityLog`. Ai đã chuyển trạng thái từ Todo sang In Progress vào lúc mấy giờ? Dữ liệu log đã có thiết kế, nhung Tab "Lịch sử" trong IssueDetail chỉ xả ra chữ "Đang phát triển".
- [ ] **📎 Đính kèm Tệp (Attachments):** Bảng `Attachment`. Khi comment hay viết mô tả, người dùng cần nút Kẹp giấy để đính kèm File PDF/Ảnh. Do chưa xây Storage cho Ảnh dự án (ở mục 5) nên Attachment cũng đang bị " đóng băng".
- [ ] **🔔 Notification (Quả chuông thông báo):** Bảng `Notification` kết hợp WebSockets/STOMP. Ai đó vừa gán việc cho bạn, quả chuông góc trên bên phải chưa nảy số đỏ và chưa có bảng popup thông báo kéo xuống.
- [ ] **⭐ Đánh dấu Yêu thích (User Stars):** Bảng `UserStar`. Chức năng cắm Cờ/Sao vàng lưu lại Dự án/Filter hay dùng (để cho lên phần Favorite của Sidebar/Header Navbar).

---

## 📊 8. PHÂN TÍCH KHẢ THI: XÂY DỰNG GIAO DIỆN TIMELINE / GANTT CHART

Dựa vào việc "soi" cấu trúc Entity Backend của bạn hiện tại, tui đánh giá khả năng bạn tự code được màn hình Timeline (như Jira Plan) như sau:

### ⏳ 1. Trục thời gian (Thanh ngang bắt đầu & Kết thúc)
Biểu đồ Timeline cần vẽ các thanh ngang chạy dài trên lịch.
- **Bạn đã có:** Cột `dueDate` (Ngày đến hạn) trong entity `Issue.java`.
- **Bạn đang THIẾU:** Hoàn toàn **chưa có cột `startDate`** (Ngày bắt đầu) ở Backend! Nếu không có ngày bắt đầu, ứng dụng Frontend lấy đâu ra mốc tọa độ x=0 để vẽ chiều dài của thanh nằm ngang? 
- **Giải pháp bắt buộc:** Bạn phải vào mở `Issue.java`, thêm trường `@Column(name = "start_date") private LocalDateTime startDate;`, sau đó ALTER TABLE MySQL để cập nhật DB, và nhúng nó vào UI.

### 🌳 2. Cấu trúc cây phân cấp (Epic > Task > Sub-Task)
Timeline thường gom nhóm / lồng các thanh ngang vào bên dưới một thanh quản lý lớn (Epic) có thể bấm tam giác (Collapse/Expand).
- **Tuyệt vời! Bạn ĐÃ CÓ VŨ KHÍ NÀY:** Trong `Issue.java`, bạn đã thiết kế sẵn liên kết `@ManyToOne parentIssue` và quy ước luôn mảng `@OneToMany subtasks`. Nghĩa là bạn hoàn toàn có thể dùng nó để đẻ ra cấu trúc cây: Issue to nhất (Epic) sẽ có bảng `parent_issue_id` là null, các Issue con (Task) sẽ chỏ `parent_issue_id` vào Epic đó. Dữ liệu này dư sức để React vẽ cây phân cấp chuẩn Jira!

### 🔗 3. Mũi tên phụ thuộc (Dependency Lines - Chặn / Bị chặn)
Khi một Task A phải xong thì Task B mới được làm, Timeline xịn sẽ có một sợi dây cong nối đít thằng A sang mép đầu thằng B.
- **Hoàn hảo! Bạn ĐÃ CÓ BẢNG NÀY ĐỂ KÉO DÂY:** Nhìn vào backend, bạn đã thiết kế sẵn entity `IssueLink.java`! Nó lưu trữ chính xác quan hệ giữa `outwardIssue` và `inwardIssue` kèm theo kiểu (Type) như "blocks", "relates to". Khi làm UI Timeline, bạn chỉ việc fetch mảng này ra và dùng thư viện SVG/Canvas để vẽ các đường cung chỉ từ Task ID này sang Task ID khác cực kỳ xịn sò.

**⚡ Tổng kết Timeline:** DB của bạn đã được chuẩn bị 80% sức mạnh cho trò chơi Timeline lớn. **Yếu điểm duy nhất là bạn quên thêm `startDate` vào bảng Issue.** Chấm hết!

---
**💡 Gợi ý tiến độ (Sprint Planning) cho Developer:**
Nên ưu tiên giải quyết **Kéo thả thả LexoRank**, **Tạo Issue nhanh** và **Sửa Sprint** để hoàn trả lại logic vòng đời cơ bản nhất của một hệ thống Agile. Các tính năng như Upload Ảnh hay AI, Biểu đồ thống kê nên dành cho Giai đoạn (Phase) sau vì cấu hình Infrastructure tốn khá nhiều thời gian.
