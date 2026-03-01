import { NextResponse } from "next/server";
import { getPostBySlug } from "@/lib/db";

export async function GET(_req, { params }) {
  const item = await getPostBySlug(params.slug);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item });
}
