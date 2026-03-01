import { readdir } from "node:fs/promises";
import path from "node:path";
import { buildRoleTask } from "./prompts.mjs";

function hasLiveErrors(roleRuns) {
  return roleRuns.some((r) => (r.result || "").includes("[LIVE_ERROR]"));
}

async function collectArtifactStats() {
  const root = path.resolve(process.cwd(), "artifacts");
  const commands = ["brainstorm", "plan", "code-auto", "code-review", "debug", "watzup"];
  const stats = {};

  for (const cmd of commands) {
    try {
      const dir = path.join(root, cmd);
      const runs = await readdir(dir, { withFileTypes: true });
      stats[cmd] = runs.filter((d) => d.isDirectory()).length;
    } catch {
      stats[cmd] = 0;
    }
  }

  return stats;
}

export async function runWorkflow({ workflow, input, openclaw, projectContext }) {
  const cmd = workflow.command;

  if (cmd === "clear") {
    return {
      summary: "Context reset requested. No agent spawned.",
      files: [{ name: "clear-state.md", content: "# Clear\nSession context has been reset.\n" }]
    };
  }

  if (cmd === "watzup") {
    const tracker = await openclaw.spawn({
      role: "tracker",
      runtime: "subagent",
      task: buildRoleTask({ role: "tracker", command: cmd, input, projectContext })
    });
    const stats = await collectArtifactStats();
    const summary = "/watzup completed via subagent (1 role).";
    return {
      summary,
      files: [
        {
          name: "project-health.md",
          content: `# Project Health\n\n## Workflow Runs\n- brainstorm: ${stats["brainstorm"]}\n- plan: ${stats["plan"]}\n- code:auto: ${stats["code-auto"]}\n- code:review: ${stats["code-review"]}\n- debug: ${stats["debug"]}\n\n## Tracker Summary\n${tracker.result}\n`
        }
      ]
    };
  }

  if (cmd === "plan") {
    const researchers = ["researcher-a", "researcher-b", "researcher-c"];
    const parallel = await Promise.all(
      researchers.map((r) =>
        openclaw.spawn({
          role: r,
          runtime: "subagent",
          task: buildRoleTask({
            role: "researcher",
            command: cmd,
            input,
            projectContext
          })
        })
      )
    );

    const planner = await openclaw.spawn({
      role: "planner",
      runtime: "subagent",
      task: `${buildRoleTask({ role: "planner", command: cmd, input, projectContext })}\n\nResearch inputs: ${parallel
        .map((p) => p.result)
        .join(" | ")}`
    });

    return {
      summary: "Planner synthesized parallel research and produced phased implementation plan.",
      files: [
        {
          name: "implementation-plan.md",
          content: `# Implementation Plan\n\n${planner.result}\n\n## Inputs\n- ${parallel.map((p) => p.role).join("\n- ")}\n`
        },
        {
          name: "risk-register.md",
          content: "# Risk Register\n\n- R1: Unknown requirements drift\n- R2: Agent timeout under heavy load\n- R3: Test flakiness in CI\n"
        }
      ]
    };
  }

  const roleRuns = [];
  for (const role of workflow.roles || []) {
    roleRuns.push(
      await openclaw.spawn({
        role,
        runtime: workflow.runtime,
        task: buildRoleTask({ role, command: cmd, input, projectContext })
      })
    );
  }

  const failed = hasLiveErrors(roleRuns);
  const files = (workflow.artifacts || []).map((name) => ({
    name,
    content: `# ${name}\n\nCommand: /${cmd}\nRuntime: ${workflow.runtime}\n\n## Agent Runs\n${roleRuns
      .map((r) => `- ${r.role}: ${r.result}`)
      .join("\n")}\n`
  }));

  if (cmd === "code:auto") {
    files.push({
      name: "quality-gate.md",
      content: `# Quality Gate\n\n- Build/Test/Review pipeline: ${failed ? "FAILED" : "PASSED"}\n- Live errors detected: ${failed ? "YES" : "NO"}\n\n${
        failed
          ? "Action: check [LIVE_ERROR] sections in reports, fix and rerun the same phase."
          : "Action: proceed to next phase."
      }\n`
    });
  }

  const summary = failed
    ? `/${cmd} completed with issues (${roleRuns.length} role(s)); check artifacts for [LIVE_ERROR].`
    : `/${cmd} completed via ${workflow.runtime} (${roleRuns.length} role(s)).`;

  return { summary, files };
}
