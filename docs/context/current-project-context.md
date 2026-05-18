# Current Project Context

## 1. Current Task

Task: IMCFO Constitution v2 Council Execution.

Status: Constitution v2 document system is being rebuilt under Codebase-first + Living Constitution.

This file replaces the old `docs/10-current-project-context.md` continuity role. Do not restore the old context file unless the user explicitly asks for historical recovery.

## 2. Source Of Truth

Current source of truth:

- user instruction in the current task
- `docs/council/*`
- `docs/constitution/*`
- `docs/discovery/*`
- `docs/specs/*`
- `docs/experiments/*`
- `docs/adr/*`
- this file

Deprecated:

- old `AGENTS.md`
- old `docs/00-10`

## 3. Current Git State

Observed during execution:

- branch: `main...origin/main [ahead 28]`
- old `AGENTS.md` deleted
- old `docs/00-10` deleted
- old handoff docs under `docs/handoff/2026-05-04-imcfo-complete-handoff/` deleted
- `docs/council/` untracked before execution

The handoff deletion state should be confirmed by the user later if historical handoff material should be preserved elsewhere.

## 4. Current Implementation Facts

Current mobile app:

- `mobile/` is the main app.
- `mobile/index.ts` registers `App`.
- `mobile/App.tsx` coordinates current screen routing.
- `mobile/src/app/useAppData.ts` coordinates data loading, mutations, summary, and persistence.

Current data:

- AsyncStorage adapter is the current local persistence implementation.
- Storage calls are concentrated in `mobile/src/storage/asyncStorageAdapter.ts`.
- Current formal transaction save path goes through `useAppData.saveTransaction` and `transactionRules`.

Current AI / ASR:

- voice input calls ASR endpoint through `speechTranscriptionService.ts`.
- text recognition returns Candidate Transaction Draft through `recordRecognitionService.ts`.
- current backend `backend/asr-scf` is ASR proxy only, not ledger backend.

Current financial caveats:

- system is transaction-rule-driven, not proven complete double-entry ledger.
- journal entries exist as model/storage but no full generation loop was found.
- some advanced reports are hardcoded / prototype.
- importData may bypass accounting rule replay.

## 5. Next Continuity Notes

If context is compressed:

1. Read this file.
2. Run `git status --short --branch`.
3. Read `docs/council/19-final-execution-report.md` if it exists.
4. Continue from the newest user instruction.
5. Do not read or restore old `docs/10-current-project-context.md`.

## 6. Key Commands

```powershell
git status --short --branch
git diff --name-status
cd mobile; npm run typecheck
cd backend/asr-scf; npm test
```

Run build/typecheck only when the task needs implementation verification. Documentation-only work normally requires diff review, not app build.
