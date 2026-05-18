# IMCFO Constitution v2 Council Round Templates

本文件定义后续正式 Constitution v2 Council Execution 的轮次模板。本轮 Bootstrap 不执行这些轮次。

## Round 0: Bootstrap Verification

- Round goal: 确认 agent team 已存在，并确认用户是否授权进入执行阶段。
- Active agents: Codex Deliberation Controller, Diff Reviewer, Final QA Reporter.
- Required inputs: `docs/council/README.md`, `docs/council/agent-team.md`, `docs/council/operating-protocol.md`, 用户明确授权。
- Required outputs: bootstrap verification result, execution authorization status.
- Stop condition: 用户未明确授权进入执行阶段时立即停止。
- What must not happen: 不得读取全部代码；不得恢复旧规则；不得写 Constitution v2 正文。

## Round 1: Codebase Discovery

- Round goal: 发现当前代码、配置、目录结构和关键链路事实。
- Active agents: Codebase Discovery Agent, Implementation Reality Critic.
- Required inputs: 当前仓库代码、配置、目录结构、轻量 git 状态。
- Required outputs: current implementation facts, codebase map, current data flow, current financial flow, current AI record flow, implementation reality critique.
- Stop condition: discovery 被 critic 质询并修正到可接受。
- What must not happen: 不得把当前技术栈写成永久限制；不得把实验代码当成稳定架构；不得修改业务代码。

## Round 2: External Intelligence

- Round goal: 收集外部产品、用户、AI-first、视觉和行为趋势情报。
- Active agents: External Intelligence Agent, Evidence Quality Critic.
- Required inputs: 可验证外部来源、发布时间、相关性说明。
- Required outputs: source/date/finding/relevance/limitation, evidence critique, credibility rating.
- Stop condition: 每条重要情报都有可信度和适用边界。
- What must not happen: 不得照搬竞品；不得用趋势压倒 IMCFO 产品灵魂；不得把外部情报直接写入 Constitution。

## Round 3: Initial Claims

- Round goal: 各 Doctrine Chamber 提交初始主张。
- Active agents: Product Doctrine Agent, Financial Core Agent, AI Input Agent, Architecture Contract Agent, Visual Experience Agent, User Behavior Agent, Workflow Agent.
- Required inputs: Round 1 facts, Round 2 intelligence, 用户目标。
- Required outputs: product doctrine claim, financial doctrine claim, AI input doctrine claim, architecture contract claim, visual experience doctrine claim, user behavior doctrine claim, workflow doctrine claim.
- Stop condition: 每个主张都明确提出 candidate rules 和适用边界。
- What must not happen: 主张不得直接进入 Constitution；不得跳过 paired critiques。

## Round 4: Paired Critiques

- Round goal: 每个 Critic Agent 攻击对应主 Agent。
- Active agents: Product Contrarian Agent, Accounting Red-Team Agent, AI Failure-Mode Critic, Overengineering Critic, Visual Taste & Usability Critic, Friction & Retention Critic, Process Chaos Critic.
- Required inputs: Round 3 initial claims.
- Required outputs: critique reports, risk reports, rejected clichés, required revisions.
- Stop condition: 每个主 Agent 都收到具体批评和修正要求。
- What must not happen: Critic 不得只反对不替代；不得越权直接裁决。

## Round 5: Cross-Examination

- Round goal: Agent 之间交叉质询，找出跨领域冲突。
- Active agents: All Doctrine Chamber agents, Codex Deliberation Controller.
- Required inputs: Round 3 claims, Round 4 critiques.
- Required outputs: cross-examination notes, conflict list, unresolved questions.
- Stop condition: 至少完成指定交叉质询对。
- What must not happen: 不得跳过 Financial ↔ AI Input；不得跳过 Architecture ↔ AI Input；不得忽略 Workflow ↔ All。

Required cross-examinations:

- Product ↔ User Behavior
- Product ↔ Visual
- Financial ↔ AI Input
- Financial ↔ User Behavior
- Architecture ↔ AI Input
- Architecture ↔ Visual
- Workflow ↔ All

## Round 6: Revised Claims

- Round goal: 主 Agent 根据批评修正主张。
- Active agents: Product Doctrine Agent, Financial Core Agent, AI Input Agent, Architecture Contract Agent, Visual Experience Agent, User Behavior Agent, Workflow Agent.
- Required inputs: critique reports, cross-examination notes.
- Required outputs: revised claims, revised candidate rules, open disputes.
- Stop condition: 每条修正主张标明 accepted criticism 和 rejected criticism。
- What must not happen: 不得无视 critic；不得重新引入已被否决的范围膨胀。

## Round 7: Constitution Court

- Round goal: 裁决哪些内容进入 Constitution、doctrine、contracts、specs、experiments、ADR 或 rejected。
- Active agents: Chief Constitution Architect, Scope Judge, Contradiction Judge, Originality Judge.
- Required inputs: revised claims, critique reports, cross-examination notes.
- Required outputs: court decision packet, accepted/rejected/moved rule list, rewrite requests.
- Stop condition: 所有 candidate rules 均有归属。
- What must not happen: Court 不得直接落盘；不得绕过任何 Judge；不得恢复旧规则。

## Round 8: Markdown Landing

- Round goal: 将 court decision 转成可维护 Markdown 结构和文本。
- Active agents: Framework Selector Agent, Framework Critic Agent, Innovation Freedom Agent, Living Constitution Agent, Doctrine Distiller Agent, Markdown Information Architect, Spec Boundary Agent, Document Writer Agent, Markdown QA Agent.
- Required inputs: court decision packet, markdown landing rules.
- Required outputs: framework selection, rule level matrix, file responsibility map, drafted Markdown, Markdown QA report.
- Stop condition: Markdown QA 通过，且 implementation facts 与 constitution rules 已分离。
- What must not happen: 不得把当前技术栈写进 constitution；不得把页面结构写成永久限制；不得把 API / 模型供应商写死。

## Round 9: Final QA & Diff Review

- Round goal: 最终检查文件修改范围并输出中文汇报。
- Active agents: Diff Reviewer, Final QA Reporter.
- Required inputs: final diff, created/modified file list, Markdown QA report.
- Required outputs: `git diff --name-status`, final Chinese report.
- Stop condition: diff 确认没有越权修改，用户收到中文汇报。
- What must not happen: 不得自动提交；不得 `git add .`；不得进入下一阶段。

