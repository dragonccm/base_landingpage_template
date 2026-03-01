# Telegram Runbook

## 1) Quy ước phản hồi
- Luôn trả 2 phần:
  1. **Summary ngắn** (5-10 dòng)
  2. **Artifacts** (danh sách file/report)

## 2) Mẫu trả lời chuẩn
```
✅ /plan completed (run: 20260301-193500)
- Scope: CMS MVP
- Phases: 4
- Risks: 3 (1 high)
- Next action: /code:auto phase=1
Artifacts:
- artifacts/plan/implementation-plan.md
- artifacts/plan/risk-register.md
```

## 3) Lỗi thường gặp
- Command sai cú pháp -> trả usage + ví dụ đúng
- Thiếu input -> hỏi tối đa 3 clarifying questions
- Timeout -> trả tiến độ partial + hướng retry

## 4) Quy tắc an toàn
- Chỉ nhận lệnh từ user allowlist
- Lệnh nhạy cảm yêu cầu confirm: `CONFIRM <run-id>`
- Không gửi secret/token vào chat

## 5) Chu trình vận hành đề xuất
1. `/brainstorm` để khóa requirement
2. `/plan` để ra phase + risk
3. `/code:auto phase=1`
4. `/code:review target=<branch>`
5. `/watzup` theo dõi health
6. `/debug` khi CI fail
