# Strategic Recommendation

## 1. Most Recommended Model

Most recommended: Operating CFO Loop Model.

Recommended top-level navigation:

- 经营
- 报告
- 账本
- 我的

Recommended global action:

- 说一笔

This is not a permanent spec. It is the strongest market-first strategic direction to test.

## 2. Secondary Model

Secondary recommendation: Life Event Translation Model.

Its strongest idea should be absorbed as core capability:

- User speaks or types a life event.
- IMCFO translates it into financial impact.
- The user confirms.
- The system updates operating state, report facts and ledger source.

## 3. Not Recommended as Primary Navigation

- Traditional bookkeeping model: rejected because it makes IMCFO look like another ledger app.
- Pure AI Chat model: rejected because it risks hiding finance structure and auditability.
- Financial Statement Model: downgraded to report layer because it is too professional for primary consumer navigation.
- Operating System Model: downgraded to long-term vision because it is too broad for MVP validation.
- Coach-only Model: rejected as sole IA because it can overpromise advice.

## 4. Recommended Top-level Navigation

### 经营

Purpose:

- The default Personal CFO brief.
- Shows what changed, what matters, what needs action and what can wait.
- Should answer "我现在的经营状态怎样？"

### 报告

Purpose:

- The authoritative financial report layer.
- Contains simple and professional views of financial statements and analysis.
- Preserves report-engine truth.

### 账本

Purpose:

- The traceable source-of-truth layer.
- Contains posted transactions, accounts, assets, liabilities, categories, imports and correction history.
- Separates official facts from AI drafts.

### 我的

Purpose:

- User-owned data, privacy, settings, export/import, local-first controls and account-level preferences.

## 5. Recommended Global Action

"说一笔" should be globally available and not treated as an ordinary tab.

It starts a unified input flow:

1. Voice or text input.
2. AI parses candidate transaction draft.
3. Low-confidence or multi-transaction cases require explicit user clarification.
4. User confirms or edits.
5. Transaction rule layer posts the transaction.
6. Report engine / rule layer supplies final impact.
7. User returns to 经营 with updated state.

## 6. Recommended Core User Path

Default path:

1. Open IMCFO.
2. Land on 经营.
3. Read today's CFO brief.
4. Tap 说一笔 to capture a life event.
5. Confirm draft.
6. See posted impact.
7. Drill into 报告 for formal truth or 账本 for source evidence.
8. Take an optional action.

## 7. Why This Is More Distinct Than a Bookkeeping App

Ordinary bookkeeping apps ask the user to maintain data and interpret it alone.

The Operating CFO Loop asks IMCFO to:

- capture life events,
- translate them into financial meaning,
- preserve traceable facts,
- surface operating state,
- recommend optional action.

The product identity becomes "经营自己", not "记一笔".

## 8. What Needs User Testing

- Whether ordinary users understand "经营".
- Whether "今日 CFO" is clearer than "经营" for the first destination.
- Whether "账本" is clearer than "财务档案".
- Whether global "说一笔" is discoverable enough without being a tab.
- Whether users trust AI draft impact when it is clearly labeled as estimate.
- Whether formal reports are discoverable from 经营 and 报告.

## 9. Can Enter Constitution as Principles

Only principles can enter Constitution after explicit review:

- Navigation should serve the loop: life event input -> financial translation -> confirmed fact -> operating feedback -> user action.
- AI input must not be treated as posted financial fact.
- Users must be able to trace insights back to posted facts.
- Reports remain authoritative after posting.
- Navigation must not freeze a specific current tab layout.

## 10. Should Remain Experiments

- Exact labels: 经营, 今日 CFO, 今日判断, 能不能花, 财务档案.
- Whether "说一笔" appears as central action, floating action, command bar, or input sheet.
- Whether "能不能花" deserves a first-level destination.
- Whether recurring obligations become a top-level action area.
- Whether Coach / Advisor persona appears in navigation.

## 11. Not Yet Decided

- Final Chinese navigation labels.
- The exact number of destinations.
- Whether reports and operating analysis are separate or nested.
- Whether "我的" is a permanent first-level destination or can be folded into data/privacy.
- Whether goal / project management deserves first-level navigation.

## 12. Strategic Judgment Independent of Current Implementation

This recommendation does not depend on current IMCFO navigation or code structure.

If implementation later conflicts with this direction, the implementation should be evaluated through a separate specs / implementation planning task, not by weakening the market-first conclusion.

