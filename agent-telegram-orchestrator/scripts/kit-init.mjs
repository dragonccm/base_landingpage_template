import { mkdir, access, copyFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

async function ensureDir(rel) {
  await mkdir(path.join(root, rel), { recursive: true });
}

async function ensureEnv() {
  const env = path.join(root, ".env");
  const sample = path.join(root, ".env.example");
  try {
    await access(env);
    return "exists";
  } catch {
    try {
      await copyFile(sample, env);
      return "created";
    } catch {
      return "missing-sample";
    }
  }
}

async function main() {
  await ensureDir("artifacts");
  await ensureDir("data");
  await ensureDir("generated-projects");

  const envStatus = await ensureEnv();

  console.log("✅ Kit init done");
  console.log(`- workspace: ${root}`);
  console.log(`- .env: ${envStatus}`);
  console.log("Next steps:");
  console.log("1) Update .env values");
  console.log("2) npm run kit:doctor");
  console.log("3) npm run telegram OR npm run web");
}

main().catch((e) => {
  console.error("❌ kit:init failed:", e.message);
  process.exit(1);
});
