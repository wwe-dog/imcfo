# IMCFO Constitution v2 Council Final Execution Report

## 1. 执行结论

结论：PASS。

本轮已完成 IMCFO Constitution v2 Council Execution，建立了 Codebase-first + Living Constitution 文档体系。

本轮没有进入代码实现阶段，没有修改 `mobile`、`backend`、package 或 lockfile，没有提交，也没有恢复旧 `AGENTS.md` 或旧 `docs/00-10`。

## 2. 实际新建 / 修改 / 删除文件

### 新建 / 修改的新体系文件

Council execution records:

- `docs/council/11-execution-start-report.md`
- `docs/council/12-codebase-discovery-review.md`
- `docs/council/13-external-intelligence.md`
- `docs/council/14-initial-claims.md`
- `docs/council/15-paired-critiques.md`
- `docs/council/16-cross-examination.md`
- `docs/council/17-revised-claims.md`
- `docs/council/18-constitution-court-rulings.md`
- `docs/council/19-final-execution-report.md`

Constitution v2:

- `docs/constitution/00-imcfo-constitution-v2.md`
- `docs/constitution/01-product-doctrine.md`
- `docs/constitution/02-financial-core-doctrine.md`
- `docs/constitution/03-ai-input-boundary.md`
- `docs/constitution/04-architecture-contracts.md`
- `docs/constitution/05-visual-experience.md`
- `docs/constitution/06-agent-workflow.md`
- `docs/constitution/07-change-governance.md`

Discovery:

- `docs/discovery/current-codebase-map.md`
- `docs/discovery/current-data-flow.md`
- `docs/discovery/current-financial-flow.md`
- `docs/discovery/current-ai-record-flow.md`

Other docs layers:

- `docs/specs/README.md`
- `docs/experiments/README.md`
- `docs/experiments/candidate-directions.md`
- `docs/adr/README.md`
- `docs/context/current-project-context.md`
- `docs/README.md`

### 当前删除状态

以下删除状态来自用户声明的旧规则废弃背景，本轮没有恢复：

- `AGENTS.md`
- `docs/00-project-constitution.md` 到 `docs/10-current-project-context.md`
- `docs/handoff/2026-05-04-imcfo-complete-handoff/*`

注意：`docs/handoff/...` 删除状态已如实保留。建议用户后续确认是否需要把历史交接材料另存或恢复到 archive 区。

## 3. 多轮讨论摘要

- Round 0：确认 Bootstrap PASS，结构验收 PASS，用户已授权正式执行。
- Round 1：完成 codebase discovery，明确当前实现事实、数据流、财务流、AI 记一笔链路。
- Round 2：完成外部情报矩阵，补充官方产品、GitHub 项目、中国记账语境、AI/语音输入、可读性、安全与 LLM 财务能力资料。
- Round 3：各 Doctrine Chamber 提交初始主张。
- Round 4：Critic Agents 挑刺，指出定位空泛、会计闭环不足、AI 失败模式、过度工程、视觉炫技、留存摩擦、流程混乱等问题。
- Round 5：完成 Product、Financial、AI、Architecture、Visual、User Behavior、Workflow 交叉质询。
- Round 6：主 Agent 根据批评修正主张。
- Round 7：Constitution Court 裁决规则归属。
- Round 8：落地 Markdown 文档体系。
- Round 9：完成最终 QA 与 diff review。

## 4. 被 Critic 挑刺后发生的关键修正

- “个人 CFO”从口号修正为“生活事件 -> 财务语言 -> 经营反馈 -> 行动”的行为闭环。
- 当前财务实现从“完整会计系统”降格为真实描述：交易规则驱动的个人财务状态系统，未来需强化复式账 / import / transfer / complex target。
- AI 输入从“智能记账”明确为 Candidate Draft 边界，复杂与低置信交易不得自动入账。
- Architecture Contract 从技术栈约束修正为职责边界。
- Dark Liquid CFO Style 从永久风格降级为当前 doctrine。
- 用户留存从每日打卡修正为断续使用后也能重新理解财务状态。
- 压缩上下文规则迁移到 `docs/context/current-project-context.md`，不恢复旧 `docs/10-current-project-context.md`。

## 5. Constitution Court 最终裁决摘要

Accepted into Constitution:

- IMCFO 是 personal CFO system，不是普通记账 App。
- 保护输入、理解、反馈、行动闭环。
- UI 不得发明会计公式。
- 正式入账必须经过统一 transaction rule layer。
- AI 只能生成 Candidate Transaction Draft。
- AI 不得直接写账、写 storage、绕过 transaction rules。
- API key / secret 不得进入前端。
- AI / ASR 后端不得成为账本数据库。
- 视觉不得牺牲财务准确性、可读性、性能和信任。
- 当前代码事实进入 discovery，不进入永久宪法。
- 重大架构、产品、数据、AI 边界变化需要治理机制。

Rejected:

- AI 自动入账。
- 当前页面结构永久化。
- 当前技术栈永久化。
- 当前视觉风格永久唯一化。
- 旧 `AGENTS.md` 或旧 `docs/00-10` 恢复为 source of truth。
- 将 experiments 直接写成核心规则。

## 6. 新 Constitution v2 核心规则

- 宪法保护产品灵魂，不冻结项目形态。
- 如果一条规则未来可能合理变化，就不要写进 Constitution。
- 当前实现事实写入 discovery。
- 当前页面、功能、视觉、交互写入 specs。
- 探索方向写入 experiments。
- 重大决策写入 ADR。
- 财务准确性高于 UI、AI、视觉和输入效率。

## 7. 已废弃的旧约束

- 旧 `AGENTS.md` 不再作为 source of truth。
- 旧 `docs/00-10` 不再作为 source of truth。
- 旧技术栈限制不再恢复为永久限制。
- 旧页面结构不再恢复为永久限制。
- 旧视觉实现不再恢复为永久限制。
- 旧 API / 模型供应商不再恢复为永久限制。

## 8. 保留的底线

- AI 不能直接写账。
- AI 只能生成 Candidate Transaction Draft。
- 正式入账必须经过用户确认。
- 正式入账必须经过统一交易规则层。
- UI 不得发明会计公式。
- 后端不能成为账本数据库。
- API key / secret 不得进入前端。
- 财务准确性高于视觉炫技。

## 9. 创新空间如何保留

文档分为四层：

- Level 1 Core Invariants：不可轻易改变的项目灵魂和底线。
- Level 2 Doctrines：当前产品、财务、AI、视觉、协作原则。
- Level 3 Contracts：模块边界和协作规则。
- Level 4 Experiments：允许探索、试错、废弃。

未来技术栈、页面结构、视觉风格、AI 输入方式、模型供应商、商业模式都没有被永久锁死。需要改变时通过 specs、experiments、ADR 或 Constitution Review 进入。

## 10. Markdown 文档结构说明

当前新文档结构：

```text
docs/
├─ README.md
├─ council/
├─ constitution/
├─ discovery/
├─ specs/
├─ experiments/
├─ adr/
└─ context/
```

核心入口：

- `docs/constitution/00-imcfo-constitution-v2.md`
- `docs/council/README.md`
- `docs/context/current-project-context.md`

## 11. Git Diff 检查

`git diff --name-status` 当前显示 tracked deletion：

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

`git status --short --branch` 还显示新增未跟踪目录：

```text
?? docs/README.md
?? docs/adr/
?? docs/constitution/
?? docs/context/
?? docs/council/
?? docs/discovery/
?? docs/experiments/
?? docs/specs/
```

检查结论：

- 未发现 `mobile/*` 修改。
- 未发现 `backend/*` 修改。
- 未发现 package / lockfile 修改。
- 未恢复旧 `AGENTS.md`。
- 未恢复旧 `docs/00-10`。
- 未自动提交。

## 12. 风险和下一步建议

### 风险

- 外部情报已经扩展为结构化矩阵，但用户提出的“500 次搜索”尚未作为独立 deep research sprint 完成。当前文档已采用证据质量筛选，低质量营销噪声未进入强规则。
- 当前 discovery 依赖本轮轻量代码读取和子 Agent 审查，没有进行完整安全审计或完整代码审计。
- 当前高级报告与部分 UI 文案存在原型 / hardcoded 风险，后续实现任务应修正。
- 当前 importData、复杂交易、transfer、liability target 等需要 specs 和实现 hardening。
- `docs/handoff/...` 删除状态需要用户确认是否保留历史资料。

### 下一步建议

1. 单独执行 External Intelligence Deep Research，按主题矩阵扩展到大规模检索，并只沉淀高可信来源。
2. 为 `docs/specs/` 创建 Record Input、Report Engine、Import/Export、Visual System 详细规格。
3. 创建第一批 ADR：AI / ASR service boundary、storage source of truth、financial report engine direction。
4. 针对发现的 financial risks 开实现任务，但需用户另行授权后再修改业务代码。
