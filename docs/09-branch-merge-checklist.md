# 我为 CFO · 分支合并检查清单

本文档用于把功能分支合并回稳定集成基线。当前基线是 Expo 移动端 V0.1。

## 1. 合并前通用检查

在合并任何功能分支前，先确认当前基线可运行：

```powershell
cd D:\imcfo\mobile
npm.cmd install
npm.cmd run typecheck
npm.cmd start
```

Expo 启动后，用手机 Expo Go 打开应用，至少检查：

- 首页可以展示资产、负债、收入、费用、利润、所有者权益。
- 记一笔可以保存交易。
- 保存后首页和报表会刷新。
- 报表页可以切换简易版/专业版。
- 设置页可以导出和重置本地数据。

## 2. 合并 feature/assets-liabilities-crud

推荐命令：

```powershell
cd D:\imcfo
git status
git checkout main
git pull
git merge feature/assets-liabilities-crud
cd mobile
npm.cmd install
npm.cmd run typecheck
npm.cmd start
```

合并后重点测试：

- 资产可以新增、编辑、删除。
- 负债可以新增、编辑、删除。
- 信用卡仍然作为负债处理。
- 资产和负债变化后，首页所有者权益会更新。
- 资产负债表会同步更新。
- 记一笔保存交易后，不会破坏资产负债 CRUD 的数据。

高风险文件：

- `mobile/App.tsx`
- `mobile/src/screens/AssetsLiabilitiesScreen.tsx`
- `mobile/src/screens/RecordScreen.tsx`
- `mobile/src/storage/asyncStorageAdapter.ts`
- `mobile/src/storage/storageAdapter.ts`
- `mobile/src/storage/seedData.ts`
- `mobile/src/domain/models/asset.ts`
- `mobile/src/domain/models/liability.ts`
- `mobile/src/domain/accounting/transactionRules.ts`
- `mobile/src/domain/accounting/calculations.ts`

## 3. 合并 feature/reports-detail

推荐命令：

```powershell
cd D:\imcfo
git status
git checkout main
git pull
git merge feature/reports-detail
cd mobile
npm.cmd install
npm.cmd run typecheck
npm.cmd start
```

合并后重点测试：

- 报表页仍然包含资产负债表、利润表、现金流量表。
- 简易版/专业版切换仍然可用。
- `nonCash` 交易不进入现金净变化。
- 信用卡消费计入费用和负债，但不计入现金流出。
- 信用卡还款减少负债和现金资产，并进入筹资现金流出。
- 投资买入不影响利润表。
- 投资卖出在没有成本基础时，不自动确认投资收益或亏损。

高风险文件：

- `mobile/src/screens/ReportsScreen.tsx`
- `mobile/src/components/ReportBlock.tsx`
- `mobile/src/domain/accounting/calculations.ts`
- `mobile/src/domain/reports/balanceSheet.ts`
- `mobile/src/domain/reports/incomeStatement.ts`
- `mobile/src/domain/reports/cashFlowStatement.ts`
- `mobile/src/domain/models/report.ts`
- `mobile/src/domain/accounting/transactionRules.ts`

## 4. 如果出现冲突

处理原则：

1. 不改项目宪法，除非任务明确要求。
2. 不引入后端、登录、数据库、AI、支付、API、个体工商户、经营所得、增值税或发票逻辑。
3. 优先保留领域纯函数的稳定性。
4. `RecordScreen` 和 `App.tsx` 的数据保存链路不能绕过 storage adapter。
5. screens 不允许直接调用 AsyncStorage。
6. 报表计算函数不允许读取 React state 或 AsyncStorage。

处理步骤：

```powershell
git status
git diff --name-only --diff-filter=U
```

逐个打开冲突文件，按以下顺序解决：

1. 先保留类型模型兼容性。
2. 再保留 storage adapter 接口。
3. 再保留交易映射规则。
4. 再保留报表纯计算函数。
5. 最后处理 screen UI。

解决后运行：

```powershell
cd D:\imcfo\mobile
npm.cmd run typecheck
npm.cmd start
```

确认手机端可运行后，再提交合并结果。

## 5. 合并后提交前检查

每次合并后至少运行：

```powershell
cd D:\imcfo\mobile
npm.cmd run typecheck
```

如果改动涉及 UI 或存储，再运行：

```powershell
npm.cmd start
```

手机端至少手动检查：

- 首页
- 记一笔
- 资产负债
- 报表
- 设置

## 6. 合并顺序建议

推荐顺序：

1. 先合并 `feature/assets-liabilities-crud`。
2. 确认资产负债数据结构稳定。
3. 再合并 `feature/reports-detail`。
4. 用更完整的数据验证报表详情。

原因：

报表详情依赖资产、负债、交易和计算规则。先稳定资产负债 CRUD，可以减少报表分支重复改模型的风险。
