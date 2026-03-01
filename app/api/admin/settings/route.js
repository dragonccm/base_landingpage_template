import { NextResponse } from "next/server";
import { getSettings, saveSettings } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { auditAdminAction } from "@/lib/audit";

export async function GET(req) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  await auditAdminAction(req, guard.user, "settings.read", "settings");
  return NextResponse.json({ data: await getSettings() });
}

export async function PUT(req) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const body = await req.json();
  if (!body?.identity || !body?.seo || !body?.smtp) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  await saveSettings({ ...body, security: body.security || {} });
  await auditAdminAction(req, guard.user, "settings.update", "settings", {
    identityKeys: Object.keys(body.identity || {}),
    seoKeys: Object.keys(body.seo || {}),
    smtpKeys: Object.keys(body.smtp || {}),
    securityKeys: Object.keys(body.security || {}),
  });
  return NextResponse.json({ ok: true });
}
