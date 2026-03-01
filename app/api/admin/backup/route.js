import { NextResponse } from "next/server";
import { mkdir, writeFile, cp, readdir, stat, rm } from "fs/promises";
import path from "path";
import { exportBackupData } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { auditAdminAction } from "@/lib/audit";

const backupsBase = path.join(process.cwd(), "backups");

export async function GET(req) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  await mkdir(backupsBase, { recursive: true });
  const entries = await readdir(backupsBase, { withFileTypes: true });
  const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  const items = await Promise.all(
    dirs.map(async (name) => {
      const fullPath = path.join(backupsBase, name);
      const s = await stat(fullPath);
      return {
        id: name,
        path: fullPath,
        createdAt: s.birthtime?.toISOString?.() || s.mtime.toISOString(),
      };
    })
  );

  items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  await auditAdminAction(req, guard.user, "backup.read", "backups", { count: items.length });
  return NextResponse.json({ items });
}

export async function POST(req) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const ts = new Date().toISOString().replace(/[.:]/g, "-");
  const backupRoot = path.join(backupsBase, ts);
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  const targetUploads = path.join(backupRoot, "uploads");

  await mkdir(backupRoot, { recursive: true });
  const data = await exportBackupData();
  await writeFile(path.join(backupRoot, "database.json"), JSON.stringify(data, null, 2), "utf-8");

  try {
    await cp(uploadsDir, targetUploads, { recursive: true });
  } catch {
    // no uploads yet
  }

  await auditAdminAction(req, guard.user, "backup.create", "backups", { backupPath: backupRoot });
  return NextResponse.json({ ok: true, backupPath: backupRoot });
}

export async function DELETE(req) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing backup id" }, { status: 400 });
  if (id.includes("..") || id.includes("/") || id.includes("\\")) {
    return NextResponse.json({ error: "Invalid backup id" }, { status: 400 });
  }

  const target = path.join(backupsBase, id);
  await rm(target, { recursive: true, force: true });
  await auditAdminAction(req, guard.user, "backup.delete", "backups", { id, target });
  return NextResponse.json({ ok: true });
}
