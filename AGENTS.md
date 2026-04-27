# AGENTS.md

## Project

This project is **我为CFO**, a personal finance web app that treats the user as a company.

It is not a normal bookkeeping app. It is a personal operating system based on company-style financial reports.

## Product Rules

- Keep the MVP simple.
- Do not add backend, login, payment, or real API integrations yet.
- Use Expo + React Native + TypeScript + AsyncStorage for the first mobile MVP.
- Support the product direction of Balance Sheet, Income Statement, Cash Flow Statement, simple report mode, professional report mode, and monthly/quarterly/yearly reports.
- All user-facing copy should be Chinese.
- All code comments and internal technical naming can be English.

## Architecture Rules

- All future product, data model, report engine, and UI work must follow `docs/00-project-constitution.md`.
- Keep accounting logic separate from UI.
- Keep report calculation functions pure and testable.
- Do not let frontend code invent accounting formulas.
- Keep mobile storage adapters separate from report calculation functions.
- Prefer typed TypeScript data models for accounts, transactions, report periods, and report outputs.
- Do not add unnecessary dependencies.

## Quality Rules

- Before finishing any implementation task, run build/type checks if available.
- Validate formulas with simple examples and edge cases.
- Keep changes small and scoped to the task.
- Report final results in Chinese.

## Project Agents

- `product-architect`: product direction, MVP scope, feature priority, user language, page structure, and product drift prevention.
- `accounting-logic-architect`: accounting rules, personal finance mappings, report definitions, and simple/professional report logic.
- `data-model-agent`: TypeScript data models, mobile storage schema, transaction/account/report period structure, and migration planning.
- `report-engine-agent`: pure financial calculation functions and formula validation for core reports and metrics.
- `frontend-ui-agent`: React UI pages, dashboard, forms, report display, report mode switch, Chinese copy, and UX.
- `qa-review-agent`: build checks, type checks, formula validation, edge cases, data consistency, and regression review.
