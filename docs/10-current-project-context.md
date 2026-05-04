# 我为 CFO 当前项目上下文快照

更新时间：2026-05-04  
当前分支：`main`，相对 `origin/main` ahead 17  
当前 HEAD：`346d37f docs: refresh current project context snapshot`  
快照原因：生成完整项目交接包后刷新上下文，便于后续会话从 Git 和文档恢复。  
交接包路径：`D:\imcfo\docs\handoff\2026-05-04-imcfo-complete-handoff`

## 1. 项目定位

“我为 CFO”是把普通自然人的个人财务按公司经营视角组织起来的移动端 MVP。产品核心不是普通记账，而是用资产负债表、利润表、现金流量表、经营结论和个人净资产视角帮助用户理解自己的财务经营状态。

当前范围继续保持 V0.1 简单边界：

- Expo + React Native + TypeScript + AsyncStorage。
- 不新增后端、登录、数据库、云同步、AI/API、支付、税务申报、VAT、发票逻辑、个体工商户逻辑。
- 底部导航固定为：首页 / 管理 / 报表 / 我的。
- 用户可见文案保持中文。
- “我为 CFO”“经营结论”“资产负债管理”等关键文案保持不变。

## 2. 技术栈与开发方式

- 移动端：Expo 54 + React Native 0.81 + React 19 + TypeScript strict。
- 本地存储：AsyncStorage，通过 `mobile/src/app/useAppData.ts` 统一读写。
- 会计与报表逻辑：`mobile/src/domain/accounting` 下的纯函数和状态变更规则。
- 三大报表：`mobile/src/domain/reports/balanceSheet.ts`、`incomeStatement.ts`、`cashFlowStatement.ts` 当前 re-export `calculations.ts` builder。
- 当前可用脚本：`npm.cmd run web`、`npm.cmd run typecheck`、`npm.cmd run android`。

架构边界继续保持：

- UI 屏幕不直接读写 AsyncStorage。
- 报表计算函数保持纯函数、可测试。
- UI 不发明或修改会计公式。
- 不改 storage schema、transaction mapping、自然语言解析行为、route/storage/domain key。

## 3. 当前已完成与正在进行的工作

已完成并提交到 HEAD 的上下文：

- 移动端暖色金融 UI 重构已有多轮提交。
- `docs/10-current-project-context.md` 上一版快照已提交为 `346d37f`。

当前工作区仍有未提交的移动端功能/UI 代码：

- `mobile/App.tsx`
- `mobile/src/components/AppIcon.tsx`
- `mobile/src/screens/AccountManagementScreen.tsx`
- `mobile/src/screens/AssetsLiabilitiesScreen.tsx`
- `mobile/src/screens/DashboardScreen.tsx`
- `mobile/src/screens/RecordScreen.tsx`
- `mobile/src/screens/ReportsScreen.tsx`
- `mobile/src/screens/SettingsScreen.tsx`
- `mobile/src/screens/TransactionRecordsScreen.tsx`
- `mobile/src/styles/theme.ts`
- `mobile/src/components/DrilldownIncomeSankeySection.tsx`
- `mobile/src/components/financeUI.tsx`
- `mobile/src/domain/reports/incomeStructureFlow.ts`
- `mobile/src/domain/reports/operatingAnalysisReport.ts`
- `mobile/src/domain/reports/profitabilityAnalysis.ts`
- `mobile/src/screens/OperatingAnalysisReportScreen.tsx`
- `mobile/src/screens/ProfitabilityAnalysisScreen.tsx`

重要完成度说明：

- 基础 Dashboard summary 和三大报表摘要来自当前本地数据计算。
- `operatingAnalysisReport.ts` 与 `profitabilityAnalysis.ts` 目前仍是静态 mock 报告，不是已接入真实 AppData 的报表引擎。
- `incomeStructureFlow.ts` 是收入结构树到下钻 view model 的纯展示转换。
- Dashboard 内仍有部分趋势、资产/负债结构和现金流方向聚合逻辑，后续应迁到 domain/report engine。

## 4. 本次交接包

新增完整交接包目录：

```text
D:\imcfo\docs\handoff\2026-05-04-imcfo-complete-handoff
```

主要产物：

- `imcfo-complete-handoff.md`
- `imcfo-complete-handoff.pdf`
- `appendix-a-architecture-map.md/pdf`
- `appendix-b-product-and-accounting-rules.md/pdf`
- `appendix-c-ui-screenshot-index.md/pdf`
- `appendix-d-current-git-and-risks.md/pdf`
- `new-gpt-handoff-prompt.txt`
- `screenshots/`

截图状态：

- 本轮当前 Android 模拟器截图 16 张，覆盖首页、管理、报表、我的、经营分析、盈利能力分析、账户管理。
- 从旧 Android 模拟器交接包复制补充截图 7 张，覆盖交易记录、交易详情、资产负债管理、资产科目、资产详情、负债总览和负债科目。
- 补充截图文件名带 `supplement`，避免误认为本轮新拍。

## 5. 验证结果

已运行：

```powershell
cd D:\imcfo\mobile
npm.cmd run typecheck
```

结果：通过，`tsc --noEmit` 无错误。

PDF 导出：

- 使用本机 Chrome headless 从 Markdown 临时生成 HTML 后导出 PDF。
- 已删除中间 HTML 文件，交付范围保留 Markdown + PDF + 图片 + 接管提示词。

## 6. 当前 Git 状态

生成交接包前的基线状态：

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

本次文档提交应只 stage：

- `docs/10-current-project-context.md`
- `docs/handoff/2026-05-04-imcfo-complete-handoff/**`

不要 stage 当前 mobile 功能代码或其他未跟踪 UI 参考目录。

## 7. 常用命令

```powershell
cd D:\imcfo\mobile
npm.cmd install
npm.cmd run typecheck
npm.cmd run web -- --port 8091 --host localhost
npm.cmd start
npm.cmd run android

cd D:\imcfo
git status --short --branch
git log --oneline --decorate -10
```

## 8. 下次会话建议首句

```text
Use AGENTS.md, docs/10-current-project-context.md, and docs/handoff/2026-05-04-imcfo-complete-handoff/imcfo-complete-handoff.md as source of truth.
Project root: D:\imcfo.
Continue the mobile MVP without changing accounting formulas, storage schema, transaction mapping, parser behavior, route keys, storage keys, or domain model fields.
Before finishing implementation tasks, run npm.cmd run typecheck inside D:\imcfo\mobile.
Report final results in Chinese.
```
