import { getLanding } from "@/lib/db";
import { NextResponse } from "next/server";
export async function GET(){ return NextResponse.json({ data: await getLanding() }); }
