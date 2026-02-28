import { NextResponse } from "next/server";
import { clearAuthCookie } from "../../../../lib/auth";

export async function POST() {
  const res = NextResponse.json({ message: "Đăng xuất thành công" });
  clearAuthCookie(res);
  return res;
}
