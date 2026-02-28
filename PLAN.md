# CMS Theme & Content Configuration — Execution Plan

## Tổng quan dự án
- **Tên dự án:** NextCMS Config
- **Mục tiêu:** Xây dựng hệ thống CMS cho phép admin cấu hình design tokens (màu, typography) và nội dung text động. Frontend Next.js đọc config qua API và render — layout do dev code cứng.
- **Tech stack:** Next.js 15 (App Router) + Node.js (Fastify) + PostgreSQL + Prisma + shadcn/ui
- **Thời gian ước tính:** 6–8 tuần (1 dev)

---

## Kiến trúc hệ thống
- Admin Panel (Next.js) ↔ REST API (Fastify + Prisma) ↔ PostgreSQL
- Frontend Site (Next.js) đọc `/api/config`, `/api/content/*` để render
- Hỗ trợ ISR/revalidation

---

## Cấu trúc Monorepo
```txt
/
├── apps/
│   ├── admin/      # Next.js admin panel
│   └── web/        # Next.js frontend site
├── packages/
│   ├── api/        # Fastify Node.js backend
│   ├── db/         # Prisma schema + migrations
│   └── types/      # Shared TypeScript types
├── docker-compose.yml
└── turbo.json
```

---

## Database Schema (Prisma)
- `SiteConfig` (design_tokens, site_settings)
- `PageContent` (pageSlug, section, fields JSON, locale, draft/version)
- `ConfigHistory` (snapshot + rollback)
- `User` + enum role `ADMIN | EDITOR`

---

## API Endpoints
### Public
- `GET /api/config`
- `GET /api/content/:pageSlug`
- `GET /api/content/:pageSlug/:section`

### Protected (JWT)
- `POST /api/auth/login`
- `PUT /api/config/design-tokens`
- `PUT /api/config/site-settings`
- `PUT /api/content/:pageSlug/:section`
- `POST /api/content/:pageSlug/:section/publish`
- `GET /api/history/:type`
- `POST /api/history/:id/rollback`
- `POST /api/revalidate`

---

## Frontend Strategy (apps/web)
- Inject CSS variables ở `layout.tsx` từ config API
- `getCmsConfig` + `getPageContent` dùng cache tags (`cms-config`, `content-home`...)
- Render section theo content JSON
- On-demand ISR với `revalidateTag`

---

## Admin Panel (apps/admin)
- `/login`, `/dashboard`
- `/design-tokens` (colors/typography/spacing)
- `/content/[pageSlug]/[section]`
- `/settings`
- `/history` + rollback
- `/users` (ADMIN)
- Có live preview iframe

---

## Lộ trình thực thi
### Phase 1 — Foundation (Tuần 1)
- Khởi tạo monorepo Turborepo
- Setup PostgreSQL + Prisma migrations
- Setup Fastify API + env + CORS
- JWT auth + seed data

### Phase 2 — Backend API (Tuần 2)
- CRUD design tokens/content
- Draft/Publish
- History + rollback
- Revalidation webhook
- RBAC middleware

### Phase 3 — Frontend Site (Tuần 3)
- Next.js web app
- Config/content fetch + cache tags
- CSS vars injection
- Dynamic fonts
- Revalidation route

### Phase 4 — Admin Panel (Tuần 4–5)
- Admin app + shadcn/ui
- Login/session
- Design token editor
- Live preview
- Content editor + rich text
- Draft/Publish + history UI

### Phase 5 — Polish & DevOps (Tuần 6)
- User management
- Error handling/toast
- Docker Compose + Dockerfile
- CI/CD
- Deploy

### Phase 6 — Testing & Hardening (Tuần 7–8)
- Unit test API (Vitest)
- E2E admin flow (Playwright)
- Zod validation + rate limit
- Security audit (XSS/CSRF/SQLi)
- Lighthouse/performance

---

## Environment Variables
```env
# packages/api
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
REVALIDATE_SECRET=
FRONTEND_URL=

# apps/web
API_URL=
REVALIDATE_SECRET=
NEXT_PUBLIC_SITE_URL=

# apps/admin
API_URL=
NEXTAUTH_SECRET=
```

---

## Go-live Checklist
- Đổi toàn bộ secrets production
- Enable HTTPS
- Backup PostgreSQL tự động
- CDN cho static assets
- Monitoring + error tracking
- Smoke test full flow admin → revalidate → frontend cập nhật

---

## Ghi chú
Phase 3 nên làm trước Phase 4 để có frontend chạy ổn định rồi mới tích hợp live preview trong admin.
