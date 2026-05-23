# Home Dashboard Super-Agent Council Run

This is a fresh council run. It intentionally discards the earlier council files and does not reuse their conclusions.

## Round 0: Bootstrap

### 0.1 Task Boundary

Task type: documentation/spec/council only.

Confirmed constraints:

- Do not modify `mobile/**`.
- Do not modify `DashboardScreen.tsx`.
- Do not modify `package.json` or `package-lock.json`.
- Do not modify `docs/constitution/**` or `docs/discovery/**`.
- Do not restore deprecated `AGENTS.md`.
- Do not restore legacy `docs/00-10`.
- Do not stage or commit.
- Do not run `git clean`.

### 0.2 Step 0 Removal Log

Initial inspection command:

```text
git status --short --branch --untracked-files=all
```

Initial status:

```text
## main...origin/main [ahead 1]
 M mobile/src/screens/LedgerModuleScreen.tsx
?? docs/council/home-dashboard-super-agent-run.md
?? docs/council/home-dashboard-super-agent-team.md
?? docs/specs/home-dashboard-v4-final-council-spec.md
?? mobile/qa-budget-category-swipe.png
?? mobile/qa-budget-delete-confirm.png
?? mobile/qa-budget-edit-category.png
?? mobile/qa-budget-edit-fixed.png
?? mobile/qa-budget-edit-project.png
?? mobile/qa-budget-fixed-swipe.png
?? mobile/qa-budget-new-category-error.png
?? mobile/qa-budget-new-fixed-error.png
?? mobile/qa-budget-new-project-error.png
?? mobile/qa-budget-overview.png
?? mobile/qa-budget-project-swipe.png
```

Removed only these files if present:

- `docs/council/home-dashboard-super-agent-team.md`
- `docs/council/home-dashboard-super-agent-run.md`
- `docs/specs/home-dashboard-v4-final-council-spec.md`

Post-removal status:

```text
## main...origin/main [ahead 1]
 M mobile/src/screens/LedgerModuleScreen.tsx
?? mobile/qa-budget-category-swipe.png
?? mobile/qa-budget-delete-confirm.png
?? mobile/qa-budget-edit-category.png
?? mobile/qa-budget-edit-fixed.png
?? mobile/qa-budget-edit-project.png
?? mobile/qa-budget-fixed-swipe.png
?? mobile/qa-budget-new-category-error.png
?? mobile/qa-budget-new-fixed-error.png
?? mobile/qa-budget-new-project-error.png
?? mobile/qa-budget-overview.png
?? mobile/qa-budget-project-swipe.png
```

The modified `mobile/src/screens/LedgerModuleScreen.tsx` and untracked QA screenshots are pre-existing user/worktree state and are not touched by this council task.

### 0.3 Source Files Read

The council read the following current source-of-truth files:

1. `docs/constitution/00-imcfo-constitution-v2.md`
2. `docs/constitution/01-product-doctrine.md`
3. `docs/constitution/02-financial-core-doctrine.md`
4. `docs/constitution/03-ai-input-boundary.md`
5. `docs/constitution/04-architecture-contracts.md`
6. `docs/constitution/05-visual-experience.md`
7. `docs/constitution/06-agent-workflow.md`
8. `docs/constitution/07-change-governance.md`
9. `docs/discovery/current-codebase-map.md`
10. `docs/discovery/current-data-flow.md`
11. `docs/discovery/current-financial-flow.md`
12. `docs/discovery/current-ai-record-flow.md`

Deprecated sources explicitly excluded:

- legacy `AGENTS.md`
- legacy `docs/00-10`
- old `docs/10-current-project-context.md` as current truth

### 0.4 Key Rules Extracted From Source

#### Constitution v2

Quoted rules:

- `The source of truth hierarchy is:`
- `Legacy AGENTS.md and legacy docs/00-10 are deprecated`
- `It is not a normal bookkeeping app`
- `life event input -> financial language translation -> operating status feedback`
- `UI must not invent accounting formulas.`
- `AI may only create Candidate Transaction Drafts.`
- `AI must not directly write ledger data.`
- `Formal posting requires user confirmation.`

Council consequence:

The homepage must be a personal CFO operating surface, not a sphere demo. It may guide input, interpretation, and next action, but it cannot create financial truth or bypass draft confirmation.

#### Product Doctrine

Quoted rules:

- `IMCFO turns personal life into a personal company.`
- `record a life event`
- `see your operating state`
- `A mobile-first personal operating view`
- `A normal bookkeeping app with a dark UI` is explicitly rejected.
- `AI-first record input reduces friction but does not replace financial rules.`

Council consequence:

The homepage must translate personal life into operating status. The default page should answer the user's operating question, not merely advertise record speed or display decorative finance objects.

#### Financial Core Doctrine

Quoted rules:

- `UI cannot invent accounting formulas.`
- `Report calculations must be pure enough to test.`
- `Storage does not decide financial meaning.`
- `Three reports are the current product skeleton`
- `Every report row and summary metric should be traceable`

Council consequence:

Metrics on the homepage must come from existing data, domain rules, report outputs, or clearly marked data-insufficient states. Cash safety cannot be invented unless a documented rule exists.

#### AI Input Boundary

Quoted rules:

- `AI is not the bookkeeper of record.`
- `A Candidate Transaction Draft is not a posted transaction.`
- `It must remain visibly reviewable by the user.`
- Formal posting requires `user confirmation`.
- `impactPreview must never be presented as report-engine output.`

Council consequence:

The bottom voice entry can be primary, but it must still enter the Candidate Draft and confirmation flow. The homepage may hint at input, but cannot imply AI auto-posting.

#### Architecture Contracts

Quoted rules:

- UI may `display drafts` and `present report output`.
- UI must not `invent accounting formulas`.
- UI must not `mutate storage directly`.
- UI must not `post AI drafts directly`.
- AI/ASR may handle `transcription` and `draft recognition`.
- Backend may `not become the ledger database`.

Council consequence:

The homepage design can define UI hierarchy and interactions only. It cannot move ledger responsibility or storage ownership.

#### Visual Experience

Quoted rules:

- `Current visual direction: Dark Liquid CFO Style.`
- It should not feel like `a generic bookkeeping table`.
- Allowed metaphors include `sphere / orbit / operating-state metaphors`.
- Allowed entry direction includes `voice-first record entry`.
- `Not every element requires a glass surface container.`
- `Report tables and charts must be scannable.`
- `Motion must not block recording, confirmation`
- `Loading states and empty states must be visually distinct from real data states.`
- `The current bottom navigation remains 首页 / 管理 / 报表 / 我的 unless a separate product decision changes route structure.`
- `Screens must not create financial numbers`

Council consequence:

The homepage may use cockpit, orbit, glass, and voice-first patterns, but the sphere should be subordinate if it blocks operating clarity. Bottom navigation conflict must be recorded, not silently resolved.

#### Agent Workflow

Quoted rules:

- Agent collaboration exists, but `source of truth must remain explicit`.
- Keep `accounting logic out of UI`.
- Before major work, `record current source of truth, git status`.
- Final output should include `git diff / status summary`.

Council consequence:

This run must be recorded, evidence-backed, and limited to the three council/spec files.

#### Change Governance

Quoted rules:

- ADR required for `changing storage ownership`.
- ADR required for `changing report engine source of truth`.
- Specs update required for `page structure`, `UI behavior`, and `prompt / draft UI changes`.
- Constitution Review is required when a change may affect `AI posting boundary` or `user confirmation requirement`.

Council consequence:

The homepage redesign belongs in a spec. Bottom navigation structure change may require ADR if it becomes a product architecture decision rather than a visual implementation detail.

#### Discovery: Current Codebase Map

Quoted facts:

- Current bottom entries are `dashboard`, `record`, `reports`, `settings`.
- `RecordScreen.tsx` is the current voice/text record entry with Candidate Draft confirmation.
- Screens do not directly call `AsyncStorage`.
- `speechTranscriptionService.ts` returns transcription.
- `recordRecognitionService.ts` recognizes text into `CandidateTransactionDraft`.
- Current mobile services do not directly write ledger or AsyncStorage.

Council consequence:

The bottom voice entry claim conflicts with older visual doctrine and must be handled as a current-design decision requiring spec/ADR clarity. Record flows should reuse existing `RecordScreen` and recognition services.

#### Discovery: Current Data Flow

Quoted facts:

- Startup loads `AppData` through `useAppData`.
- Formal saves flow through `createTransactionFromInput`, `applyTransactionToFinancialState`, then `storageAdapter.saveData`.
- Report display can use `buildDashboardSummary`, `buildBalanceSheetSummary`, `buildIncomeStatementSummary`, and `buildCashFlowStatementSummary`.
- `screen 不直接调用 AsyncStorage`.
- `record recognition service 返回 Draft，不直接保存交易`.

Council consequence:

Homepage data should bind to existing summaries or be data-insufficient. It must not calculate new financial truth in screen code.

#### Discovery: Current Financial Flow

Quoted facts:

- The current system is a `transaction-rule-driven personal financial state system`.
- It is not a complete double-entry ledger closed loop.
- Operating/profitability analysis currently has prototype/hardcoded risk.
- Settings has financial conclusions that may be UI-hardcoded.
- Display financial conclusions must be traceable to domain/report engine.

Council consequence:

The homepage should avoid ambitious operating conclusions unless backed by current summary/report outputs. It can present a conservative operating verdict based on available safe metrics and mark unavailable items.

#### Discovery: Current AI Record Flow

Quoted facts:

- Voice flow: `RecordScreen -> expo-audio recording -> speechTranscriptionService`.
- Text flow: text -> `recognizeTransactionDraft(text)` -> `CandidateTransactionDraft` -> confirmation modal.
- Formal flow: `CandidateTransactionDraft -> handleConfirmDraft() -> buildTransactionInputFromDraft() -> onSave`.
- `当前 AI Draft 不直接写 AsyncStorage`.
- Low confidence, multi-transaction, missing target/account/direction Drafts must stay candidate.

Council consequence:

The bottom center voice entry can be the primary input, but all paths must end in the same Candidate Draft confirmation flow.

### 0.5 Current User Intent Entered Into Council

The current user intent is:

- Redesign Home Dashboard as C方案 / 极限创新版 / 个人公司驾驶舱.
- Default home should focus on operating status.
- The old high-density sphere should not be default body.
- The old sphere should be preserved only as a reduced button or secondary expandable CFO Orbit.
- The bottom center voice input should be treated as the primary natural-language entry.
- The homepage should answer: 我这个月经营得怎么样？
- The homepage must not be a pure sphere demo, a card pile dashboard, or a normal bookkeeping reskin.

## Round 1: Independent Claims

### 1.1 personal-cfo-product-agent / 个人 CFO 产品 Agent

1. Homepage job:
   The homepage must make the user feel they are operating a personal company. Its first job is not recording, browsing cards, or showing a sphere. Its first job is to translate this month's life activity into a company-style operating answer.

2. Currently wrong:
   The previous sphere-first direction makes the homepage read as a visual object demo. It does not answer the user's question quickly. It also makes the product look like a futuristic launcher rather than a CFO cockpit.

3. Must keep:
   Keep Dark Liquid CFO Style, company-style language, the bottom voice entry, report-backed financial concepts, and the old sphere as a brand symbol.

4. Must remove or downgrade:
   Downgrade the large sphere from homepage body to secondary CFO Orbit. Remove high-density default card piles. Remove any unauthorized HUD that displays fake or hardcoded numbers.

5. Must test:
   Test whether the first screen makes the user understand: "I can see this month's operating condition and I can speak a life event to update it."

### 1.2 financial-truth-agent / 财务真实性 Agent

1. Homepage job:
   The homepage should expose financial state only through report/domain-backed values or explicit data-insufficient states. It should not act like an analyst if the data is incomplete.

2. Currently wrong:
   Visual experiments have treated finance as a backdrop. Some prior UI states risked showing hardcoded numbers, decorative HUD, or conclusions not traceable to report engine.

3. Must keep:
   Keep the six accounting elements, report skeleton, Candidate Draft boundary, and user confirmation before posting.

4. Must remove or downgrade:
   Remove UI formulas, fake cash safety, fake operating verdicts, and visual claims that imply financial truth.

5. Must test:
   Test no-data state, low-data state, and real-data state separately. Check that every visible amount has a source field and every unavailable metric is clearly marked.

### 1.3 information-architecture-agent / 信息架构 Agent

1. Homepage job:
   The homepage should prioritize a simple operating answer, then supporting metrics, then action. It should not use the sphere as the organizing principle.

2. Currently wrong:
   The old sphere consumes the first screen. It creates density without hierarchy. It is visually memorable but weak as information architecture.

3. Must keep:
   Keep a short brand area, a clear operating headline, three to four compact financial state modules, a visible action path, and a secondary orbit entry.

4. Must remove or downgrade:
   Remove the big sphere from above-the-fold. Remove large inline input if the bottom voice entry is already primary. Avoid a card pile dashboard.

5. Must test:
   Test one-screen scannability on Android portrait: brand, answer, critical metrics, and bottom voice entry must be visible without scrolling.

### 1.4 user-behavior-agent / 用户行为 Agent

1. Homepage job:
   A user should open the app and understand in 5 seconds: "This tells me how my personal company is doing this month, and I can speak a new event."

2. Currently wrong:
   A sphere-first page requires explanation. Users may admire it but not know whether to tap it, rotate it, record something, or read a report.

3. Must keep:
   Keep Chinese copy, direct prompts, bottom voice input, and clear next action.

4. Must remove or downgrade:
   Remove abstract-only cockpit language. Downgrade orbit into an optional exploration layer. Avoid duplicate large record entry competing with bottom voice.

5. Must test:
   Test first-use comprehension, empty state, and whether the user can locate record input immediately.

### 1.5 visual-director-agent / 视觉导演 Agent

1. Homepage job:
   The homepage should look like a deep, calm personal CFO cockpit: dark, liquid, operational, premium, and restrained.

2. Currently wrong:
   The sphere attempts drifted into noisy blur, gray translucent blocks, all-card glow, and debug-like geometry. It overloaded visual effects and reduced trust.

3. Must keep:
   Keep Dark Liquid CFO background, glass where it creates hierarchy, brand gradient, low-interference ambient motion, and a controlled CFO Orbit symbol.

4. Must remove or downgrade:
   Remove high-density 76-card all-blur default sphere, noisy HUD streams, debug grids, and decorative effects that compete with financial reading.

5. Must test:
   Screenshot QA must verify readability, not just beauty. The page must look premium but still operational.

### 1.6 interaction-agent / 交互 Agent

1. Homepage job:
   The homepage should route the user through operating status -> input -> confirmation -> updated status. The bottom voice button is the main input.

2. Currently wrong:
   Prior layouts mixed sphere tap, drag, center voice card, HUD, and bottom voice entry. Too many primary interactions competed.

3. Must keep:
   Keep bottom center voice input as the primary recording entry if it is now current UI. Keep Candidate Draft confirmation. Keep bottom navigation unless a spec/ADR updates it.

4. Must remove or downgrade:
   Remove large always-visible center voice card inside sphere. Avoid inline input card as another full CTA unless it is a small hint. Downgrade sphere interactions to a secondary CFO Orbit.

5. Must test:
   Test tap paths: bottom voice opens record, metric tap opens explanation bottom sheet, CFO Orbit opens secondary expansion, no direct AI posting.

### 1.7 implementation-feasibility-agent / 实现可行性 Agent

1. Homepage job:
   Implementation should phase the cockpit without destabilizing current data and report flows.

2. Currently wrong:
   Previous attempts spent risk budget on visual experiments: heavy blur, dense Skia, many transparent layers, and screenshot iteration. That is not the shortest path to product-correct home.

3. Must keep:
   Keep existing `DashboardScreen` data props and summary outputs. Keep `RecordScreen` and services for input. Keep bottom nav until explicit decision.

4. Must remove or downgrade:
   Remove all-card blur as default. Defer complex orbit animation. Do not add dependencies.

5. Must test:
   Typecheck, screenshot collapsed/default home, no-data state, bottom voice flow, metric bottom sheets, and no forbidden file changes.

### 1.8 home-screenshot-qa-agent / 首页截图 QA Agent

1. Homepage job:
   QA should verify whether the screenshot answers the homepage question and preserves boundaries.

2. Currently wrong:
   Earlier visual QA focused on whether the sphere looked acceptable. The future QA must judge operating clarity first.

3. Must keep:
   Keep Chinese labels, dark visual consistency, bottom navigation, bottom voice input clarity, and data-state distinction.

4. Must remove or downgrade:
   Reject sphere-dominant screenshots, fake metric screenshots, card piles, unauthorized HUD, and debug/probe lines.

5. Must test:
   Capture default, no-data, low-data, and orbit-expanded states. Check readability and bottom nav conflict state.

## Round 2: Paired Rebuttal Loops

### 2.1 home-council-chair ↔ chair-process-auditor

Original Claim:
The chair states that this is a docs/spec-only rerun from current source-of-truth. It will delete only the old three council/spec files, then produce a full new run and final spec. It will not modify mobile code or reuse deprecated docs.

Round 1 Rebuttal Objection:
`chair-process-auditor` objects with Major severity: the chair could still converge too quickly by treating the current user intent as sufficient and skipping the two-round loop discipline.

Round 1 Main Agent Revision:
The chair accepts. The run document must include all nine paired loops, each with at least two objection/revision/review rounds, even when satisfied after round 1. It must also include six argued cross-debates.

Round 1 Rebuttal Review:
Satisfied for round 1, but requests a sanity challenge.

Round 2 Sanity Challenge:
`chair-process-auditor` objects with Major severity: final spec could silently decide bottom navigation conflict. Current user says bottom center voice exists, while Visual Experience still says bottom navigation remains 首页 / 管理 / 报表 / 我的 unless a separate decision changes route structure.

Round 2 Main Agent Revision:
The chair accepts. Bottom navigation conflict must appear in cross-debate D and final spec. The council must state whether ADR is recommended or whether implementation must wait for explicit confirmation.

Round 2 Rebuttal Review:
Satisfied. The process is sufficiently explicit.

Final Status: Satisfied.

### 2.2 personal-cfo-product-agent ↔ product-contrarian-agent

Original Claim:
The product agent claims the homepage must become a Personal Company Cockpit. The old sphere should be downgraded because the product promise is operating interpretation, not visual novelty.

Round 1 Rebuttal Objection:
`product-contrarian-agent` objects with Blocker severity: "personal company cockpit" may be an internal metaphor. A user may not understand it in 5 seconds unless the homepage states a plain question.

Round 1 Main Agent Revision:
The product agent accepts. The homepage must explicitly surface "我这个月经营得怎么样？" or an equivalent Chinese operating question above the metrics. "个人公司驾驶舱" can be supporting framing, not the only title.

Round 1 Rebuttal Review:
Satisfied for the plain-language requirement, but asks for a second challenge.

Round 2 Sanity Challenge:
`product-contrarian-agent` objects with Major severity: If the homepage shows a polished cockpit but does not explain how input changes the operating state, users may see branding without utility.

Round 2 Main Agent Revision:
The product agent accepts. The homepage must connect status and action: operating answer, supporting metrics, and a visible cue toward bottom voice input. The protected loop must be visible in the structure: status -> why -> next action.

Round 2 Rebuttal Review:
Satisfied. The product metaphor is grounded in user task.

Final Status: Satisfied.

### 2.3 financial-truth-agent ↔ financial-edge-case-agent

Original Claim:
The financial agent claims homepage metrics must come from domain/report outputs or be marked data-insufficient. UI cannot calculate new formulas, especially cash safety.

Round 1 Rebuttal Objection:
`financial-edge-case-agent` objects with Blocker severity: "经营得怎么样" invites a synthetic conclusion. If it combines profit, cash flow, assets, or safety cushion without a documented formula, it violates doctrine.

Round 1 Main Agent Revision:
The financial agent accepts. The homepage verdict must not be a hidden formula. Phase 1 can use a conservative textual state based on available existing fields and must disclose data insufficiency. If a combined verdict is desired later, it needs report-engine support or documented assumptions.

Round 1 Rebuttal Review:
Satisfied for hidden-formula risk, but requests a second challenge.

Round 2 Sanity Challenge:
`financial-edge-case-agent` objects with Major severity: Cash safety is specifically dangerous. It may require cash balance, fixed expenses, runway logic, and period assumptions not currently guaranteed.

Round 2 Main Agent Revision:
The financial agent accepts. Cash safety is `data-insufficient` unless an existing report/source field provides it or a future documented rule is added. The UI may show "需要更多现金流数据" but not a fake runway or safety score.

Round 2 Rebuttal Review:
Satisfied. All unsafe metrics are blocked or marked insufficient.

Final Status: Satisfied.

### 2.4 information-architecture-agent ↔ information-density-critic

Original Claim:
The IA agent claims default home should be a compact operating cockpit: brand, operating question, three-axis financial state, action hint, and secondary CFO Orbit.

Round 1 Rebuttal Objection:
`information-density-critic` objects with Major severity: A cockpit can easily become low-density poster art. The page must contain enough actual financial structure to avoid becoming a hero screen.

Round 1 Main Agent Revision:
The IA agent accepts. Above the fold must include at least: operating question/answer, three compact state modules, and one next-action cue. Visual brand alone is insufficient.

Round 1 Rebuttal Review:
Satisfied for minimum density, but asks for a second challenge.

Round 2 Sanity Challenge:
`information-density-critic` objects with Major severity: Three-axis modules could become a card pile if each axis expands into many cards.

Round 2 Main Agent Revision:
The IA agent accepts. Default state must use one primary answer strip and a limited set of compact modules. Expanded explanation belongs in bottom sheets or report screens, not in default card piles.

Round 2 Rebuttal Review:
Satisfied. Default density is controlled.

Final Status: Satisfied.

### 2.5 user-behavior-agent ↔ novice-confusion-agent

Original Claim:
The user agent claims the homepage should be understandable in 5 seconds: this is my monthly operating state, and I can speak a new event.

Round 1 Rebuttal Objection:
`novice-confusion-agent` objects with Blocker severity: A first-time user may not know what "operating state" means. They need a plain-language anchor and an action that is obvious.

Round 1 Main Agent Revision:
The user agent accepts. The headline should use plain Chinese: "我这个月经营得怎么样？" The answer should avoid jargon in simple mode and should point to the bottom voice entry with wording like "说一件生活事件，更新本月经营状态".

Round 1 Rebuttal Review:
Satisfied for first-use text, but asks for a second challenge.

Round 2 Sanity Challenge:
`novice-confusion-agent` objects with Major severity: If the old sphere remains visible as a cool button, the user may think it is primary or decorative and ignore the financial answer.

Round 2 Main Agent Revision:
The user agent accepts. CFO Orbit must be visually secondary: small, labeled, and below the main status. It should not compete with the operating answer or bottom voice entry.

Round 2 Rebuttal Review:
Satisfied. First-use path is clear.

Final Status: Satisfied.

### 2.6 visual-director-agent ↔ visual-critic-agent

Original Claim:
The visual director claims the homepage should use Dark Liquid CFO Style with restrained glass, operating-state hierarchy, and a secondary orbit symbol.

Round 1 Rebuttal Objection:
`visual-critic-agent` objects with Major severity: Dark Liquid CFO Style has previously drifted into overdesigned sci-fi, dirty gray glass, and low readability. The spec must prevent another effect-first page.

Round 1 Main Agent Revision:
The visual director accepts. The visual rules must state that effects are subordinate to status, input, confirmation, and financial reading. Not every element uses glass; major metrics can float on the dark background.

Round 1 Rebuttal Review:
Satisfied for overdesign control, but asks for a second challenge.

Round 2 Sanity Challenge:
`visual-critic-agent` objects with Major severity: The CFO Orbit can reintroduce the 76-card visual debt if the old sphere is reused unchanged.

Round 2 Main Agent Revision:
The visual director accepts. CFO Orbit may reuse the old sphere only as a reduced, secondary, lower-density, expandable functional symbol. It must not use high-density all-card blur or debug/probe grids.

Round 2 Rebuttal Review:
Satisfied. Visual direction is restrained and orbit risk is mitigated.

Final Status: Satisfied.

### 2.7 interaction-agent ↔ interaction-friction-agent

Original Claim:
The interaction agent claims the bottom center voice entry should be primary. Homepage should not add a competing large inline record card, but may include a small hint.

Round 1 Rebuttal Objection:
`interaction-friction-agent` objects with Major severity: If bottom voice entry is primary but the homepage has no inline affordance, some users may miss the reason to use it.

Round 1 Main Agent Revision:
The interaction agent partially accepts. The homepage may include an inline "next action" row that points to bottom voice, but it should not be a second primary CTA. The bottom button remains the actual record entry.

Round 1 Rebuttal Review:
Satisfied for duplicate CTA risk, but asks for a second challenge.

Round 2 Sanity Challenge:
`interaction-friction-agent` objects with Blocker severity: The bottom center voice entry conflicts with earlier bottom nav doctrine. The interaction spec cannot assume it is approved architecture.

Round 2 Main Agent Revision:
The interaction agent accepts. The final spec must explicitly state: the current bottom center voice entry is treated as current design intent for this council, but if it changes bottom navigation architecture, ADR is recommended or user confirmation is required before implementation.

Round 2 Rebuttal Review:
Satisfied. The conflict is not silent.

Final Status: Satisfied.

### 2.8 implementation-feasibility-agent ↔ implementation-ambition-agent

Original Claim:
The feasibility agent claims Phase 1 should avoid heavy animation and all-card blur, and should first implement the cockpit structure, data binding, and empty states.

Round 1 Rebuttal Objection:
`implementation-ambition-agent` objects with Major severity: Feasibility may dilute the selected C方案 / 极限创新版 into a safe dashboard. Product-correct ideas should be phased, not rejected.

Round 1 Main Agent Revision:
The feasibility agent accepts. Phase 1 should still feel innovative through hierarchy, language, dark liquid environment, and secondary orbit concept. Phase 2 can add richer CFO Orbit behavior after the operating cockpit is stable.

Round 1 Rebuttal Review:
Satisfied for ambition preservation, but asks for a second challenge.

Round 2 Sanity Challenge:
`implementation-ambition-agent` objects with Major severity: If CFO Orbit is postponed too much, the old sphere may be effectively deleted, violating the current user intent.

Round 2 Main Agent Revision:
The feasibility agent accepts. Phase 1 should include a visible CFO Orbit button or compact preview, even if expanded animation is Phase 2. The old sphere is downgraded, not removed.

Round 2 Rebuttal Review:
Satisfied. Feasibility plan preserves the concept.

Final Status: Satisfied.

### 2.9 home-screenshot-qa-agent ↔ qa-false-positive-agent

Original Claim:
The screenshot QA agent claims acceptance should check default, no-data, low-data, and orbit-expanded screenshots.

Round 1 Rebuttal Objection:
`qa-false-positive-agent` objects with Major severity: QA must not only check visual beauty; it must check whether the homepage answers the operating question without fake data.

Round 1 Main Agent Revision:
The QA agent accepts. QA checklist must include: answers "我这个月经营得怎么样？", no fake money, source-backed metrics, bottom voice clarity, old sphere downgraded, no card pile, no forbidden file changes.

Round 1 Rebuttal Review:
Satisfied for content QA, but asks for a second challenge.

Round 2 Sanity Challenge:
`qa-false-positive-agent` objects with Major severity: A single Android screenshot may pass while interaction states fail. CFO Orbit, bottom sheets, and bottom voice overlay must be checked.

Round 2 Main Agent Revision:
The QA agent accepts. QA requires multiple states: default, empty/data-insufficient, metric explanation, CFO Orbit expanded, and bottom voice initiation. If any state is unavailable, the report must mark it as not verified.

Round 2 Rebuttal Review:
Satisfied. QA now covers visual and behavior risks.

Final Status: Satisfied.

## Round 3: Cross-Debates

### 3.A Product Positioning vs User Understanding

Question:
Can users understand "personal company cockpit" in 5 seconds? Should homepage explicitly say "我这个月经营得怎么样？"

Participants:

- `personal-cfo-product-agent`
- `product-contrarian-agent`
- `user-behavior-agent`
- `novice-confusion-agent`

Opening positions:

- Product: The page should be a personal company cockpit, not bookkeeping.
- Contrarian: Cockpit is too abstract unless translated into plain user value.
- User behavior: Five-second comprehension requires a plain question and obvious next action.
- Novice confusion: The user should not need to understand accounting doctrine before using the page.

Argument 1:
Product argues that "个人公司驾驶舱" preserves IMCFO's differentiation. The homepage should not retreat to "收支概览" because that collapses the product into bookkeeping.

Counterargument:
Contrarian replies that differentiation is useless if the first screen does not explain itself. "驾驶舱" can be a supporting metaphor, but the primary headline should be a question the user already has.

Argument 2:
User behavior argues that the question "我这个月经营得怎么样？" maps directly to the desired mental model. It is clear, Chinese, and action-oriented.

Counterargument:
Product warns that too plain a question could become generic wellness-style finance unless the supporting modules use company-style language: 资产、负债、净资产、利润/结余、现金流.

Argument 3:
Novice confusion argues that the page should connect the answer to action: if the state is incomplete, it should tell the user to record a life event, not show passive placeholders.

Counterargument:
Product accepts but insists the action must still go through the CFO translation loop, not merely "add expense".

Resolved points:

- The default homepage concept is Personal Company Cockpit.
- The visible plain-language question must be "我这个月经营得怎么样？" or a close equivalent.
- "个人公司驾驶舱" is supporting framing, not the sole headline.
- The next action must point to bottom voice input and Candidate Draft flow.

Unresolved points:

- Exact copy should be refined in implementation, but must remain Chinese and not generic bookkeeping language.

Decision:

Use a Personal Company Cockpit default with explicit operating question and visible input cue.

### 3.B Financial Truth vs Information Architecture

Question:
Which metrics can homepage show safely? How can no-data state keep information density without fake numbers?

Participants:

- `financial-truth-agent`
- `financial-edge-case-agent`
- `information-architecture-agent`
- `information-density-critic`

Opening positions:

- Financial truth: Show only source-backed metrics or data-insufficient states.
- Edge case: Cash safety and operating verdicts are dangerous without documented formulas.
- IA: The homepage still needs enough structure to be useful.
- Density critic: Empty state cannot become a page of "待绑定".

Argument 1:
Financial truth argues assets, liabilities, net assets, income, expenses, and profit/surplus can be shown if they come from existing summaries/report calculations.

Counterargument:
Edge case warns that net assets and cash are different. Profit/surplus and cash flow are different. The UI must not collapse them into one "healthy" score.

Argument 2:
IA argues that the homepage needs a compact state grid: maybe three axes such as "家底", "本月经营", "现金流". Each axis can contain one or two safe fields.

Counterargument:
Financial truth accepts the axes only if labels make data limits explicit. "现金安全垫" is not safe until there is a domain/report rule.

Argument 3:
Density critic argues no-data should still feel dense enough: show the structure, explain missing evidence, and provide a single action prompt. Do not fill every tile with "待绑定".

Counterargument:
Edge case agrees, but placeholders must be visually distinct from real numbers and cannot look like actual balances.

Resolved points:

- Safe source-backed metrics can show.
- Unsafe metrics must be data-insufficient.
- Empty state should show skeleton structure, explanatory text, and a voice-entry prompt rather than fake values.
- UI may not calculate new formulas.

Unresolved points:

- Exact data source names for each metric must be verified in implementation against current summaries/report functions.

Decision:

Homepage metrics are allowed only with explicit source fields. Cash safety is data-insufficient until a documented rule exists. No-data state keeps structure without fake money.

### 3.C Visual Direction vs Information Density

Question:
How can homepage avoid both card pile dashboard and low-density visual poster?

Participants:

- `visual-director-agent`
- `visual-critic-agent`
- `information-architecture-agent`
- `information-density-critic`

Opening positions:

- Visual director: Dark Liquid CFO Style should create premium operational atmosphere.
- Visual critic: Effects have repeatedly harmed clarity.
- IA: The page needs a strong information hierarchy.
- Density critic: Sparse hero screens and card piles are both failures.

Argument 1:
Visual director proposes a dark cockpit surface: large operating question, compact status modules, and restrained ambient motion. Glass is used for bounded content, while headline metrics can float.

Counterargument:
Visual critic warns that glass should not be applied everywhere. Blurs, shadows, and transparent layers must be limited because previous all-glass sphere experiments became gray and dirty.

Argument 2:
IA proposes a top-to-bottom hierarchy: brand/period, operating answer, 3-axis status, next action cue, secondary CFO Orbit.

Counterargument:
Density critic says three-axis status must not become many stacked cards. Each axis should have a single compact body and expand on tap.

Argument 3:
Visual director proposes the old sphere as a small orbit button or expandable secondary visual. It can preserve brand memory without dominating the first screen.

Counterargument:
Visual critic says the expanded orbit must have strict density and no debug/probe grid. It must not reintroduce the 76-card all-blur failure.

Resolved points:

- Default home uses a controlled cockpit layout, not a poster and not a card pile.
- Glass surfaces are selective.
- CFO Orbit is secondary and compact by default.
- Visual effects cannot imply financial meaning.

Unresolved points:

- Exact visual composition should be implemented and screenshot-tested, not finalized purely in text.

Decision:

Use a restrained Dark Liquid CFO cockpit: high information priority, low decorative dominance, and secondary orbit.

### 3.D Bottom Voice Entry vs Inline Input Hint

Question:
Since bottom center voice entry exists, does homepage still need a large inline "向 CFO 汇报一件事" entry? What should remain on homepage?

Participants:

- `interaction-agent`
- `interaction-friction-agent`
- `user-behavior-agent`
- `personal-cfo-product-agent`

Opening positions:

- Interaction: Bottom center voice is the primary input.
- Friction: Duplicate CTAs create confusion.
- User behavior: Users still need to understand what the bottom voice does.
- Product: Input should be framed as reporting a life event to the personal CFO.

Argument 1:
Interaction argues the homepage should not include a large voice input card if the center bottom voice button is always visible. That would create two competing primary entries.

Counterargument:
User behavior says the page still needs a visible instruction because the bottom button alone may look like a generic record action.

Argument 2:
Product proposes an inline hint, not a large input card: "说一件生活事件，IMCFO 会翻译成财务语言". This supports the loop without competing with the bottom button.

Counterargument:
Friction accepts if the inline hint is non-dominant and does not open a second custom flow. It should either point to or trigger the same bottom record flow.

Argument 3:
Interaction raises the bottom navigation conflict: doctrine says 首页 / 管理 / 报表 / 我的, while current UI has a center voice entry. This cannot be silently normalized.

Counterargument:
Product agrees the final spec must mark the center voice entry as current design intent requiring spec update and likely ADR if it changes route architecture.

Resolved points:

- Bottom center voice entry is primary for this homepage concept.
- No large competing inline input card in default home.
- A small inline hint is allowed.
- All input paths must use Candidate Draft confirmation.

Unresolved points:

- Whether bottom center voice permanently replaces/augments the older four-tab nav requires explicit product decision; ADR is recommended if route/navigation architecture changes.

Decision:

Default home uses the bottom center voice entry as the primary input and includes only a small contextual hint. Navigation conflict is recorded and ADR is recommended if implementation changes the approved bottom nav architecture.

### 3.E Sphere / CFO Orbit Debate

Question:
Should old sphere be hidden by default, reduced to button, kept as background, or exposed through secondary expandable CFO Orbit? What is allowed inside CFO Orbit?

Participants:

- `personal-cfo-product-agent`
- `visual-director-agent`
- `visual-critic-agent`
- `interaction-agent`
- `implementation-feasibility-agent`

Opening positions:

- Product: Preserve sphere as brand memory, but not default body.
- Visual director: Use it as secondary CFO Orbit.
- Visual critic: Prevent return to noisy card pile.
- Interaction: Orbit should be optional and expandable.
- Feasibility: Phase it; avoid heavy dense animation in Phase 1.

Argument 1:
Product argues the old sphere should not be deleted because it has become an IMCFO symbol. However, default home must answer operating status first.

Counterargument:
Visual critic replies that if the sphere remains large, it will still dominate. It must be visibly downgraded.

Argument 2:
Interaction proposes CFO Orbit as a small secondary button or compact preview below the main cockpit. Tapping opens a bottom sheet or overlay with functional nodes.

Counterargument:
Feasibility accepts but says Phase 1 should include a simple button/compact preview; expanded orbit behavior can be lower density and possibly implemented later.

Argument 3:
Visual director proposes rules for allowed content: shortcuts to accounts, reports, assets/liabilities, transaction records, and explanatory finance nodes. It must not contain fake metrics or dozens of decorative cards.

Counterargument:
Product agrees and adds that CFO Orbit is both decorative and functional, but functional meaning must win.

Resolved points:

- Old sphere is downgraded to secondary expandable CFO Orbit.
- It is not default homepage information architecture.
- It may reuse the old sphere idea only in reduced density.
- It may contain functional navigation/explanation nodes.
- It must not contain unauthorized HUD, fake metrics, debug grids, or high-density all-blur cards.

Unresolved points:

- Exact visual implementation of CFO Orbit should be phase-scoped and screenshot-tested.

Decision:

Use CFO Orbit as secondary expandable orbit, visible as a small button or compact visual below the operating cockpit. It may be both decorative and functional, but never the default page body.

### 3.F Feasibility vs Ambition

Question:
What can be implemented in Phase 1 without performance debt? What belongs to Phase 2 or later?

Participants:

- `implementation-feasibility-agent`
- `implementation-ambition-agent`
- `visual-director-agent`
- `home-screenshot-qa-agent`

Opening positions:

- Feasibility: Phase 1 must avoid performance-heavy experiments.
- Ambition: The result must still feel like the selected C方案.
- Visual: Innovation can come from hierarchy and atmosphere, not only animation.
- QA: Each phase needs screenshot acceptance.

Argument 1:
Feasibility says Phase 1 should implement structure, data binding, empty states, and a simple CFO Orbit entry. Avoid heavy Skia blur and dense rotating sphere.

Counterargument:
Ambition says a purely static dashboard betrays the C方案. It needs at least a distinctive cockpit structure, dark liquid environment, and secondary orbit affordance.

Argument 2:
Visual director says Phase 1 can be visually strong using typography, depth, controlled glass, brand gradient accents, and restrained ambient movement. It does not require all-card blur.

Counterargument:
QA says the design must prove it is not a generic finance dashboard by screenshot checks: question, operating answer, voice loop, and downgraded sphere.

Argument 3:
Feasibility proposes Phase 2 for richer CFO Orbit expansion and interaction polish after the default cockpit passes QA.

Counterargument:
Ambition accepts if Phase 1 includes an explicit placeholder/entry for CFO Orbit and the spec prevents permanent deletion.

Resolved points:

- Phase 1: code inspection, default cockpit structure, safe data binding, no-data state, bottom voice alignment, simple CFO Orbit entry, screenshot QA.
- Phase 2+: richer CFO Orbit expansion, deeper interaction, advanced visuals if performance allows.
- No new dependencies are needed for the spec.

Unresolved points:

- Actual implementation sequencing depends on current code inspection in a later task.

Decision:

Proceed with phased implementation recommendation: product-correct cockpit first, secondary orbit preserved, advanced animation later.

## Round 4: Revised Positions

### 4.1 home-council-chair

Changed after criticism:
The chair now requires explicit bottom navigation conflict handling and two rebuttal rounds per pair.

Still insists:
This task remains docs/spec-only and cannot modify mobile code.

Risk remains:
Future implementation could skip ADR discussion when changing bottom navigation. The spec must flag it.

### 4.2 personal-cfo-product-agent

Changed after criticism:
The product metaphor will be paired with a plain user-facing question: 我这个月经营得怎么样？

Still insists:
The homepage must become a Personal Company Cockpit, not a bookkeeping dashboard.

Risk remains:
If copy becomes too generic, product differentiation weakens.

### 4.3 financial-truth-agent

Changed after criticism:
Cash safety and synthetic verdicts are blocked unless backed by existing data or documented report rules.

Still insists:
No UI formulas and no fake financial conclusions.

Risk remains:
Implementation must verify actual source fields before binding metrics.

### 4.4 information-architecture-agent

Changed after criticism:
The structure must include enough actual state modules to avoid poster-like emptiness, while keeping expansions out of default state.

Still insists:
The old sphere cannot be the default IA.

Risk remains:
Too many metric modules could become a card pile.

### 4.5 user-behavior-agent

Changed after criticism:
The homepage must include a contextual cue for the bottom voice button without creating a second primary CTA.

Still insists:
Five-second comprehension is required.

Risk remains:
If bottom voice icon is visually unclear, the cue may not be enough.

### 4.6 visual-director-agent

Changed after criticism:
Glass is selective; CFO Orbit is secondary and lower-density. Effects must stay subordinate.

Still insists:
Dark Liquid CFO Style remains the homepage visual doctrine.

Risk remains:
Implementation may overuse blur or revive sphere noise.

### 4.7 interaction-agent

Changed after criticism:
The bottom voice entry is treated as current design intent, but navigation conflict requires explicit decision/ADR if structural.

Still insists:
All record paths must use Candidate Draft confirmation.

Risk remains:
Inline hint may accidentally become a duplicate input component.

### 4.8 implementation-feasibility-agent

Changed after criticism:
Phase 1 must preserve an explicit CFO Orbit entry, not postpone the sphere into invisibility.

Still insists:
No all-card blur, no new dependencies, and no domain/storage/report changes in homepage implementation.

Risk remains:
CFO Orbit implementation may still become performance-heavy if not scoped.

### 4.9 home-screenshot-qa-agent

Changed after criticism:
QA must test data truth and interaction states, not only the default screenshot.

Still insists:
Do not approve unless the homepage answers the operating question and old sphere is downgraded.

Risk remains:
Emulator screenshots may not fully prove performance; interaction QA must supplement.

## Round 5: Final Judge Decision

### 5.1 Final Homepage Concept

Final concept:

IMCFO Home Dashboard V4 is a Personal Company Cockpit. It answers "我这个月经营得怎么样？" using source-backed operating status, compact financial state modules, and the bottom voice input as the primary action.

The old sphere is not deleted. It is downgraded to a secondary expandable CFO Orbit.

### 5.2 Default Homepage Structure

From top to bottom:

1. Compact brand/period area.
2. Plain operating question: 我这个月经营得怎么样？
3. Source-backed operating answer or data-insufficient explanation.
4. Compact three-axis status area:
   - 家底 / 资产负债与净资产
   - 本月经营 / 收入费用与利润或结余
   - 现金流 / cash movement, with safety marked insufficient unless backed
5. Small next-action hint pointing to bottom voice entry.
6. Secondary CFO Orbit button or compact preview.
7. Bottom navigation / bottom voice entry area, pending explicit navigation decision if current center voice entry changes route architecture.

### 5.3 Data State Rules

- Real values require existing data source fields.
- Unavailable metrics show data-insufficient explanations, not fake values.
- UI must not calculate new formulas.
- Synthetic operating verdicts require report-engine support or documented rules.

### 5.4 Empty State Rules

When data is insufficient:

- Do not show fake money.
- Do not fill every card with "待绑定".
- Show the cockpit structure with limited explanatory placeholders.
- Guide user toward bottom voice input: record a life event to build the month.

### 5.5 Bottom Voice Entry Rule

The current bottom center voice input is treated as the primary natural-language entry for this council. It should open the existing record input/Candidate Draft flow.

Navigation conflict:

- Earlier visual doctrine says bottom navigation remains 首页 / 管理 / 报表 / 我的 unless a separate product decision changes route structure.
- Current user intent references a center voice input already existing in the current UI.
- Final recommendation: treat center voice entry as a current design decision requiring spec update. ADR is recommended if it changes product navigation architecture or route structure.

### 5.6 CFO Orbit Rule

- Default visibility: secondary, compact, below operating status.
- Button location: lower half of home, above bottom navigation, not first-screen hero.
- Expanded behavior: optional bottom sheet or overlay with controlled low-density orbit.
- May contain: functional navigation/explanation nodes for accounts, reports, assets/liabilities, transactions, and financial concepts.
- Must not contain: fake metrics, unauthorized HUD, high-density 76-card all-blur sphere, debug/probe grids, or direct posting actions.
- May use old sphere: yes, only as reduced-density secondary orbit.
- Role: both brand symbol and functional navigation hub, with function taking priority.

### 5.7 Visual Rules

- Use Dark Liquid CFO Style.
- Background stays dark and operational.
- Glass is selective.
- Metrics must remain readable.
- Brand gradient is allowed for emphasis, not for semantic financial status.
- Semantic green/amber/red remain separate from brand colors.
- Avoid over-decoration, gray muddy glass, all-card blur, and debug textures.

### 5.8 Implementation Phases

1. Phase 1: spec landing and code inspection.
2. Phase 2: homepage default structure.
3. Phase 3: data binding and empty state.
4. Phase 4: CFO Orbit button / secondary expansion.
5. Phase 5: screenshot QA.
6. Phase 6: cleanup and typecheck.

### 5.9 Screenshot QA Criteria

Minimum checks:

- Does homepage answer "我这个月经营得怎么样？"
- Does no-data state avoid fake money?
- Is bottom voice entry clear?
- Is old sphere downgraded?
- Is homepage not a card pile?
- Is readability preserved?
- Is bottom navigation unchanged or explicitly marked as requiring decision?
- Is no accounting/domain/storage/report logic changed?

### 5.10 ADR Recommendation

ADR recommended if the bottom center voice entry permanently changes product navigation architecture or route structure.

No ADR required for this council/spec document itself.

