# TEMPLATE_GUIDE.md

## Mục tiêu
Bộ source NextCMS dùng làm template chuẩn để tạo landing web mới cực nhanh.

## Quick Start
1. Clone template bằng script:
   ```bash
   node scripts/new-site.mjs client-acme-web "Client Acme Web"
   ```
2. Vào project mới:
   ```bash
   cd ../client-acme-web
   npm install
   npm run seed
   npm run dev
   ```
3. Vào `/admin` để chỉnh:
   - Identity
   - SEO
   - Theme + Content
   - SMTP
   - Security
   - Media

## Contract dữ liệu
- `landing.theme`: design tokens
- `landing.content` + `landing.contentI18n`: nội dung
- `settings.identity|seo|smtp|security`

## Kiến trúc section (custom giao diện nhanh)
`app/page.js` đã tách thành section components tại `components/sections/*`:
- Header
- HeroSection
- GoalsSection
- FocusSection
- ContactSection
- FooterSection

Khi làm giao diện mới: thay section component tương ứng, không đụng backend API.

## Bảo mật cơ bản đã có
- Auth cookie httpOnly
- Role admin/super_admin
- Block account
- Rate-limit login theo số lần thất bại
- Rate-limit contact theo giờ
- Contact lưu DB trước khi gửi mail

## Quản trị nâng cao
- Contacts inbox trong admin
- User management (chỉ super_admin):
  - tạo admin/super_admin
  - block/activate
  - delete user khác
- Backup toàn diện:
  - API: `POST /api/admin/backup`
  - CLI: `npm run backup`

## Backup
```bash
npm run backup
```
Output: `backups/<timestamp>/database.json` + `uploads/`

## Lưu ý vận hành
- Đổi `JWT_SECRET` production
- Dùng HTTPS + reverse proxy
- Giới hạn truy cập `/admin` theo IP nếu có thể
- Backup định kỳ hàng ngày
