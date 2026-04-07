# DANH SÁCH CÁC TÍNH NĂNG CHƯA HOÀN THIỆN (JIRA CLONE)

Dưới đây là bảng tổng hợp chi tiết tất cả những chức năng, component giao diện đang "nằm không", chưa hoạt động hoặc chưa được lập trình xong trong dự án của bạn (áp dụng cho cả Frontend và Backend). 

---

## 💻 1. FRONTEND (Giao diện React.js)

### 👤 Trang Hồ sơ cá nhân (`ProfilePage.jsx`)
- [ ] **Nút "Thay đổi ảnh":** Đang có sẵn giao diện nhưng `onClick` bỏ trống. Chưa có pop-up chọn ảnh hay liên kết gọi API thay đổi Avatar. Khung Avatar vẫn chỉ đang khoét tròn và in ra chữ cái đầu tiên của Họ Tên.
- [ ] **Tab "Tài khoản liên kết":** Hiện chỉ in ra một dòng chữ báo hiệu Đang thi công. 
- [ ] **Tab "Thông báo":** Hiện chỉ in ra một dòng chữ báo hiệu Đang thi công.

### 🔍 Thanh Điều Hướng & Tìm Kiếm Cụm (Global Header `Layout.jsx`)
- [ ] **Nút Home/Về Danh Sách:** Nhấn chữ "Jira Clone" hoặc Icon ở góc trái trên cùng của Header chưa Navigate điều hướng thoát ra khỏi dự án hiện tại để quay về trang `/projects`.
- [ ] **Global Search (Tìm kiếm toàn cục):** Ô "Tìm kiếm..." ngay giữa Header hiện vẫn là Input rỗng. (Giống như ảnh bạn gửi: bấm vào phải bung ra Popup với Cột trái là Recently Viewed, Recent Projects, Cột phải là bộ lọc Filter by Project, Filter by Assignee).

### 👥 Quản lý Nhân Sự (`PeoplePage.jsx`)
- [ ] **Bộ lọc tìm kiếm Users:** Trang liệt kê người dùng của hệ thống đang thiếu hụt một thanh tìm kiếm (Search Bar), chưa có Dropdown Lọc theo Vai trò (Role), và Lọc trạng thái (Active/Suspend).

### 📋 Bảng Kanban & Backlog (`BoardPage.jsx` & `BacklogPage.jsx`)
- [ ] **Thanh Filter Nâng Cao (Giống hệt ảnh cung cấp):** Phía trên của giao diện thiết kế Kanban/Backlog còn thiếu cả một cụm Filter Bar ngang bao gồm:
  - Chọn Sprint (Dropdown Menu để lọc công việc theo Sprint 1, Sprint 2...).
  - Nút đóng/mở "Bắt đầu Sprint" (hoặc Hoàn thành Sprint).
  - Lọc theo Người Giao (Avatar List: bấm vào cái mặt ai là hiện các Tasks của người đó + Nút thêm người).
  - Lọc theo Nhãn (Nhãn Dropdown).
  - Lọc theo Độ ưu tiên (Ưu tiên Dropdown).
  - Ô Text Input "Tìm kiếm board / issue".
- [ ] **Quản lý Vòng đời Sprint (Sprint Lifecycle):** 
  - Tại trang Backlog, thiếu giao diện bấm vào để **chỉnh sửa thông tin Sprint** (Sửa Tên, Mục tiêu, Ngày Bắt đầu/Kết thúc).
  - Thiếu API xử lý nghiệp vụ **"Hoàn thành Sprint"** (Complete Sprint) để dồn việc chưa xong sang Sprint kế tiếp.
  - Thiếu bảng quản lý **Epic Panel** nằm bên tay trái của Backlog (theo chuẩn giao diện Jira).
- [ ] **Thêm cột trạng thái mới:** Ở góc phải của Board có một cột rỗng nét đứt ghi chữ `+ Tạo cột mới` nhưng bấm vào không có tác dụng. (Backend đã có API tạo Status nhưng chưa được gọi).
- [ ] **Tạo nhanh Issue từ Cột Kanban:** Ở đáy mỗi cột con (`KanbanColumn.jsx`) có chữ `+ Tạo issue` nhưng hiện chưa có lệnh `onClick` (không bung ra khung nhập liệu nhanh giống như Backlog).
- [ ] **Trải nghiệm Real-time WebSocket:** Sau khi người dùng kéo thả thành công, bạn phải F5 (hoặc gọi lại hàm fetchBoardData mượt tay hơn chút) chứ chưa có hệ thống Websocket tự động đồng bộ bảng Kanban qua lại các thiết bị.

### 📝 Chi tiết công việc (`IssueDetailDrawer.jsx`)
- [ ] **Chọn người thực hiện (Assignee):** Hiện tại thông tin "Người báo cáo" và "Người được giao" (Assignee) chỉ đang hiển thị dạng Text đọc, chưa có ô Component `<select>` dropdown để thay đổi trực tiếp người code.
- [ ] **Thiết lập Ngày hạn (Due Date):** Chỉ hiển thị "Chưa đặt" hoặc chuỗi ngày tháng đọc được. Không có bất kỳ Date Picker nào để nhấp vào chỉnh sửa hạn chót thực tế.
- [ ] **Estimate / Story Points / Time Tracking:** Hoàn toàn thiếu mất khu vực để đánh giá Điểm ảo (Story Point) hay Log (theo dõi thời gian hoàn thành).
- [ ] **Chỉnh sửa / Xóa Bình luận:** User hiện đã tạo Cmt thành công, tuy nhiên không có cách nào bôi đen để Sửa hay Xóa đi bình luận của chính mình.
- [ ] **Tab Lịch sử hoạt động (Activity):** Đang in ra dòng chữ *Tính năng lịch sử hoạt động đang được phát triển*. (Audit log chưa được nối).
- [ ] **Tài liệu đính kèm (Attachments):** Hoàn toàn chưa có giao diện nào để đính kèm File hay hình ảnh vào Issue / bình luận.

### ⚙️ Cài đặt Dự án (`ProjectSettingsPage.jsx`)
- [ ] **Cập nhật thông tin dự án:** Giao diện có nút "Lưu thay đổi" (Tên, Mã dự án) nhưng thực tế bên trong OnClick hiện đang là code **Mock** thả ảo `addToast('success')`, chưa gọi bất kỳ API BE `Update Project` nào.
- [ ] **Đổi Ảnh đại diện Dự án (Project Avatar):** Chưa có hệ thống Browse & Upload ảnh đại diện nổi bật cho dự án (vẫn đang fix cứng chữ cái đầu).
- [ ] **Phân quyền Thành viên:** Đã thêm/xóa được thành viên trong nhóm nhưng chưa có dropdown sửa đổi "Vai trò" (Ví dụ đổi từ Developer -> Manager) của thành viên.

---

## ⚙️ 2. BACKEND (Spring Boot)

### 📁 Upload File (Bộ nhớ lưu trữ Media)
- [ ] **Chưa có hệ thống lưu File:** Backend hiện tại thiếu toàn bộ dịch vụ (Service) hỗ trợ nhận file định dạng đa phương tiện (ví dụ: MultipartFile).
- [ ] **Upload Avatar:** API Update Profile có nhận `avatarUrl` (chuỗi), tuy nhiên để đổi được ảnh, bạn thiếu một API riêng dạng `POST /api/users/upload-avatar` (Tải ảnh vào resource nội bộ hoặc Amazon S3/Cloudinary rồi trả về URL cấu hình).
- [ ] **API Đính kèm File:** `CollaborationController.java` đã có API *Lấy* danh sách file `getAttachments` nhưng lại khuyết API *Tạo mới* `POST /api/attachments` để người dùng nhúng file vào Database (Cần map bytes hoặc upload lên server riêng).

### 🔄 WebSocket (STOMP)
- [ ] **Thiếu WebSockets config:** Kanban đang chạy ở nền tản tĩnh (REST API + Polling tay). Để JIRA thực sự "Pro", Backend cần sử dụng `spring-boot-starter-websocket` (cấu hình STOMP) để push thông điệp "Thay đổi Trạng thái Issue" xuống tất cả client đang mở Board tương ứng tức thời.

### 🔍 Search & Notification:
- [ ] **Thông báo (Notification Service):** Bảng CSDL hoặc Endpoint để đẩy Noti (chuông báo) đến người dùng (như "Ai đó vừa giao Việc X cho bạn") hoàn toàn chưa có.

---

**Lời khuyên từ tôi:** 
Bạn nên ưu tiên làm phần **Fix Nút (Tạo Cột, Giao Việc trong Kanban)** trước để Flow App hoàn thiện 100%. Các tính năng như Upload File hay WebSocket nên để vào đợt nâng cấp (Version 2) vì tốn khá nhiều thời gian setup môi trường mạng và bộ nhớ. 

_Bạn muốn bắt tay vào làm giải quyết vấn đề nào đầu tiên trong danh sách trên? Hãy bảo tôi nhé!_
