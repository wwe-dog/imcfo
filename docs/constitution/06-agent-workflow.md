# Agent Workflow Doctrine

## 1. Doctrine

Agent collaboration tools — Claude, GPT, and Codex — are used exclusively by the developer who builds IMCFO. They are not part of the product experience for end users. End users of IMCFO interact only with the mobile app.

IMCFO uses agent collaboration, but source of truth comes first.

Before major work, agents must identify:

- current user instruction
- relevant Constitution v2 files
- relevant discovery facts
- relevant specs / ADRs
- current git diff

## 2. Current Role Doctrine

Current collaboration doctrine:

- Claude: visual critique, screenshot critique, visual specification.
- GPT: product architecture, rule design, Codex prompts, QA strategy.
- Codex: code implementation, document landing, typecheck, screenshot QA, git diff reporting.

This role split is useful but not immutable.

## 3. Conflict Resolution

When agent outputs conflict:

- On Constitution or doctrine questions: Claude's review takes precedence. Claude is responsible for visual critique, financial safety review, and constitution alignment.
- On implementation questions: Codex output takes precedence. Codex is responsible for code correctness and verified implementation facts.
- When both layers are in dispute, the developer's explicit instruction is the final authority. No agent output overrides a direct user instruction.

## 4. Documentation Task Rules

For documentation-only tasks:

- do not modify business code
- do not modify package or lockfiles
- do not restore deprecated docs
- write in the correct docs layer
- run final diff review

## 5. Implementation Task Rules

For implementation tasks:

- read current docs relevant to the task
- inspect the current code before editing
- keep accounting logic out of UI
- run available checks when feasible
- report modified files and verification

## 6. Long Context Rules

For long tasks or context compression:

- use `docs/context/current-project-context.md` as the new continuity file
- do not recreate legacy `docs/10-current-project-context.md`
- record current source of truth, git status, files changed, and remaining risks
- after compaction, resume from current context plus git status, not from deprecated rules

## 7. Final QA Rules

Every major documentation or implementation task should end with:

- what changed
- what did not change
- checks run
- git diff / status summary
- risks
- next recommended action
