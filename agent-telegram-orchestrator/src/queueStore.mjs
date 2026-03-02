import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.resolve(process.cwd(), "data");
const QUEUE_FILE = path.join(DATA_DIR, "queue.json");

async function readQueue() {
  try {
    const raw = await readFile(QUEUE_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeQueue(items) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(QUEUE_FILE, JSON.stringify(items, null, 2), "utf8");
}

export async function enqueueJob(commandText, source = "web") {
  const items = await readQueue();
  const id = `q_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  items.push({
    id,
    commandText,
    source,
    status: "queued",
    createdAt: new Date().toISOString(),
    startedAt: null,
    endedAt: null,
    result: null,
    error: null
  });
  await writeQueue(items);
  return id;
}

export async function claimNextJob() {
  const items = await readQueue();
  const idx = items.findIndex((x) => x.status === "queued");
  if (idx < 0) return null;
  items[idx].status = "running";
  items[idx].startedAt = new Date().toISOString();
  await writeQueue(items);
  return items[idx];
}

export async function finishJob(id, { result = null, error = null } = {}) {
  const items = await readQueue();
  const idx = items.findIndex((x) => x.id === id);
  if (idx < 0) return;
  items[idx].status = error ? "failed" : "done";
  items[idx].endedAt = new Date().toISOString();
  items[idx].result = result;
  items[idx].error = error;
  await writeQueue(items);
}

export async function listJobs(limit = 100) {
  const items = await readQueue();
  return items.slice(-Math.max(1, Math.min(limit, 500))).reverse();
}
