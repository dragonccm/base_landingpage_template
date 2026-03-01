import { NextResponse } from "next/server";
import { listContactSubmissions, updateContactSubmissionStatus } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { auditAdminAction } from "@/lib/audit";

export async function GET(req) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  await auditAdminAction(req, guard.user, "contacts.read", "contacts");
  return NextResponse.json({ items: await listContactSubmissions() });
}

export async function PATCH(req) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  const { id, status } = await req.json();
  if (!id || !status) return NextResponse.json({ error: "Missing id/status" }, { status: 400 });
  await updateContactSubmissionStatus(id, status);
  await auditAdminAction(req, guard.user, "contacts.update_status", "contact_submission", { id, status });
  return NextResponse.json({ ok: true });
}
