import { NextResponse } from "next/server";
import { createPost, deletePost, listPostsAdmin, updatePost } from "@/lib/db";
import { requirePostEditor } from "@/lib/auth";
import { auditAdminAction } from "@/lib/audit";

export async function GET(req) {
  const guard = await requirePostEditor();
  if (guard.error) return guard.error;

  const { searchParams } = new URL(req.url);
  const items = await listPostsAdmin({
    q: searchParams.get("q") || "",
    status: searchParams.get("status") || undefined,
    category: searchParams.get("category") || undefined,
    tag: searchParams.get("tag") || undefined,
    authorId: searchParams.get("authorId") || undefined,
    dateFrom: searchParams.get("dateFrom") || undefined,
    dateTo: searchParams.get("dateTo") || undefined,
    sort: searchParams.get("sort") || "newest",
    page: Number(searchParams.get("page") || 1),
    limit: Number(searchParams.get("limit") || 20),
  });

  await auditAdminAction(req, guard.user, "posts.read", "posts", { count: items.length });
  return NextResponse.json({ items });
}

export async function POST(req) {
  const guard = await requirePostEditor();
  if (guard.error) return guard.error;

  const body = await req.json();
  if (!body?.title) return NextResponse.json({ error: "Missing title" }, { status: 400 });

  const id = await createPost({
    title: body.title,
    slug: body.slug,
    excerpt: body.excerpt,
    contentJson: body.contentJson,
    contentHtml: body.contentHtml,
    coverImage: body.coverImage,
    status: body.status || "draft",
    categoryId: body.categoryId,
    authorId: guard.user.sub,
    seoTitle: body.seoTitle,
    seoDescription: body.seoDescription,
    seoImage: body.seoImage,
    isFeatured: !!body.isFeatured,
    publishedAt: body.publishedAt || null,
    tagIds: Array.isArray(body.tagIds) ? body.tagIds : [],
  });

  await auditAdminAction(req, guard.user, "posts.create", "posts", { id, title: body.title });
  return NextResponse.json({ ok: true, id });
}

export async function PATCH(req) {
  const guard = await requirePostEditor();
  if (guard.error) return guard.error;

  const body = await req.json();
  if (!body?.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const ok = await updatePost(body.id, body, guard.user.sub);
  if (!ok) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  await auditAdminAction(req, guard.user, "posts.update", "posts", { id: body.id, status: body.status });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req) {
  const guard = await requirePostEditor();
  if (guard.error) return guard.error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await deletePost(id);
  await auditAdminAction(req, guard.user, "posts.delete", "posts", { id });
  return NextResponse.json({ ok: true });
}
