# 我为 CFO 当前项目上下文快照

更新时间：2026-05-05  
当前分支：`main`，相对 `origin/main` ahead 18（提交前状态）  
当前 HEAD：`30a3411 docs: add complete project handoff package`  
快照原因：自动化 1 执行移动端 overnight-quality 维护审计后刷新上下文，便于后续会话从 Git 和文档恢复。

## 1. 项目定位与边界

“我为 CFO”是把普通自然人的个人财务按公司经营视角组织起来的移动端 MVP。产品核心不是普通记账，而是用资产负债表、利润表、现金流量表、经营结论和个人净资产视角帮助用户理解自己的财务经营状态。

当前 V0.1 边界继续保持：

- Expo + React Native + TypeScript + AsyncStorage。
- 底部导航固定为：首页 / 管理 / 报表 / 我的。
- 用户可见文案保持中文。
- 不新增后端、登录、数据库、云同步、AI/API、支付、税务申报、VAT、发票逻辑、个体工商户逻辑。
- 不改项目宪法、会计政策、交易规则、现金流规则、storage schema、route/storage/domain key。

## 2. 技术栈与架构规则

- 移动端：Expo 54 + React Native 0.81 + React 19 + TypeScript strict。
- 本地存储：AsyncStorage，通过 `mobile/src/app/useAppData.ts` 统一读写。
- 会计与报表逻辑：`mobile/src/domain/accounting` 下的纯函数和状态变更规则。
- 三大报表：`mobile/src/domain/reports/balanceSheet.ts`、`incomeStatement.ts`、`cashFlowStatement.ts` 当前 re-export `calculations.ts` builder。

架构边界继续保持：

- UI 屏幕不直接读写 AsyncStorage。
- 报表计算函数保持纯函数、可测试。
- UI 不发明或修改会计公式。
- 移动端存储适配与报表计算函数分离。

## 3. 本次自动化审计结果

本次运行覆盖：

- 仓库结构、`mobile/package.json`、`tsconfig.json`、`mobile/App.tsx`、`mobile/src/screens`、`components`、`domain`、`hooks`、`storage`、`styles`。
- TypeScript 编译稳定性。
- 交易记录、筛选弹窗、月份折叠、交易详情、账户管理、资产负债管理、数据重置/导入后的状态安全。
- 冗余 helper、未使用导入、未使用状态、旧 UI 函数组件。
- 高复杂度演示数据和 2026-04 财务不变量。

关键修复：

- `TransactionRecordsScreen` 删除旧版交易搜索、筛选、分组和 display record 构建 helper，统一依赖 `transactionDisplayIndex`。
- `TransactionRecordsScreen` 在 records index 变化后清理已经不存在的交易详情选中项，避免重置/导入/清空数据后详情页引用 stale record。
- `transactionDisplayIndex` 移除关闭状态的性能调试 `console.log` 路径。
- `RecordScreen`、`SettingsScreen`、`AppIcon`、`ProfitabilityAnalysisScreen`、`AccountManagementScreen` 清理未使用导入、未使用状态和未使用组件。
- 交易记录默认懒加载月份数据仍保留，搜索/筛选时才 hydration 全量 records。

未改变：

- 未改会计公式、交易规则、现金流规则。
- 未改 seed data totals、高复杂度演示预期值。
- 未改 storage schema。
- 未新增后端、登录、云同步、支付、AI/API、税务/VAT/发票模块。
- 未新增底部 tab。

## 4. 验证结果

已运行：

```powershell
cd D:\imcfo\mobile
C:\Users\liyuxiang\AppData\Local\OpenAI\Codex\bin\node.exe .\node_modules\typescript\bin\tsc --noEmit
C:\Users\liyuxiang\AppData\Local\OpenAI\Codex\bin\node.exe .\node_modules\typescript\bin\tsc --noEmit --noUnusedLocals --noUnusedParameters
```

结果：均通过。

环境说明：本次自动化环境 PATH 中找不到 `npm.cmd`，所以没有直接运行 `npm.cmd run typecheck`；已使用本地 Node 直接执行同一个 TypeScript 编译器入口。`mobile/package.json` 当前只有 `start/android/ios/web/typecheck`，没有 lint/test/build 脚本。

数据校验：

- 2026-04 seed data 实际计算值：
  - assets: 5,000,000
  - liabilities: 1,186,000
  - net worth: 3,814,000
  - income: 93,500
  - expenses: 45,600
  - profit: 47,900
  - operating cash flow: 56,900
  - investing cash flow: -64,000
  - financing cash flow: -69,200
  - cash net change: -76,300
- `historicalMonthlySnapshots` 中 2026-04 快照同样保持上述值。
- seed transactions 检查结果：交易 ID 无重复，账户/资产/负债引用无缺失。

## 5. 当前已知限制

- `operatingAnalysisReport.ts` 与 `profitabilityAnalysis.ts` 仍是静态 mock 报告，不是已接入真实 AppData 的报表引擎。
- Dashboard 内仍有部分趋势、资产/负债结构和现金流方向聚合逻辑，后续应迁到 domain/report engine。
- 当前自动化环境缺少 `npm.cmd` PATH，后续人工环境可再直接跑 `npm.cmd run typecheck`。
- 未做模拟器视觉回归截图；本轮以静态审计、TypeScript 编译和财务数据校验为主。
- 工作区仍保留未跟踪参考/交接目录：`docs/handoff/2026-05-imcfo-pdf/`、`docs/ui-reference/`、`docs/ui-snapshots/`。

## 6. 当前 Git 状态记录

本次审计提交前，工作区已有大范围移动端未提交改动。本次自动化在这些改动基础上继续审计和清理，并准备提交被当前移动端代码引用的源码文件。

提交后应重点查看：

```powershell
cd D:\imcfo
git log --oneline --decorate -8
git status --short --branch
```

本次维护提交信息预期：

```text
chore: audit and clean up mobile app
```

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
Use AGENTS.md, docs/10-current-project-context.md, and current Git state as source of truth.
Project root: D:\imcfo.
Continue the mobile MVP without changing accounting formulas, storage schema, transaction mapping, parser behavior, route keys, storage keys, or domain model fields.
Before finishing implementation tasks, run npm.cmd run typecheck inside D:\imcfo\mobile when npm.cmd is available; otherwise run local tsc through the bundled Node path.
Report final results in Chinese.
```
