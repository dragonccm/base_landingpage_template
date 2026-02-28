import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("DATABASE_URL is not set. Please configure .env.local");
}

const pool = new Pool({ connectionString, ssl: connectionString ? { rejectUnauthorized: false } : undefined });

let initialized = false;

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
  `);

  initialized = true;
}

function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    createdAt: row.created_at,
  };
}

function mapProduct(row) {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    oldPrice: Number(row.old_price),
    stock: row.stock,
    category: row.category,
    image: row.image,
  };
}

function mapOrder(row) {
  return {
    id: row.id,
    userId: row.user_id,
    customerName: row.customer_name,
    total: Number(row.total),
    status: row.status,
    items: row.items,
    createdAt: row.created_at,
  };
}

export const db = {
  users: {
    async list() {
      await ensureSchema();
      const { rows } = await pool.query(`SELECT * FROM users ORDER BY created_at DESC`);
      return rows.map(mapUser);
    },
    async findByEmail(email) {
      await ensureSchema();
      const { rows } = await pool.query(`SELECT * FROM users WHERE LOWER(email)=LOWER($1) LIMIT 1`, [email]);
      return mapUser(rows[0]);
    },
    async findById(id) {
      await ensureSchema();
      const { rows } = await pool.query(`SELECT * FROM users WHERE id=$1 LIMIT 1`, [id]);
      return mapUser(rows[0]);
    },
    async create(user) {
      await ensureSchema();
      await pool.query(
        `INSERT INTO users (id,name,email,password_hash,role,created_at)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [user.id, user.name, user.email, user.passwordHash, user.role, user.createdAt || new Date().toISOString()]
      );
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
      await pool.query(
        `INSERT INTO products (id,name,price,old_price,stock,category,image)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [product.id, product.name, product.price, product.oldPrice, product.stock, product.category, product.image]
      );
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
      await pool.query(
        `INSERT INTO orders (id,user_id,customer_name,total,status,items,created_at)
         VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7)`,
        [order.id, order.userId, order.customerName, order.total, order.status, JSON.stringify(order.items || []), order.createdAt || new Date().toISOString()]
      );
      return order;
    },
    async updateStatus(id, status) {
      await ensureSchema();
      const { rows } = await pool.query(`UPDATE orders SET status=$1 WHERE id=$2 RETURNING *`, [status, id]);
      return mapOrder(rows[0]);
    },
  },
};

export { pool };
