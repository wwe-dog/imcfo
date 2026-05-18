# IMCFO Constitution v2

## 1. Nature

This is the living constitution for IMCFO.

It protects the soul and safety boundaries of the product. It does not freeze the current implementation shape.

Core principle:

> 宪法不是为了禁止变化，而是为了保证变化不会破坏 IMCFO 的灵魂。

## 2. Source Of Truth

The source of truth hierarchy is:

1. Current user instruction for the active task.
2. This Constitution v2 and related doctrine / contract documents.
3. Current codebase discovery facts under `docs/discovery/`.
4. Current specs under `docs/specs/`.
5. ADRs under `docs/adr/`.
6. Current context under `docs/context/`.

Legacy `AGENTS.md` and legacy `docs/00-10` are deprecated. They must not be restored or treated as source of truth unless the user explicitly asks for historical recovery.

## 3. Product Soul

IMCFO is a personal CFO system.

It is not a normal bookkeeping app, not a budget skin, and not an AI auto-entry demo. Its purpose is to translate personal life events into company-style financial language so the user can understand and operate their own financial state.

The protected loop is:

```text
life event input
-> financial language translation
-> operating status feedback
-> user action
```

Any major feature should strengthen at least one part of this loop.

## 4. Financial Core Invariants

Financial correctness outranks UI convenience, visual effect, and AI fluency.

Core invariants:

- UI must not invent accounting formulas.
- AI must not generate posted transactions or final journal entries.
- Posted transactions must pass a unified transaction rule layer.
- Report calculations must be explainable, testable, and traceable.
- Financial conclusions shown to the user must be traceable to domain rules or report engine output.
- Simple mode may simplify language, but it must not change the underlying accounting meaning.

Current implementation may be incomplete. The constitution protects the financial direction and boundaries; discovery documents record what is currently implemented.

## 5. AI Input Invariants

AI is a candidate input and explanation system, not the ledger authority.

Core invariants:

- AI may only create Candidate Transaction Drafts.
- AI must not directly write ledger data.
- AI must not directly write AsyncStorage or any future storage layer.
- AI must not bypass transaction rules.
- Formal posting requires user confirmation.
- Complex, ambiguous, low-confidence, or multi-transaction inputs must remain Drafts until the user completes the missing information.
- API keys and secrets must not be embedded in frontend code.
- AI / ASR backend services must not become the ledger database.

## 6. Data Privacy Invariants

User financial data belongs to the user.

Core invariants:

- User financial data must not leave the user's device without explicit user authorization.
- No analytics, telemetry, AI training, or remote logging may access transaction data, account data, asset data, or liability data without explicit user authorization.
- Any feature that would transmit user financial data to a remote service requires an ADR and explicit user authorization before design or implementation begins.
- Cloud sync, multi-device, and remote backup features are not prohibited, but they require Constitution Review before any design or implementation begins.

## 7. Architecture Invariants

The constitution defines responsibilities, not permanent technologies.

Core invariants:

- Current implementation facts belong in `docs/discovery/`.
- Current feature and UI details belong in `docs/specs/`.
- Durable module responsibilities belong in architecture contracts.
- Major product, architecture, data, storage, AI boundary, or supplier changes require ADR.
- No technology stack, UI library, page structure, visual engine, API provider, model provider, or storage implementation is permanent unless explicitly elevated through Constitution Review.

## 8. Visual Experience Invariants

Visual identity matters, but finance must stay readable and trustworthy.

Core invariants:

- Visual design must not sacrifice financial accuracy.
- Visual design must not sacrifice readability of numbers, labels, charts, tables, and error states.
- Visual design must not create accounting meanings.
- Visual effects must not damage the core input and understanding flow.
- Current Dark Liquid CFO Style is a doctrine, not the only permanent style.

## 9. Collaboration Invariants

Major project work must start by confirming the current source of truth.

Core invariants:

- Do not restore deprecated project rules automatically.
- Do not modify business code during documentation-only tasks.
- Keep implementation facts, constitution rules, specs, experiments, and ADRs separated.
- Long-running tasks must maintain context in `docs/context/current-project-context.md`.
- Final QA must include diff review for unintended code, backend, package, lockfile, and legacy-rule changes.

## 10. Rule Levels

### Level 1: Core Invariants

Project soul, financial safety, AI posting boundary, data privacy, architecture source-of-truth, and change governance. These require Constitution Review to change.

### Level 2: Doctrines

Current product, finance, AI, visual, behavior, and workflow principles. These can evolve through explicit decision and documentation updates.

### Level 3: Contracts

Module boundaries and collaboration responsibilities. These evolve with architecture, usually through ADR.

### Level 4: Experiments

Exploratory ideas that may be tried, revised, or discarded. Experiments cannot override Level 1 invariants.

## 11. Placement Rule

If a rule may reasonably change in the future, do not put it in constitution.

If a rule describes current code state, put it in discovery.

If a rule describes current feature, page, interaction, visual, or API behavior, put it in specs.

If a rule describes an exploratory direction, put it in experiments.

If a rule records a major decision, put it in ADR.
