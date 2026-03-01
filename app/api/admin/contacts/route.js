import { NextResponse } from "next/server";
import { listContactSubmissions, updateContactSubmissionStatus } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  return NextResponse.json({ items: await listContactSubmissions() });
}

export async function PATCH(req) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  const { id, status } = await req.json();
  if (!id || !status) return NextResponse.json({ error: "Missing id/status" }, { status: 400 });
  await updateContactSubmissionStatus(id, status);
  return NextResponse.json({ ok: true });
}
