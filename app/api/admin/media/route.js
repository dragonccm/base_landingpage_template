import { NextResponse } from "next/server";
import { getMedia, saveMedia } from "@/lib/db";

export async function GET() {
  return NextResponse.json({ items: await getMedia() });
}

export async function POST(req) {
  const body = await req.json();
  if (!body?.url) return NextResponse.json({ error: "Missing url" }, { status: 400 });
  const media = await getMedia();
  const byExt = /\.(mp4|webm|mov)$/i.test(body.url) ? "video" : "image";
  const item = { id: `m_${crypto.randomUUID()}`, url: body.url, name: body.name || "Untitled", alt: body.alt || "", type: body.type || byExt, createdAt: new Date().toISOString() };
  media.unshift(item);
  await saveMedia(media);
  return NextResponse.json({ ok: true, item });
}

export async function PATCH(req) {
  const body = await req.json();
  if (!body?.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const media = await getMedia();
  const idx = media.findIndex((m) => m.id === body.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  media[idx] = { ...media[idx], name: body.name ?? media[idx].name, alt: body.alt ?? media[idx].alt, url: body.url ?? media[idx].url, type: body.type ?? media[idx].type };
  await saveMedia(media);
  return NextResponse.json({ ok: true, item: media[idx] });
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const media = await getMedia();
  await saveMedia(media.filter((m) => m.id !== id));
  return NextResponse.json({ ok: true });
}
