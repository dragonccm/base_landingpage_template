import { readdir } from "node:fs/promises";
import path from "node:path";
import { buildRoleTask } from "./prompts.mjs";
import { validateCodeAutoRoleRuns } from "./validators.mjs";
import { scaffoldProject } from "./projectScaffold.mjs";

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

  if (cmd === "cook") {
    const requirement = await openclaw.spawn({
      role: "requirements",
      runtime: "subagent",
      task: buildRoleTask({ role: "requirements", command: "brainstorm", input, projectContext })
    });

    const planRun = await openclaw.spawn({
      role: "planner",
      runtime: "subagent",
      task: buildRoleTask({ role: "planner", command: "plan", input, projectContext })
    });

    const scaffold = await scaffoldProject({
      baseDir: process.cwd(),
      requestText: input.freeText,
      stackHint: input.args.stack
    });

    const dev = await openclaw.spawn({
      role: "developer",
      runtime: "acp",
      task: `${buildRoleTask({ role: "developer", command: "code:auto", input, projectContext })}\nTarget project path: ${scaffold.projectDir}`
    });
    const tester = await openclaw.spawn({
      role: "tester",
      runtime: "acp",
      task: `${buildRoleTask({ role: "tester", command: "code:auto", input, projectContext })}\nTarget project path: ${scaffold.projectDir}`
    });
    const reviewer = await openclaw.spawn({
      role: "reviewer",
      runtime: "subagent",
      task: `${buildRoleTask({ role: "reviewer", command: "code:review", input, projectContext })}\nTarget project path: ${scaffold.projectDir}`
    });
    const docs = await openclaw.spawn({
      role: "docs",
      runtime: "subagent",
      task: `${buildRoleTask({ role: "docs", command: "code:auto", input, projectContext })}\nTarget project path: ${scaffold.projectDir}`
    });

    return {
      summary: `Cook completed. Generated ${scaffold.stack} project at ${path.relative(process.cwd(), scaffold.projectDir)}.`,
      files: [
        { name: "cook-summary.md", content: `# Cook Summary\n\n## Requirement\n${requirement.result}\n\n## Plan\n${planRun.result}\n\n## Delivery\n- Stack: ${scaffold.stack}\n- Project: ${scaffold.projectName}\n- Path: ${scaffold.projectDir}\n` },
        { name: "project-output.md", content: `# Project Output\n\nProject folder: ${scaffold.projectDir}\n\n## Agent Execution\n- Developer: ${dev.result}\n- Tester: ${tester.result}\n- Reviewer: ${reviewer.result}\n- Docs: ${docs.result}\n\n## Run\n1. cd \"${scaffold.projectDir}\"\n2. npm install\n3. Follow README.md\n` }
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

  let gateFailed = failed;
  if (cmd === "code:auto") {
    const gate = validateCodeAutoRoleRuns(roleRuns);
    gateFailed = gateFailed || !gate.passed;

    files.push({
      name: "quality-gate.md",
      content: `# Quality Gate\n\n- Build/Test/Review pipeline: ${gateFailed ? "FAILED" : "PASSED"}\n- Live errors detected: ${failed ? "YES" : "NO"}\n- Evidence format checks passed: ${gate.passed ? "YES" : "NO"}\n\n## Failed Checks\n${gate.failedChecks.length ? gate.failedChecks.map((c) => `- ${c}`).join("\n") : "- none"}\n\n${
        gateFailed
          ? "Action: fix missing evidence / live errors and rerun same phase."
          : "Action: proceed to next phase."
      }\n`
    });
  }

  const summary = gateFailed
    ? `/${cmd} completed with issues (${roleRuns.length} role(s)); quality gate failed, check artifacts.`
    : `/${cmd} completed via ${workflow.runtime} (${roleRuns.length} role(s)).`;

  return { summary, files };
}
