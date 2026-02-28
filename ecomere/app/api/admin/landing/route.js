import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";

export async function GET() {
  const data = await db.settings.getLanding();
  return NextResponse.json({ data });
}

export async function PUT(request) {
  const body = await request.json();
  if (!body?.theme || !body?.content) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const data = await db.settings.saveLanding(body);
  return NextResponse.json({ message: "Updated", data });
}
