import { mkdir, cp, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(exec);
const root = process.cwd();

function ts() {
  const d = new Date();
  const p = (v) => String(v).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

async function main() {
  const stamp = ts();
  const outDir = path.join(root, "dist", `kit-${stamp}`);
  await mkdir(outDir, { recursive: true });

  const include = [
    "src",
    "scripts",
    "project-profiles",
    "workflow-registry.json",
    "gate-policy.json",
    "README.md",
    "command-spec.md",
    "OPENCLAW_INTEGRATION.md",
    "system-architecture.md",
    "MULTI_AGENT_WORKFLOW_V1.md",
    "package.json",
    ".env.example",
    "Dockerfile",
    "docker-compose.yml"
  ];

  for (const item of include) {
    await cp(path.join(root, item), path.join(outDir, item), { recursive: true, force: true });
  }

  const pkgRaw = await readFile(path.join(outDir, "package.json"), "utf8");
  const pkg = JSON.parse(pkgRaw);
  await writeFile(path.join(outDir, "PACKAGE_INFO.json"), JSON.stringify({
    name: pkg.name,
    version: pkg.version,
    packedAt: new Date().toISOString()
  }, null, 2));

  const zipPath = path.join(root, "dist", `kit-${stamp}.zip`);
  const ps = `Compress-Archive -Path \"${outDir}\\*\" -DestinationPath \"${zipPath}\" -Force`;
  await run(`powershell -NoProfile -Command "${ps}"`, { windowsHide: true });

  console.log("✅ Kit packed");
  console.log(`- folder: ${outDir}`);
  console.log(`- zip: ${zipPath}`);
}

main().catch((e) => {
  console.error("❌ kit:pack failed:", e.message);
  process.exit(1);
});
