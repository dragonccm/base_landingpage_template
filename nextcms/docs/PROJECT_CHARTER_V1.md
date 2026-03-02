# PROJECT CHARTER v1 — Multi-Agent Web Delivery System

**Date:** 2026-03-02  
**Status:** Approved (v1 baseline)  
**Scope:** Productize a multi-agent automation system that receives requirements and delivers production-candidate websites with strict gates.

---

## 1) Vision

Build a commercial-ready system where users submit requirements (feature list/Figma/spec), and a multi-agent pipeline plans, builds, tests, secures, and releases websites with auditable quality controls.

---

## 2) Technology Architecture (Target)

- **Control Plane**
  - Telegram commands
  - Web dashboard
- **Orchestration Core**
  - OpenClaw main orchestrator
- **Execution Layer**
  - `subagent`: planning/docs/review/governance
  - `acp`: coding/debug/test execution
- **State & Artifacts**
  - Run store (status/history/timeline)
  - Artifact store (spec/plan/test/review/security/deploy)
- **Gate Engine**
  - Template compliance gate
  - Build/Test gate
  - Security/SEO gate
  - Fail => auto loop back to previous step
- **Scheduler**
  - Cron checks: health, regressions, daily reports
- **Packaging**
  - One-command CLI + Docker bundle (phase 1)
  - Installer/EXE (phase 2)

---

## 3) Standard Multi-Agent Workflow

`INTAKE -> PLAN -> BUILD -> TEST -> SECURITY -> RELEASE`

Each stage:
1. Has an assigned role/agent
2. Must output required artifacts
3. Must pass gate criteria before advancing
4. Auto-returns to prior stage on failed input quality

---

## 4) Core Project Principles (Mandatory)

1. **Template Baseline Rule**  
   Every generated website must include at least all baseline template capabilities (never less).

2. **Gate-Driven Delivery**  
   No gate pass => no progression.

3. **Auto Rework Loop**  
   If output is unfit for next stage, route back automatically with fix checklist.

4. **Security & Structure First**  
   Data integrity, security baseline, and architecture correctness override speed.

5. **Artifact-First Auditability**  
   Decisions and outcomes must be traceable with standardized artifacts.

6. **Production Realism**  
   No absolute "zero bug" claims; enforce staged hardening and controlled release.

7. **Productization by Design**  
   Final deliverable is a reproducible kit: one command / installer setup.

---

## 5) Minimum Acceptance Standards

A release candidate must pass:
- Template compliance checklist
- `npm run build` success
- Functional smoke checks (core routes/API/auth)
- Security baseline (no critical/high unresolved)
- SEO baseline (meta/OG/canonical/sitemap/robots)
- Updated docs/runbook

---

## 6) Role Model (Human -> Agent Mapping)

- PM / Orchestrator -> workflow coordination
- QA (process) -> standards and gates
- QC/Tester (product) -> test plans/execution/re-test
- Developer (FE/BE) -> implementation
- Security -> risk and hardening review
- DevOps -> build/release/rollback readiness

---

## 7) Product Roadmap

### Phase A — Reliability Foundation
- Enforce schemas/contracts
- Implement strict gate policies
- Improve rework loop precision

### Phase B — Operational Hardening
- Queue + retry/backoff
- Better telemetry and failure taxonomy
- Release governance and risk scoring

### Phase C — Commercial Packaging
- CLI init/start/doctor/upgrade
- Docker one-command deployment
- Backup/restore and health diagnostics

### Phase D — User-Friendly Distribution
- Installer/EXE with setup wizard
- License/activation/update channels

---

## 8) Non-Negotiables

- No bypass for mandatory gates
- No feature regression below template baseline
- No sensitive deploy action without explicit approval
- No undocumented architectural changes

---

## 9) Governance

This charter is the single source of truth for architecture direction and delivery principles.
Any exceptions must be documented with rationale and approval.
