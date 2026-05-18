# Financial Core Doctrine

## 1. Doctrine

IMCFO's financial credibility comes from rule-driven transactions and explainable reports.

The user may see simple Chinese copy, but the system must preserve accounting meaning underneath.

## 2. Core Boundaries

- UI cannot invent accounting formulas.
- AI cannot create posted transactions.
- Posted transactions must pass transaction rules.
- Posted transactions must not be silently overwritten or deleted. Corrections must be made through an explicit edit or reversal action that preserves a modification record, so that report history remains traceable.
- Report calculations must be pure enough to test.
- Storage does not decide financial meaning.
- Visual components do not decide financial meaning.

## 3. Simple Mode Financial Boundaries

Simple mode translates financial language for users who are not accounting professionals: college students, early-career individuals, people with side income, and anyone building their first systematic view of personal finances.

Simple mode is a language layer. It is not an accounting layer.

Permitted simplifications:

- Term substitution with equivalent meaning: 应收账款 → 别人欠你的钱, 本期 → 这个月.
- Colloquial phrasing of direction: 净利润为负 → 这个月亏了.

Prohibited simplifications:

- R1. Must not introduce causal attribution. Financial data describes what happened, not why. 净利润为负 must not become 你这个月花多了 because the cause may be falling income, not rising expense.
- R2. Must not collapse distinct financial dimensions. 净资产 must not become 我的钱 because net worth and liquid cash are different things. 净利润 must not be presented as cash.
- R3. Must not omit a dimension when the financial fact requires both. If net profit is positive but cash flow is negative, simple mode must present both. Showing only one creates a false picture.

When a simplification would violate R1, R2, or R3, the system must fall back to professional terminology rather than produce a misleading simplified version.

Specific vocabulary mappings belong in specs, not in this doctrine.

## 4. Report Doctrine

Three reports are the current product skeleton:

- Balance Sheet: what the user owns, owes, and has as equity.
- Income Statement: whether the user's life operation generated surplus or deficit in the period.
- Cash Flow Statement: where cash moved across operating, investing, and financing activity.

The reports should be understandable in simple mode and auditable in professional mode.

## 5. Formula Integrity

Every report row and summary metric should be traceable to:

- transaction rules
- account / asset / liability state
- report calculation functions
- documented assumptions

If a screen shows a financial conclusion, it must either be calculated by the financial core or clearly labeled as commentary / prototype.
