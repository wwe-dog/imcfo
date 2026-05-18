# Zero-based Navigation Models

> These are candidate models for a new AI-first Personal CFO App. They are not implementation specs and do not depend on the current IMCFO app structure.

## Model A: CFO Cockpit Model

Top-level navigation:

- 驾驶舱
- 输入
- 报告
- 账本
- 我的

Global action design:

- "说一笔" remains available from every destination.
- The Input tab is not mandatory if the global action proves discoverable.

User mental model:

- I open the app to see my current financial operating state.

Core user path:

- Open 驾驶舱 -> see risk / change / next action -> use 说一笔 -> confirm draft -> return to cockpit impact.

Why it fits IMCFO:

- Closest to Personal CFO cockpit and decision orientation.

Why different from normal bookkeeping apps:

- Starts from operating state, not ledger maintenance.

Risks:

- Could become a chart wall.
- "驾驶舱" may feel too business-heavy.

Best user:

- Users who want a command center and are comfortable with financial metaphors.

What should be tested:

- Whether "驾驶舱" is understandable and whether users know what to do next.

## Model B: Operating System Model

Top-level navigation:

- 状态
- 行动
- 账本
- 报告
- 我的

Global action design:

- "说一笔" starts new input from all tabs.

User mental model:

- IMCFO is the operating system for my personal finances.

Core user path:

- Check 状态 -> pick 行动 -> inspect supporting 账本 / 报告 -> record new data through global action.

Why it fits IMCFO:

- Converts finance from passive records into ongoing management.

Why different:

- Elevates action and status over ordinary bookkeeping.

Risks:

- "状态" and "行动" can be too abstract.
- Can become an enterprise menu if expanded too far.

Best user:

- Users who want guidance, not raw reports.

What should be tested:

- Whether users understand "状态" and "行动" without onboarding.

## Model C: AI-first Input Model

Top-level navigation:

- 说一笔
- 待确认
- 看影响
- 报告
- 我的

Global action design:

- AI input is the central home and may also be a persistent action.

User mental model:

- I talk to the app first; the app organizes my finances after that.

Core user path:

- Say or type an event -> receive candidate draft -> confirm -> view impact -> inspect reports.

Why it fits IMCFO:

- Maximizes AI-first differentiation.

Why different:

- Navigation begins from conversation / input, not ledger objects.

Risks:

- Over-AI. Users may distrust or feel trapped if recognition fails.
- Drafts can be confused with posted facts.

Best user:

- Users who hate forms and want a conversational product.

What should be tested:

- Failure recovery, draft confidence, manual fallback and trust.

## Model D: Financial Statement Model

Top-level navigation:

- 资产负债
- 收入支出
- 现金流
- 行动
- 我的

Global action design:

- "说一笔" updates the relevant statement after confirmation.

User mental model:

- My life is translated into the three financial statements.

Core user path:

- Record or import event -> system routes impact to statements -> user reads the statement affected.

Why it fits IMCFO:

- Directly protects the "personal company financial statements" identity.

Why different:

- More financially rigorous than normal expense apps.

Risks:

- Too professional for ordinary users.
- Can make reports the first burden rather than a trust layer.

Best user:

- Users who want accounting clarity or professional mode.

What should be tested:

- Whether simple-mode labels can preserve truth without overwhelming users.

## Model E: Life Event Translation Model

Top-level navigation:

- 说一笔
- 看影响
- 看经营
- 管账本
- 我的

Global action design:

- "说一笔" can be both a primary entry and persistent shortcut.

User mental model:

- I describe real life; IMCFO tells me the financial meaning.

Core user path:

- Say a life event -> see estimated impact -> confirm -> see operating update -> inspect ledger if needed.

Why it fits IMCFO:

- Directly expresses IMCFO's translation role.

Why different:

- Competes on meaning translation, not expense category management.

Risks:

- "看影响" can be confused with final report output if not labeled carefully.
- May underemphasize formal reports.

Best user:

- Non-accountants who want everyday language.

What should be tested:

- Whether users understand impact estimate vs posted financial result.

## Model F: Coach / Advisor Model

Top-level navigation:

- 今日判断
- 说一笔
- 行动
- 报告
- 我的

Global action design:

- "说一笔" is visible as core input; "Ask CFO" may appear inside 今日判断 and 报告.

User mental model:

- IMCFO is my daily financial advisor.

Core user path:

- Check 今日判断 -> ask / record -> receive optional action -> verify in report.

Why it fits IMCFO:

- Strong retention hook if the daily judgment is useful.

Why different:

- Focuses on judgment and action rather than ledger.

Risks:

- Advice boundary risk.
- Repeated advice can feel generic or moralizing.

Best user:

- Users who want help deciding what to do.

What should be tested:

- Whether "今日判断" produces real perceived value with sparse data.

## Model G: Operating CFO Loop Model

Top-level navigation:

- 经营
- 报告
- 账本
- 我的

Global action design:

- "说一笔" is a persistent global primary action, not a normal tab.
- "Ask CFO" is context-aware inside 经营 / 报告 / 账本.

User mental model:

- I operate myself like a small company: record events, see operating state, verify reports, keep the books clean.

Core user path:

- Open 经营 -> see today's financial judgment -> tap 说一笔 -> confirm candidate draft -> return to 经营 impact -> inspect 报告 or 账本 if needed.

Why it fits IMCFO:

- Combines cockpit, translation, trusted statements and ledger traceability without turning input into a tab.

Why different:

- The primary destination is "经营", not "首页"; the product is about operating yourself, not maintaining records.

Risks:

- "经营" may need onboarding copy or alternate naming tests.
- If 经营 becomes too broad, it can hide concrete tasks.

Best user:

- Users who want AI-first input but still need financial trust.

What should be tested:

- Whether ordinary users understand 经营 / 报告 / 账本 and whether "说一笔" is discoverable enough as a global action.

