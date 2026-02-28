import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getSettings } from "@/lib/db";

export async function POST(req) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, message } = body || {};
    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
    }

    const settings = await getSettings();
    const smtp = settings.smtp || {};
    if (!smtp.host || !smtp.user || !smtp.pass || !smtp.fromEmail || !smtp.toEmail) {
      return NextResponse.json({ error: "SMTP chưa cấu hình trong admin" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: Number(smtp.port || 587),
      secure: String(smtp.secure) === "true",
      auth: { user: smtp.user, pass: smtp.pass },
    });

    await transporter.sendMail({
      from: `"${smtp.fromName || "NextCMS"}" <${smtp.fromEmail}>`,
      to: smtp.toEmail,
      replyTo: email,
      subject: `[Contact] ${firstName} ${lastName}`,
      text: `Name: ${firstName} ${lastName}\nEmail: ${email}\n\n${message}`,
      html: `<p><strong>Name:</strong> ${firstName} ${lastName}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong><br/>${String(message).replace(/\n/g, "<br/>")}</p>`,
    });

    return NextResponse.json({ ok: true, message: "Gửi liên hệ thành công" });
  } catch {
    return NextResponse.json({ error: "Gửi mail thất bại" }, { status: 500 });
  }
}
