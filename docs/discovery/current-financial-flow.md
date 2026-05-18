# Current Financial Flow

> 本文件记录当前财务实现事实和风险。它不是长期会计规则宪法。

## 1. Current Financial Model Facts

当前模型包括：

- Account
- Asset
- Liability
- Transaction
- ReportPeriod
- ReportSummary
- JournalEntry

当前 `TransactionType` 覆盖收入、支出、资产增减、负债增减、应收应付、转账、投资买卖、还款、信用卡支出和信用卡还款等类型。

## 2. Transaction Rule Flow

当前核心链路：

```text
TransactionInput
-> createTransactionFromInput()
-> transactionRules lookup
-> Transaction
-> applyTransactionToFinancialState()
-> next AppData
```

当前交易规则会更新：

- transactions list
- accounts balance
- assets currentValue
- liabilities currentBalance

## 3. Current Report Flow

当前基础报表计算：

```text
transactions + assets + liabilities
-> calculations.ts
-> balance sheet summary
-> income statement summary
-> cash flow statement summary
-> dashboard summary
```

当前现金流按 `cashFlowType` 分类。`nonCash` 类型不会进入现金流总额。

## 4. Journal Entry Reality

当前发现：

- `JournalEntry` model 存在。
- `journalEntries` storage key 存在。
- seed data 中 `journalEntries` 为空。
- `journalEntryRules.ts` 当前主要是分录平衡校验。
- 未发现当前主链路自动生成 journal entries 并由分录推导三表。

因此当前系统是“交易规则驱动的个人财务状态系统”，不是完整 double-entry ledger closed loop。Constitution v2 应保护会计一致性和可解释性，但不得把当前实现误写成已完成的完整复式账本。

## 5. Known Financial Risks

Implementation Reality Critic 识别的风险：

- `createTransactionFromInput` 验证较薄。
- 某些 liability target 缺失时可能 fallback 更新第一条 liability，未来若 UI 放开复杂类型会产生错误入账风险。
- `transfer` 当前记录交易但不完整移动双边账户余额。
- importData 可导入不一致 JSON，绕过 transaction rules 回放。
- Operating analysis 和 profitability analysis 当前包含硬编码 / 原型数据。
- Settings 中部分财务结论是 UI 硬编码，不一定来自 report engine。
- AI 远端返回的 `impactPreview` 不影响入账，但可能展示非规则推导的财务影响说明。

## 6. Constitution Implications

应进入 Constitution / doctrine 的底线：

- UI 不得发明会计公式。
- AI 不得生成最终会计分录或正式交易。
- 正式入账必须经过统一 transaction rule layer。
- 报表计算必须可解释、可测试。
- 展示层的财务结论必须可追溯到 domain/report engine。

应进入 specs / future hardening 的事项：

- importData 一致性校验。
- complex transaction targets 必填规则。
- transfer 双边账户规则。
- journal entry 生成是否进入未来版本。
- 原型分析报告改为真实 report engine 输出。
