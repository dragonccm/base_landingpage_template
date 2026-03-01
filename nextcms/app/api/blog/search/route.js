import { NextResponse } from "next/server";
import { listPostsPublic } from "@/lib/db";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const items = await listPostsPublic({
    q,
    category: searchParams.get("category") || undefined,
    tag: searchParams.get("tag") || undefined,
    sort: searchParams.get("sort") || (q ? "relevance" : "newest"),
    page: Number(searchParams.get("page") || 1),
    limit: Number(searchParams.get("limit") || 12),
  });
  return NextResponse.json({ items });
}
