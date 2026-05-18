# IMCFO Constitution v2 Council Execution Start Report

## 1. Round 0 结论

状态：PASS。

本轮已经由用户明确授权进入 `IMCFO Constitution v2 Council Execution`。这不是 Bootstrap，也不是结构验收；这是正式的 Codebase-first + Living Constitution Rebuild 执行阶段。

## 2. Bootstrap Verification

- Bootstrap 文档已存在：`docs/council/README.md`、`agent-team.md`、`operating-protocol.md`、`round-templates.md`、`markdown-landing-rules.md`、`next-execution-prompt.md`。
- 结构验收报告已存在：`docs/council/10-structure-audit-report.md`。
- 结构验收结论：PASS，可进入下一阶段。
- 结构验收 FAIL：无。
- 结构验收 WARN：存在，但不阻止执行。主要是未跟踪文件不会出现在 `git diff --name-status` 中，以及层级职责可在后续文档里继续加强。

## 3. 当前 Git 状态摘要

当前分支：`main...origin/main [ahead 28]`。

当前旧文件删除状态是用户声明的预期背景，不应恢复：

- `AGENTS.md`
- `docs/00-project-constitution.md`
- `docs/01-v0.1-product-scope.md`
- `docs/02-v0.1-page-structure.md`
- `docs/03-v0.1-data-model.md`
- `docs/04-v0.1-accounting-rules.md`
- `docs/05-v0.1-report-rules.md`
- `docs/06-v0.1-transaction-mapping.md`
- `docs/07-v0.1-implementation-roadmap.md`
- `docs/08-mobile-app-migration-plan.md`
- `docs/09-branch-merge-checklist.md`
- `docs/10-current-project-context.md`

当前 `docs/handoff/2026-05-04-imcfo-complete-handoff/` 下文件也处于删除状态。本轮不扩大删除范围，也不恢复它们；最终报告需要提示用户确认是否需要保留历史交接材料。

当前 `docs/council/` 为未跟踪新文档目录，这是 Council Bootstrap 和本轮执行文档的预期输出位置。

## 4. 本轮执行确认

确认进入正式执行：是。

执行边界：

- 不恢复旧 `AGENTS.md`。
- 不恢复旧 `docs/00-10`。
- 不把旧规则当作 source of truth。
- 不修改 `mobile` 业务代码。
- 不修改 `backend` 业务代码。
- 不修改 package 或 lockfile。
- 不提交，不 `git add .`。
- 当前技术栈、页面结构、视觉实现、API / 模型供应商只作为 current implementation facts，不写成永久限制。

## 5. Stop Condition

Round 0 已完成，可以进入 Round 1 Codebase Discovery。
