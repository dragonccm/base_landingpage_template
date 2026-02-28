import { getLanding, saveLanding } from "@/lib/db";
import { NextResponse } from "next/server";
export async function GET(){ return NextResponse.json({ data: await getLanding() }); }
export async function PUT(req){ const body = await req.json(); await saveLanding(body); return NextResponse.json({ ok:true }); }
