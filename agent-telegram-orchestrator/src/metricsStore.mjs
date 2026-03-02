import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.resolve(process.cwd(), "data");
const METRICS_FILE = path.join(DATA_DIR, "autoflow-metrics.json");

async function readMetrics() {
  try {
    const raw = await readFile(METRICS_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return {
      updatedAt: null,
      totalRuns: 0,
      successRuns: 0,
      failedRuns: 0,
      stageFailures: {},
      failureTypes: {}
    };
  }
}

export async function recordAutoflowMetrics({ success, failures = [] }) {
  await mkdir(DATA_DIR, { recursive: true });
  const m = await readMetrics();
  m.totalRuns += 1;
  if (success) m.successRuns += 1;
  else m.failedRuns += 1;

  for (const f of failures) {
    const stage = f.stage || "unknown";
    const type = f.type || "unknown";
    m.stageFailures[stage] = (m.stageFailures[stage] || 0) + 1;
    m.failureTypes[type] = (m.failureTypes[type] || 0) + 1;
  }

  m.updatedAt = new Date().toISOString();
  await writeFile(METRICS_FILE, JSON.stringify(m, null, 2), "utf8");
}

export async function getAutoflowMetrics() {
  return readMetrics();
}
