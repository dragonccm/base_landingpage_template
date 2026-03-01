# AGENTS.md — NextCMS Working Agreement

Tài liệu này dành cho agent/dev khi làm việc trong dự án **nextcms**.
Mục tiêu: thay đổi an toàn, dễ deploy, dễ bảo trì và nhất quán theo định hướng hiện tại.

## 1) Mục tiêu sản phẩm

- CMS quản trị landing page (theme/content)
- Quản lý media, contacts, users
- Backup dữ liệu + uploads
- Audit log cho thao tác quản trị

## 2) Nguyên tắc bắt buộc khi sửa code

1. **Không phá API contract hiện có** nếu chưa có yêu cầu rõ ràng.
2. Mọi thay đổi liên quan admin phải có:
   - kiểm tra quyền (`requireAdmin` hoặc `requireSuperAdmin`)
   - audit log nếu là thao tác quản trị quan trọng
3. Chỉnh schema DB theo hướng **compatible**:
   - ưu tiên `CREATE TABLE IF NOT EXISTS`
   - `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`
4. Không commit dữ liệu runtime:
   - `backups/`
   - `public/uploads/`
   - `.next/`
   - `.env.local`
5. Nếu có script/migration mới: phải cập nhật docs (`DEPLOYMENT.md`).

## 3) Quy ước phân quyền hiện tại

- `admin`: vận hành nội dung + backup + xem audit/users
- `super_admin`: thêm/xóa/chặn user (quyền nhạy cảm)

Nếu đổi policy quyền, bắt buộc cập nhật:
- API route tương ứng
- `DEPLOYMENT.md` mục phân quyền

## 4) Quy trình thay đổi chuẩn

1. Sửa code
2. Kiểm tra local:
   - `npm run migrate:audit`
   - `npm run dev` (smoke test UI/API)
3. Trước deploy:
   - `npm run build`
4. Sau deploy:
   - `npm run verify:deploy`

## 5) Tài liệu chuẩn cần đọc

- `DEPLOYMENT.md` — quy trình deploy/rollback/verify
- `scripts/migrate-audit.mjs` — migration audit log
- `scripts/verify-deploy.mjs` — kiểm tra sau deploy

## 6) Checklist PR/commit

- [ ] Không có file runtime/data rác trong commit
- [ ] API nhạy cảm có guard role
- [ ] Có audit log cho thao tác admin quan trọng
- [ ] Docs đã cập nhật
- [ ] Verify deploy pass

## 7) Ưu tiên khi có xung đột

1. An toàn dữ liệu
2. Tính ổn định deploy
3. Tương thích ngược
4. Trải nghiệm admin UI
