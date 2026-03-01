import { NextResponse } from "next/server";
import { listAuditLogs } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(req) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit") || 300);
  const items = await listAuditLogs(limit);
  return NextResponse.json({ items });
}
