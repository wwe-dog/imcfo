# 附录 D：当前 Git 状态与风险

## 1. 当前状态

2026-05-05 同步时：

```text
## main...origin/main [ahead 18]
 M docs/10-current-project-context.md
 M mobile/App.tsx
 M mobile/src/components/AppIcon.tsx
 M mobile/src/screens/AccountManagementScreen.tsx
 M mobile/src/screens/AssetsLiabilitiesScreen.tsx
 M mobile/src/screens/DashboardScreen.tsx
 M mobile/src/screens/RecordScreen.tsx
 M mobile/src/screens/ReportsScreen.tsx
 M mobile/src/screens/SettingsScreen.tsx
 M mobile/src/screens/TransactionRecordsScreen.tsx
 M mobile/src/styles/theme.ts
?? docs/handoff/2026-05-imcfo-pdf/
?? docs/ui-reference/
?? docs/ui-snapshots/
?? mobile/src/components/DrilldownIncomeSankeySection.tsx
?? mobile/src/components/financeUI.tsx
?? mobile/src/domain/reports/incomeStructureFlow.ts
?? mobile/src/domain/reports/operatingAnalysisReport.ts
?? mobile/src/domain/reports/profitabilityAnalysis.ts
?? mobile/src/screens/OperatingAnalysisReportScreen.tsx
?? mobile/src/screens/ProfitabilityAnalysisScreen.tsx
```

## 2. 本次文档提交范围

只应 stage：

- `docs/handoff/2026-05-04-imcfo-complete-handoff/**`
- `docs/10-current-project-context.md`

不要 stage：

- 当前 mobile 功能代码。
- `docs/ui-reference/`
- `docs/ui-snapshots/`
- 旧交接包目录中非本次新增的内容，除非后续明确要求。

## 3. 当前风险

- 新报表分析文件是未跟踪功能代码，还没有形成单独 feature commit。
- 经营分析和盈利能力分析使用静态 mock 数据，与真实 AppData 口径尚未打通。
- Dashboard 内存在 UI 层聚合逻辑，长期应迁到 domain/report engine。
- 应收/应付现金流分类在文档和实现之间需要统一。
- 当前没有自动化测试脚本，最低质量门槛是 `npm.cmd run typecheck`。
- 2026-05-05 快照记录的 overnight-quality 审计结果已同步进本交接包；截至同步开始时，这些移动端代码仍在工作区中显示为未提交改动。
- 本地分支同步时为 ahead 18，远端可能没有最新上下文。

## 4. 最低验收

```powershell
cd D:\imcfo\mobile
npm.cmd run typecheck
```

结果：本次交接包生成前已通过。

2026-05-05 审计还记录了以下 TypeScript 验证通过：

```powershell
C:\Users\liyuxiang\AppData\Local\OpenAI\Codex\bin\node.exe .\node_modules\typescript\bin\tsc --noEmit
C:\Users\liyuxiang\AppData\Local\OpenAI\Codex\bin\node.exe .\node_modules\typescript\bin\tsc --noEmit --noUnusedLocals --noUnusedParameters
```

数据校验：

- 2026-04 seed data：assets 5,000,000；liabilities 1,186,000；net worth 3,814,000；income 93,500；expenses 45,600；profit 47,900；operating cash flow 56,900；investing cash flow -64,000；financing cash flow -69,200；cash net change -76,300。
- `historicalMonthlySnapshots` 中 2026-04 快照保持同样数值。
- seed transactions 检查结果：交易 ID 无重复，账户/资产/负债引用无缺失。
