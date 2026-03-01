import { NextResponse } from "next/server";
import { requirePostEditor } from "@/lib/auth";
import { createPostCategory, createPostTag, deletePostCategory, deletePostTag, listPostCategories, listPostTags } from "@/lib/db";
import { auditAdminAction } from "@/lib/audit";

export async function GET(req) {
  const guard = await requirePostEditor();
  if (guard.error) return guard.error;
  const [categories, tags] = await Promise.all([listPostCategories(), listPostTags()]);
  return NextResponse.json({ categories, tags });
}

export async function POST(req) {
  const guard = await requirePostEditor();
  if (guard.error) return guard.error;

  const body = await req.json();
  const type = body?.type;
  const name = String(body?.name || "").trim();
  if (!type || !name) return NextResponse.json({ error: "Missing type/name" }, { status: 400 });

  if (type === "category") {
    const id = await createPostCategory(name, body.slug);
    await auditAdminAction(req, guard.user, "post_taxonomy.create_category", "post_categories", { id, name });
    return NextResponse.json({ ok: true, id });
  }

  if (type === "tag") {
    const id = await createPostTag(name, body.slug);
    await auditAdminAction(req, guard.user, "post_taxonomy.create_tag", "post_tags", { id, name });
    return NextResponse.json({ ok: true, id });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

export async function DELETE(req) {
  const guard = await requirePostEditor();
  if (guard.error) return guard.error;

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const id = searchParams.get("id");
  if (!type || !id) return NextResponse.json({ error: "Missing type/id" }, { status: 400 });

  if (type === "category") {
    await deletePostCategory(id);
    await auditAdminAction(req, guard.user, "post_taxonomy.delete_category", "post_categories", { id });
    return NextResponse.json({ ok: true });
  }

  if (type === "tag") {
    await deletePostTag(id);
    await auditAdminAction(req, guard.user, "post_taxonomy.delete_tag", "post_tags", { id });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
