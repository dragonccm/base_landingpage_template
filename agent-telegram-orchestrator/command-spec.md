# Command Spec (Telegram)

## Envelope chung
- Input: tin nhắn Telegram bắt đầu bằng `/`.
- Context: `chat_id`, `user_id`, `thread_id` (nếu có), timestamp.
- Output: 1) tóm tắt ngắn trong chat, 2) artifact markdown đính kèm hoặc link nội bộ.

---

## 1. /docs:init
**Mục đích:** quét codebase, tạo tài liệu khởi tạo.

**Args:**
- `path` (optional, mặc định repo root)

**Agent flow:**
- Scout Agent (subagent)

**Artifacts:**
- `artifacts/docs-init/codebase-summary.md`
- `artifacts/docs-init/code-standards.md`
- `artifacts/docs-init/system-architecture.md`

---

## 2. /brainstorm
**Mục đích:** lấy requirement rõ ràng trước khi plan/code.

**Args:**
- free text mô tả ý tưởng ban đầu

**Agent flow:**
- Requirements Agent (subagent)
- Nếu thiếu dữ liệu: hỏi clarifying questions

**Artifacts:**
- `artifacts/brainstorm/requirements-spec.md`
- `artifacts/brainstorm/open-questions.md` (nếu còn)

---

## 3. /plan
**Mục đích:** tạo implementation plan theo phase.

**Args:**
- `scope` (optional)

**Agent flow:**
- Planner Agent spawn 2-4 Researcher Agents song song (subagent)

**Artifacts:**
- `artifacts/plan/implementation-plan.md`
- `artifacts/plan/risk-register.md`

---

## 4. /code:auto
**Mục đích:** triển khai phase hiện tại có kiểm soát chất lượng.

**Args:**
- `phase` (required)
- `branch` (optional)

**Agent flow:**
- Developer Agent (acp)
- Tester Agent (acp/subagent tùy độ nặng)
- Code Reviewer (subagent)
- Docs Agent (subagent)

**Quality gates:**
- Build pass
- Test pass
- Không có lỗ hổng critical/high chưa xử lý
- Docs/spec được cập nhật

**Artifacts:**
- `artifacts/code-auto/<phase>/dev-report.md`
- `artifacts/code-auto/<phase>/test-report.md`
- `artifacts/code-auto/<phase>/review-report.md`
- `artifacts/code-auto/<phase>/docs-update.md`

---

## 5. /debug
**Mục đích:** phân tích lỗi runtime/CI.

**Args:**
- log text / link job / stacktrace

**Agent flow:**
- Debugger Agent (acp)

**Artifacts:**
- `artifacts/debug/root-cause-analysis.md`
- `artifacts/debug/regression-tests.md`
- `artifacts/debug/fix-plan.md`

---

## 6. /code:review
**Mục đích:** review đa chiều song song.

**Args:**
- `target` (PR/branch/commit)

**Agent flow (parallel):**
- Architecture Reviewer
- Security Reviewer
- Performance Reviewer
- Testing Reviewer
- Code Quality Reviewer
- Documentation Reviewer

**Artifacts:**
- `artifacts/review/<target>/review-*.md`
- `artifacts/review/<target>/review-summary.md`

---

## 7. /watzup
**Mục đích:** theo dõi sức khỏe dự án/milestone.

**Artifacts:**
- `artifacts/watzup/project-health.md`

**Metrics MVP:**
- command success rate
- test pass rate
- open critical findings
- phase completion

---

## 8. /cook
**Mục đích:** all-in-one từ yêu cầu đến project source chạy được.

**Args:**
- free text yêu cầu dự án
- `stack` (optional: react-native|nextjs|react|node)

**Agent flow:**
- Requirements -> Planner -> Developer -> Tester -> Reviewer -> Docs
- Auto scaffold source project theo loại app/web/backend

**Artifacts:**
- `artifacts/cook/<run>/cook-summary.md`
- `artifacts/cook/<run>/project-output.md`

**Output chính:**
- thư mục project tại `generated-projects/<project-name>`
- README + RUNBOOK để chạy local

---

## 9. /autoflow
**Mục đích:** chạy pipeline đa agent end-to-end với gate và auto loop-back khi fail.

**Args:**
- free text yêu cầu dự án (required)
- `maxLoops` (optional, mặc định 2)
- `templatePath` (optional, mặc định `../nextcms`, dùng cho `npm run verify:release`)
- retry theo stage (optional): `retryIntake`, `retryPlan`, `retryBuild`, `retryTest`, `retrySecurity`, `retryRelease`

**Flow chuẩn:**
- intake -> plan -> build -> test -> security -> release
- nếu test/security fail: tự quay lại build để fix rồi chạy lại
- nếu input stage không đạt: quay lại stage trước đó

**Artifacts:**
- `artifacts/autoflow/<run>/autoflow-summary.md`
- `artifacts/autoflow/<run>/gate-report.md`
- `artifacts/autoflow/<run>/release-report.md`
- `artifacts/autoflow/<run>/failure-taxonomy.md`

---

## 10. /clear
**Mục đích:** reset context phiên làm việc.

**Hành vi:**
- Không spawn agent
- Đóng/cancel workflow đang chờ (nếu có)
- Trả trạng thái sạch
