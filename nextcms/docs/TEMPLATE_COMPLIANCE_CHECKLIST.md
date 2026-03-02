# TEMPLATE COMPLIANCE CHECKLIST

Use this checklist for every generated website to ensure it is not below baseline template.

## Command

```bash
npm run verify:template
# or check another project path
node scripts/template-compliance-check.mjs <target-dir>
```

## Mandatory checks

- Core admin routes exist
- SMTP test routes exist
- Blog APIs exist
- Baseline docs exist (`AGENTS.md`, `DEPLOYMENT.md`, charter/policy)
- Required package scripts exist (`dev`, `build`, `start`, `verify:deploy`)

## Release policy

- If template compliance fails => STOP pipeline
- Route task back to responsible build stage for fix
- Re-run `verify:template` until PASS
- Standard release precheck command:

```bash
npm run verify:release
```

This runs template compliance first, then deploy verification.
