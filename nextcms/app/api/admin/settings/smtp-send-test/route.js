import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { requireAdmin } from "@/lib/auth";

export async function POST(req) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { smtp, toEmail } = await req.json();
  const receiver = String(toEmail || "").trim().toLowerCase();

  if (!receiver) return NextResponse.json({ ok: false, error: "Thiếu email nhận test" }, { status: 400 });
  if (!smtp?.host || !smtp?.user || !smtp?.pass || !smtp?.fromEmail) {
    return NextResponse.json({ ok: false, error: "Thiếu cấu hình SMTP" }, { status: 400 });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: Number(smtp.port || 587),
      secure: String(smtp.secure) === "true",
      auth: { user: smtp.user, pass: smtp.pass },
    });

    await transporter.sendMail({
      from: `"${smtp.fromName || "NextCMS"}" <${smtp.fromEmail}>`,
      to: receiver,
      subject: "[NextCMS] SMTP test mail",
      text: "SMTP test thành công từ NextCMS Admin.",
      html: "<p><strong>SMTP test thành công</strong> từ NextCMS Admin.</p>",
    });

    return NextResponse.json({ ok: true, message: `Đã gửi mail test tới ${receiver}` });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error?.message || "Gửi mail test thất bại" }, { status: 400 });
  }
}
