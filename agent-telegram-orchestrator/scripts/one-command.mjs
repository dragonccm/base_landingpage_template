import { handleMessageDetailed } from "../src/core.mjs";
import { loadDotEnv } from "../src/env.mjs";

loadDotEnv();

async function main() {
  const text = process.argv.slice(2).join(" ").trim();
  if (!text) {
    console.log("Usage: npm run one -- " + '"<chu de hoac yeu cau web>"');
    process.exit(1);
  }

  const templatePath = process.env.TEMPLATE_BASELINE_PATH || "C:\\Users\\nguye\\.openclaw\\workspace\\nextcms";
  const command = `/ship ${text} templatePath=${templatePath}`;
  const liveMode = process.env.OPENCLAW_LIVE_MODE === "1";

  const result = await handleMessageDetailed(command, { dryRun: !liveMode, source: "one-command" });
  console.log(result.reply);
}

main().catch((e) => {
  console.error("one-command failed:", e.message);
  process.exit(1);
});
