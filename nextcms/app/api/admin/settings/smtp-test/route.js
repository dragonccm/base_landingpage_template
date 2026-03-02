import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { requireAdmin } from "@/lib/auth";

export async function POST(req) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { smtp } = await req.json();
  if (!smtp?.host || !smtp?.user || !smtp?.pass) {
    return NextResponse.json({ ok: false, error: "Thiếu cấu hình SMTP" }, { status: 400 });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: Number(smtp.port || 587),
      secure: String(smtp.secure) === "true",
      auth: { user: smtp.user, pass: smtp.pass },
    });

    await transporter.verify();
    return NextResponse.json({ ok: true, message: "Kết nối SMTP thành công" });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error?.message || "Không thể kết nối SMTP" }, { status: 400 });
  }
}
