import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "../../../../lib/db";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request) {
  try {
    const body = await request.json();
    const input = schema.parse(body);

    const exists = await db.users.findByEmail(input.email);
    if (exists) return NextResponse.json({ error: "Email đã tồn tại" }, { status: 409 });

    const user = {
      id: `u_${crypto.randomUUID()}`,
      name: input.name,
      email: input.email,
      passwordHash: await bcrypt.hash(input.password, 10),
      role: "customer",
      createdAt: new Date().toISOString(),
    };

    await db.users.create(user);

    return NextResponse.json({ message: "Tạo tài khoản thành công" });
  } catch {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }
}
