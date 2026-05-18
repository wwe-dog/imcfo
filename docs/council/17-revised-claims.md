# Round 6 Revised Claims

## 1. Product Doctrine Agent

### Original Claim

IMCFO 是个人 CFO 系统，不是普通记账 App。

### Critic Attacks Received

- “个人 CFO”可能空泛。
- 三表可能对普通用户太重。
- AI-first 不足以差异化。

### Cross-Debate Changes

把定位从名词改为行为闭环：生活事件 -> 财务语言 -> 经营反馈 -> 行动。

### Revised Claim

IMCFO 的核心不是“高级记账”，而是把个人生活翻译成可经营、可复盘、可行动的公司式财务语言。

### Final Candidate Rules

- IMCFO protects the personal CFO loop。
- IMCFO must not degrade into ordinary bookkeeping。
- Every major feature must strengthen input, understanding, feedback, or action。

### Placement Recommendation

- constitution：personal CFO identity and loop。
- doctrine：AI-first MVP, company-style expression。
- specs：current pages and copy。
- experiments：new feedback forms。

### Rejected Ideas

- 仅用 AI 记账作为核心差异。
- 将当前首页结构写成永久规则。

## 2. Financial Core Agent

### Original Claim

会计规则高于 UI、AI 和视觉。

### Critic Attacks Received

- 当前不是完整复式账闭环。
- importData 可绕过规则。
- 原型报告和硬编码财务结论有误导风险。

### Cross-Debate Changes

降低对当前实现完成度的表述，强化未来演进的底线。

### Revised Claim

IMCFO 的财务可信度来自统一交易规则层、可追溯报表计算和明确的 Draft / posted transaction 分离。

### Final Candidate Rules

- UI cannot invent accounting formulas。
- AI cannot create posted transactions。
- Reports must be explainable and testable。
- Posted transactions must pass transaction rules。

### Placement Recommendation

- constitution：financial safety boundaries。
- doctrine：simple/pro mode shared core。
- contracts：UI/report/storage separation。
- specs：transaction validation and import hardening。
- experiments：journal entry generation。

### Rejected Ideas

- 宣称当前系统已经是完整 double-entry ledger。

## 3. AI Input Agent

### Original Claim

AI 记一笔是核心输入系统，但 AI 只能生成 Candidate Transaction Draft。

### Critic Attacks Received

- 多笔、投资、还款、往来容易误识别。
- impactPreview 可能误导。
- 用户确认可能过弱。

### Cross-Debate Changes

增加 postable / needs-more-info 边界，强调复杂交易不得自动入账。

### Revised Claim

AI 是低摩擦输入和候选解释层，不是账本写入者。所有复杂、低置信或多笔事件必须停在 Draft 直到用户补全。

### Final Candidate Rules

- AI only creates Candidate Transaction Draft。
- AI cannot write ledger, storage, or final accounting effect。
- User confirmation is mandatory。
- Complex Drafts require target account / subject completion。

### Placement Recommendation

- constitution：AI boundary。
- contracts：service and draft boundary。
- specs：confidence, multi-transaction, fallback handling。
- experiments：AI explanation and correction。

### Rejected Ideas

- 自动入账。
- 远端模型直接输出正式会计影响。

## 4. Architecture Contract Agent

### Original Claim

定义架构边界，不锁死技术栈。

### Critic Attacks Received

- 可能过度工程。
- 可能把当前实现写死。
- 文档可能阻碍 MVP。

### Cross-Debate Changes

只保护职责边界，不保护具体技术形态。

### Revised Claim

Architecture contracts define who may decide what, not which library or file must exist forever。

### Final Candidate Rules

- Current implementation facts live in discovery。
- Durable boundaries live in contracts。
- Major boundary changes require ADR。

### Placement Recommendation

- constitution：codebase-first and no stack lock-in。
- contracts：layer responsibilities。
- discovery：current files and stack。
- ADR：major architecture changes。

### Rejected Ideas

- 把 Expo、AsyncStorage、当前 screen routing 写成永久架构。

## 5. Visual Experience Agent

### Original Claim

Dark Liquid CFO Style 是当前视觉 doctrine。

### Critic Attacks Received

- 可能炫技。
- 可能影响可读性和可信度。
- 可能带来性能债。

### Cross-Debate Changes

将当前视觉从“风格规则”降为 doctrine/specs，核心只保留财务可读性和信任底线。

### Revised Claim

视觉创新被允许且重要，但必须服务个人 CFO 理解、财务可信度和移动端性能。

### Final Candidate Rules

- Visuals cannot override financial clarity。
- Current style is not permanent。
- Visual layer consumes finance data; it does not invent it。

### Placement Recommendation

- constitution：visual safety boundary。
- doctrine：current Dark Liquid CFO direction。
- specs：current implementation details。
- experiments：new visual metaphors。

### Rejected Ideas

- 把液态玻璃、球体或暗黑风格写成唯一永久风格。

## 6. User Behavior Agent

### Original Claim

IMCFO 的闭环是输入、理解、反馈、行动。

### Critic Attacks Received

- 用户可能三天后就停用。
- AI 输入不一定更快。
- 报表可能没有行动价值。

### Cross-Debate Changes

从连续打卡改为“断续使用后也能重新理解”。

### Revised Claim

IMCFO 应帮助用户在任何时间重新理解自己的经营状态，而不是惩罚用户没有每天记账。

### Final Candidate Rules

- Input must lead to understanding。
- Reports must support action。
- Simple mode lowers cognitive load without changing accounting meaning。

### Placement Recommendation

- constitution：behavior loop。
- doctrine：retention and feedback model。
- specs：current feedback UI。
- experiments：weekly/monthly operating review。

### Rejected Ideas

- 用 streak / 打卡作为核心留存机制。

## 7. Workflow Agent

### Original Claim

Claude / GPT / Codex 协作流程必须 source-of-truth first。

### Critic Attacks Received

- 流程可能过重。
- 多窗口会污染上下文。
- 压缩后可能读旧文件。

### Cross-Debate Changes

采用 lightweight governance，并将压缩上下文记录迁移到新 docs/context。

### Revised Claim

IMCFO 的协作机制必须先确认当前 source of truth，再按任务规模选择轻量或完整 Council 流程。

### Final Candidate Rules

- Do not restore legacy docs unless explicitly requested。
- Major work starts with source-of-truth check。
- Long tasks maintain `docs/context/current-project-context.md`。
- Final QA includes diff review。

### Placement Recommendation

- constitution：source-of-truth and no legacy restore。
- doctrine：agent collaboration roles。
- contracts：context handoff and QA gate。
- specs：task templates。

### Rejected Ideas

- 每个小任务都强制完整 Council。
