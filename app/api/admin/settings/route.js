import { NextResponse } from "next/server";
import { getSettings, saveSettings } from "@/lib/db";

export async function GET() {
  return NextResponse.json({ data: await getSettings() });
}

export async function PUT(req) {
  const body = await req.json();
  if (!body?.identity || !body?.seo || !body?.smtp) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  await saveSettings({ ...body, security: body.security || {} });
  return NextResponse.json({ ok: true });
}
