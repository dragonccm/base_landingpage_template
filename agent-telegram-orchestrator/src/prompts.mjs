export function buildRoleTask({ role, command, input, projectContext }) {
  const base = `Command: /${command}\nArgs: ${JSON.stringify(input.args)}\nFreeText: ${input.freeText || ""}\n\n${projectContext}`;

  const roleHints = {
    scout: "Scan codebase and produce concise architecture and standards summary.",
    requirements: "Clarify goals, constraints, and acceptance criteria. Ask at most 3 questions if needed.",
    planner: "Produce phased implementation plan with dependencies, risks, and milestone definitions.",
    researcher: "Gather alternatives/tradeoffs and highlight assumptions.",
    developer: "Implement by phase, keep commits atomic, report changed files and rationale.",
    tester: "Write and run tests, provide failures with reproducible steps.",
    reviewer: "Review for correctness, maintainability, and security risks.",
    debugger: "Perform root-cause analysis from logs and suggest minimal-risk fix + regression tests.",
    tracker: "Summarize project health, bottlenecks, and next best actions."
  };

  return `${base}\n\nRole: ${role}\nInstruction: ${roleHints[role] || "Complete assigned task with high signal output."}`;
}
