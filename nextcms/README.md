# NextCMS

Next.js CMS cho landing page + admin dashboard.

## Tính năng chính

- Quản lý nội dung Landing (theme/content)
- Quản lý SEO/Identity/SMTP/Security settings
- Quản lý media (ảnh/video)
- Quản lý contacts
- Quản lý users theo role (admin/super_admin)
- Backup dữ liệu và uploads
- Audit log cho thao tác quản trị

## Công nghệ

- Next.js 14 (App Router)
- PostgreSQL (`pg`)
- Redux Toolkit (admin state)

## Chạy local

```bash
npm install
npm run dev
```

## Scripts quan trọng

```bash
npm run build
npm run start
npm run migrate:audit
npm run migrate:blog
npm run verify:deploy
```

## Tài liệu

- `DEPLOYMENT.md`: hướng dẫn deploy/rollback/troubleshooting/verify
- `AGENTS.md`: quy ước làm việc cho agent/dev

## Lưu ý vận hành

- Runtime artifacts đã được ignore:
  - `backups/`
  - `public/uploads/`
- Tạo folder giữ chỗ bằng `.gitkeep` để không lỗi đường dẫn khi deploy mới.
