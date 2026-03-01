# OpenClaw Integration Plan (Live Mode)

## Mục tiêu
Thay `dry-run` trong `src/openclawClient.mjs` bằng chế độ gọi OpenClaw sessions thật.

## Contract đề xuất
`openclawClient.spawn({ role, runtime, task })` sẽ:
1. `sessions_spawn` với `runtime` tương ứng (`subagent` hoặc `acp`)
2. Gửi task role-specific vào session bằng `sessions_send`
3. Nhận response cuối cùng và trả về `{ sessionKey, role, runtime, result }`

## Runtime policy
- subagent: scout, requirements, planner, researcher, reviewer, docs, tracker
- acp: developer, tester, debugger

## ACP notes
- Với `runtime: "acp"`, set `agentId` rõ ràng theo harness bạn chọn.
- Trên Discord nên thread-bound session; Telegram có thể dùng run mode hoặc session mode tùy workload.

## Error handling
- Timeout: trả partial result + hướng dẫn retry
- Spawn fail: fallback sang subagent (nếu phù hợp), hoặc fail-fast
- Session closed: retry 1 lần với context rút gọn

## Security checklist
- Whitelist Telegram user ID/group ID
- Secrets không ghi vào artifact
- Command nhạy cảm yêu cầu confirm
