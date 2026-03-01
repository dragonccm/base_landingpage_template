import { NextResponse } from "next/server";
import { jwtDecrypt } from "jose";

function secret() {
  const raw = process.env.JWT_SECRET || "dev-secret-change-me";
  const normalized = (raw + "00000000000000000000000000000000").slice(0, 32);
  return new TextEncoder().encode(normalized);
}

export async function middleware(req) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", req.url));
  try {
    const { payload } = await jwtDecrypt(token, secret());
    if (!["admin", "super_admin"].includes(String(payload.role))) return NextResponse.redirect(new URL("/", req.url));
    if (String(payload.status || "active") !== "active") return NextResponse.redirect(new URL("/login", req.url));
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
