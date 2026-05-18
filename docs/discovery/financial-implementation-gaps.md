# Financial Implementation Gaps

> This file records current financial implementation facts and known gaps. It is discovery, not doctrine. It must not be treated as permanent rules.

## 1. Current Financial Reality

Current implementation is a transaction-rule-driven personal financial state system.

Current code has:

- transaction rules
- account / asset / liability state updates
- report calculations
- report period filtering
- basic three-statement summaries

Current code does not yet prove:

- complete double-entry journal generation
- journal-derived statements
- full import consistency validation
- complete handling of all complex transaction cases

## 2. Required Hardening Areas

These are implementation gaps, not constitution invariants. They should be addressed in specs or future tasks:

- importData consistency validation
- complex transaction target validation
- transfer balance movement
- investment transaction mapping
- repayment and credit card repayment mapping
- journal entry generation or explicit decision not to generate journals
- prototype report replacement with live data calculations
