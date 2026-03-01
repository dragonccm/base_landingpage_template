#!/usr/bin/env node
import dotenv from "dotenv";
import { mkdir, writeFile, cp } from "fs/promises";
import path from "path";

dotenv.config({ path: ".env.local" });
const { exportBackupData } = await import("../lib/db.js");

const ts = new Date().toISOString().replace(/[.:]/g, "-");
const backupRoot = path.join(process.cwd(), "backups", ts);
await mkdir(backupRoot, { recursive: true });

const data = await exportBackupData();
await writeFile(path.join(backupRoot, "database.json"), JSON.stringify(data, null, 2), "utf-8");

try {
  await cp(path.join(process.cwd(), "public", "uploads"), path.join(backupRoot, "uploads"), { recursive: true });
} catch {}

console.log(`✅ Backup done: ${backupRoot}`);
