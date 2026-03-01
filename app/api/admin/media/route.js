import { NextResponse } from "next/server";
import { getMedia, saveMedia } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { auditAdminAction } from "@/lib/audit";

export async function GET(req) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  await auditAdminAction(req, guard.user, "media.read", "media");
  return NextResponse.json({ items: await getMedia() });
}

export async function POST(req) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const body = await req.json();
  if (!body?.url) return NextResponse.json({ error: "Missing url" }, { status: 400 });
  const media = await getMedia();
  const byExt = /\.(mp4|webm|mov)$/i.test(body.url) ? "video" : "image";
  const item = { id: `m_${crypto.randomUUID()}`, url: body.url, name: body.name || "Untitled", alt: body.alt || "", type: body.type || byExt, createdAt: new Date().toISOString() };
  media.unshift(item);
  await saveMedia(media);
  await auditAdminAction(req, guard.user, "media.create", "media", { mediaId: item.id, type: item.type, url: item.url });
  return NextResponse.json({ ok: true, item });
}

export async function PATCH(req) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const body = await req.json();
  if (!body?.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const media = await getMedia();
  const idx = media.findIndex((m) => m.id === body.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  media[idx] = { ...media[idx], name: body.name ?? media[idx].name, alt: body.alt ?? media[idx].alt, url: body.url ?? media[idx].url, type: body.type ?? media[idx].type };
  await saveMedia(media);
  await auditAdminAction(req, guard.user, "media.update", "media", { mediaId: body.id });
  return NextResponse.json({ ok: true, item: media[idx] });
}

export async function DELETE(req) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const media = await getMedia();
  await saveMedia(media.filter((m) => m.id !== id));
  await auditAdminAction(req, guard.user, "media.delete", "media", { mediaId: id });
  return NextResponse.json({ ok: true });
}
