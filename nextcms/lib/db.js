import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

let inited = false;

export const defaultLanding = {
  theme: {
    fontFamily: "Lato, Inter, Arial, sans-serif",
    bgColor: "#ffffff",
    textColor: "#111111",
    primaryColor: "#75323c",
    secondaryColor: "#dab772",
  },
  content: {
    title: "NextCMS Landing",
    subtitle: "Editable from admin dashboard",
    cta: "Get Started",
    section1: "About section text",
    section2: "Feature section text",
  },
};

export const defaultSettings = {
  identity: {
    siteTitle: "NextCMS",
    siteTagline: "Modern CMS",
    logoUrl: "",
    faviconUrl: "",
  },
  seo: {
    metaTitle: "NextCMS",
    metaDescription: "Modern CMS with theme/content configuration",
    metaKeywords: "cms,nextjs,seo",
    ogImage: "",
  },
};

export const defaultMedia = [];

async function upsertKey(key, value) {
  await pool.query(
    `INSERT INTO site_content (key, value, updated_at)
     VALUES ($1, $2::jsonb, NOW())
     ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`,
    [key, JSON.stringify(value)]
  );
}

async function getKey(key, fallback) {
  const { rows } = await pool.query("SELECT value FROM site_content WHERE key=$1 LIMIT 1", [key]);
  return rows[0]?.value || fallback;
}

export async function ensureSchema() {
  if (inited) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'editor',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS site_content (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await upsertKey("landing", await getKey("landing", defaultLanding));
  await upsertKey("settings", await getKey("settings", defaultSettings));
  await upsertKey("media", await getKey("media", defaultMedia));

  inited = true;
}

export async function getLanding() {
  await ensureSchema();
  return getKey("landing", defaultLanding);
}

export async function saveLanding(value) {
  await ensureSchema();
  await upsertKey("landing", value);
}

export async function getSettings() {
  await ensureSchema();
  const data = await getKey("settings", defaultSettings);
  return {
    identity: { ...defaultSettings.identity, ...(data.identity || {}) },
    seo: { ...defaultSettings.seo, ...(data.seo || {}) },
  };
}

export async function saveSettings(value) {
  await ensureSchema();
  await upsertKey("settings", value);
}

export async function getMedia() {
  await ensureSchema();
  return getKey("media", defaultMedia);
}

export async function saveMedia(value) {
  await ensureSchema();
  await upsertKey("media", value);
}

export async function findUserByEmail(email) {
  await ensureSchema();
  const { rows } = await pool.query("SELECT * FROM users WHERE LOWER(email)=LOWER($1) LIMIT 1", [email]);
  return rows[0] || null;
}

export async function createUser(user) {
  await ensureSchema();
  await pool.query(
    "INSERT INTO users (id,name,email,password_hash,role,created_at) VALUES ($1,$2,$3,$4,$5,NOW())",
    [user.id, user.name, user.email, user.passwordHash, user.role]
  );
}

export { pool };
