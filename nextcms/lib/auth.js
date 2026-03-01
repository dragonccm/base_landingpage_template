import { EncryptJWT, jwtDecrypt } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE = "auth_token";

function secret() {
  const raw = process.env.JWT_SECRET || "dev-secret-change-me";
  const normalized = (raw + "00000000000000000000000000000000").slice(0, 32);
  return new TextEncoder().encode(normalized);
}

export async function signToken(payload) {
  return new EncryptJWT(payload)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .encrypt(secret());
}

export async function verifyToken(token) {
  try {
    return (await jwtDecrypt(token, secret())).payload;
  } catch {
    return null;
  }
}

export function setCookie(res, token) {
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearCookie(res) {
  res.cookies.set(COOKIE, "", { path: "/", maxAge: 0 });
}

export async function currentUser() {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAdmin() {
  const user = await currentUser();
  if (!user || !["admin", "super_admin"].includes(String(user.role))) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { user };
}

export async function requireStaff() {
  const user = await currentUser();
  if (!user || !["editor", "admin", "super_admin"].includes(String(user.role))) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { user };
}

export async function requirePostEditor() {
  const user = await currentUser();
  if (!user || !["editor", "admin", "super_admin"].includes(String(user.role))) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user };
}

export async function requireSuperAdmin() {
  const user = await currentUser();
  if (!user || String(user.role) !== "super_admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user };
}

export const COOKIE_NAME = COOKIE;
