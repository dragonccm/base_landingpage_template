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

## 8. /clear
**Mục đích:** reset context phiên làm việc.

**Hành vi:**
- Không spawn agent
- Đóng/cancel workflow đang chờ (nếu có)
- Trả trạng thái sạch
