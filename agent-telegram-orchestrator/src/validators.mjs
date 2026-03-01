export function validateCodeAutoRoleRuns(roleRuns = []) {
  const getRole = (name) => roleRuns.find((r) => r.role === name)?.result || "";

  const dev = getRole("developer");
  const tester = getRole("tester");
  const reviewer = getRole("reviewer");
  const docs = getRole("docs");

  const checks = [
    {
      key: "developer.changed_files",
      ok: /changed files\s*:/i.test(dev) || /files changed\s*:/i.test(dev)
    },
    {
      key: "developer.commit_hash",
      ok: /commit\s*(hash|id)?\s*:/i.test(dev)
    },
    {
      key: "tester.tests",
      ok: /test\s*result\s*:/i.test(tester) || /tests\s*pass/i.test(tester)
    },
    {
      key: "reviewer.security",
      ok: /security\s*:/i.test(reviewer) || /vulnerab/i.test(reviewer)
    },
    {
      key: "docs.updated",
      ok: /docs\s*updated\s*:/i.test(docs) || /documentation\s*:/i.test(docs)
    }
  ];

  const failed = checks.filter((c) => !c.ok).map((c) => c.key);
  return {
    passed: failed.length === 0,
    failedChecks: failed,
    checks
  };
}
