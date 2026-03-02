# Multi-Agent Workflow v1

## Goal
Run a full automated delivery pipeline using multiple subagents/ACP roles with enforced gates and automatic loop-back when quality is insufficient.

## Stages
1. intake (subagent)
2. plan (subagent)
3. build (acp)
4. test (acp)
5. security (subagent)
6. release (acp)

## Gate Rule
A stage output is considered failed when output contains:
- `[LIVE_ERROR]`
- `fail`, `failed`, `critical`, `blocker`

Failed gate behavior:
- intake/plan/build fail -> restart loop from intake
- test fail -> run rework-build then loop again
- security fail -> run rework-security then loop again

## Command
`/autoflow <requirement text> [maxLoops=2]`

## Artifacts
- `autoflow-summary.md`
- `gate-report.md`
- `release-report.md`

## Current readiness
- v1 is operational but heuristic-based (keyword gate detection).
- v2 should move to strict structured role output schema and explicit pass/fail fields.
