import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "../../../../lib/db";
import { setAuthCookie, signToken } from "../../../../lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request) {
  try {
    const body = await request.json();
    const input = schema.parse(body);

    const user = await db.users.findByEmail(input.email);
    if (!user) return NextResponse.json({ error: "Sai email hoặc mật khẩu" }, { status: 401 });

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) return NextResponse.json({ error: "Sai email hoặc mật khẩu" }, { status: 401 });

    const token = await signToken({ sub: user.id, email: user.email, role: user.role, name: user.name });

    const res = NextResponse.json({ message: "Đăng nhập thành công", role: user.role });
    setAuthCookie(res, token);
    return res;
  } catch {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }
}
