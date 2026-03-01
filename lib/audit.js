import { createAuditLog } from "@/lib/db";

function pickHeaders(req) {
  return {
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || null,
    userAgent: req.headers.get("user-agent") || null,
  };
}

function safeDetails(details) {
  if (!details) return null;
  try {
    return JSON.parse(JSON.stringify(details));
  } catch {
    return { note: "unserializable_details" };
  }
}

export async function auditAdminAction(req, user, action, target, details = null, status = "success") {
  try {
    const meta = pickHeaders(req);
    await createAuditLog({
      actorId: user?.sub || null,
      actorEmail: user?.email || null,
      actorRole: user?.role || null,
      action,
      target,
      status,
      ip: meta.ip,
      userAgent: meta.userAgent,
      details: safeDetails(details),
    });
  } catch {
    // never block main admin flow if audit logging fails
  }
}
