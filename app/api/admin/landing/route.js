import { getLanding, saveLanding } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { auditAdminAction } from "@/lib/audit";

export async function GET(req) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  await auditAdminAction(req, guard.user, "landing.read", "landing");
  return NextResponse.json({ data: await getLanding() });
}

export async function PUT(req) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  const body = await req.json();
  await saveLanding(body);
  await auditAdminAction(req, guard.user, "landing.update", "landing", {
    themeKeys: Object.keys(body?.theme || {}),
    contentKeys: Object.keys(body?.content || {}),
  });
  return NextResponse.json({ ok: true });
}
