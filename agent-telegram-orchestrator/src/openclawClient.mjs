import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

function roleToAgentEnv(role, runtime) {
  const key = `OPENCLAW_AGENT_${runtime.toUpperCase()}_${role.replaceAll("-", "_").toUpperCase()}`;
  return process.env[key] || process.env.OPENCLAW_AGENT_DEFAULT || "main";
}

function extractReplyText(json) {
  if (!json) return "";
  if (typeof json.replyText === "string") return json.replyText;
  if (typeof json.text === "string") return json.text;
  if (typeof json.output === "string") return json.output;
  if (typeof json.message === "string") return json.message;
  if (Array.isArray(json.messages)) {
    const last = [...json.messages].reverse().find((m) => typeof m?.text === "string");
    if (last?.text) return last.text;
  }
  return JSON.stringify(json);
}

async function runOpenClawAgent({ role, runtime, task, timeoutMs }) {
  const agentId = roleToAgentEnv(role, runtime);
  const args = [
    "agent",
    "--agent",
    agentId,
    "--message",
    task,
    "--json",
    "--timeout",
    String(Math.ceil(timeoutMs / 1000))
  ];

  const { stdout } = await execFileAsync("openclaw", args, {
    windowsHide: true,
    maxBuffer: 1024 * 1024 * 4,
    timeout: timeoutMs
  });

  let parsed;
  try {
    parsed = JSON.parse(stdout);
  } catch {
    parsed = { raw: stdout };
  }

  const result = extractReplyText(parsed).trim() || "[empty response]";
  return {
    agentId,
    result,
    raw: parsed
  };
}

export class OpenClawClient {
  constructor({ dryRun = true, timeoutMs = 120000 } = {}) {
    this.dryRun = dryRun;
    this.timeoutMs = timeoutMs;
  }

  async spawn({ role, runtime, task }) {
    if (this.dryRun) {
      return {
        sessionKey: `dry-${role}-${Date.now()}`,
        role,
        runtime,
        task,
        agentId: "dry-run",
        result: `[DRY_RUN] ${role} completed task on runtime=${runtime}`
      };
    }

    try {
      const live = await runOpenClawAgent({
        role,
        runtime,
        task,
        timeoutMs: this.timeoutMs
      });

      return {
        sessionKey: `agent:${live.agentId}:main`,
        role,
        runtime,
        task,
        agentId: live.agentId,
        result: live.result
      };
    } catch (err) {
      return {
        sessionKey: `agent:error:${Date.now()}`,
        role,
        runtime,
        task,
        agentId: roleToAgentEnv(role, runtime),
        result: `[LIVE_ERROR] ${err.message}`
      };
    }
  }
}
