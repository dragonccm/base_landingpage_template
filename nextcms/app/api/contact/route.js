import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getSettings, saveContactSubmission, countRecentContacts } from "@/lib/db";

function clean(v) {
  return String(v || "").replace(/[<>]/g, "").trim();
}

export async function POST(req) {
  try {
    const body = await req.json();
    const firstName = clean(body?.firstName);
    const lastName = clean(body?.lastName);
    const email = clean(body?.email).toLowerCase();
    const message = clean(body?.message);

    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
    }

    const settings = await getSettings();
    const security = settings.security || {};
    const maxContactPerHour = Number(security.maxContactPerHour || 20);
    const countHour = await countRecentContacts(1);
    if (countHour >= maxContactPerHour) {
      return NextResponse.json({ error: "Hệ thống đang nhận quá nhiều liên hệ, vui lòng thử lại sau." }, { status: 429 });
    }

    const id = `c_${crypto.randomUUID()}`;
    await saveContactSubmission({ id, firstName, lastName, email, message });

    const smtp = settings.smtp || {};
    const hasSMTP = smtp.host && smtp.user && smtp.pass && smtp.fromEmail && smtp.toEmail;
    if (hasSMTP) {
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
        html: `<p><strong>Name:</strong> ${firstName} ${lastName}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong><br/>${message.replace(/\n/g, "<br/>")}</p>`,
      });
    }

    return NextResponse.json({ ok: true, message: "Đã ghi nhận liên hệ" });
  } catch {
    return NextResponse.json({ error: "Gửi liên hệ thất bại" }, { status: 500 });
  }
}
