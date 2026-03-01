import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findUserByEmail, recordAuthAttempt, countRecentFailedAttempts, getSettings } from "@/lib/db";
import { setCookie, signToken } from "@/lib/auth";

export async function POST(req){
  try {
    const { email, password } = await req.json();
    const mail = String(email || "").trim().toLowerCase();
    const settings = await getSettings();
    const maxAttempts = Number(settings?.security?.maxLoginAttempts || 5);
    const blockMinutes = Number(settings?.security?.loginBlockMinutes || 30);

    const recentFails = await countRecentFailedAttempts(mail, blockMinutes);
    if (recentFails >= maxAttempts) {
      return NextResponse.json({ error:"Too many failed attempts. Try later." }, { status:429 });
    }

    const user = await findUserByEmail(mail);
    if(!user) {
      await recordAuthAttempt({ id: crypto.randomUUID(), email: mail, ip: req.headers.get("x-forwarded-for"), success: false });
      return NextResponse.json({ error:'Invalid credentials' }, { status:401 });
    }
    if (String(user.status) !== "active") {
      return NextResponse.json({ error:'Account is blocked' }, { status:403 });
    }

    const ok = await bcrypt.compare(password || "", user.password_hash);
    await recordAuthAttempt({ id: crypto.randomUUID(), email: mail, ip: req.headers.get("x-forwarded-for"), success: ok });
    if(!ok) return NextResponse.json({ error:'Invalid credentials' }, { status:401 });

    const token = await signToken({ sub:user.id, email:user.email, role:user.role, name:user.name, status:user.status });
    const res = NextResponse.json({ ok:true, role:user.role, name: user.name });
    setCookie(res, token);
    return res;
  } catch {
    return NextResponse.json({ error: "Login server error" }, { status: 500 });
  }
}
