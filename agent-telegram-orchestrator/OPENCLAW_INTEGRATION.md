# OpenClaw Integration (Live Mode)

## Trạng thái hiện tại
Đã tích hợp live mode trong `src/openclawClient.mjs` thông qua CLI:
- `openclaw agent --agent <id> --message <task> --json --timeout <sec>`

`OPENCLAW_LIVE_MODE=1` sẽ bật chế độ này.

## Contract runtime
`openclawClient.spawn({ role, runtime, task })` sẽ:
1. Resolve `agentId` theo mapping env (`OPENCLAW_AGENT_*`)
2. Gọi `openclaw agent` 1 turn
3. Parse JSON output và chuẩn hóa về `{ sessionKey, role, runtime, result }`

## Agent mapping
- Subagent roles: `OPENCLAW_AGENT_SUBAGENT_<ROLE>`
- ACP roles: `OPENCLAW_AGENT_ACP_<ROLE>`
- Fallback: `OPENCLAW_AGENT_DEFAULT` (mặc định `main`)

Ví dụ:
- `OPENCLAW_AGENT_SUBAGENT_REQUIREMENTS=requirements`
- `OPENCLAW_AGENT_SUBAGENT_PLANNER=planner`
- `OPENCLAW_AGENT_ACP_DEVELOPER=developer`

## Runtime policy
- subagent: scout, requirements, planner, researcher, reviewer, docs, tracker
- acp: developer, tester, debugger

## Error handling
- Timeout / CLI error: trả `[LIVE_ERROR] ...` vào report để không mất trace run.
- Bot vẫn tiếp tục workflow và phản hồi artifact.

## Security checklist
- Whitelist Telegram user ID/group ID
- Secrets không ghi vào artifact
- Command nhạy cảm yêu cầu confirm

## Ghi chú nâng cấp tiếp
Nếu cần session orchestration sâu hơn (spawn/send/poll), có thể chuyển qua OpenClaw tool runtime nội bộ hoặc custom gateway plugin.
