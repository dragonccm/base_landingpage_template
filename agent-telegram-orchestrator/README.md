# Agent Telegram Orchestrator (OpenClaw)

Hệ thống điều phối nhiều agent thông qua lệnh chat Telegram.

## Mục tiêu
- Dùng Telegram làm giao diện điều khiển dự án AI workflow.
- Chuẩn hóa command + artifact đầu ra (`spec`, `plan`, `review`, `debug`).
- Kết hợp `subagent` (analysis) + `acp` (coding/debug) trong OpenClaw.

## Command MVP
- `/docs:init`
- `/brainstorm`
- `/plan`
- `/code:auto`
- `/debug`
- `/code:review`
- `/watzup`
- `/clear`

## Kiến trúc runtime
- **subagent:** docs, requirement, planning, multi-review text-heavy
- **acp:** coding, test execution, CI/debug log investigation

Xem chi tiết:
- `project-charter.md`
- `command-spec.md`
- `system-architecture.md`
- `implementation-plan.md`
- `telegram-runbook.md`
