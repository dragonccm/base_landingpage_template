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
    tracker: "Summarize project health, bottlenecks, and next best actions.",
    docs: "Update technical docs/specs to reflect implementation and behavior changes.",
    intake: "Normalize requirements input into clear scope, constraints, and acceptance criteria.",
    security: "Review implementation for auth/validation/secret/rate-limit risks and provide severity-based findings.",
    devops: "Validate build/release readiness, rollout checklist, and rollback instructions.",
    integration: "Validate FE/BE integration contracts and identify mismatch risks.",
    qc: "Create test plan and product-level quality checklist with pass/fail criteria."
  };

  const strictTemplate =
    command === "code:auto"
      ? "\n\nSTRICT OUTPUT FORMAT (required):\n- Changed Files: <list>\n- Commit Hash: <hash-or-none>\n- Test Result: <pass/fail + evidence>\n- Security: <findings/no critical>\n- Docs Updated: <what changed>\n- Next Action: <next step>"
      : "";

  return `${base}\n\nRole: ${role}\nInstruction: ${roleHints[role] || "Complete assigned task with high signal output."}${strictTemplate}`;
}
