# Jira Clone

> **Môn:** Công nghệ phần mềm TC5 · **Nhóm:** 6 thành viên  
> **Stack:** Spring Boot 4 · React 19 + Vite · MySQL

---

## 🚀 Hướng Dẫn Chạy Project

### Backend
```bash
cd jira-clone-backend
cp .env.example .env       # Copy và điền thông tin thật vào .env
mvn spring-boot:run        # Chạy trên port 8080
```

### Frontend
```bash
cd jira-clone-frontend
npm install
npm run dev                # Chạy trên port 3000
```

### Yêu cầu môi trường
| Công cụ | Phiên bản |
|---|---|
| Java | 17+ |
| Maven | 3.8+ |
| MySQL | 8.0+ |
| Node.js | 18+ |

---

## 🗂️ Cấu Trúc Project

```
jira-clone/
├── jira-clone-backend/              # Spring Boot 4 REST API
│   ├── .env.example                 # Template biến môi trường
│   └── src/main/java/com/jira/clone/
│       ├── controllers/             # REST Controllers
│       ├── services/                # Business logic
│       ├── models/entities/         # 21 JPA Entities
│       ├── repositories/            # Spring Data JPA
│       └── security/                # JWT + Filter
│
└── jira-clone-frontend/             # React 19 + Vite
    └── src/
        ├── pages/                   # Trang giao diện
        ├── components/              # Components tái sử dụng
        └── services/api.js          # API calls
```

---

## 📋 Kế Hoạch Nhóm

Xem chi tiết tại: **[KeHoachChiaViecCho6nguoi.md](./KeHoachChiaViecCho6nguoi.md)**

---

## 🔑 Biến Môi Trường

Tạo file `.env` từ `.env.example` trong thư mục `jira-clone-backend/`:

| Biến | Mô tả |
|---|---|
| `DB_URL` | Chuỗi kết nối MySQL |
| `DB_USERNAME` | Username MySQL |
| `DB_PASSWORD` | Password MySQL |
| `JWT_SECRET` | Khóa bí mật ký JWT (≥64 ký tự) |
| `GOOGLE_CLIENT_ID` | Google OAuth2 Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 Client Secret |
| `BREVO_API_KEY` | API key Brevo (gửi email OTP) |
| `BREVO_SENDER_EMAIL` | Email đã verify trên Brevo |
