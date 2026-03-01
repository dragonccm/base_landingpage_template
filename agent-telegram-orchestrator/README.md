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

## Chạy qua Telegram
1. Tạo bot với BotFather và lấy token.
2. Tạo `.env` từ `.env.example`.
3. Thiết lập allowlist user/chat để an toàn.
4. Chạy:
```bash
npm run telegram
```

Bot dùng long polling (`getUpdates`) và sẽ xử lý các message bắt đầu bằng `/`.

### Live mode
- Đặt `OPENCLAW_LIVE_MODE=1` để bot gọi `openclaw agent --json` cho từng role.
- Có thể map role -> agent id bằng biến môi trường `OPENCLAW_AGENT_*` (xem `.env.example`).
- Nếu không map, hệ thống dùng `OPENCLAW_AGENT_DEFAULT` (mặc định `main`).

### Safety upgrade
- `/code:auto` và `/debug` yêu cầu xác nhận 2 bước:
  1. Gửi command bình thường
  2. Bot trả `confirm id` và bạn xác nhận bằng `/confirm <id>`
- Confirm hết hạn sau 10 phút.
- `/code:auto` sinh thêm `quality-gate.md` để báo pass/fail gate rõ ràng.
- Gate `/code:auto` kiểm tra bằng chứng bắt buộc: `Changed Files`, `Commit Hash`, `Test Result`, `Security`, `Docs Updated`.

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
