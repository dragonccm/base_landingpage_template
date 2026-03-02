import { exec } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(exec);

async function check(name, command) {
  try {
    const { stdout } = await run(command, { windowsHide: true });
    console.log(`✅ ${name}${stdout?.trim() ? ` -> ${stdout.trim()}` : ""}`);
    return true;
  } catch (e) {
    console.log(`❌ ${name} -> ${e.message}`);
    return false;
  }
}

async function main() {
  const results = [];
  results.push(await check("node", "node -v"));
  results.push(await check("npm", "npm -v"));
  results.push(await check("openclaw", "openclaw --version"));

  const ok = results.every(Boolean);
  if (!ok) {
    console.log("\nDoctor result: FAILED");
    process.exit(1);
  }

  console.log("\nDoctor result: PASSED");
}

main().catch((e) => {
  console.error("❌ kit:doctor crashed:", e.message);
  process.exit(1);
});
