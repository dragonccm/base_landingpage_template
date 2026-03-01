import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.resolve(process.cwd(), "data");
const RUNS_FILE = path.join(DATA_DIR, "runs.json");

async function readRuns() {
  try {
    const raw = await readFile(RUNS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function appendRun(entry) {
  await mkdir(DATA_DIR, { recursive: true });
  const runs = await readRuns();
  runs.unshift(entry);
  const capped = runs.slice(0, 500);
  await writeFile(RUNS_FILE, JSON.stringify(capped, null, 2), "utf8");
}

export async function listRuns(limit = 50) {
  const runs = await readRuns();
  return runs.slice(0, Math.max(1, Math.min(limit, 200)));
}

export async function getRun(runId) {
  const runs = await readRuns();
  return runs.find((r) => r.runId === runId) || null;
}
