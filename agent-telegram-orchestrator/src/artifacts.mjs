import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export function createRunId(now = new Date()) {
  const pad = (v) => String(v).padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

export async function writeArtifacts(baseDir, command, runId, files) {
  const cmdFolder = command.replaceAll(":", "-");
  const outDir = path.join(baseDir, "artifacts", cmdFolder, runId);
  await mkdir(outDir, { recursive: true });

  const written = [];
  for (const file of files) {
    const full = path.join(outDir, file.name);
    await writeFile(full, file.content, "utf8");
    written.push(full);
  }
  return written;
}
