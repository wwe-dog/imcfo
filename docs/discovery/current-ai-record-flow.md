# Current AI Record Flow

> 本文件记录当前 AI / ASR / 记一笔链路事实。它不是供应商或 API 的永久限制。

## 1. Voice Input Flow

当前语音链路：

```text
RecordScreen
-> expo-audio recording
-> local audio file
-> speechTranscriptionService.transcribeAudio()
-> EXPO_PUBLIC_IMCFO_ASR_ENDPOINT
-> backend/asr-scf Tencent ASR proxy
-> transcription text
```

当前 ASR service：

- 校验录音时长。
- 校验音频大小。
- 读取音频为 base64。
- 调用 public ASR endpoint。
- 返回文本。
- 删除临时录音文件。

未发现 ASR service 写账、写 storage 或计算报表。

## 2. Text To Draft Flow

当前识别链路：

```text
transcription text or user text
-> recognizeTransactionDraft(text)
-> local rule parser
-> optional remote model endpoint
-> CandidateTransactionDraft
-> RecordScreen confirmation modal
```

当前 `CandidateTransactionDraft` 包含：

- sourceText
- amount
- direction
- transactionType
- category
- accountName
- dateText
- note
- confidence
- needsReview
- impactPreview
- provider / model

## 3. Draft To Formal Transaction Flow

当前确认链路：

```text
CandidateTransactionDraft
-> user reviews / edits
-> handleConfirmDraft()
-> buildTransactionInputFromDraft()
-> onSave(TransactionInput)
-> useAppData.saveTransaction()
-> transactionRules
-> storageAdapter.saveData()
```

当前 AI Draft 不直接写 AsyncStorage。正式保存由用户确认后进入统一交易规则层。

## 4. Current Conservative Limits

当前 Draft 直接可入账类型主要是：

- income
- expense

部分复杂类型如 repayment、investment、multi-transaction 等需要更明确的科目或目标选择；当前 UI 不应让这些低置信 / 高风险 Draft 自动入账。

## 5. Backend Boundary

当前 `backend/asr-scf` 是 ASR proxy：

- 只接收音频。
- 只返回 transcription text。
- 不生成 transaction draft。
- 不写账。
- 不存账本。
- 不计算报表。

这支持 Constitution v2 的边界：后端服务可以作为 AI / ASR 代理，但不得悄悄成为账本数据库。

## 6. Current Risks

- `EXPO_PUBLIC_IMCFO_RECORD_AI_ENDPOINT` 指向的 record AI 服务不在当前仓库中，契约需要 specs 明确。
- 远端 Draft 的 `impactPreview` 可被 UI 展示，但不一定来自 report engine。
- “还花呗”“买基金”“朋友转账再请客”等语句可能包含负债、投资、多笔交易、方向判断，不能低摩擦到牺牲准确性。
- 低置信度、多笔、缺目标账户、缺交易方向的 Draft 必须停在候选态。

## 7. Constitution Implications

必须进入核心边界：

- AI 只能生成 Candidate Transaction Draft。
- AI 不得直接写账。
- AI 不得直接写 AsyncStorage。
- AI 不得绕过 transaction rules。
- 正式入账必须经过用户确认。
- API key / secret 不得进入前端。
- AI / ASR 后端不能成为账本数据库。
