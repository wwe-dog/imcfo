# Architecture Contracts

## 1. Contract Principle

Contracts define responsibilities, not permanent implementation shape.

Current paths, libraries, and filenames are discovery facts. The durable rule is which layer may make which decision.

## 2. Layer Responsibilities

### UI Layer

May:

- collect user input
- display data
- display drafts
- trigger callbacks
- present report output

Must not:

- invent accounting formulas
- mutate storage directly
- post AI drafts directly
- calculate financial truth independently from the financial core
- silently suppress or ignore errors returned by the domain or transaction rule layer.

### Application Orchestration Layer

May:

- coordinate screen state
- call storage adapters
- call domain functions
- pass data and callbacks to UI

Must not:

- create hidden financial rules separate from domain
- bypass transaction rule layer for posted transactions
- swallow domain errors before they reach the UI layer.

### Transaction Rule Layer

Owns:

- posted transaction creation
- financial state mutation rules
- transaction type effects
- required validation before posting

Validation errors and rule violations must be surfaced explicitly. They must not be silently defaulted away.

### Report Engine Layer

Owns:

- balance sheet calculation
- income statement calculation
- cash flow statement calculation
- summary metrics
- report assumptions

Must remain testable and explainable.

### Storage Adapter Layer

Owns:

- persistence
- import/export
- data normalization

Must not:

- decide accounting meaning
- generate financial conclusions
- replace transaction rules

### AI / ASR Service Layer

Owns:

- transcription
- draft recognition
- confidence and missing information

Must not:

- write ledger
- write storage
- become the ledger database
- expose secrets to frontend

### Backend Service Boundary

Backend may act as a proxy or service boundary. It must not become the book of record by accident.

AI / ASR backends must not become the ledger database under the current Constitution v2.

If future cloud sync, account login, or multi-device synchronization is proposed, it must preserve the ledger boundary unless the user explicitly authorizes a Constitution-level review.

## 3. Change Contracts

ADR required for:

- replacing storage model
- adding cloud sync or multi-device data ownership
- any proposal to move ledger source-of-truth to backend, which requires Constitution-level review before ADR
- changing AI / ASR provider boundary
- changing formal transaction model
- changing report engine architecture
- changing product scope beyond personal CFO MVP

Specs update sufficient for:

- page layout
- copy
- component styles
- supported transaction forms
- prompt templates
- screen-level interactions

Discovery update required for:

- actual code structure changes
- dependency changes
- endpoint changes
- current data-flow changes
