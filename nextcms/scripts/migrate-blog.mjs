import 'dotenv/config';
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  console.error('Missing DATABASE_URL');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const sql = `
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS post_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS post_tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content_json JSONB,
  content_html TEXT,
  cover_image TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  category_id TEXT REFERENCES post_categories(id) ON DELETE SET NULL,
  author_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  seo_title TEXT,
  seo_description TEXT,
  seo_image TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  view_count INT NOT NULL DEFAULT 0,
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS post_tag_map (
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES post_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

CREATE TABLE IF NOT EXISTS post_revisions (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  title TEXT,
  excerpt TEXT,
  content_json JSONB,
  content_html TEXT,
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_status_published ON posts(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_search_vector ON posts USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_posts_title_trgm ON posts USING GIN(title gin_trgm_ops);
`;

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('Blog migration completed');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Blog migration failed:', e.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
