# 附录 D：当前 Git 状态与风险

## 1. 当前状态

生成交接包前：

```text
## main...origin/main [ahead 17]
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
?? docs/handoff/
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
- 本地分支 ahead 17，远端可能没有最新上下文。

## 4. 最低验收

```powershell
cd D:\imcfo\mobile
npm.cmd run typecheck
```

结果：本次交接包生成前已通过。

