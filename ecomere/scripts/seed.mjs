import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config({ path: ".env.local" });
const { pool, ensureSchema } = await import("../lib/db.js");

async function main() {
  await ensureSchema();

  const adminEmail = "nguyenngoclong5511@gmail.com";
  const adminPassword = "long20%long";

  const hash = await bcrypt.hash(adminPassword, 10);

  await pool.query(
    `INSERT INTO users (id,name,email,password_hash,role,created_at)
     VALUES ($1,$2,$3,$4,'admin',NOW())
     ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, password_hash=EXCLUDED.password_hash, role='admin'`,
    ["u_admin", "Nguyen Ngoc Long", adminEmail, hash]
  );

  const { rows } = await pool.query(`SELECT COUNT(*)::int AS total FROM products`);
  if (rows[0].total === 0) {
    await pool.query(`
      INSERT INTO products (id,name,price,old_price,stock,category,image) VALUES
      ('p1','Laptop Gaming MSI Katana 15',24990000,28990000,12,'Laptop Gaming','https://images.unsplash.com/photo-1517336714739-489689fd1ca8?q=80&w=1200&auto=format&fit=crop'),
      ('p2','Màn hình LG UltraGear 27 inch 180Hz',6490000,7390000,25,'Màn hình','https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1200&auto=format&fit=crop'),
      ('p3','Chuột Logitech G Pro X Superlight 2',2790000,3290000,34,'Chuột','https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=1200&auto=format&fit=crop'),
      ('p4','Bàn phím cơ AKKO 5075B Plus',1990000,2290000,40,'Bàn phím','https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=1200&auto=format&fit=crop');
    `);
  }

  console.log("Seed done.");
  await pool.end();
}

main().catch(async (e) => {
  console.error(e);
  await pool.end();
  process.exit(1);
});
