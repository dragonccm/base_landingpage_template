# NextCMS Deployment Guide (Backup + Audit Log)

Hướng dẫn đầy đủ để deploy bản có **Backup Manager** và **Audit Log** ổn định.

---

## 1) Yêu cầu hệ thống

- Node.js: >= 18 (khuyến nghị 20/22)
- PostgreSQL: >= 13
- Có quyền tạo/sửa bảng trong DB
- Server có quyền ghi thư mục project (để tạo `backups/`)

---

## 2) Biến môi trường bắt buộc

Tạo `.env.production` (hoặc cấu hình qua hệ thống deploy):

```env
NODE_ENV=production
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require
JWT_SECRET=your-strong-secret-at-least-32-chars
```

> Gợi ý: dùng `sslmode=verify-full` nếu hạ tầng hỗ trợ đúng chứng chỉ.

### 2.1 Biến môi trường cho script verify

Không bắt buộc cho runtime app, nhưng nên có cho bước verify sau deploy:

```env
VERIFY_BASE_URL=https://your-domain.com
VERIFY_ADMIN_EMAIL=admin@example.com
VERIFY_ADMIN_PASSWORD=your-password
```

- Nếu không set `VERIFY_ADMIN_EMAIL/PASSWORD`, script chỉ kiểm tra public API.
- Không commit credentials verify vào git.

---

## 3) Cập nhật code

```bash
git pull
npm install
```

---

## 4) Chạy migration audit log (bắt buộc)

Đã có script tự động:

```bash
npm run migrate:audit
```

Script sẽ:
- Tạo bảng `audit_logs` nếu chưa có
- Bổ sung cột còn thiếu (schema cũ)
- Cố gắng sửa dữ liệu `id` bị null/rỗng
- Đảm bảo có primary key `audit_logs_pkey`
- In danh sách cột để xác nhận

---

## 5) Build sạch và chạy

```bash
rm -rf .next
npm run build
npm run start
```

Windows CMD:

```bat
rmdir /s /q .next
npm run build
npm run start
```

---

## 6) Nếu dùng PM2

```bash
pm2 start npm --name nextcms -- start
pm2 save
```

Khi cập nhật phiên bản:

```bash
git pull
npm install
npm run migrate:audit
rm -rf .next
npm run build
pm2 restart nextcms
```

---

## 7) Checklist kiểm tra sau deploy

### 7.0 Pre-flight trước khi bấm deploy
- Đã backup DB hiện tại
- Đã xác nhận `DATABASE_URL` đang trỏ đúng môi trường production
- Đã xác nhận role tài khoản vận hành (`admin` hoặc `super_admin`)
- Đã có plan rollback (commit/tag ổn định)

### 7.1 Login + Admin
- `/login` hoạt động
- `/admin` mở bình thường

### 7.2 Backup Manager
- Tab **Backup** hiển thị danh sách backup
- Bấm **Create Backup** trả về thành công
- Bấm **Delete backup** thành công
- Thư mục `backups/<timestamp>` có `database.json`

### 7.3 Audit Log
- Tab **Audit** load danh sách log
- Thực hiện 1 thao tác admin (ví dụ cập nhật landing)
- Reload tab Audit thấy record mới

### 7.4 API smoke test (đã đăng nhập)
- `GET /api/admin/backup` → 200
- `POST /api/admin/backup` → 200
- `GET /api/admin/audit-logs?limit=50` → 200

---

## 8) Phân quyền hiện tại

- `GET /api/admin/users`: admin + super_admin
- `POST /api/admin/users`: super_admin
- `PATCH /api/admin/users`: super_admin

- `GET /api/admin/backup`: admin + super_admin
- `POST /api/admin/backup`: admin + super_admin
- `DELETE /api/admin/backup`: admin + super_admin

- `GET /api/admin/audit-logs`: admin + super_admin

> Nếu muốn chặt hơn, có thể đổi lại delete backup/audit log thành `super_admin`.

### 8.1 Ma trận thao tác nhanh

| Tác vụ | admin | super_admin |
|---|---:|---:|
| Xem dashboard/admin data | ✅ | ✅ |
| Tạo backup | ✅ | ✅ |
| Xóa backup | ✅ | ✅ |
| Xem audit logs | ✅ | ✅ |
| Tạo user mới | ❌ | ✅ |
| Block/Activate/Delete user | ❌ | ✅ |

---

## 9) API smoke test thủ công (tuỳ chọn)

Sau khi login trên trình duyệt, có thể test nhanh bằng tab Network hoặc dùng công cụ API.

Các endpoint quan trọng cần trả về 200:
- `GET /api/admin/landing`
- `GET /api/admin/settings`
- `GET /api/admin/backup`
- `POST /api/admin/backup`
- `GET /api/admin/audit-logs?limit=20`

Nếu endpoint trả 401/403:
- kiểm tra cookie đăng nhập còn hiệu lực
- logout/login lại
- kiểm tra role user trong DB

---

## 10) Troubleshooting

### Lỗi `column actor_id does not exist`
Nguyên nhân: DB schema cũ chưa migrate.

Cách xử lý:
```bash
npm run migrate:audit
```

### Lỗi `Cannot find module './682.js'`
Nguyên nhân: cache `.next` lỗi sau đổi route/module.

Cách xử lý:
```bash
rm -rf .next
npm run dev
# hoặc production: npm run build && npm run start
```

### Lỗi `403 Forbidden`
Nguyên nhân phổ biến:
- Chưa đăng nhập
- Token hết hạn
- Role không đủ quyền

Cách xử lý:
- Logout/login lại
- Kiểm tra role user trong bảng `users`

### Lỗi `ECONNRESET / ECONNREFUSED` với PostgreSQL
Nguyên nhân: DB không reachable hoặc SSL cấu hình sai.

Cách xử lý:
- Kiểm tra `DATABASE_URL`
- Kiểm tra firewall/network
- Kiểm tra `sslmode` phù hợp

---

## 11) Verify tự động sau deploy (khuyến nghị)

Đã có script kiểm tra nhanh endpoint quan trọng:

```bash
# chỉ test public endpoints
npm run verify:deploy

# test cả admin endpoints
VERIFY_BASE_URL=https://your-domain.com \
VERIFY_ADMIN_EMAIL=admin@example.com \
VERIFY_ADMIN_PASSWORD='your-password' \
npm run verify:deploy
```

Windows PowerShell:

```powershell
$env:VERIFY_BASE_URL='https://your-domain.com'
$env:VERIFY_ADMIN_EMAIL='admin@example.com'
$env:VERIFY_ADMIN_PASSWORD='your-password'
npm run verify:deploy
```

Script sẽ check:
- Public: `/api/landing`, `/api/settings`
- Admin (nếu có credentials): login, landing/settings admin, backup GET/POST, audit logs, users

Nếu có endpoint fail script sẽ exit code 1 để gắn CI/CD.

---

## 12) Quy trình deploy chuẩn (khuyến nghị)

```bash
git pull
npm install
npm run migrate:audit
rm -rf .next
npm run build
pm2 restart nextcms
npm run verify:deploy
```

---

## 13) Rollback nhanh

Nếu deploy lỗi:
1. Checkout commit ổn định gần nhất
2. `npm install`
3. `rm -rf .next && npm run build`
4. Restart service

> Migration audit đã thêm cột/bảng theo hướng tương thích ngược, rollback app thường không bị ảnh hưởng dữ liệu.

---

## 14) Ghi chú vận hành

- Backup hiện lưu ở thư mục local `backups/`.
- Nên có cron đồng bộ thư mục `backups/` sang object storage/S3.
- Nên bật log rotation cho tiến trình Node/PM2.

---

Nếu cần, mình có thể viết thêm:
- cron backup hằng ngày,
- export audit log ra CSV.
