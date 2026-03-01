import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseTelegramCommand } from "./parser.mjs";
import { resolveWorkflow, validateCommandInput } from "./router.mjs";
import { createRunId, writeArtifacts } from "./artifacts.mjs";
import { runWorkflow } from "./workflows.mjs";
import { OpenClawClient } from "./openclawClient.mjs";
import { buildProjectContext } from "./contextBuilder.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

function formatTelegramReply({ command, runId, summary, artifactPaths, profileId }) {
  const profileLine = profileId ? `\n- project profile: ${profileId}` : "";
  return `✅ /${command} completed (run: ${runId})${profileLine}\n- ${summary}\nArtifacts:\n${artifactPaths.map((p) => `- ${path.relative(projectRoot, p)}`).join("\n")}`;
}

async function handleMessage(text, { dryRun = true } = {}) {
  const parsed = parseTelegramCommand(text);
  if (!parsed.ok) return `❌ ${parsed.error}`;

  const workflow = resolveWorkflow(parsed.command);
  if (!workflow) return `❌ Unknown command: /${parsed.command}`;

  const validationError = validateCommandInput(parsed.command, parsed);
  if (validationError) return `❌ ${validationError}`;

  const openclaw = new OpenClawClient({ dryRun });
  const runId = createRunId();
  const { profileId, projectContext } = await buildProjectContext(parsed);
  const { summary, files } = await runWorkflow({
    workflow,
    input: parsed,
    openclaw,
    projectContext
  });
  const artifactPaths = await writeArtifacts(projectRoot, parsed.command, runId, files);

  return formatTelegramReply({
    command: parsed.command,
    runId,
    summary,
    artifactPaths,
    profileId
  });
}

async function main() {
  const isDemo = process.argv.includes("--demo");

  if (isDemo) {
    const demos = [
      "/brainstorm project=expense-note-mobile Xây app mobile quản lý chi tiêu và ghi chú",
      "/plan project=expense-note-mobile scope=mvp-2-weeks",
      "/code:auto project=expense-note-mobile phase=1 branch=feature/mvp",
      "/code:review target=feature/mvp",
      "/debug CI failed at test step timeout"
    ];

    for (const d of demos) {
      const reply = await handleMessage(d, { dryRun: true });
      console.log("\n>>>", d);
      console.log(reply);
    }
    return;
  }

  const input = process.argv.slice(2).join(" ");
  if (!input) {
    console.log("Usage:\n  npm run demo\n  npm start -- \"/plan scope=mvp\"");
    return;
  }

  const reply = await handleMessage(input, { dryRun: true });
  console.log(reply);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
