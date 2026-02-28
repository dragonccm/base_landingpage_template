import { NextResponse } from "next/server";
import { getSettings } from "@/lib/db";

export async function GET() {
  return NextResponse.json({ data: await getSettings() });
}
