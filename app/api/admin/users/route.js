import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createUser, listUsers, updateUserStatus, deleteUser, findUserByEmail } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth";

export async function GET() {
  const guard = await requireSuperAdmin();
  if (guard.error) return guard.error;
  return NextResponse.json({ items: await listUsers() });
}

export async function POST(req) {
  const guard = await requireSuperAdmin();
  if (guard.error) return guard.error;

  const { name, email, password, role } = await req.json();
  if (!name || !email || !password) return NextResponse.json({ error: "Missing name/email/password" }, { status: 400 });
  const exist = await findUserByEmail(email);
  if (exist) return NextResponse.json({ error: "Email already exists" }, { status: 400 });

  const passwordHash = await bcrypt.hash(password, 10);
  await createUser({
    id: `u_${crypto.randomUUID()}`,
    name,
    email: String(email).toLowerCase(),
    passwordHash,
    role: role === "super_admin" ? "super_admin" : "admin",
    status: "active",
  });

  return NextResponse.json({ ok: true });
}

export async function PATCH(req) {
  const guard = await requireSuperAdmin();
  if (guard.error) return guard.error;
  const me = guard.user;

  const { id, action } = await req.json();
  if (!id || !action) return NextResponse.json({ error: "Missing id/action" }, { status: 400 });
  if (id === me.sub) return NextResponse.json({ error: "Cannot modify yourself" }, { status: 400 });

  if (action === "block") await updateUserStatus(id, "blocked");
  else if (action === "activate") await updateUserStatus(id, "active");
  else if (action === "delete") await deleteUser(id);
  else return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  return NextResponse.json({ ok: true });
}
