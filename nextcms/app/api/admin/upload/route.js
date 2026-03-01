import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { requirePostEditor } from "@/lib/auth";
import { getMedia, saveMedia } from "@/lib/db";
import { auditAdminAction } from "@/lib/audit";

export async function POST(req) {
  const guard = await requirePostEditor();
  if (guard.error) return guard.error;

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file) return NextResponse.json({ error: "Missing file" }, { status: 400 });
    const isImage = file.type?.startsWith("image/");
    const isVideo = file.type?.startsWith("video/");
    if (!isImage && !isVideo) return NextResponse.json({ error: "Only image/video files are allowed" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = (file.name?.split(".").pop() || "png").toLowerCase();
    const safeExt = ["png", "jpg", "jpeg", "webp", "gif", "svg", "mp4", "webm", "mov"].includes(ext) ? ext : "png";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExt}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    const uploadedUrl = `/uploads/${filename}`;
    const uploadedType = isVideo ? "video" : "image";

    const media = await getMedia();
    const existed = media.some((m) => m.url === uploadedUrl);
    if (!existed) {
      media.unshift({
        id: `m_${crypto.randomUUID()}`,
        url: uploadedUrl,
        name: file.name || filename,
        alt: "",
        type: uploadedType,
        createdAt: new Date().toISOString(),
      });
      await saveMedia(media);
    }

    await auditAdminAction(req, guard.user, "upload.create", "upload", {
      filename,
      mimeType: file.type || null,
      size: typeof file.size === "number" ? file.size : null,
      registeredInMedia: true,
    });

    return NextResponse.json({ ok: true, url: uploadedUrl, type: uploadedType });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
