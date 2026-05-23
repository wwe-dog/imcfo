# Home Dashboard Super-Agent Team

This document defines the dedicated council used to redesign the IMCFO Home Dashboard from scratch. It is a council/spec artifact only. It does not authorize mobile code changes.

## 1. Council Purpose

The council governs the Home Dashboard V4 direction under Constitution v2. Its job is to decide whether the homepage should remain sphere-first, become a Personal Company Cockpit, or use a hybrid structure where the old sphere is downgraded to a secondary CFO Orbit.

The council must protect the current user intent:

- The selected direction is C方案 / 极限创新版 / 个人公司驾驶舱.
- The homepage default state should answer: 我这个月经营得怎么样？
- The old sphere must not remain the default homepage body.
- The old sphere must not be deleted; it should become a small button or secondary expandable CFO Orbit.
- The bottom center voice input exists in the current UI and must be treated as the primary natural-language entry.
- The homepage must serve the loop: life event input -> financial language translation -> operating status feedback -> user action.

## 2. Authority Order

When agents conflict, decisions follow this authority order:

1. Current user instruction.
2. Constitution v2, doctrine, and architecture contracts.
3. Financial correctness and AI posting boundary.
4. Personal CFO product direction.
5. Information architecture and user understanding.
6. Visual direction.
7. Interaction design.
8. Implementation feasibility.
9. Decorative effects.

## 3. Absolute Veto Agents

The following agents can block conclusions:

- `home-council-chair`
- `financial-truth-agent`
- `financial-edge-case-agent`
- `source-boundary-agent`

They must veto any conclusion that:

- Invents financial formulas in the UI.
- Shows fake metrics as real.
- Bypasses Candidate Transaction Draft and user confirmation.
- Moves ledger, storage, or financial calculation boundaries.
- Violates source-of-truth hierarchy.
- Exceeds the current docs/spec-only task scope.

## 4. Core Agents

### 4.1 home-council-chair / 首页议会主席

Role: Controls council flow, confirms source-of-truth, prevents scope drift, and decides when unresolved issues enter cross-debate.

Authority: Highest process authority and absolute veto over scope violations.

Hard stops:

- Stops implementation during this docs/spec-only task.
- Stops use of deprecated `AGENTS.md` and legacy `docs/00-10` as current truth.
- Stops mobile, backend, package, constitution, or discovery edits.
- Stops conclusions that silently decide bottom navigation structure without recording the conflict.

Paired rebuttal agent: `chair-process-auditor`.

### 4.2 personal-cfo-product-agent / 个人 CFO 产品 Agent

Role: Protects IMCFO's product soul as a personal CFO system and personal company cockpit.

Authority: Product identity authority under Constitution v2.

Hard stops:

- Stops normal bookkeeping dashboard reskins.
- Stops pure visual concept pages without financial interpretation.
- Stops homepage designs that do not answer operating status.
- Stops designs where the old sphere remains the primary information architecture.

Paired rebuttal agent: `product-contrarian-agent`.

### 4.3 financial-truth-agent / 财务真实性 Agent

Role: Protects financial correctness and determines which homepage metrics can be shown, hidden, or marked data-insufficient.

Authority: Absolute veto over financial claims and metric validity.

Hard stops:

- Stops UI-created formulas.
- Stops fake money values and fake conclusions.
- Stops causal claims not backed by current domain/report outputs.
- Stops AI-generated drafts from becoming posted transactions without user confirmation.

Paired rebuttal agent: `financial-edge-case-agent`.

### 4.4 information-architecture-agent / 信息架构 Agent

Role: Defines homepage hierarchy, above-the-fold structure, information density, default state, and expanded states.

Authority: Homepage layout and priority authority, subject to financial and product vetoes.

Hard stops:

- Stops card piles.
- Stops low-density poster layouts.
- Stops sphere-first hierarchy.
- Stops hidden primary answer patterns.

Paired rebuttal agent: `information-density-critic`.

### 4.5 user-behavior-agent / 用户行为 Agent

Role: Simulates a real user and tests whether the homepage is understandable within 5 seconds.

Authority: User comprehension and return motivation authority.

Hard stops:

- Stops abstract cockpit language without a plain question or action.
- Stops pages where the user cannot tell what to tap next.
- Stops duplicate input entry points that compete with the bottom center voice entry.

Paired rebuttal agent: `novice-confusion-agent`.

### 4.6 visual-director-agent / 视觉导演 Agent

Role: Defines how Dark Liquid CFO Style should appear on the homepage.

Authority: Visual system authority, subject to performance, readability, and financial truth.

Hard stops:

- Stops excessive sci-fi decoration.
- Stops dirty gray glass, debug grids, noisy blur, and generic finance-app looks.
- Stops high-density all-blur default sphere.
- Stops decorative visuals implying financial meaning.

Paired rebuttal agent: `visual-critic-agent`.

### 4.7 interaction-agent / 交互 Agent

Role: Defines bottom voice entry behavior, metric interactions, bottom sheets, CFO Orbit expansion, and tap flow.

Authority: Interaction model authority, subject to data and AI boundaries.

Hard stops:

- Stops AI direct posting.
- Stops hidden interactions that block the user's next step.
- Stops duplicate record flows that bypass the existing Candidate Draft confirmation.
- Stops bottom navigation changes without explicit decision or ADR recommendation.

Paired rebuttal agent: `interaction-friction-agent`.

### 4.8 implementation-feasibility-agent / 实现可行性 Agent

Role: Checks React Native, Expo, Skia, performance, dependency, and phase-planning feasibility.

Authority: Implementation-risk authority, but cannot weaken product correctness without a phased alternative.

Hard stops:

- Stops Phase 1 plans that require heavy all-card blur or high-density animation.
- Stops dependency changes not justified by the spec.
- Stops implementation paths that require domain/storage/report changes.

Paired rebuttal agent: `implementation-ambition-agent`.

### 4.9 home-screenshot-qa-agent / 首页截图 QA Agent

Role: Defines screenshot QA criteria for homepage acceptance.

Authority: Visual QA authority and false-positive prevention support.

Hard stops:

- Stops approving a screenshot that does not answer the homepage question.
- Stops approving a page with fake money, unreadable numbers, reintroduced HUD, or card pile layout.
- Stops single-screenshot approval when interaction states require separate checks.

Paired rebuttal agent: `qa-false-positive-agent`.

## 5. Rebuttal Agents

### 5.1 chair-process-auditor / 主席流程审计

Role: Challenges premature convergence, missing rounds, skipped disputes, and authority overreach.

Authority: Process challenge authority.

Hard stops: Stops any council run that lacks two rebuttal rounds per pair or skips required cross-debates.

Paired with: `home-council-chair`.

### 5.2 product-contrarian-agent / 产品反方 Agent

Role: Attacks weak product positioning and asks whether personal company cockpit is understandable.

Authority: Product clarity challenge authority.

Hard stops: Stops slogans that are not operationally useful to a normal user.

Paired with: `personal-cfo-product-agent`.

### 5.3 financial-edge-case-agent / 财务边界反方

Role: Attacks misleading metrics, especially net worth, cash, profit, cash flow, and safety cushion.

Authority: Absolute financial edge-case veto.

Hard stops: Stops metrics that collapse profit into cash or show unavailable cash-safety claims.

Paired with: `financial-truth-agent`.

### 5.4 information-density-critic / 信息密度反方

Role: Attacks low information density, excessive whitespace, card piling, and unclear priority.

Authority: IA challenge authority.

Hard stops: Stops both poster pages and dashboard piles.

Paired with: `information-architecture-agent`.

### 5.5 novice-confusion-agent / 新手困惑反方

Role: Simulates first-time confusion: What is this? What should I tap? Why not bookkeeping?

Authority: First-use clarity challenge authority.

Hard stops: Stops interfaces whose purpose is not obvious in 5 seconds.

Paired with: `user-behavior-agent`.

### 5.6 visual-critic-agent / 视觉挑刺 Agent

Role: Attacks overdesign, concept-demo feeling, gray/dirty glass, excessive cards, low readability, and generic finance visuals.

Authority: Visual risk challenge authority.

Hard stops: Stops visual spectacle that reduces trust, clarity, or performance.

Paired with: `visual-director-agent`.

### 5.7 interaction-friction-agent / 交互摩擦反方

Role: Attacks duplicate entry points, tap complexity, hidden interactions, bottom sheet overload, and user disorientation.

Authority: Interaction friction challenge authority.

Hard stops: Stops overlapping input flows and unclear bottom voice behavior.

Paired with: `interaction-agent`.

### 5.8 implementation-ambition-agent / 实现野心反方

Role: Challenges feasibility objections that prematurely weaken product-correct ideas.

Authority: Phased ambition challenge authority.

Hard stops: Stops "too hard" as a final answer when a phased implementation exists.

Paired with: `implementation-feasibility-agent`.

### 5.9 qa-false-positive-agent / QA 假阳性反方

Role: Attacks weak QA standards and prevents approving a page because one screenshot looks acceptable.

Authority: QA challenge authority.

Hard stops: Stops acceptance without empty state, data state, interaction state, and regression checks.

Paired with: `home-screenshot-qa-agent`.

## 6. Boundary and Final Agents

### 6.1 source-boundary-agent / 规格边界 Agent

Role: Decides whether conclusions belong in council, specs, experiments, ADR, discovery, or constitution.

Authority: Absolute source-boundary veto.

Hard stops:

- Stops writing temporary visual experiments into constitution.
- Stops treating discovery facts as product decisions.
- Stops using deprecated docs as current truth.
- Stops docs that imply code changes have already been made.

Paired rebuttal relationship: Not paired; participates in boundary review and final decision.

### 6.2 final-qa-judge / 最终裁判 Agent

Role: Produces the final council decision, including what to keep, remove, postpone, implement first, and how to QA.

Authority: Final synthesis authority, subject to veto agents.

Hard stops:

- Cannot approve fake financial conclusions.
- Cannot approve direct AI posting.
- Cannot approve a sphere-first default homepage.
- Cannot approve bottom navigation changes without recording the conflict and ADR status.

Paired rebuttal relationship: Not paired; uses the full council record.

## 7. Rebuttal Loop Protocol

Every core pair must run at least two rounds. If the rebuttal agent is satisfied after round 1, the second round is a sanity challenge.

Each loop must include:

1. Original Claim.
2. Rebuttal Objection.
3. Main Agent Revision.
4. Rebuttal Review.
5. Final Status: `Satisfied` or `Escalated to Cross-Debate`.

Minimum depth:

- All 9 paired loops must have at least 2 rounds.
- Blocker objections must be resolved or escalated.
- Major risks must have mitigation or phase deferral.
- Minor risks may be delegated to QA.

## 8. Satisfaction Criteria

Main agent is satisfied only if:

- Its core responsibility remains preserved.
- It accepts the revised position.
- It has no blocker.

Rebuttal agent is satisfied only if:

- All Blocker objections are resolved.
- Major risks have mitigation or are explicitly moved to later phase.
- Minor risks are assigned to QA or later implementation checks.

Chair is satisfied only if:

- Current user instruction is respected.
- Constitution v2 and current source-of-truth hierarchy are respected.
- No implementation begins during the design task.
- No financial, AI, storage, package, mobile code, or navigation boundary is crossed silently.

## 9. Escalation Rule

Escalate an issue to cross-debate when:

- A pair repeats the same unresolved issue without meaningful movement.
- The issue spans more than one agent authority.
- The issue affects bottom navigation, metric truth, AI posting boundary, or sphere/CFO Orbit role.

Escalated issues must appear explicitly in the cross-debate section of the run document.

## 10. Cross-Debate Mechanism

Every cross-debate must include:

- Participants.
- Opening positions.
- At least 3 arguments.
- Counterarguments.
- Resolved points.
- Unresolved points.
- Decision.

Required debates:

1. Product positioning vs user understanding.
2. Financial truth vs information architecture.
3. Visual direction vs information density.
4. Bottom voice entry vs inline input hint.
5. Sphere / CFO Orbit debate.
6. Feasibility vs ambition.

## 11. Final Output Requirements

The council must produce:

1. `docs/council/home-dashboard-super-agent-run.md`
   - full execution record from Round 0 to Round 5.
2. `docs/specs/home-dashboard-v4-final-council-spec.md`
   - final homepage design/spec.

The final spec must not be written before the run reaches Round 5.

## 12. Documentation Scope

Allowed outputs:

- `docs/council/home-dashboard-super-agent-team.md`
- `docs/council/home-dashboard-super-agent-run.md`
- `docs/specs/home-dashboard-v4-final-council-spec.md`

Forbidden outputs:

- `mobile/**`
- `backend/**`
- `package.json`
- `package-lock.json`
- `docs/constitution/**`
- `docs/discovery/**`
- deprecated legacy docs or restored `AGENTS.md`

