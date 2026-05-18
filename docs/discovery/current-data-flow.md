# Current Data Flow

> 本文件记录 current implementation facts。它不是长期架构宪法。

## 1. App Startup Flow

当前启动链路：

1. `mobile/index.ts` 注册 `App`。
2. `mobile/App.tsx` 渲染 App shell。
3. `AppShell` 调用 `useAppData()`。
4. `useAppData` 通过 storage adapter 读取 `AppData`。
5. 如果本地无版本记录，则使用 seed data 初始化。
6. App 把 accounts、assets、liabilities、transactions、settings、summary 等数据通过 props 传给 screens。

## 2. Storage Load And Save Flow

当前数据加载：

```text
AsyncStorage
-> asyncStorageAdapter.loadData()
-> normalize / seed fallback
-> useAppData state
-> App.tsx
-> screens
```

当前数据保存：

```text
screen callback
-> useAppData mutation function
-> domain rule or state update
-> storageAdapter.saveData()
-> AsyncStorage.multiSet()
```

## 3. Transaction Save Flow

当前正式入账主链路：

```text
RecordScreen or manual UI
-> onSave(TransactionInput)
-> App.tsx handleSaveTransaction
-> useAppData.saveTransaction
-> createTransactionFromInput(input)
-> applyTransactionToFinancialState(currentData, transaction)
-> storageAdapter.saveData(nextData)
```

这说明当前正式交易不会由 UI 直接写 AsyncStorage。正式交易会经过 `transactionRules.ts`。

## 4. Account / Asset / Liability Flow

当前账户、资产、负债修改：

```text
screen form
-> App.tsx callback
-> useAppData upsert/delete/reconcile function
-> domain/state helper
-> storageAdapter.saveData(nextData)
```

当前存在 account 与 asset/liability 的同步逻辑。该同步是当前实现事实，不代表未来必须保持当前模型形态。

## 5. Report Data Flow

当前三表与首页摘要：

```text
transactions + assets + liabilities + currentPeriod
-> filterTransactionsByReportPeriod()
-> buildDashboardSummary()
-> buildBalanceSheetSummary()
-> buildIncomeStatementSummary()
-> buildCashFlowStatementSummary()
-> ReportsScreen / DashboardScreen display
```

当前基础三表走 domain calculation。经营分析、盈利分析存在硬编码 / 原型内容，不能误判为已完成的报表计算链路。

## 6. Import / Export Flow

当前导出：

```text
SettingsScreen
-> exportData()
-> storageAdapter.exportData()
-> JSON string
```

当前导入：

```text
SettingsScreen pasted JSON
-> importData(json)
-> storageAdapter.importData()
-> parse / shallow normalize
-> saveData()
```

Implementation Reality Critic 发现：导入路径可能绕过交易规则回放，导致 transactions / assets / liabilities 之间出现不一致。该风险应进入 specs 或 future hardening，不应被忽略。

## 7. Boundary Facts

当前边界较清楚的地方：

- screen 不直接调用 AsyncStorage。
- report calculation 不直接调用 AsyncStorage。
- ASR service 不写账。
- record recognition service 返回 Draft，不直接保存交易。

当前边界需要加强的地方：

- importData 缺少规则回放 / 完整一致性校验。
- 部分 UI 文案和分析卡片存在硬编码财务结论。
- AI draft 的 `impactPreview` 可由远端返回，虽然不影响入账，但可能误导用户理解财务影响。
