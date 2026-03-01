# Release Checklist

Checklist này dùng cho mỗi lần release/deploy production.

## A. Chuẩn bị

- [ ] Xác nhận branch phát hành đúng (main/master)
- [ ] Freeze thay đổi ngoài phạm vi release
- [ ] Backup database
- [ ] Kiểm tra `DATABASE_URL`, `JWT_SECRET` trên môi trường deploy

## B. Build & Migrate

```bash
git pull
npm install
npm run migrate:audit
rm -rf .next
npm run build
```

- [ ] Migration chạy thành công
- [ ] Build thành công

## C. Deploy

- [ ] Restart service (PM2/systemd/container)
- [ ] App health check OK

## D. Verify sau deploy

```bash
npm run verify:deploy
```

Với verify admin đầy đủ:

```bash
VERIFY_BASE_URL=https://your-domain.com \
VERIFY_ADMIN_EMAIL=admin@example.com \
VERIFY_ADMIN_PASSWORD='your-password' \
npm run verify:deploy
```

- [ ] `/api/landing` OK
- [ ] `/api/settings` OK
- [ ] `/api/admin/backup` GET/POST OK
- [ ] `/api/admin/audit-logs` OK

## E. Nghiệm thu chức năng trọng điểm

- [ ] Đăng nhập admin
- [ ] Tạo backup thành công
- [ ] Xóa backup thành công
- [ ] Audit log hiển thị thao tác mới

## F. Sau phát hành

- [ ] Tag version (ví dụ `v1.0.0`)
- [ ] Ghi release note ngắn
- [ ] Theo dõi log lỗi 15-30 phút đầu
