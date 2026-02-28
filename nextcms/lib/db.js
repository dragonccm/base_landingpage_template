import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

let inited = false;

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
  inited = true;
}

export const defaultLanding = {
  theme: { fontFamily: "Inter, Arial, sans-serif", bgColor: "#eef2f7", textColor: "#0d1425", primaryColor: "#2f9ae0" },
  content: { title: "NextCMS Landing", subtitle: "Editable from admin", cta: "Get Started", section1: "About section text", section2: "Feature section text" }
};

export async function getLanding() {
  await ensureSchema();
  const { rows } = await pool.query("SELECT value FROM site_content WHERE key='landing' LIMIT 1");
  return rows[0]?.value || defaultLanding;
}

export async function saveLanding(value) {
  await ensureSchema();
  await pool.query(`INSERT INTO site_content (key, value, updated_at) VALUES ('landing', $1::jsonb, NOW()) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`, [JSON.stringify(value)]);
}

export async function findUserByEmail(email) {
  await ensureSchema();
  const { rows } = await pool.query("SELECT * FROM users WHERE LOWER(email)=LOWER($1) LIMIT 1", [email]);
  return rows[0] || null;
}

export async function createUser(user) {
  await ensureSchema();
  await pool.query("INSERT INTO users (id,name,email,password_hash,role,created_at) VALUES ($1,$2,$3,$4,$5,NOW())", [user.id, user.name, user.email, user.passwordHash, user.role]);
}

export { pool };
