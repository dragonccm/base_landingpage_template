# System Architecture

## 1) Logical Components
1. **Telegram Ingress**
   - Nhận update từ bot webhook/polling
   - Chuẩn hóa metadata (`chat_id`, `user_id`, `text`)

2. **Command Router**
   - Parse command + args
   - Validate command contract
   - Check permission (allowlist)

3. **Workflow Orchestrator**
   - Mapping command -> workflow graph
   - Spawn sessions qua OpenClaw (`sessions_spawn`)
   - Gửi task chi tiết qua `sessions_send`
   - Thu kết quả và hợp nhất

4. **Artifact Store**
   - Lưu markdown output theo cấu trúc thư mục
   - Gắn run-id + timestamp

5. **Notifier**
   - Trả tóm tắt về Telegram
   - Đính kèm file hoặc link artifact

## 2) Runtime Mapping
- `subagent`: docs/research/planning/review/docs-update
- `acp`: implement code, chạy test/build, debug CI

## 3) Sequence (ví dụ /plan)
1. User gửi `/plan` trên Telegram
2. Router parse + authorize
3. Orchestrator spawn Planner session
4. Planner spawn Researcher sessions song song
5. Planner hợp nhất output -> `implementation-plan.md`
6. Notifier gửi summary + artifact

## 4) Failure Handling
- Parse lỗi -> trả usage help
- Agent timeout -> retry 1 lần, sau đó fail with diagnostics
- Partial success (một vài reviewer fail) -> trả kết quả phần còn lại + cảnh báo

## 5) Security
- User allowlist theo Telegram user ID
- Command sensitive cần xác nhận 2 bước
- Redact secret trong log trước khi gửi chat
- Budget guard: token/time cap theo command
