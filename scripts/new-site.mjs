#!/usr/bin/env node
import { mkdir, cp, readFile, writeFile, access } from "fs/promises";
import path from "path";

const [, , targetArg, siteNameArg] = process.argv;
if (!targetArg) {
  console.error("Usage: node scripts/new-site.mjs <target-folder> [site-name]");
  process.exit(1);
}

const sourceRoot = process.cwd();
const targetRoot = path.resolve(sourceRoot, "..", targetArg);
const siteName = siteNameArg || path.basename(targetRoot);

async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

if (await exists(targetRoot)) {
  console.error(`Target already exists: ${targetRoot}`);
  process.exit(1);
}

await mkdir(targetRoot, { recursive: true });

await cp(sourceRoot, targetRoot, {
  recursive: true,
  filter: (src) => {
    const rel = path.relative(sourceRoot, src);
    if (!rel) return true;
    const deny = ["node_modules", ".next", ".git", "backups"];
    return !deny.some((d) => rel.split(path.sep).includes(d));
  },
});

const pkgPath = path.join(targetRoot, "package.json");
const pkg = JSON.parse(await readFile(pkgPath, "utf-8"));
pkg.name = siteName.toLowerCase().replace(/[^a-z0-9-]/g, "-");
await writeFile(pkgPath, JSON.stringify(pkg, null, 2), "utf-8");

const envExamplePath = path.join(targetRoot, ".env.example");
const envLocalPath = path.join(targetRoot, ".env.local");
const baseEnv = await exists(envExamplePath)
  ? await readFile(envExamplePath, "utf-8")
  : "DATABASE_URL=\nJWT_SECRET=change-me\n";

const envBoot = `${baseEnv}\n# Auto-generated for ${siteName}\nJWT_SECRET=${crypto.randomUUID().replace(/-/g, "")}\n`;
await writeFile(envLocalPath, envBoot, "utf-8");

console.log(`✅ New site created at: ${targetRoot}`);
console.log(`Next steps:`);
console.log(`1) cd ${targetRoot}`);
console.log(`2) npm install`);
console.log(`3) npm run seed`);
console.log(`4) npm run dev`);
