# IMCFO Constitution v2 Council Structure Audit Report

## 1. 结论总览

结论：PASS，可进入下一阶段。

说明：

- Council 架构不是扁平 agent 清单，已经形成总控层、事实层、外部情报层、专题议院层、交叉辩论层、宪法法院层、Markdown 落地层和最终 QA 层。
- 主 Agent 与 Critic Agent 配对完整。
- 权限边界、运行协议、轮次模板、Markdown 落地规则和下一阶段入口均已建立。
- 本轮未执行 Constitution v2 Rebuild、未执行 codebase discovery、未收集外部情报、未写最终宪法正文。

当前唯一注意项是：工作区 diff 中存在旧 `AGENTS.md`、旧 `docs/00-10` 和旧 handoff 文件删除。这些删除来自用户明确声明的旧项目文件废弃和重构前置状态，不是本轮结构审计新增的越界修改，也不是旧规则恢复。

## 2. 文件检查结果

已检查：

- PASS `docs/council/README.md`
- PASS `docs/council/agent-team.md`
- PASS `docs/council/operating-protocol.md`
- PASS `docs/council/round-templates.md`
- PASS `docs/council/markdown-landing-rules.md`
- PASS `docs/council/next-execution-prompt.md`

`AGENTS.md` 当前不存在，未读取。

## 3. 层级结构检查

- PASS Codex Deliberation Controller：存在，职责为流程控制；明确无最终宪法裁决权、无业务代码修改权。
- PASS Foundation Layer：存在，包含 Codebase Discovery Agent 与 Implementation Reality Critic；用于区分事实发现与事实挑刺。
- PASS Intelligence Layer：存在，包含 External Intelligence Agent 与 Evidence Quality Critic；用于区分外部启发与证据质量审查。
- PASS Doctrine Chambers：存在，按 Product、Financial、AI Input、Architecture、Visual Experience、User Behavior、Workflow 分议院。
- PASS Cross-Debate Arena：存在，要求 Product、Financial、AI、Architecture、Visual、User Behavior、Workflow 交叉质询。
- PASS Constitution Court：存在，包含 Chief Constitution Architect、Scope Judge、Contradiction Judge、Originality Judge。
- PASS Markdown Landing Studio：存在，包含框架选择、框架挑刺、创新自由、活宪法、原则提炼、信息架构、规格边界、文档写入、Markdown QA。
- PASS Final QA Gate：存在，包含 Diff Reviewer 与 Final QA Reporter。

层级之间的流向已经通过 Mermaid 图和文本树表达，避免平铺化。

## 4. Agent 配对检查

- PASS Codebase Discovery Agent ↔ Implementation Reality Critic
- PASS External Intelligence Agent ↔ Evidence Quality Critic
- PASS Product Doctrine Agent ↔ Product Contrarian Agent
- PASS Financial Core Agent ↔ Accounting Red-Team Agent
- PASS AI Input Agent ↔ AI Failure-Mode Critic
- PASS Architecture Contract Agent ↔ Overengineering Critic
- PASS Visual Experience Agent ↔ Visual Taste & Usability Critic
- PASS User Behavior Agent ↔ Friction & Retention Critic
- PASS Workflow Agent ↔ Process Chaos Critic
- PASS Framework Selector Agent ↔ Framework Critic Agent
- PASS Document Writer Agent ↔ Markdown QA Agent
- PASS Final QA Reporter ↔ Diff Reviewer

Critic Agent 均不是只有名字，均定义了攻击对象、攻击职责、输出产物和权限边界。

## 5. 权限边界检查

- PASS Codex Deliberation Controller 有流程控制权，但没有最终宪法裁决权。
- PASS 主 Agent 有提案权，但没有直接写入 Constitution 的权力。
- PASS Critic Agent 有质询权，但没有最终裁决权。
- PASS Constitution Court 有 accepted / rejected / moved to specs / moved to experiments / moved to ADR 等裁决权。
- PASS Document Writer 只有 Markdown 落盘权，没有产品裁决权、架构裁决权或自行发明规则权。
- PASS Innovation Freedom Agent 有阻止规则过度写死的权力。
- PASS Spec Boundary Agent 有阻止实现细节进入 Constitution 的权力。
- PASS Diff Reviewer 有最终 diff 审查权。
- PASS Final QA Reporter 只汇报，不擅自修改规则。

## 6. 运行协议检查

- PASS operating-protocol 明确主 Agent 主张不能直接进入 Constitution。
- PASS operating-protocol 明确每个主张必须经过对应 Critic 挑刺。
- PASS operating-protocol 明确 Critic 必须攻击假设、指出风险、提出替代方案。
- PASS operating-protocol 明确 Doctrine Chamber 必须进入 Cross-Debate Arena。
- PASS operating-protocol 明确 Constitution Court 决定规则去向。
- PASS operating-protocol 明确 Document Writer 只能根据裁决落盘。
- PASS operating-protocol 明确没有用户确认不得进入正式 Constitution v2 Rebuild。
- PASS operating-protocol 明确核心原则：宪法不是为了禁止变化，而是为了保证变化不会破坏 IMCFO 的灵魂。

## 7. 轮次模板检查

- PASS Round 0: Bootstrap Verification
- PASS Round 1: Codebase Discovery
- PASS Round 2: External Intelligence
- PASS Round 3: Initial Claims
- PASS Round 4: Paired Critiques
- PASS Round 5: Cross-Examination
- PASS Round 6: Revised Claims
- PASS Round 7: Constitution Court
- PASS Round 8: Markdown Landing
- PASS Round 9: Final QA & Diff Review

每一轮均包含：

- Round goal
- Active agents
- Required inputs
- Required outputs
- Stop condition
- What must not happen

## 8. Markdown 落地规则检查

- PASS 明确采用 Doctrine + Contracts + Experiments Framework。
- PASS 明确区分 `constitution/`、`discovery/`、`specs/`、`experiments/`、`adr/`、`context/`。
- PASS 明确当前技术栈只能进 discovery，不能写成永久宪法限制。
- PASS 明确当前页面结构只能进 discovery / specs，不能写成永久宪法限制。
- PASS 明确当前视觉实现只能作为 doctrine / specs，不能写成唯一永久风格。
- PASS 明确当前 API / 模型供应商不能写成永久限制。
- PASS 明确 experiments 不能误写成核心规则。
- PASS 明确 ADR 用于重大技术、架构、产品方向变化。

## 9. 创新空间检查

- PASS Innovation Freedom Agent 存在。
- PASS Living Constitution Agent 存在。
- PASS 明确 Constitution 保护项目灵魂，不冻结项目形态。
- PASS 明确规则分层为 Level 1 Core Invariants、Level 2 Doctrines、Level 3 Contracts、Level 4 Experiments。
- PASS 明确未来技术栈、页面结构、视觉实现、AI 输入方式、商业模式不能被当前状态永久锁死。
- PASS 明确 V0.1 临时约束不得误写成长期原则。

## 10. 旧规则废弃检查

- PASS 明确不恢复旧 `AGENTS.md`。
- PASS 明确不恢复旧 `docs/00-10`。
- PASS 明确不把旧规则当作 source of truth。
- PASS 明确当前项目事实应从现有代码、配置、目录结构读取。
- PASS 未发现 council 文档要求恢复旧技术栈限制。

## 11. 安全边界检查

- PASS 明确 AI 不能直接写账。
- PASS 明确 AI 只能生成候选交易 Draft 的边界，且不得污染正式账本。
- PASS 明确正式入账必须经过用户确认。
- PASS 明确 AI 不能绕过 transaction rules。
- PASS 明确 UI 不得发明会计公式。
- PASS 明确后端不能成为账本数据库。
- PASS 明确 API key 不得进入前端。
- PASS 明确财务准确性高于视觉炫技，视觉不得牺牲财务信息准确性、可读性和性能。

## 12. Git Diff 检查

执行命令：

```powershell
git diff --name-status
```

输出：

```text
D	AGENTS.md
D	docs/00-project-constitution.md
D	docs/01-v0.1-product-scope.md
D	docs/02-v0.1-page-structure.md
D	docs/03-v0.1-data-model.md
D	docs/04-v0.1-accounting-rules.md
D	docs/05-v0.1-report-rules.md
D	docs/06-v0.1-transaction-mapping.md
D	docs/07-v0.1-implementation-roadmap.md
D	docs/08-mobile-app-migration-plan.md
D	docs/09-branch-merge-checklist.md
D	docs/10-current-project-context.md
D	docs/handoff/2026-05-04-imcfo-complete-handoff/appendix-a-architecture-map.md
D	docs/handoff/2026-05-04-imcfo-complete-handoff/appendix-b-product-and-accounting-rules.md
D	docs/handoff/2026-05-04-imcfo-complete-handoff/appendix-c-ui-screenshot-index.md
D	docs/handoff/2026-05-04-imcfo-complete-handoff/appendix-d-current-git-and-risks.md
D	docs/handoff/2026-05-04-imcfo-complete-handoff/appendix-e-visual-system.md
D	docs/handoff/2026-05-04-imcfo-complete-handoff/imcfo-complete-handoff.md
D	docs/handoff/2026-05-04-imcfo-complete-handoff/imcfo-complete-handoff.pdf
D	docs/handoff/2026-05-04-imcfo-complete-handoff/new-gpt-handoff-prompt.txt
D	docs/handoff/2026-05-04-imcfo-complete-handoff/screenshots/01-home-top.png
D	docs/handoff/2026-05-04-imcfo-complete-handoff/screenshots/02-home-middle.png
D	docs/handoff/2026-05-04-imcfo-complete-handoff/screenshots/03-home-bottom.png
D	docs/handoff/2026-05-04-imcfo-complete-handoff/screenshots/04-manage-top.png
D	docs/handoff/2026-05-04-imcfo-complete-handoff/screenshots/05-manage-lower.png
D	docs/handoff/2026-05-04-imcfo-complete-handoff/screenshots/06-reports-top.png
D	docs/handoff/2026-05-04-imcfo-complete-handoff/screenshots/07-reports-full-report.png
D	docs/handoff/2026-05-04-imcfo-complete-handoff/screenshots/08-reports-lower.png
D	docs/handoff/2026-05-04-imcfo-complete-handoff/screenshots/09-settings-top.png
D	docs/handoff/2026-05-04-imcfo-complete-handoff/screenshots/10-settings-data.png
D	docs/handoff/2026-05-04-imcfo-complete-handoff/screenshots/11-operating-analysis-report.png
D	docs/handoff/2026-05-04-imcfo-complete-handoff/screenshots/13-profitability-analysis-middle.png
D	docs/handoff/2026-05-04-imcfo-complete-handoff/screenshots/14-manage-accounting-center.png
D	docs/handoff/2026-05-04-imcfo-complete-handoff/screenshots/15-account-management-overview.png
D	docs/handoff/2026-05-04-imcfo-complete-handoff/screenshots/16-account-category-detail.png
D	docs/handoff/2026-05-04-imcfo-complete-handoff/screenshots/17-account-detail-sheet.png
D	docs/handoff/2026-05-04-imcfo-complete-handoff/screenshots/18-transaction-records-supplement.png
D	docs/handoff/2026-05-04-imcfo-complete-handoff/screenshots/19-transaction-detail-supplement.png
D	docs/handoff/2026-05-04-imcfo-complete-handoff/screenshots/20-assets-liabilities-overview-supplement.png
D	docs/handoff/2026-05-04-imcfo-complete-handoff/screenshots/21-asset-subject-detail-supplement.png
D	docs/handoff/2026-05-04-imcfo-complete-handoff/screenshots/22-asset-detail-supplement.png
D	docs/handoff/2026-05-04-imcfo-complete-handoff/screenshots/23-liability-overview-supplement.png
D	docs/handoff/2026-05-04-imcfo-complete-handoff/screenshots/24-liability-subject-detail-supplement.png
```

补充说明：

- `git diff --name-status` 不显示未跟踪文件；当前 `git status --short --branch` 显示 `?? docs/council/`。
- 未发现 `mobile/*`、`backend/*`、`package.json`、`package-lock.json`、`pnpm-lock.yaml`、`yarn.lock` 修改。
- 未发现旧 `docs/00-10` 被恢复；当前 diff 显示它们是删除状态。
- 当前 diff 中旧文档删除符合用户已说明的“旧 project 文件主动废弃”背景，不构成本次 council 结构失败。

## 13. 必须修正项

无。

## 14. 建议优化项

- [WARN] 问题：`git diff --name-status` 不显示未跟踪的 `docs/council/*` 具体文件。
  - 影响：仅看 `git diff --name-status` 无法直接看到本轮新增 council 文件清单。
  - 建议优化：后续 Final QA Reporter 同时汇报 `git status --short --branch` 中的 `?? docs/council/`，并手动列出新增文件。

- [WARN] 问题：层级职责主要通过 agent 定义和 round 模板体现，未为每个“层级本身”单独写一张输入/输出/权限表。
  - 影响：不影响执行，但未来读者如果只看层级图，可能需要继续阅读 agent 定义才能理解每层边界。
  - 建议优化：正式执行前可在 `agent-team.md` 增加一段 Layer Responsibility Summary。

## 15. 是否允许进入下一阶段

可以进入 Constitution v2 Council Execution。

前提：

- 必须由用户明确确认。
- 必须从 `docs/council/next-execution-prompt.md` 触发。
- 仍不得自动提交。
- 仍不得修改业务代码，除非用户后续另行授权。

