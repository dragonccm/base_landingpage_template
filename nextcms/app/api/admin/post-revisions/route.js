import { NextResponse } from "next/server";
import { requirePostEditor } from "@/lib/auth";
import { listPostRevisions, restorePostRevision } from "@/lib/db";
import { auditAdminAction } from "@/lib/audit";

export async function GET(req) {
  const guard = await requirePostEditor();
  if (guard.error) return guard.error;

  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");
  if (!postId) return NextResponse.json({ error: "Missing postId" }, { status: 400 });
  const items = await listPostRevisions(postId);
  return NextResponse.json({ items });
}

export async function POST(req) {
  const guard = await requirePostEditor();
  if (guard.error) return guard.error;

  const { revisionId } = await req.json();
  if (!revisionId) return NextResponse.json({ error: "Missing revisionId" }, { status: 400 });

  const ok = await restorePostRevision(revisionId, guard.user.sub);
  if (!ok) return NextResponse.json({ error: "Revision not found" }, { status: 404 });
  await auditAdminAction(req, guard.user, "posts.restore_revision", "post_revisions", { revisionId });
  return NextResponse.json({ ok: true });
}
