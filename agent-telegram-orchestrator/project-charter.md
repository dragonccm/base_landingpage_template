# Project Charter

## 1) Problem
Workflow AI coding hiện thường thiếu cấu trúc: output rời rạc, khó audit, khó lặp lại theo team.

## 2) Vision
Biến Telegram thành command console để vận hành pipeline agent chuẩn hóa:
`requirements -> plan -> implement -> test -> review -> docs -> status`.

## 3) Scope MVP
### In scope
- Parse command từ Telegram
- Điều phối agent bằng OpenClaw sessions (`sessions_spawn`, `sessions_send`)
- Lưu artifact markdown theo command
- Trả kết quả gọn về Telegram
- Basic auth allowlist + xác nhận command rủi ro

### Out of scope (phase sau)
- Deploy production tự động
- Dashboard web riêng
- Multi-repo orchestration

## 4) Success Metrics (MVP)
- 95% command hợp lệ được parse đúng
- >= 80% run thành công không cần thao tác tay
- `/plan` cho output theo phase + dependency + risk
- `/code:review` có báo cáo severity + action items

## 5) Constraints
- Ưu tiên an toàn: lệnh nguy hiểm cần confirm hai bước
- Có timeout/budget cho từng workflow
- Không chạy loop polling liên tục

## 6) Deliverables
- Spec command + template output
- Architecture + state machine
- Implementation plan theo phase
- Telegram runbook vận hành
