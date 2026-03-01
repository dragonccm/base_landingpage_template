# Blog Module Roadmap (Landing + Blog)

Mục tiêu: nâng cấp NextCMS thành hệ **Landing page + Blog** trong cùng dự án, có tìm kiếm full-text mạnh và bộ lọc nâng cao.

## Phase 1 — Foundation (1-2 tuần)

### 1. Database & Search Core
- Tạo bảng:
  - `post_categories`
  - `post_tags`
  - `posts`
  - `post_tag_map`
  - `post_revisions`
- Trường chính của `posts`:
  - `id, slug, title, excerpt, content_json, content_html`
  - `cover_image, status(draft|review|scheduled|published|archived)`
  - `author_id, reviewer_id`
  - `published_at, scheduled_at`
  - `seo_title, seo_description, seo_image`
  - `is_featured, view_count`
  - `search_vector TSVECTOR`
- Index bắt buộc:
  - `GIN(search_vector)`
  - `BTREE(status, published_at DESC)`
  - `BTREE(author_id)`
  - `UNIQUE(slug)`

### 2. Public Blog
- Trang list: `/blog`
- Trang detail: `/blog/[slug]`
- API:
  - `GET /api/blog/posts`
  - `GET /api/blog/posts/[slug]`
  - `GET /api/blog/search`
- Filter cơ bản:
  - q (full-text)
  - category, tags
  - dateFrom/dateTo
  - sort

### 3. Admin CRUD cơ bản
- Tab `posts` trong `/admin`
- CRUD bài viết
- Status flow: draft -> review -> published
- Upload ảnh trong editor
- Audit log action:
  - `posts.create/update/publish/delete`

### 4. Verify & Docs
- Update `DEPLOYMENT.md` thêm migration blog
- Add `npm run migrate:blog`
- Add smoke tests vào `verify:deploy`

---

## Phase 2 — Editor nâng cao & Workflow (1-2 tuần)

### 1. Editor “như Word”
- Rich text blocks:
  - paragraph, heading H1-H6
  - bold, italic, underline, strike
  - align left/center/right/justify
  - ordered/unordered checklist
  - quote, code block
  - link text + open in new tab
  - image (inline + caption + alt)
  - table
  - chart block (bar/line/pie)
  - embed block (youtube/iframe an toàn)
- Undo/redo
- Auto-save
- Draft recovery

### 2. Revision system
- Lưu snapshot mỗi lần save/publish
- Compare 2 versions
- Restore version

### 3. Advanced filtering in admin
- Multi-select tags/categories
- Status + author + date range
- Sort + pagination
- Saved filters

---

## Phase 3 — SEO, Scale, Analytics (1 tuần)

- Sitemap auto gồm blog URLs
- RSS feed
- JSON-LD Article schema
- Related posts theo tag + search similarity
- Search analytics (top keywords, no-result keywords)
- Performance tuning (cache + query optimization)

---

## Definition of Done (DoD)

- [ ] Full-text search < 300ms (dataset vừa)
- [ ] Filter kết hợp hoạt động đúng
- [ ] Editor hỗ trợ đầy đủ block chính
- [ ] Audit log đầy đủ thao tác posts
- [ ] Backup chứa posts/revisions/tags/categories
- [ ] Docs deploy + rollback + verify đầy đủ
