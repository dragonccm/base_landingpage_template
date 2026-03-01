export class OpenClawClient {
  constructor({ dryRun = true } = {}) {
    this.dryRun = dryRun;
  }

  async spawn({ role, runtime, task }) {
    if (this.dryRun) {
      return {
        sessionKey: `dry-${role}-${Date.now()}`,
        role,
        runtime,
        task,
        result: `[DRY_RUN] ${role} completed task on runtime=${runtime}`
      };
    }

    throw new Error("Live mode not wired yet. Integrate OpenClaw sessions_spawn/sessions_send in host runtime.");
  }
}
