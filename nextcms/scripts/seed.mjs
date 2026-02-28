import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config({ path: ".env.local" });
const { pool, ensureSchema, defaultLanding } = await import("../lib/db.js");

await ensureSchema();
const hash = await bcrypt.hash("long20%long", 10);
await pool.query(
  `INSERT INTO users (id,name,email,password_hash,role,created_at)
   VALUES ('u_admin','Nguyen Ngoc Long','nguyenngoclong5511@gmail.com',$1,'admin',NOW())
   ON CONFLICT (email) DO UPDATE SET password_hash=EXCLUDED.password_hash, role='admin', name='Nguyen Ngoc Long'`,
  [hash]
);
await pool.query(
  `INSERT INTO site_content (key,value,updated_at)
   VALUES ('landing',$1::jsonb,NOW())
   ON CONFLICT (key) DO NOTHING`,
  [JSON.stringify(defaultLanding)]
);
console.log("Seed done");
await pool.end();
