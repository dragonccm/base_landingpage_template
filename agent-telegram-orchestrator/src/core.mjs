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
export const projectRoot = path.resolve(__dirname, "..");

function formatTelegramReply({ command, runId, summary, artifactPaths, profileId }) {
  const profileLine = profileId ? `\n- project profile: ${profileId}` : "";
  return `✅ /${command} completed (run: ${runId})${profileLine}\n- ${summary}\nArtifacts:\n${artifactPaths
    .map((p) => `- ${path.relative(projectRoot, p)}`)
    .join("\n")}`;
}

export async function handleMessage(text, { dryRun = true } = {}) {
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
