# Implementation Plan (Phased)

## Phase 1 — Core plumbing (2 ngày)
- [ ] Tạo command router và parser
- [ ] Tạo workflow registry (`/docs:init`, `/brainstorm`, `/plan`, `/debug`, `/code:review`, `/code:auto`, `/watzup`)
- [ ] Tạo run-id + thư mục artifact theo run
- [ ] Basic notifier format về Telegram

## Phase 2 — Agent orchestration (3 ngày)
- [ ] Adapter cho OpenClaw `sessions_spawn` / `sessions_send`
- [ ] Runtime policy: command nào dùng subagent/acp
- [ ] Timeout/retry/cancel
- [ ] Chuẩn hóa template prompt cho từng role

## Phase 3 — Quality gates + review parallel (2 ngày)
- [ ] Gate cho `/code:auto`
- [ ] Parallel review 6 vai trò cho `/code:review`
- [ ] Severity scoring + action checklist

## Phase 4 — Telemetry & tracker (1-2 ngày)
- [ ] Thu metrics command success, latency, failure reason
- [ ] Tạo `project-health.md` cho `/watzup`
- [ ] Milestone status snapshot

## Phase 5 — Hardening (1-2 ngày)
- [ ] Allowlist auth
- [ ] Confirm flow cho command nhạy cảm
- [ ] Secret redaction
- [ ] Budget caps

## Exit Criteria (MVP done)
- [ ] 7/8 command chạy được end-to-end (`/clear` chỉ reset)
- [ ] Có artifact chuẩn cho mỗi command
- [ ] Có runbook vận hành và xử lý sự cố
