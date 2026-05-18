# Change Governance

## 1. Purpose

Change governance keeps IMCFO adaptable without losing its soul.

## 2. Rule Levels

### Level 1: Core Invariants

Includes:

- personal CFO identity
- financial safety
- AI posting boundary
- source-of-truth hierarchy
- no accidental backend ledger
- change governance

Changes require Constitution Review.

### Level 2: Doctrines

Includes:

- current product direction
- current financial doctrine
- current AI input doctrine
- current visual doctrine
- current workflow doctrine

Changes require explicit decision and document update.

### Level 3: Contracts

Includes:

- layer responsibilities
- module boundaries
- collaboration contracts
- service boundaries

Changes usually require ADR when they affect data ownership, posting, report engine, or AI boundary.

### Level 4: Experiments

Includes:

- new interaction ideas
- visual explorations
- AI capabilities
- report formats
- business model explorations

Experiments can be created, revised, or discarded. They cannot override Level 1.

## 3. ADR Required

Create ADR for:

- adding login or cloud sync
- any proposal to move ledger source-of-truth to backend, which requires Constitution-level review before ADR
- changing storage ownership
- changing AI provider boundary in a way that affects secrets or posting
- changing transaction model
- changing report engine source of truth
- changing product scope beyond personal CFO MVP
- adopting a new primary platform or major technology stack

## 4. Specs Update Required

Update specs for:

- page structure
- copy
- UI behavior
- visual implementation details
- input form changes
- prompt / draft UI changes
- current endpoint configuration

## 5. Discovery Update Required

Update discovery when code reality changes:

- dependency changes
- directory structure changes
- data-flow changes
- financial-flow changes
- AI record-flow changes
- backend responsibility changes

## 6. Constitution Review Required

Constitution Review is required if a change may affect:

- product identity
- financial truth
- AI posting boundary
- data ownership
- backend ledger boundary
- user confirmation requirement
- source-of-truth hierarchy

## 7. Constitution Versioning

Each time a Constitution Review is completed and changes are accepted:

- Increment the constitution version number.
- Record the effective date and a one-line summary of what changed at the top of docs/constitution/00-imcfo-constitution-v2.md under a "Version History" block.

The current version is v2. Version history before v2 does not need to be reconstructed unless the developer explicitly requests historical recovery.
