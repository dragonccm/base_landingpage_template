# Agent Telegram Orchestrator — Tài liệu Kiến trúc & Kỹ thuật đầy đủ

> Phiên bản: 1.0  
> Cập nhật: 2026-03-02  
> Phạm vi: Toàn bộ hệ thống điều phối agent qua Telegram/Web + OpenClaw runtime

---

## 1) Mục tiêu hệ thống

Hệ thống `agent-telegram-orchestrator` cho phép điều khiển quy trình làm dự án qua command chat, với triết lý:

- **Chat-first orchestration**: dùng Telegram (và web dashboard) làm mặt điều khiển.
- **Role-based execution**: chia việc theo vai trò agent (requirements/planner/developer/tester/reviewer/docs...).
- **Hybrid runtime**:
  - `subagent` cho phân tích/tổng hợp tài liệu.
  - `acp` cho coding/debug/test thực thi.
- **Artifact-first traceability**: mọi lần chạy tạo artifact markdown + lưu run log có thể audit.

---

## 2) Kiến trúc tổng thể (logical)

```text
[Telegram User] / [Web User]
        |
        v
[Ingress Layer]
  - telegramBot.mjs (polling)
  - webServer.mjs (HTTP API)
        |
        v
[Core Application Layer]
  - parser.mjs (parse command)
  - router.mjs (resolve workflow + validate input)
  - contextBuilder.mjs (inject project profile/context)
  - workflows.mjs (orchestration logic)
        |
        v
[Execution Layer]
  - openclawClient.mjs
    -> openclaw agent --json
    -> runtime: subagent / acp
        |
        v
[Persistence & Outputs]
  - artifacts/* (markdown outputs theo run)
  - data/runs.json (history/timeline)
  - generated-projects/* (/cook scaffold output)
```

---

## 3) Thành phần chính và trách nhiệm

### 3.1 `src/index.mjs` (entrypoint)
- Chọn mode chạy theo flag:
  - `--telegram`: chạy bot polling
  - `--web`: chạy dashboard API/web
  - `--demo`: chạy kịch bản mẫu
  - mặc định: xử lý 1 command CLI

### 3.2 `src/telegramBot.mjs` (Telegram ingress)
- Polling bằng `getUpdates` (long polling).
- Kiểm tra allowlist:
  - `TELEGRAM_ALLOW_USER_IDS`
  - `TELEGRAM_ALLOW_CHAT_IDS`
- Xử lý command nhạy cảm 2 bước confirm:
  - Sensitive set: `code:auto`, `debug`
  - Command xác nhận: `/confirm <id>`
  - TTL confirm: 10 phút
- Trả kết quả theo message reply thread-safe (`reply_parameters`).

### 3.3 `src/webServer.mjs` (Web ingress)
- Endpoint chính:
  - `GET /health`
  - `GET /` (UI tĩnh `src/web/index.html`)
  - `GET /api/runs?limit=...`
  - `GET /api/runs/:runId`
  - `POST /api/command` (thực thi command)
- Auth tùy chọn qua `WEB_DASHBOARD_TOKEN` (`Authorization: Bearer ...`).

### 3.4 `src/core.mjs` (application service)
Pipeline chuẩn cho mọi command:
1. Parse command (`parseTelegramCommand`).
2. Resolve workflow (`resolveWorkflow`).
3. Validate input (`validateCommandInput`).
4. Build project context/profile (`buildProjectContext`).
5. Chạy workflow (`runWorkflow`).
6. Ghi artifacts (`writeArtifacts`).
7. Lưu run record (`appendRun`).
8. Format reply thống nhất.

### 3.5 `src/workflows.mjs` (orchestrator)
- Chứa logic điều phối theo command, gồm cả tuần tự và song song.
- Trường hợp đặc biệt:
  - `clear`: local, không spawn agent.
  - `watzup`: tracker + thống kê run artifact.
  - `plan`: song song 3 researcher rồi planner tổng hợp.
  - `cook`: end-to-end từ requirement -> plan -> scaffold -> develop/test/review/docs.
- `code:auto` có quality gate (`validateCodeAutoRoleRuns`) và phát sinh `quality-gate.md`.

### 3.6 `src/openclawClient.mjs` (runtime adapter)
- Abstraction duy nhất để gọi OpenClaw agent.
- `dryRun=true` trả mock result để test luồng mà không gọi runtime thật.
- `dryRun=false` gọi:
  - `openclaw agent --agent <id> --message <task> --json --timeout <sec>`
- Mapping role -> agent id qua env:
  - `OPENCLAW_AGENT_<RUNTIME>_<ROLE>`
  - fallback `OPENCLAW_AGENT_DEFAULT`
- Bắt lỗi runtime thành `[LIVE_ERROR] ...` để không mất trace.

### 3.7 Persistence
- `src/artifacts.mjs`
  - RunId format: `YYYYMMDD-HHMMSS`
  - Thư mục artifact: `artifacts/<command>/<runId>/...`
- `src/runStore.mjs`
  - File: `data/runs.json`
  - Lưu tối đa 500 runs (FIFO newest-first)

---

## 4) Registry command và hợp đồng thực thi

Cấu hình nguồn sự thật tại `workflow-registry.json`:

- `docs:init` → subagent/scout
- `brainstorm` → subagent/requirements
- `plan` → subagent/planner+researchers (parallel)
- `code:auto` → acp/developer+tester+reviewer+docs (+quality gates)
- `debug` → acp/debugger
- `code:review` → subagent/multi-reviewers (parallel)
- `watzup` → subagent/tracker
- `cook` → hybrid end-to-end
- `clear` → local reset

Input validation cứng tại `router.mjs` (ví dụ: `code:auto` bắt buộc `phase`, `code:review` bắt buộc `target`, `cook` bắt buộc free-text...).

---

## 5) Luồng xử lý điển hình

### 5.1 Luồng `/plan`
1. User gửi `/plan ...`.
2. Parse/validate pass.
3. Spawn song song 3 `researcher-*` (subagent).
4. Gom output researchers vào prompt cho `planner`.
5. Sinh `implementation-plan.md` + `risk-register.md`.
6. Ghi run và phản hồi summary.

### 5.2 Luồng `/code:auto`
1. User gửi command.
2. (Telegram) yêu cầu confirm 2 bước.
3. Chạy roles runtime `acp`: developer → tester → reviewer → docs (theo cấu hình workflow).
4. Tạo các report markdown theo role.
5. Chạy quality gate kiểm tra evidence + lỗi runtime.
6. Kết luận pass/fail trong `quality-gate.md`.

### 5.3 Luồng `/cook` (all-in-one)
1. Requirements (subagent)
2. Planning (subagent)
3. Scaffold source (`projectScaffold.mjs`) vào `generated-projects/`
4. Developer + Tester (acp)
5. Reviewer + Docs (subagent)
6. Xuất `cook-summary.md` + `project-output.md`

---

## 6) Dữ liệu, cấu trúc thư mục, quy ước artifact

### 6.1 Thư mục chính
- `src/`: mã nguồn điều phối
- `artifacts/`: output theo run
- `data/runs.json`: lịch sử run
- `generated-projects/`: mã nguồn được scaffold bởi `/cook`
- `project-profiles/`: profile/project context tái sử dụng

### 6.2 Metadata run (`runs.json`)
Mỗi run gồm:
- `runId`, `command`, `text`, `source`
- `dryRun`, `profileId`
- `summary`
- `artifactPaths[]`
- `startedAt`, `endedAt`

=> Đảm bảo **auditability**, **timeline tracking**, **postmortem**.

---

## 7) Bảo mật & an toàn vận hành

### 7.1 Control plane security
- Allowlist user/chat cho Telegram.
- Dashboard token auth (nếu bật).
- Command nhạy cảm bắt buộc confirm 2 bước.

### 7.2 Runtime safety
- Timeout cho lệnh OpenClaw (`timeoutMs`, default 120s).
- Capture lỗi thành artifact thay vì crash toàn workflow.
- Dry-run mode để test parser/router/workflow không phát sinh hành động thật.

### 7.3 Secret handling
- Secret quản lý qua `.env` (không commit).
- `.env.example` định nghĩa contract config.
- Không ghi token vào artifact output.

---

## 8) Cấu hình môi trường (technical contract)

Biến quan trọng:
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_ALLOW_USER_IDS`
- `TELEGRAM_ALLOW_CHAT_IDS`
- `OPENCLAW_LIVE_MODE` (`1` để gọi OpenClaw thật)
- `OPENCLAW_AGENT_DEFAULT`
- `OPENCLAW_AGENT_SUBAGENT_<ROLE>`
- `OPENCLAW_AGENT_ACP_<ROLE>`
- `WEB_PORT`
- `WEB_DASHBOARD_TOKEN`

Runtime mode:
- **Dry-run (mặc định)**: an toàn để dev/test logic.
- **Live mode**: kích hoạt OpenClaw agent CLI cho từng role thật.

---

## 9) Chất lượng, quan sát, và vận hành

### 9.1 Metrics hiện có (MVP)
- Số runs theo command (qua artifact folders)
- Trạng thái pass/fail gate của `/code:auto`
- Lịch sử run và thời gian chạy

### 9.2 Operational practices
- Dùng `/watzup` để theo dõi health.
- Với lỗi runtime: kiểm tra `[LIVE_ERROR]` trong artifacts.
- Giữ artifacts làm bằng chứng cho review & retrospective.

### 9.3 SLO đề xuất (giai đoạn tiếp theo)
- P95 command completion time
- Success rate theo command/runtime
- Retry rate và timeout rate
- Quality gate pass rate

---

## 10) Giới hạn hiện tại và nợ kỹ thuật

1. Tích hợp OpenClaw hiện tại theo kiểu **single-turn CLI call**, chưa dùng session orchestration sâu (`spawn/send/poll` theo phiên dài).
2. `runs.json` là file local, chưa có DB/lock mạnh cho tải cao.
3. Chưa có hàng đợi công việc (queue) và retry policy theo cấp độ workflow.
4. Chưa có observability stack chuẩn (structured logging + metrics backend + tracing).
5. Chưa có cơ chế rate limiting theo user/chat/command.

---

## 11) Lộ trình nâng cấp kỹ thuật đề xuất

### Phase 1 — Hardening (ngắn hạn)
- Thêm schema validation cho input command.
- Chuẩn hóa error codes.
- Structured logs JSON cho mọi run/role.
- Test tự động parser/router/workflows.

### Phase 2 — Scalability
- Tách execution queue (BullMQ/Redis hoặc tương đương).
- Chuyển run store sang SQLite/Postgres.
- Idempotency key cho command để chống double-trigger.

### Phase 3 — Deep OpenClaw integration
- Chuyển từ `openclaw agent` single-shot sang session API orchestration đa bước.
- Quản lý lifecycle từng role session rõ ràng (spawn, follow-up, terminate).
- Hỗ trợ parallel fan-out/fan-in có kiểm soát ngân sách.

### Phase 4 — Governance/Enterprise
- RBAC theo command.
- Audit trail nâng cao + retention policy.
- Policy engine (ví dụ: command/risk-level/approval matrix).

---

## 12) Runbook vận hành nhanh

### Chạy local demo
```bash
npm run demo
```

### Chạy Telegram bot
```bash
npm run telegram
```

### Chạy Web dashboard
```bash
npm run web
# mở http://localhost:8787
```

### Chạy một command trực tiếp
```bash
npm start -- "/plan project=expense-note-mobile scope=mvp"
```

---

## 13) Kết luận kỹ thuật

`agent-telegram-orchestrator` đã đạt được mô hình **orchestrator trung tâm, command-driven, artifact-first** với khả năng chạy hybrid `subagent + acp` phù hợp cho tự động hóa quy trình dự án.

Điểm mạnh hiện tại:
- Luồng rõ ràng, dễ mở rộng command.
- Có safety cơ bản cho lệnh nhạy cảm.
- Có trace end-to-end qua artifacts + run history.

Ưu tiên tiếp theo để production-grade:
1. Queue + DB + observability.
2. Session orchestration sâu với OpenClaw.
3. Security governance ở mức tổ chức (RBAC, policy, audit retention).
