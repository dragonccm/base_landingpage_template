import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseTelegramCommand } from "./parser.mjs";
import { resolveWorkflow, validateCommandInput } from "./router.mjs";
import { createRunId, writeArtifacts } from "./artifacts.mjs";
import { runWorkflow } from "./workflows.mjs";
import { OpenClawClient } from "./openclawClient.mjs";
import { buildProjectContext } from "./contextBuilder.mjs";
import { appendRun } from "./runStore.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const projectRoot = path.resolve(__dirname, "..");

function formatTelegramReply({ command, runId, summary, artifactPaths, profileId }) {
  const profileLine = profileId ? `\n- project profile: ${profileId}` : "";
  return `✅ /${command} completed (run: ${runId})${profileLine}\n- ${summary}\nArtifacts:\n${artifactPaths
    .map((p) => `- ${path.relative(projectRoot, p)}`)
    .join("\n")}`;
}

export async function handleMessageDetailed(text, { dryRun = true, source = "unknown" } = {}) {
  const startedAt = new Date().toISOString();
  const parsed = parseTelegramCommand(text);
  if (!parsed.ok) {
    return {
      ok: false,
      error: parsed.error,
      reply: `❌ ${parsed.error}`
    };
  }

  const workflow = resolveWorkflow(parsed.command);
  if (!workflow) {
    return {
      ok: false,
      error: `Unknown command: /${parsed.command}`,
      reply: `❌ Unknown command: /${parsed.command}`
    };
  }

  const validationError = validateCommandInput(parsed.command, parsed);
  if (validationError) {
    return {
      ok: false,
      error: validationError,
      reply: `❌ ${validationError}`
    };
  }

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
  const reply = formatTelegramReply({
    command: parsed.command,
    runId,
    summary,
    artifactPaths,
    profileId
  });

  const endedAt = new Date().toISOString();
  await appendRun({
    runId,
    command: parsed.command,
    text,
    source,
    dryRun,
    profileId: profileId || null,
    summary,
    artifactPaths: artifactPaths.map((p) => path.relative(projectRoot, p)),
    startedAt,
    endedAt
  });

  return {
    ok: true,
    runId,
    command: parsed.command,
    summary,
    profileId,
    artifactPaths,
    reply
  };
}

export async function handleMessage(text, options = {}) {
  const result = await handleMessageDetailed(text, options);
  return result.reply;
}
