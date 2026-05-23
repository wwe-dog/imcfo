# Home Dashboard V4 Final Council Spec

This spec is produced by the fresh Home Dashboard Super-Agent Council run. It is a design/spec artifact only and does not modify mobile implementation.

## 1. Final Homepage Judgment

Chosen option: **Hybrid**.

Meaning:

- Use **Personal Company Cockpit / 个人公司驾驶舱** as the default homepage.
- Downgrade the old sphere to a **secondary expandable CFO Orbit**.
- Do not continue sphere-first.
- Do not remove the old sphere concept entirely.
- Do not use the sphere as default information architecture.

## 2. One-Sentence Homepage Definition

IMCFO 首页是个人公司驾驶舱，用经营结论、三轴财务状态和底部语音入口回答用户“我这个月经营得怎么样？”。

## 3. Default Homepage Structure

From top to bottom:

1. Compact brand and period area.
   - Keep IMCFO identity.
   - Do not let the logo consume excessive vertical space.
   - Period label should make the current month/report window visible when data exists.

2. Operating question and answer.
   - Primary visible question: `我这个月经营得怎么样？`
   - Answer may be:
     - source-backed operating summary, or
     - data-insufficient explanation.
   - Do not show a fake score or fake conclusion.

3. Three-axis personal company state.
   - 家底: assets, liabilities, net assets.
   - 本月经营: income, expenses, profit or surplus.
   - 现金流: cash movement; cash safety only when supported.
   - Each axis should be compact by default and expandable through details.

4. Next-action hint.
   - A small contextual cue points to the bottom center voice input.
   - It should not become a competing large input card.
   - Suggested direction: `说一件生活事件，更新本月经营状态`.

5. CFO Orbit entry.
   - Small secondary button or compact preview.
   - Lower visual priority than operating status and bottom voice entry.

6. Bottom navigation / bottom voice entry area.
   - See navigation conflict rule below.

## 4. Above-The-Fold Rule

Before scrolling, the user must be able to see:

- IMCFO identity.
- The question `我这个月经营得怎么样？`.
- A real answer or clear data-insufficient state.
- At least the compact three-axis state summary.
- A cue that bottom voice input is the primary action.
- The secondary CFO Orbit entry only if it does not compete with the above.

Above-the-fold must not be occupied by:

- a large default sphere,
- a high-density card orbit,
- a decorative HUD with fake numbers,
- a poster-like hero with no financial structure.

## 5. Bottom Voice Entry Rule

Current council interpretation:

- The bottom center voice entry shown in current UI is treated as current design intent for this homepage direction.
- It is the primary natural-language input entry.
- The homepage should not add a second large voice input card that competes with it.
- Inline homepage copy may point to it, but should not create a separate posting flow.

Required interaction:

- Bottom voice opens existing record input / intelligent record flow.
- AI must produce a Candidate Transaction Draft.
- User confirmation remains required.
- No direct ledger write, no direct storage write, no bypass of transaction rules.

Navigation conflict:

- Earlier visual doctrine records bottom navigation as 首页 / 管理 / 报表 / 我的 unless a separate product decision changes route structure.
- Current user intent references a center voice entry already present in current UI.
- Final spec decision: **Treat center voice entry as a current design decision requiring spec update. ADR is recommended if it changes product navigation architecture or route keys.**
- Until implementation is explicitly approved, do not silently remove or rename existing bottom navigation routes.

## 6. CFO Orbit Rule

### 6.1 Default Visibility

CFO Orbit is secondary by default.

It appears as:

- a small button,
- a compact orbit preview,
- or a restrained secondary module below the operating status area.

It must not appear as the main body of the default homepage.

### 6.2 Button Location

Preferred location:

- below the three-axis state and next-action hint,
- above the bottom navigation,
- aligned to the cockpit layout rather than floating randomly.

It must not block the bottom voice entry.

### 6.3 Expanded Behavior

Allowed expansion patterns:

- bottom sheet,
- modal overlay,
- secondary panel,
- compact orbit expansion.

Expanded state should be dismissible and should not replace the default operating answer.

### 6.4 What CFO Orbit May Contain

Allowed:

- account entry point,
- transaction records entry point,
- assets/liabilities entry point,
- reports entry point,
- finance concept nodes,
- shortcuts that explain or navigate to existing app functions.

### 6.5 What CFO Orbit Must Not Contain

Forbidden:

- fake financial numbers,
- fake operating conclusions,
- unauthorized HUD,
- direct posting actions,
- AI auto-entry without confirmation,
- high-density 76-card all-blur sphere,
- debug/probe grids,
- visual noise that makes the homepage read as a sphere demo.

### 6.6 Use of Old Sphere

The old sphere may be reused only as a reduced-density secondary CFO Orbit.

It may be decorative and functional, but function wins:

- decorative as a brand symbol,
- functional as navigation/explanation hub,
- not the default information architecture.

## 7. Metrics Rule

General rule:

- UI may display metric values only when they come from existing app data, domain/report calculations, or explicit summary fields.
- UI may not invent formulas.
- UI may not calculate financial truth independently.
- Unavailable data must be marked data-insufficient, not replaced with fake money.

### 7.1 Assets / 资产

Default status: show when available.

Required data source:

- existing assets state,
- balance sheet summary,
- dashboard summary if it exposes a traceable field.

UI may calculate it: no.

Fallback:

- show `资产数据不足` or equivalent compact explanation.
- guide user to add asset/account data or record relevant events.

### 7.2 Liabilities / 负债

Default status: show when available.

Required data source:

- existing liabilities state,
- balance sheet summary,
- dashboard summary if it exposes a traceable field.

UI may calculate it: no.

Fallback:

- show `负债数据不足`.
- do not imply zero liability unless data explicitly supports zero.

### 7.3 Net Assets / 净资产

Default status: show when report-backed.

Required data source:

- balance sheet summary,
- existing domain/report calculation output.

UI may calculate it: no.

Fallback:

- show `净资产需要资产与负债数据`.
- do not compute assets minus liabilities inside screen code.

### 7.4 Income / 收入

Default status: show when available for the selected period.

Required data source:

- income statement summary,
- dashboard summary,
- filtered report-period transactions processed through existing report/domain functions.

UI may calculate it: no.

Fallback:

- show `本月收入数据不足`.
- prompt the user to record income events through existing record flow.

### 7.5 Expenses / 费用

Default status: show when available for the selected period.

Required data source:

- income statement summary,
- dashboard summary,
- filtered report-period transactions processed through existing report/domain functions.

UI may calculate it: no.

Fallback:

- show `本月费用数据不足`.
- do not color expenses as "warning" by default; expenses are financial facts.

### 7.6 Profit Or Surplus / 利润或结余

Default status: show only when report-backed.

Required data source:

- income statement summary,
- dashboard summary if traceable.

UI may calculate it: no.

Fallback:

- show `利润/结余需要收入与费用数据`.
- do not collapse profit into cash.

### 7.7 Cash Flow / 现金流

Default status: show when cash flow statement summary is available and traceable.

Required data source:

- cash flow statement summary,
- existing report engine output.

UI may calculate it: no.

Fallback:

- show `现金流数据不足`.
- do not treat profit/surplus as cash flow.

### 7.8 Cash Safety / 现金安全垫

Default status: data-insufficient unless a documented source exists.

Required data source:

- future documented cash safety rule,
- report-engine field,
- or explicit domain output.

UI may calculate it: no.

Fallback:

- show `需要更多现金流与固定支出数据`.
- do not show runway months, safety score, or health label without source.

## 8. Empty State Rule

When data is insufficient, the homepage must:

- keep the cockpit structure visible,
- avoid fake money values,
- avoid a full page of `待绑定`,
- avoid misleading placeholder metrics,
- explain what evidence is missing,
- guide the user toward the bottom voice entry.

Recommended empty-state pattern:

1. Question remains: `我这个月经营得怎么样？`
2. Answer becomes: `还需要几笔真实记录，才能判断本月经营状态。`
3. Three axes show compact missing-evidence text, not fake values.
4. Next action points to bottom voice: `从说一件生活事件开始`.

## 9. Visual Rules

### 9.1 Dark Liquid CFO Style

Use Dark Liquid CFO Style as the current visual doctrine:

- dark financial operating cockpit,
- liquid depth,
- controlled glass,
- premium but readable,
- operational rather than decorative.

### 9.2 Token Use

Use current constitution visual tokens:

- base background: `#090C1D`,
- brand colors: `#FF5DBB`, `#8A5CFF`, `#3B8BFF`, `#00D2D9`,
- semantic green: `#4ade80`,
- semantic amber: `#fbbf24`,
- semantic red: `#f87171`.

Brand gradient must not replace semantic financial meaning.

### 9.3 Typography

Typography must prioritize scanning:

- operating question: clear and dominant,
- numeric values: tabular and readable,
- labels: concise Chinese,
- explanations: short, not marketing copy.

### 9.4 Spacing

Spacing must prevent both poster emptiness and dashboard pile:

- compact top brand area,
- clear hierarchy between answer, metrics, hint, and orbit,
- enough bottom safe area for navigation and center voice input.

### 9.5 Glass Surfaces

Glass is allowed for:

- bounded metric modules,
- bottom sheets,
- interactive panels,
- orbit expansion surface,
- record-flow hints.

Glass is not required for:

- every text element,
- every number,
- every background layer,
- decorative orbit nodes.

Avoid:

- dirty gray transparent blocks,
- excessive blur,
- stacked translucent layers,
- fake debug grids,
- all-card frosted sphere as default.

### 9.6 Floating Elements

Elements may float directly on dark background when:

- they are brand text,
- they are primary headline/question,
- they are large source-backed metrics,
- they need low visual weight.

### 9.7 Color Semantics

- Green means positive/healthy source-backed state.
- Amber means attention or incomplete state.
- Red means harmful/urgent state.
- Expenses are not automatically red.
- Brand gradient colors are not semantic accounting labels.

### 9.8 Avoiding Over-Decoration

Do not use:

- unauthorized HUD,
- decorative fake data streams,
- dense orbit as default body,
- debug/probe patterns,
- visual effects that compete with financial reading,
- animations that block recording or confirmation.

## 10. Interaction Rules

### 10.1 Bottom Voice Button

The bottom voice button opens the existing record input flow.

Required boundary:

- voice/text input -> Candidate Transaction Draft,
- user reviews/edits,
- user confirms,
- existing `onSave` / `useAppData` / transaction rules handle posting.

### 10.2 Inline Hint

Inline hint may exist, but:

- it is not a second primary CTA,
- it should point to the bottom voice entry,
- it must not create a separate record pipeline.

### 10.3 Metric Tap Behavior

Tapping a metric may open:

- explanation bottom sheet,
- source breakdown,
- link to report screen,
- data-insufficient guidance.

It must not silently calculate a new value.

### 10.4 CFO Orbit Button Behavior

Tapping CFO Orbit opens a secondary expansion.

Expansion should:

- preserve current homepage context,
- be dismissible,
- show low-density functional nodes,
- avoid fake metrics,
- avoid direct AI posting.

### 10.5 Bottom Sheet Behavior

Bottom sheets should:

- explain the financial meaning,
- show data source or insufficiency,
- include a clear next action,
- preserve Candidate Draft confirmation boundary.

### 10.6 No AI Direct Posting

No homepage interaction may directly post a transaction from AI output.

AI can draft; the user posts.

## 11. What Not To Do

Do not:

- re-add unauthorized HUD,
- use high-density 76-card all-blur default sphere,
- show fake financial conclusions,
- create UI formulas,
- make the sphere the main information architecture,
- build a card pile dashboard,
- add debug/probe grid,
- restore deprecated `AGENTS.md`,
- restore legacy `docs/00-10`,
- bypass Candidate Draft confirmation,
- change accounting/domain/storage/report logic as part of homepage UI work,
- use hardcoded money values as if real,
- let visual effects imply financial meaning.

## 12. Codex Implementation Phases

No code is written by this spec. Recommended implementation phases:

### Phase 1: Spec Landing And Code Inspection

- Inspect current `DashboardScreen.tsx`, app shell, bottom navigation, and record flow.
- Verify actual source fields for metrics.
- Confirm current bottom voice entry implementation and navigation implications.

### Phase 2: Homepage Default Structure

- Implement Personal Company Cockpit default hierarchy.
- Keep old sphere out of primary body.
- Add or preserve compact CFO Orbit entry.
- Do not modify accounting/domain/storage/report logic.

### Phase 3: Data Binding And Empty State

- Bind safe metrics only to existing data/report outputs.
- Implement data-insufficient state.
- Avoid fake money and UI formulas.

### Phase 4: CFO Orbit Button / Secondary Expansion

- Add compact orbit expansion only after default cockpit is stable.
- Reuse old sphere concept only in reduced-density form.
- Keep performance restrained.

### Phase 5: Screenshot QA

- Capture default, no-data, low-data, metric-expanded, bottom voice, and CFO Orbit states.
- Check visual and data-boundary criteria.

### Phase 6: Cleanup And Typecheck

- Confirm no forbidden files changed.
- Run `cd D:\imcfo\mobile && npm.cmd run typecheck`.
- Report `git status` and changed files.

## 13. Screenshot QA Checklist

Homepage QA must answer:

1. Does the homepage answer `我这个月经营得怎么样？`
2. Does no-data state avoid fake money?
3. Is bottom voice entry clear?
4. Is the old sphere downgraded to secondary CFO Orbit?
5. Is homepage not a card pile?
6. Is readability preserved in dark mode?
7. Is bottom navigation unchanged or explicitly marked as requiring decision?
8. Is there no unauthorized HUD?
9. Are there no debug/probe grids?
10. Are metrics traceable or marked data-insufficient?
11. Does the page avoid UI-created accounting formulas?
12. Does record input still require Candidate Draft confirmation?
13. Are no accounting/domain/storage/report files changed?

Failure conditions:

- Large sphere dominates default home.
- Fake values appear.
- Bottom voice entry is unclear or duplicated by a competing CTA.
- Card pile replaces operating answer.
- Cash safety appears without source.
- AI appears to auto-post.
- Visual effect reduces readability.

