# ADR

ADR means Architecture Decision Record.

Use ADRs for major decisions that change the durable shape of IMCFO.

ADR required for:

- storage source-of-truth changes
- backend ledger or cloud sync
- login / account system
- AI / ASR provider boundary changes
- API secret handling changes
- transaction model changes
- report engine architecture changes
- major visual identity direction changes
- major product scope changes
- platform or technology stack changes

## Numbering

ADRs are numbered sequentially starting from ADR-0001.

Before creating a new ADR, check the existing files in docs/adr/ to find the current highest number and increment by one.

Do not reuse numbers. Do not leave gaps.

ADR template:

```md
# ADR-0000: Title

## Status

Proposed / Accepted / Superseded

## Context

What problem or decision triggered this ADR?

## Decision

What is the decision?

## Consequences

What changes? What risks remain?

## Constitution Check

Which Constitution v2 invariants are affected?
```
