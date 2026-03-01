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

## Chạy local (MVP scaffold)
```bash
npm run demo
# hoặc
npm start -- "/plan project=expense-note-mobile scope=mvp"
```

### Project profile mẫu
Đã có profile sẵn cho chủ đề bạn đề xuất:
- `project-profiles/expense-note-mobile.json`

Bạn có thể truyền profile vào command:
```bash
npm start -- "/brainstorm project=expense-note-mobile Xây app mobile quản lý chi tiêu"
```

> Hiện tại chạy ở chế độ `dry-run` để kiểm tra parser/router/workflow và artifact output.
> Bước tiếp theo là nối trực tiếp OpenClaw `sessions_spawn` + `sessions_send` trong `src/openclawClient.mjs`.

Xem chi tiết:
- `project-charter.md`
- `command-spec.md`
- `system-architecture.md`
- `implementation-plan.md`
- `telegram-runbook.md`
