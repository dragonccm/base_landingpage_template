import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config({ path: ".env.local" });
const { pool, ensureSchema, defaultLanding, countSuperAdmins } = await import("../lib/db.js");

await ensureSchema();
const hash = await bcrypt.hash("long20%long", 10);

const hasSuper = await countSuperAdmins();
const role = hasSuper > 0 ? "admin" : "super_admin";

await pool.query(
  `INSERT INTO users (id,name,email,password_hash,role,status,created_at,updated_at)
   VALUES ('u_admin','Nguyen Ngoc Long','nguyenngoclong5511@gmail.com',$1,$2,'active',NOW(),NOW())
   ON CONFLICT (email) DO UPDATE SET password_hash=EXCLUDED.password_hash, role=EXCLUDED.role, status='active', name='Nguyen Ngoc Long', updated_at=NOW()`,
  [hash, role]
);

await pool.query(
  `INSERT INTO site_content (key,value,updated_at)
   VALUES ('landing',$1::jsonb,NOW())
   ON CONFLICT (key) DO NOTHING`,
  [JSON.stringify(defaultLanding)]
);

console.log(`Seed done. Default account role: ${role}`);
await pool.end();
