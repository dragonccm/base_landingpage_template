# Implementation Plan (Reality Check + Progress Update)

> Cập nhật: 2026-03-02 10:44 (GMT+7)  
> Mục tiêu tài liệu: phản ánh **đúng tình trạng hiện tại**, không overclaim production-readiness.

---

## 1) Tóm tắt trạng thái hiện tại

Hệ thống đã gần hoàn thành MVP orchestration qua Telegram/Web + OpenClaw runtime, nhưng còn các vấn đề thực tế:

1. **Thiết kế chưa đủ chính xác ở các case biên** (workflow phức tạp, dependency chéo giữa role).
2. **Cần sửa và tinh chỉnh nhiều vòng** ở prompt contract, quality gate và luồng retry.
3. **Chưa nên áp dụng production ở mức cao** — phù hợp nhất hiện tại là pilot/internal staging.

### Mức sẵn sàng (đánh giá thực tế)
- Prototype: ✅ Hoàn thành
- MVP nội bộ: ✅ Gần hoàn thiện
- Staging ổn định: 🟡 Đang hardening
- Production tin cậy cao: ❌ Chưa đạt

---

## 2) Tiến độ theo phase (đã cập nhật)

## Phase 1 — Core plumbing
- [x] Command router + parser
- [x] Workflow registry cho các command chính
- [x] Run-id + artifact theo run
- [x] Telegram notifier format cơ bản

**Tiến độ:** ~100%  
**Ghi chú:** hoạt động tốt cho happy path.

## Phase 2 — Agent orchestration
- [x] Adapter OpenClaw client (dry-run/live mode)
- [x] Runtime policy subagent/acp theo command
- [~] Timeout/retry/cancel (mới ở mức cơ bản, chưa có queue/retry policy chuẩn)
- [~] Prompt templates theo role (đã có, nhưng cần tinh chỉnh để giảm output lệch)

**Tiến độ:** ~75%  
**Vấn đề:** chưa có session orchestration sâu, chủ yếu single-turn.

## Phase 3 — Quality gates + review
- [x] Quality gate cho `/code:auto`
- [x] Multi-role review flow cho `/code:review`
- [ ] Severity scoring chuẩn hoá (High/Med/Low có policy hành động rõ)
- [ ] Gate evidence chuẩn hóa đầy đủ cho mọi loại dự án

**Tiến độ:** ~65%  
**Vấn đề:** gate hiện dùng được nhưng chưa đủ mạnh để bảo đảm production quality.

## Phase 4 — Telemetry & tracker
- [x] Theo dõi run history (`runs.json`)
- [x] `/watzup` có thống kê mức cơ bản
- [ ] Metrics chuẩn vận hành (latency P95, failure taxonomy, alerting)
- [ ] Dashboard kỹ thuật đầy đủ (observability thực thụ)

**Tiến độ:** ~55%  
**Vấn đề:** telemetry còn mỏng, khó debug sâu khi lỗi lặp lại.

## Phase 5 — Hardening
- [x] Allowlist Telegram user/chat
- [x] Confirm flow 2 bước cho lệnh nhạy cảm
- [ ] Secret redaction end-to-end
- [ ] Budget caps/token caps theo workflow
- [ ] Rate limit & abuse protection

**Tiến độ:** ~50%  
**Vấn đề:** security controls chưa đủ mức production.

---

## 3) Những điểm “chưa chính xác” cần sửa ngay

1. **Workflow design precision**
   - Một số command có thể cho output thiếu nhất quán giữa các role.
   - Cần chuẩn hóa input/output contract dạng schema.

2. **Orchestration reliability**
   - Chưa có job queue + retry/backoff cấp workflow.
   - Khi lỗi runtime, hiện chủ yếu ghi lỗi vào artifact thay vì tự phục hồi mạnh.

3. **Quality gate realism**
   - Gate hiện tại tốt cho MVP nhưng chưa đủ chặt để auto-deploy production.
   - Cần thêm policy “block release” theo severity/risk score.

4. **Operational visibility**
   - Chưa có tracing/metrics pipeline chuẩn.
   - Khó phân tích nguyên nhân gốc khi xảy ra lỗi chuỗi.

---

## 4) Kế hoạch sửa đổi thực tế (không over-engineer)

## Sprint A (1 tuần) — Correctness first
- Chuẩn hóa command schema (input validation chặt hơn)
- Chuẩn hóa artifact schema theo từng command
- Thêm failure taxonomy (timeout, invalid-output, tool-error, policy-block)

**Mục tiêu:** giảm lỗi “thiết kế không chính xác” ở tầng orchestration.

## Sprint B (1 tuần) — Reliability baseline
- Thêm queue nhẹ + retry/backoff cho job chính
- Idempotency key chống chạy trùng command
- Improve confirm/approval state machine

**Mục tiêu:** giảm rerun thủ công, giảm lỗi ngắt quãng.

## Sprint C (1 tuần) — Production guardrails (mức vừa đủ)
- Security gate tối thiểu: secret scan + dependency check
- Gate release theo policy severity
- Thêm metrics cơ bản: success rate, duration, failure reason

**Mục tiêu:** đủ tin cậy cho staging/limited production.

---

## 5) Mức áp dụng khuyến nghị (rất thực tế)

### Nên áp dụng ngay
- Internal automation
- Team nhỏ (1–5 dev)
- Dự án có rủi ro vừa/thấp

### Nên áp dụng có kiểm soát
- Staging/Pre-prod
- Release cadence chậm, có approval thủ công

### Chưa khuyến nghị
- Full auto production cho hệ thống quan trọng
- Multi-team, compliance cao, SLA chặt

---

## 6) Exit criteria cập nhật (khả thi hơn)

Không dùng tiêu chí “hoàn hảo”, mà dùng tiêu chí đủ vận hành:

- [ ] Command core chạy ổn định >90% trong 2 tuần
- [ ] Mọi run có artifact hợp lệ + lỗi phân loại rõ
- [ ] Có policy chặn deploy khi gate fail
- [ ] Có dashboard tối thiểu cho tiến độ + lỗi
- [ ] Có runbook sự cố cho 5 lỗi thường gặp

Khi đạt các tiêu chí trên: **đủ để vận hành staging nghiêm túc**.  
Muốn production rộng: cần thêm hardening vòng 2.
