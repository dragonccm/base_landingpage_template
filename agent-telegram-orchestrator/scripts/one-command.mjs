import { handleMessageDetailed } from "../src/core.mjs";
import { loadDotEnv } from "../src/env.mjs";
import { readFile } from "node:fs/promises";
import fs from "node:fs";
import path from "node:path";

loadDotEnv();

async function main() {
  const text = process.argv.slice(2).join(" ").trim();
  if (!text) {
    console.log("Usage: npm run one -- " + '"<chu de hoac yeu cau web>"');
    process.exit(1);
  }

  const templatePath = process.env.TEMPLATE_BASELINE_PATH || "C:\\Users\\nguye\\.openclaw\\workspace\\nextcms";

  let shipInput = text;
  const possiblePath = path.resolve(process.cwd(), text);
  if (fs.existsSync(possiblePath) && fs.statSync(possiblePath).isFile()) {
    const content = await readFile(possiblePath, "utf8");
    shipInput = `Use this brief content as source of truth:\n${content.slice(0, 24000)}`;
  }

  const command = `/ship ${shipInput} templatePath=${templatePath}`;
  const liveMode = process.env.OPENCLAW_LIVE_MODE === "1";

  const result = await handleMessageDetailed(command, { dryRun: !liveMode, source: "one-command" });
  console.log(result.reply);
}

main().catch((e) => {
  console.error("one-command failed:", e.message);
  process.exit(1);
});
