# User API Testing Guide

## 🔧 API Endpoints

### Public Routes
- `POST /api/users/login` - Đăng nhập

### Protected Routes (cần authentication)
- `POST /api/users/logout` - Đăng xuất
- `GET /api/users/profile` - Lấy profile của user hiện tại
- `GET /api/users/classes` - Lấy danh sách lớp của user hiện tại
- `POST /api/users/change-password` - Đổi mật khẩu

### Admin Routes (cần admin role)
- `GET /api/users` - Lấy danh sách tất cả users
- `POST /api/users` - Tạo user mới
- `PUT /api/users/:id` - Cập nhật user
- `DELETE /api/users/:id` - Xóa user (soft delete)

### Admin/Teacher Routes
- `GET /api/users/:id` - Lấy thông tin user theo ID

## 📝 Sample API Calls

### 1. Login
```bash
POST /api/users/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "123456"
}
```

### 2. Create User (Admin only)
```bash
POST /api/users
Content-Type: application/json
Cookie: connect.sid=...

{
  "ten": "Nguyen Van A",
  "email": "student@example.com",
  "password": "123456",
  "role": "sinhVien"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tạo người dùng thành công",
  "data": {
    "id": "SV24001",
    "ten": "Nguyen Van A", 
    "email": "student@example.com",
    "role": "sinhVien",
    "status": true
  },
  "timestamp": "2024-11-21T10:30:00.000Z"
}
```

**Auto-generated ID format:**
- Admin: `AD24001`, `AD24002`, ...
- Giảng viên: `GV24001`, `GV24002`, ...
- Sinh viên: `SV24001`, `SV24002`, ...

### 3. Get All Users (Admin only)
```bash
GET /api/users?page=1&limit=10&role=sinhVien&search=nguyen
Cookie: connect.sid=...
```

### 4. Update User (Admin only)
```bash
PUT /api/users/SV24001
Content-Type: application/json
Cookie: connect.sid=...

{
  "ten": "Nguyen Van B",
  "status": true
}
```

### 5. Change Password (Authenticated user)
```bash
POST /api/users/change-password
Content-Type: application/json
Cookie: connect.sid=...

{
  "currentPassword": "123456",
  "newPassword": "newpassword123"
}
```

### 6. Get User Classes (Authenticated user)
```bash
GET /api/users/classes?hocKyId=HK001&page=1&limit=5
Cookie: connect.sid=...
```

## 🔒 Authentication Flow

1. **Login**: POST to `/api/users/login` with email/password
2. **Session**: Server returns session cookie in response
3. **Authenticated Requests**: Include session cookie in subsequent requests
4. **Logout**: POST to `/api/users/logout` to destroy session

## ✅ Expected Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...},
  "timestamp": "2024-11-21T10:30:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errorCode": "ERROR_CODE",
  "timestamp": "2024-11-21T10:30:00.000Z",
  "path": "/api/users/login"
}
```

### Pagination Response
```json
{
  "success": true,
  "message": "Success message",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  },
  "timestamp": "2024-11-21T10:30:00.000Z"
}
```