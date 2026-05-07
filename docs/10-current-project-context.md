# 我为 CFO 当前项目上下文快照

更新时间：2026-05-07  
项目根目录：`D:\imcfo`  
移动端目录：`D:\imcfo\mobile`  
当前分支：`wip/mobile-baseline-before-worktree`  
当前 HEAD：`4148dcb wip: snapshot current mobile state before worktree`  
`main` 当前指向：`759fb80 docs: sync handoff package with current progress`  
快照原因：把当前 WIP 移动端基线同步进完整交接包，避免后续会话只看到 `main` 上的旧交接状态。

## 1. 项目定位与边界

“我为 CFO”是把普通自然人的个人财务按公司经营视角组织起来的移动端 MVP。它不是普通记账 App，而是用资产负债表、利润表、现金流量表、经营结论和个人净资产视角帮助用户理解自己的财务经营状态。

当前 V0.1 边界继续保持：

- Expo + React Native + TypeScript + AsyncStorage。
- 底部导航固定为：首页 / 管理 / 报表 / 我的。
- 用户可见文案保持中文。
- 不新增后端、登录、数据库、云同步、AI/API、支付、税务申报、VAT、发票逻辑、个体工商户逻辑。
- 不改项目宪法、会计政策、交易规则、现金流规则、storage schema、route/storage/domain key。

## 2. 当前技术栈与架构

- 移动端：Expo 54 + React Native 0.81 + React 19 + TypeScript strict。
- 本地存储：AsyncStorage，通过 `mobile/src/app/useAppData.ts` 统一读写。
- 会计与报表逻辑：`mobile/src/domain/accounting` 下的纯函数和状态变更规则。
- 三大报表：`mobile/src/domain/reports/balanceSheet.ts`、`incomeStatement.ts`、`cashFlowStatement.ts` 当前 re-export `calculations.ts` builder。
- WIP UI/图形依赖：`@shopify/react-native-skia`、`expo-blur`、`react-native-reanimated`、`react-native-worklets`。
- 字体与构建配置：新增 `mobile/assets/fonts/NotoSansSC-Regular.otf` 和 `mobile/babel.config.js`。

架构边界继续保持：

- UI 屏幕不直接读写 AsyncStorage。
- 报表计算函数保持纯函数、可测试。
- UI 不发明或修改会计公式。
- 移动端存储适配与报表计算函数分离。

## 3. 当前 WIP 基线

当前分支是 `wip/mobile-baseline-before-worktree`，不是 `main`。如果新会话从 `main` 开始，需要先切到该分支或合并对应提交，否则会看不到当前移动端基线。

相对 `main`，当前分支包含两个 WIP 提交：

- `4ea401d wip: snapshot current mobile state before worktree`  
  记录大范围移动端 WIP 基线，包括暖色金融 UI、共享 `financeUI` primitives、新经营分析/盈利能力分析页面、收入结构下钻 view model、NotoSansSC 字体、Expo babel 配置和新增动画/图形依赖。
- `4148dcb wip: snapshot current mobile state before worktree`  
  做提交前清理：删除旧 Expo error log，清理交易展示索引、交易记录页和账户管理页中的 stale detail/debug 风险与冗余代码。

`main..HEAD` 涉及的主要移动端文件：

- 修改：`mobile/App.tsx`、`mobile/package.json`、`mobile/package-lock.json`、多个 screen、`theme.ts`、`formatters.ts`、`transactionDisplayIndex.ts`。
- 新增：`mobile/src/components/financeUI.tsx`、`DrilldownIncomeSankeySection.tsx`、`mobile/src/domain/reports/incomeStructureFlow.ts`、`operatingAnalysisReport.ts`、`profitabilityAnalysis.ts`、`OperatingAnalysisReportScreen.tsx`、`ProfitabilityAnalysisScreen.tsx`、NotoSansSC 字体、`babel.config.js`。
- 删除：`mobile/expo-start-8083.err.log`。

## 4. 功能完成度记录

当前可视功能方向：

- 首页：净资产与经营结论 dashboard、现金流/资产结构摘要、分析入口。
- 管理页：记一笔、财务中心、账户/资产负债/交易入口。
- 交易记录：搜索、筛选、月份分组、详情页，当前已统一依赖 `transactionDisplayIndex`。
- 账户管理：账户总览、分类详情、账户详情、新增/编辑、对账。
- 资产负债管理：资产/负债分段、科目列表、明细、编辑、删除确认。
- 报表：三大报表、简易/专业模式、完整报表面板。
- 经营分析报告、盈利能力分析：已形成页面与 view model 雏形，但仍按静态 mock/prototype 对待，不能写成真实报表引擎完成。
- 我的/设置：个人摘要、工具、设置、数据管理。

重要限制：

- `operatingAnalysisReport.ts` 与 `profitabilityAnalysis.ts` 仍不是已接入真实 AppData 的完整报表引擎。
- Dashboard 内仍有部分趋势、资产/负债结构和现金流方向聚合逻辑留在 UI 层，后续应迁移到 domain/report engine。
- 当前没有自动化公式测试脚本，最低质量门槛仍是 TypeScript typecheck。

## 5. 验证结果

已在 2026-05-07 运行：

```powershell
cd D:\imcfo\mobile
npm.cmd run typecheck
```

结果：通过，实际执行脚本为 `tsc --noEmit`。

## 6. 当前 Git 状态

同步前状态：

```text
## wip/mobile-baseline-before-worktree
```

工作区在文档同步前是干净的。本文档同步只应修改：

- `docs/10-current-project-context.md`
- `docs/handoff/2026-05-04-imcfo-complete-handoff/**`

不要把移动端功能代码混入本次文档同步提交；它们已经在当前 WIP 分支的 `4ea401d` 与 `4148dcb` 中作为基线存在。

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
git diff --name-status main..HEAD
```

## 8. 下次会话建议首句

```text
Use AGENTS.md, docs/10-current-project-context.md, and current Git state as source of truth.
Project root: D:\imcfo.
Work from branch wip/mobile-baseline-before-worktree unless the user explicitly asks to return to main.
Continue the mobile MVP without adding backend, login, cloud sync, payment, AI/API, tax, VAT, invoice, or individual-business logic.
Do not change accounting formulas, storage schema, transaction mapping, parser behavior, route keys, storage keys, or domain model fields unless explicitly requested.
Before finishing implementation tasks, run npm.cmd run typecheck inside D:\imcfo\mobile.
Report final results in Chinese.
```
