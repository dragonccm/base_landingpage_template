#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const targetDir = path.resolve(process.argv[2] || process.env.TEMPLATE_CHECK_TARGET || process.cwd());

const requiredPaths = [
  "app/admin/page.js",
  "app/api/admin/landing/route.js",
  "app/api/admin/settings/route.js",
  "app/api/admin/settings/smtp-test/route.js",
  "app/api/admin/settings/smtp-send-test/route.js",
  "app/api/admin/users/route.js",
  "app/api/admin/posts/route.js",
  "app/api/blog/posts/route.js",
  "app/globals.css",
  "lib/db.js",
  "AGENTS.md",
  "DEPLOYMENT.md",
  "docs/PROJECT_CHARTER_V1.md",
  "docs/TEMPLATE_BASELINE_POLICY.md",
];

const requiredScripts = ["dev", "build", "start", "verify:deploy"];

function exists(rel) {
  return fs.existsSync(path.join(targetDir, rel));
}

function loadPackageJson() {
  try {
    const raw = fs.readFileSync(path.join(targetDir, "package.json"), "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const failed = [];

for (const rel of requiredPaths) {
  if (!exists(rel)) failed.push(`Missing required path: ${rel}`);
}

const pkg = loadPackageJson();
if (!pkg) {
  failed.push("Missing or invalid package.json");
} else {
  for (const s of requiredScripts) {
    if (!pkg.scripts?.[s]) failed.push(`Missing package.json script: ${s}`);
  }
}

console.log(`Template Compliance Check`);
console.log(`Target: ${targetDir}`);

if (failed.length) {
  console.log("\n❌ FAILED");
  for (const f of failed) console.log(`- ${f}`);
  process.exit(1);
}

console.log("\n✅ PASSED");
console.log("All mandatory baseline files/scripts are present.");
