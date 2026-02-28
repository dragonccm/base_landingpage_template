import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findUserByEmail } from "@/lib/db";
import { setCookie, signToken } from "@/lib/auth";

export async function POST(req){
  try {
    const { email, password } = await req.json();
    const user = await findUserByEmail(email || "");
    if(!user) return NextResponse.json({ error:'Invalid credentials' }, { status:401 });
    const ok = await bcrypt.compare(password || "", user.password_hash);
    if(!ok) return NextResponse.json({ error:'Invalid credentials' }, { status:401 });
    const token = await signToken({ sub:user.id, email:user.email, role:user.role, name:user.name });
    const res = NextResponse.json({ ok:true, role:user.role });
    setCookie(res, token);
    return res;
  } catch (e) {
    return NextResponse.json({ error: "Login server error" }, { status: 500 });
  }
}
