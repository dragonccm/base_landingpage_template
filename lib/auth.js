import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE = "auth_token";
const secret = () => new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");

export async function signToken(payload) {
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secret());
}

export async function verifyToken(token) {
  try { return (await jwtVerify(token, secret())).payload; } catch { return null; }
}

export function setCookie(res, token) {
  res.cookies.set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 7 });
}

export function clearCookie(res) { res.cookies.set(COOKIE, "", { path: "/", maxAge: 0 }); }

export async function currentUser() {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export const COOKIE_NAME = COOKIE;
