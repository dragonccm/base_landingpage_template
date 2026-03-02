import { exec } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(exec);

async function runStep(name, cmd) {
  process.stdout.write(`\n▶ ${name}\n`);
  const { stdout, stderr } = await run(cmd, { windowsHide: true, maxBuffer: 1024 * 1024 * 8 });
  if (stdout) process.stdout.write(stdout);
  if (stderr) process.stdout.write(stderr);
}

async function main() {
  await runStep("Doctor checks", "npm run kit:doctor");
  await runStep("Autoflow smoke run", "npm start -- \"/autoflow preflight smoke maxLoops=1\"");
  process.stdout.write("\n✅ Preflight passed.\n");
}

main().catch((e) => {
  console.error("\n❌ Preflight failed:", e.message);
  process.exit(1);
});
