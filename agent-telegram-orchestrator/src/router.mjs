import registry from "../workflow-registry.json" with { type: "json" };

export function resolveWorkflow(command) {
  const spec = registry[command];
  if (!spec) return null;
  return { command, ...spec };
}

export function validateCommandInput(command, { args, freeText }) {
  if (command === "code:auto" && !args.phase) {
    return "Missing required arg: phase (example: /code:auto phase=1)";
  }

  if (command === "cook" && !freeText) {
    return "Please describe what to build (example: /cook create app quản lý chi tiêu android bằng react native)";
  }

  if (command === "brainstorm" && !freeText) {
    return "Please provide idea/context after /brainstorm";
  }

  if (command === "code:review" && !args.target) {
    return "Missing required arg: target (example: /code:review target=feature/auth)";
  }

  if (command === "debug" && !freeText && !args.log) {
    return "Please provide logs/stacktrace text or log=<...>";
  }

  return null;
}
