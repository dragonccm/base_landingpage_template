import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString,
  ssl: connectionString ? { rejectUnauthorized: false } : undefined,
});

let initialized = false;

const defaultLanding = {
  theme: {
    fontFamily: "Inter, Arial, sans-serif",
    bgColor: "#070b1a",
    surfaceColor: "#0f1733",
    textColor: "#e8ecff",
    mutedColor: "#a5afcc",
    primaryColor: "#6f86ff",
    secondaryColor: "#2bd1a3",
    sectionRadius: "20",
  },
  content: {
    navBrand: "TrustXLabs",
    navCta: "Contact Us",
    heroBadge: "Leading FinTech, AI & Blockchain Solutions",
    heroTitle: "Welcome to TrustXLabs!",
    heroDesc:
      "TrustXLabs – a research center for fintech under TRUSTpay Group, focusing on research and development of AI, IoT, Big Data and Blockchain financial solutions.",
    missionTitle: "Goals & Mission",
    missionText: "TrustXLabs aims to become the leading fintech research company in Vietnam.",
    focusTitle: "Key Focus Areas",
    contactTitle: "Connect with TrustXLabs!",
    contactText: "Contact us for consultation on fintech solutions.",
  },
};

export async function ensureSchema() {
  if (initialized) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price BIGINT NOT NULL,
      old_price BIGINT NOT NULL,
      stock INT NOT NULL,
      category TEXT NOT NULL,
      image TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      total BIGINT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      items JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS site_content (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(
    `INSERT INTO site_content (key, value)
     VALUES ('landing', $1::jsonb)
     ON CONFLICT (key) DO NOTHING`,
    [JSON.stringify(defaultLanding)]
  );

  initialized = true;
}

const mapUser = (r) =>
  r
    ? { id: r.id, name: r.name, email: r.email, passwordHash: r.password_hash, role: r.role, createdAt: r.created_at }
    : null;
const mapProduct = (r) => ({ id: r.id, name: r.name, price: Number(r.price), oldPrice: Number(r.old_price), stock: r.stock, category: r.category, image: r.image });
const mapOrder = (r) => ({ id: r.id, userId: r.user_id, customerName: r.customer_name, total: Number(r.total), status: r.status, items: r.items, createdAt: r.created_at });

export const db = {
  users: {
    async findByEmail(email) {
      await ensureSchema();
      const { rows } = await pool.query(`SELECT * FROM users WHERE LOWER(email)=LOWER($1) LIMIT 1`, [email]);
      return mapUser(rows[0]);
    },
    async create(user) {
      await ensureSchema();
      await pool.query(`INSERT INTO users (id,name,email,password_hash,role,created_at) VALUES ($1,$2,$3,$4,$5,$6)`, [user.id, user.name, user.email, user.passwordHash, user.role, user.createdAt]);
      return user;
    },
  },
  products: {
    async list() {
      await ensureSchema();
      const { rows } = await pool.query(`SELECT * FROM products ORDER BY name ASC`);
      return rows.map(mapProduct);
    },
    async create(product) {
      await ensureSchema();
      await pool.query(`INSERT INTO products (id,name,price,old_price,stock,category,image) VALUES ($1,$2,$3,$4,$5,$6,$7)`, [product.id, product.name, product.price, product.oldPrice, product.stock, product.category, product.image]);
      return product;
    },
    async remove(id) {
      await ensureSchema();
      await pool.query(`DELETE FROM products WHERE id=$1`, [id]);
    },
  },
  orders: {
    async list() {
      await ensureSchema();
      const { rows } = await pool.query(`SELECT * FROM orders ORDER BY created_at DESC`);
      return rows.map(mapOrder);
    },
    async create(order) {
      await ensureSchema();
      await pool.query(`INSERT INTO orders (id,user_id,customer_name,total,status,items,created_at) VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7)`, [order.id, order.userId, order.customerName, order.total, order.status, JSON.stringify(order.items || []), order.createdAt]);
      return order;
    },
    async updateStatus(id, status) {
      await ensureSchema();
      const { rows } = await pool.query(`UPDATE orders SET status=$1 WHERE id=$2 RETURNING *`, [status, id]);
      return mapOrder(rows[0]);
    },
  },
  settings: {
    async getLanding() {
      await ensureSchema();
      const { rows } = await pool.query(`SELECT value FROM site_content WHERE key='landing' LIMIT 1`);
      return rows[0]?.value || defaultLanding;
    },
    async saveLanding(value) {
      await ensureSchema();
      await pool.query(
        `INSERT INTO site_content (key, value, updated_at) VALUES ('landing', $1::jsonb, NOW())
         ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`,
        [JSON.stringify(value)]
      );
      return value;
    },
  },
};

export { pool, defaultLanding };
