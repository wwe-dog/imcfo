# IMCFO Constitution v2 Council Execution

## Purpose

在用户明确确认后，使用已创建的 IMCFO Constitution v2 Council Agent Team，正式执行 Codebase-first Living Constitution Rebuild。

本文件是下一阶段提示词草案。本轮 Bootstrap 不执行本提示词。

## Prompt

任务名称：

IMCFO Constitution v2 Council Execution

中文名称：

IMCFO 新版底层规则议会正式执行

任务性质：

这是正式 Constitution v2 Rebuild 执行阶段。使用 `docs/council/` 中已经创建的 Agent Team、Operating Protocol、Round Templates 和 Markdown Landing Rules，执行 Codebase-first + Living Constitution 重建。

硬性前提：

- 不恢复旧 `AGENTS.md`。
- 不恢复旧 `docs/00-10`。
- 不把旧规则当作 source of truth。
- 使用 `docs/council/agent-team.md` 中定义的 agent team。
- 遵守 `docs/council/operating-protocol.md`。
- 按 `docs/council/round-templates.md` 执行轮次。
- 按 `docs/council/markdown-landing-rules.md` 落地 Markdown。
- 不自动提交。
- 不修改业务代码，除非后续用户另行明确授权。

执行轮次：

1. Round 0: Bootstrap Verification
2. Round 1: Codebase Discovery
3. Round 2: External Intelligence
4. Round 3: Initial Claims
5. Round 4: Paired Critiques
6. Round 5: Cross-Examination
7. Round 6: Revised Claims
8. Round 7: Constitution Court
9. Round 8: Markdown Landing
10. Round 9: Final QA & Diff Review

输出目标：

- 正式落地 Constitution v2 Markdown 文档。
- 区分 constitution、discovery、specs、experiments、ADR、context。
- 保护产品灵魂、财务底线、AI 入账边界、架构契约、协作机制和变更机制。
- 不锁死技术栈。
- 不锁死页面结构。
- 不锁死视觉实现。
- 不锁死 API / 模型供应商。

最终汇报必须包含：

1. 执行轮次摘要。
2. 新建 / 修改文件。
3. Constitution v2 的文件结构。
4. 核心规则摘要。
5. 未执行事项。
6. `git diff --name-status`。
7. 风险和下一步建议。

停止条件：

- Round 9 完成后停止。
- 不自动提交。
- 不进入业务代码实现。

