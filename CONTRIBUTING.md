# Contributing to NextCMS

Cảm ơn bạn đã đóng góp 🎉

## 1) Workflow đề xuất

1. Tạo branch từ `main` (hoặc `master` hiện tại):
   - `feat/<name>` cho tính năng mới
   - `fix/<name>` cho bug fix
2. Code + test local
3. Cập nhật docs nếu có đổi hành vi
4. Tạo PR với mô tả rõ ràng

## 2) Chuẩn trước khi mở PR

Chạy các lệnh sau:

```bash
npm install
npm run migrate:audit
npm run build
npm run verify:deploy
```

Nếu verify admin endpoints, set env:

```bash
VERIFY_BASE_URL=http://localhost:3000
VERIFY_ADMIN_EMAIL=admin@example.com
VERIFY_ADMIN_PASSWORD=your-password
npm run verify:deploy
```

## 3) Quy ước code

- Không commit runtime artifacts (`backups/*`, `public/uploads/*`, `.next/*`, `.env.local`)
- Với API admin: phải có guard quyền phù hợp
- Thao tác quản trị quan trọng cần audit log
- Không breaking API nếu chưa có migration plan

## 4) Commit message

Khuyến nghị dùng Conventional Commits:

- `feat: ...`
- `fix: ...`
- `docs: ...`
- `chore: ...`

Ví dụ:
- `feat(admin): add backup list and delete action`
- `fix(db): make audit export tolerant with old schema`

## 5) Checklist PR

- [ ] Code build được (`npm run build`)
- [ ] Verify deploy pass (`npm run verify:deploy`)
- [ ] Cập nhật docs liên quan
- [ ] Không chứa secrets/dữ liệu runtime
