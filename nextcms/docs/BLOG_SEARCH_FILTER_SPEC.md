# Blog Search & Advanced Filter Spec

## 1) Mục tiêu

- Tìm kiếm full-text mạnh cho blog public + admin
- Filter nâng cao nhiều điều kiện đồng thời
- Trả kết quả có ranking + pagination + sort

## 2) PostgreSQL full-text design

### Extensions
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
```

### Search vector
- Cột: `posts.search_vector TSVECTOR`
- Weight đề xuất:
  - title: A
  - excerpt: B
  - content_html: C
  - tags/category: B

Ví dụ cập nhật vector:
```sql
setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
setweight(to_tsvector('simple', coalesce(excerpt, '')), 'B') ||
setweight(to_tsvector('simple', coalesce(content_html, '')), 'C')
```

### Index
```sql
CREATE INDEX IF NOT EXISTS idx_posts_search_vector ON posts USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_posts_status_published ON posts(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_title_trgm ON posts USING GIN(title gin_trgm_ops);
```

## 3) API contract

### Public search
`GET /api/blog/search`

Query params:
- `q`: keyword
- `category`: slug hoặc id
- `tags`: csv (`ai,fintech,blockchain`)
- `dateFrom`, `dateTo`: ISO date
- `featured`: `true|false`
- `sort`: `relevance|newest|oldest|popular`
- `page`, `limit`

Response:
```json
{
  "items": [
    {
      "id": "p_xxx",
      "slug": "my-post",
      "title": "...",
      "excerpt": "...",
      "coverImage": "...",
      "publishedAt": "...",
      "author": {"id":"u_1","name":"Admin"},
      "category": {"id":"c1","name":"News","slug":"news"},
      "tags": [{"id":"t1","name":"AI","slug":"ai"}],
      "score": 0.92,
      "highlights": ["..."]
    }
  ],
  "pagination": {"page":1,"limit":10,"total":120,"totalPages":12}
}
```

### Admin posts list/search
`GET /api/admin/posts`

Query params thêm:
- `status`: `draft|review|scheduled|published|archived`
- `authorId`
- `hasSeo`: `true|false`

## 4) Filter logic

- Mặc định public chỉ lấy `status='published'` và `published_at <= NOW()`
- Multi-tag logic:
  - mode `ANY` (mặc định) hoặc `ALL`
- Date filter theo `published_at`
- Sort:
  - relevance: `ts_rank_cd(...) DESC`
  - newest: `published_at DESC`
  - oldest: `published_at ASC`
  - popular: `view_count DESC, published_at DESC`

## 5) Search quality

- Normalize từ khóa:
  - trim, lowercase, unaccent
- Nếu không có hit FTS:
  - fallback trigram (`similarity(title, q)`)
- Highlight snippet từ nội dung/title

## 6) Performance targets

- p95 query < 300ms với 50k posts
- p99 query < 700ms
- pagination ổn định

## 7) Telemetry

Lưu search analytics:
- keyword
- filters
- result_count
- latency_ms
- user_type (public/admin)

Mục đích: tối ưu relevance + phát hiện từ khóa no-result.
