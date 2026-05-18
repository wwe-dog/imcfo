# AI Input Boundary

## 1. Doctrine

AI is a low-friction input and interpretation layer.

AI is not the bookkeeper of record.

## 2. Allowed AI Outputs

AI may output:

- transcription text
- Candidate Transaction Draft
- missing-information questions
- confidence score
- possible category / account / date / note suggestions
- non-final explanation of likely financial impact

AI may not output directly into:

- posted transaction ledger
- storage adapter
- final journal entry
- final report calculation
- account / asset / liability mutation

## 3. Candidate Transaction Draft

A Candidate Transaction Draft is not a posted transaction.

It must remain visibly reviewable by the user. Formal posting requires:

1. user confirmation
2. required target account / subject completion
3. transaction rule layer processing
4. storage adapter persistence after rules pass

## 4. Impact Preview Rule

AI may return an impactPreview field inside a Candidate Transaction Draft.

Strict rules apply:

- impactPreview must be visibly labeled as an AI estimate, not a financial conclusion.
- impactPreview must never be presented as report engine output.
- impactPreview must not persist after the transaction is formally posted.
- After formal posting, any displayed financial impact must come from the report engine or the transaction rule layer, not from the AI draft.
- If impactPreview contradicts the report engine result after posting, the report engine result is authoritative and the AI estimate must be discarded.

## 5. Failure Mode Requirements

The system must treat these as high-risk inputs:

- multiple transactions in one sentence
- repayment
- investment purchase or sale
- friend transfer / reimbursement / borrowing
- missing account
- missing date
- unclear direction
- low confidence
- unsupported transaction type

Example handling:

- “今天早餐 18，午餐 32，都用支付宝”：split into two Drafts or ask user to confirm two entries.
- “我还了花呗 500”：must identify payment account and liability target before posting.
- “买了基金 3000”：must treat as investment movement, not expense.
- “朋友转我 200，我又请他吃饭 80”：must split into separate financial events.

## 6. Backend Boundary

AI / ASR backends may provide service capabilities:

- speech-to-text
- model inference
- draft normalization

They must not become the ledger source of truth.

They must not store the user's formal book or become the ledger database under the current Constitution v2.

Any future idea that would move ledger source-of-truth to a backend is not a normal ADR change. It would require explicit user authorization and a Constitution-level review before any design or implementation work begins.

## 7. Secret Boundary

API keys, model provider secrets, cloud credentials, and signing keys must not be placed in frontend code.

Frontend may hold public endpoint configuration only. Secret-bearing calls must be mediated by controlled backend or provider-safe mechanisms.
