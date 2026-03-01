import { NextResponse } from "next/server";
import { mkdir, writeFile, cp } from "fs/promises";
import path from "path";
import { exportBackupData } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth";

export async function POST() {
  const guard = await requireSuperAdmin();
  if (guard.error) return guard.error;

  const ts = new Date().toISOString().replace(/[.:]/g, "-");
  const backupRoot = path.join(process.cwd(), "backups", ts);
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

  return NextResponse.json({ ok: true, backupPath: backupRoot });
}
