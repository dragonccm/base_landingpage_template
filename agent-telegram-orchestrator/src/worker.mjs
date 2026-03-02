import { handleMessageDetailed } from "./core.mjs";
import { claimNextJob, finishJob } from "./queueStore.mjs";
import { loadDotEnv } from "./env.mjs";

loadDotEnv();

const liveMode = process.env.OPENCLAW_LIVE_MODE === "1";
const idleMs = Number(process.env.WORKER_IDLE_MS || 1200);

async function runOnce() {
  const job = await claimNextJob();
  if (!job) return false;

  try {
    const out = await handleMessageDetailed(job.commandText, {
      dryRun: !liveMode,
      source: `queue:${job.source}`
    });
    await finishJob(job.id, { result: out });
  } catch (e) {
    await finishJob(job.id, { error: e.message });
  }

  return true;
}

async function main() {
  console.log("Queue worker started.");
  console.log(`Mode: ${liveMode ? "live" : "dry-run"}`);

  while (true) {
    const did = await runOnce();
    if (!did) await new Promise((r) => setTimeout(r, idleMs));
  }
}

main().catch((e) => {
  console.error("Worker fatal:", e.message);
  process.exit(1);
});
