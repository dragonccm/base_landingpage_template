export async function runWorkflow({ workflow, input, openclaw }) {
  const cmd = workflow.command;

  if (cmd === "clear") {
    return {
      summary: "Context reset requested. No agent spawned.",
      files: [{ name: "clear-state.md", content: "# Clear\nSession context has been reset.\n" }]
    };
  }

  if (cmd === "plan") {
    const researchers = ["researcher-a", "researcher-b", "researcher-c"];
    const parallel = await Promise.all(
      researchers.map((r) =>
        openclaw.spawn({
          role: r,
          runtime: "subagent",
          task: `Research input: ${input.freeText || "project scope"}`
        })
      )
    );

    const planner = await openclaw.spawn({
      role: "planner",
      runtime: "subagent",
      task: `Synthesize researcher findings: ${parallel.map((p) => p.result).join(" | ")}`
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
        task: `${cmd} execution with args=${JSON.stringify(input.args)} freeText=${input.freeText}`
      })
    );
  }

  const files = (workflow.artifacts || []).map((name) => ({
    name,
    content: `# ${name}\n\nCommand: /${cmd}\nRuntime: ${workflow.runtime}\n\n## Agent Runs\n${roleRuns
      .map((r) => `- ${r.role}: ${r.result}`)
      .join("\n")}\n`
  }));

  const summary = `/${cmd} completed via ${workflow.runtime} (${roleRuns.length} role(s)).`;
  return { summary, files };
}
