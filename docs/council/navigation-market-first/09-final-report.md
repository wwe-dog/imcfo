# Final Market-first Navigation Report

## 1. 本轮任务性质

本轮是 IMCFO Market-first Navigation Task Force 的市场视角导航战略讨论。

本轮不是代码实现，不是当前导航检查，不是 Constitution v2 全量重建，不是 specs 写入任务。

## 2. 是否以现有导航为前提

没有。

本轮没有读取现有 navigation / screens 代码来决定方案，没有把当前页面结构作为约束，没有讨论当前 App 导航如何优化。

## 3. 参与 Agent

主导 Agent:

- External Intelligence Agent
- Evidence Quality Critic
- User Behavior Agent
- Product Doctrine Agent
- AI Input Agent
- Originality Judge

辅助 Agent:

- Financial Core Agent
- Accounting Red-Team Agent
- Architecture Contract Agent
- Overengineering Critic
- Scope Judge
- Innovation Freedom Agent
- Spec Boundary Agent
- Chief Constitution Architect
- Final QA Reporter

## 4. 外部信息收集规模

- 外部信息点数量：32
- 来源数量：30+
- 产品案例数量：17
- 中国 / 亚洲参考：6+
- 国际参考：20+
- 用户为什么不愿意记账 / 放弃记账：5+ 条假设来源和市场信号
- AI / conversational input 如何改变入口：5+ 条来源
- 移动 App 导航 / IA / 用户路径：4+ 条来源
- CFO cockpit / dashboard / business reporting：5+ 条来源

Evidence Quality Critic 结论：

- 最强证据能证明任务优先级和市场方向。
- 不能证明某个固定 tab list 必然正确。
- 因此本轮输出是战略推荐和实验方向，不是永久规则。

## 5. 市场与用户洞察

用户不是为了多维护一个账本而下载 Personal CFO App。

用户想要的是：

- 降低财务不确定性。
- 知道现在是否安全。
- 知道这个月是否变好。
- 知道能不能花这笔钱。
- 知道下一步该做什么。
- 能追溯系统为什么这样判断。

普通记账 App 同质化的根因是按数据库对象组织导航：交易、账户、分类、预算、报表、我的。IMCFO 应该按经营循环组织导航。

## 6. 候选导航模型

候选模型：

1. CFO Cockpit Model
2. Operating System Model
3. AI-first Input Model
4. Financial Statement Model
5. Life Event Translation Model
6. Coach / Advisor Model
7. Operating CFO Loop Model

## 7. 各模型评分表

| Rank | Model | Score | Judgment |
|---:|---|---:|---|
| 1 | Operating CFO Loop | 47 / 50 | 最推荐 |
| 2 | Life Event Translation | 41 / 50 | 核心能力，应吸收 |
| 3 | CFO Cockpit | 39 / 50 | 适合作为验证壳 |
| 4 | Coach / Advisor | 38 / 50 | 可作为解释层 |
| 5 | AI-first Input | 37 / 50 | 输入层实验，不应成为全部 IA |
| 6 | Operating System | 34 / 50 | 远期愿景，当前太重 |
| 7 | Financial Statement | 32 / 50 | 信任层，不应做主导航 |

## 8. Critic 挑刺摘要

- Product Contrarian: 拒绝普通记账 App 换皮；导航必须体现个人 CFO 心智。
- Friction & Retention Critic: 输入必须全局低摩擦；开屏必须有即时价值。
- Accounting Red-Team: 必须区分 raw input、draft、posted fact、report result、CFO explanation。
- AI Failure-Mode Critic: 低置信度、多笔交易、还款、投资等场景必须有 draft recovery。
- Overengineering Critic: 拒绝企业级菜单系统；当前推荐四个目的地加一个全局动作。
- Evidence Quality Critic: 外部证据可用但不能照搬；具体标签必须用户测试。

## 9. 交叉辩论关键结论

- AI 输入是中心能力和全局动作，不是普通页面。
- 报告是权威事实层，不是建议入口。
- 账本是可追溯 source of truth，不应混入未确认 Draft。
- 经营是默认操作层，但命名需要用户测试。
- Life Event Translation 是 IMCFO 最独特能力，应横贯输入、解释和行动。
- 任何具体导航结构都不应写死成永久规则。

## 10. 最终推荐模型

最推荐模型：Operating CFO Loop Model。

推荐一级导航：

- 经营
- 报告
- 账本
- 我的

推荐全局动作：

- 说一笔

## 11. 推荐核心用户路径

1. 用户打开 IMCFO。
2. 默认进入 经营。
3. 看到今日 CFO brief：状态、变化、风险、可行动项。
4. 用户点击全局动作 说一笔。
5. AI 生成 Candidate Transaction Draft。
6. 用户确认或修正。
7. 交易规则层正式入账。
8. 报表引擎 / 规则层生成正式影响。
9. 用户回到 经营 查看更新，也可进入 报告 或 账本 追溯。

## 12. 不推荐方案及原因

- 不推荐 首页 / 报表 / 管理 / 我的：太像普通记账 App。
- 不推荐把 记一笔 做成普通一级 Tab：会把 IMCFO 重新拉回记录工具心智。
- 不推荐纯 AI Chat：容易混淆聊天、草稿、账本和报表事实。
- 不推荐三大报表直接做一级导航：专业但普通用户理解成本高。
- 不推荐 Operating System 作为当前 IA：范围过大，容易变成企业软件菜单。

## 13. 应进入 Constitution 的原则

这些只能在后续 Constitution Review 中作为原则候选，不在本轮直接写入：

- 导航应服务生活事件输入 -> 财务语言翻译 -> 已确认事实 -> 经营反馈 -> 用户行动的闭环。
- AI 输入不得被展示为正式财务事实。
- 用户必须能从洞察追溯到已确认账本事实。
- 报告层在正式入账后高于 AI estimate。
- 宪法不应冻结具体导航标签、页面结构或全局动作实现方式。

## 14. 应进入 experiments 的方向

- 经营 vs 今日 CFO vs 今日判断的标签测试。
- 账本 vs 财务档案的标签测试。
- 说一笔作为中央 action / 浮层 / 命令栏 / 输入 sheet 的形态测试。
- 能不能花是否值得成为一级入口。
- Coach / Advisor 是否应成为显性角色。
- Recurring obligations 是否应作为行动入口强化。

## 15. 不应该写死的内容

- 不写死具体 tab 数量。
- 不写死 经营 / 报告 / 账本 / 我的 作为永久导航。
- 不写死 AI 输入的 UI 形态。
- 不写死视觉实现、图标、颜色、动效。
- 不写死当前实现或当前页面结构。

## 16. 后续用户测试建议

- 对 5-8 名中国目标用户做导航标签理解测试。
- 让用户在无讲解情况下选择：想知道能不能花、想补录一笔、想看本月经营状态、想确认一条 AI 草稿分别会点哪里。
- 测试全局 说一笔 是否足够可发现。
- 测试 经营 是否比 今日 CFO 更容易理解。
- 测试用户是否能区分 报告 和 账本。

## 17. Git Status

```text
## main...origin/main [ahead 28]
D  AGENTS.md
D  docs/00-project-constitution.md ... docs/10-current-project-context.md
D  docs/handoff/2026-05-04-imcfo-complete-handoff/*
M  mobile/App.tsx
M  mobile/src/domain/accounting/transactionRules.ts
M  mobile/src/screens/*.tsx
?? docs/council/navigation-market-first/
```

Note: because `docs/council/` is already an untracked directory in this working tree, `git status --short --branch` may collapse the new files from this task under `?? docs/council/` instead of listing every file individually. The files added by this task are exactly `docs/council/navigation-market-first/00-frame-reset.md` through `09-final-report.md`, plus the desktop PDF.

Mobile changes and legacy deletions existed before this market-first navigation task.

## 18. Git Diff Name-status

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
D	docs/handoff/2026-05-04-imcfo-complete-handoff/*
M	mobile/App.tsx
M	mobile/src/domain/accounting/transactionRules.ts
M	mobile/src/screens/*.tsx
```

`git diff --name-status` does not list untracked files. New files from this task are visible in `git status` under `?? docs/council/navigation-market-first/`.

## 19. Boundary Check

No mobile code was modified by this task.

No backend code was modified by this task.

No package or lockfile was modified by this task.

No constitution or specs file was modified by this task.

No old AGENTS.md or old docs/00-10 file was restored.

No git add or commit was run.
