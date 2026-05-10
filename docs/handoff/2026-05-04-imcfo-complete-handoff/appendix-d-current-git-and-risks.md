# 附录 D：当前 Git 状态与风险

最近同步：2026-05-07  
项目根目录：`D:\imcfo`

## 1. 当前状态

2026-05-07 同步前：

```text
## wip/mobile-baseline-before-worktree
```

- 当前分支：`wip/mobile-baseline-before-worktree`
- 当前 HEAD：`a73b2bb docs: sync handoff package with wip baseline`
- `main` 当前指向：`759fb80 docs: sync handoff package with current progress`
- 同步前工作区：干净
- 当前工作区存在未提交文档同步和既有移动端改动。本轮交接包同步只应修改交接包文档，不应修改或提交移动端业务代码。

当前分支相对 `main` 包含两个 WIP 移动端基线提交：

```text
 a73b2bb docs: sync handoff package with wip baseline
4148dcb wip: snapshot current mobile state before worktree
4ea401d wip: snapshot current mobile state before worktree
```

## 2. `main..HEAD` 主要差异

新增：

- `mobile/assets/fonts/NotoSansSC-Regular.otf`
- `mobile/babel.config.js`
- `mobile/src/components/DrilldownIncomeSankeySection.tsx`
- `mobile/src/components/financeUI.tsx`
- `mobile/src/domain/reports/incomeStructureFlow.ts`
- `mobile/src/domain/reports/operatingAnalysisReport.ts`
- `mobile/src/domain/reports/profitabilityAnalysis.ts`
- `mobile/src/screens/OperatingAnalysisReportScreen.tsx`
- `mobile/src/screens/ProfitabilityAnalysisScreen.tsx`
- `docs/handoff/2026-05-04-imcfo-complete-handoff/appendix-e-visual-system.md`

修改：

- `mobile/App.tsx`
- `mobile/package.json`
- `mobile/package-lock.json`
- `mobile/src/components/AppIcon.tsx`
- `mobile/src/domain/transactions/transactionDisplayIndex.ts`
- `mobile/src/screens/AccountManagementScreen.tsx`
- `mobile/src/screens/AssetsLiabilitiesScreen.tsx`
- `mobile/src/screens/DashboardScreen.tsx`
- `mobile/src/screens/RecordScreen.tsx`
- `mobile/src/screens/ReportsScreen.tsx`
- `mobile/src/screens/SettingsScreen.tsx`
- `mobile/src/screens/TransactionRecordsScreen.tsx`
- `mobile/src/styles/theme.ts`
- `mobile/src/utils/formatters.ts`

删除：

- `mobile/expo-start-8083.err.log`

## 3. 本次文档提交范围

只应 stage：

- `docs/handoff/2026-05-04-imcfo-complete-handoff/**`
- `docs/10-current-project-context.md`

不要在本次交接包同步中额外修改或 stage 移动端功能代码。当前移动端功能代码已经作为 WIP 基线存在于 `4ea401d` 和 `4148dcb`。

## 4. 当前风险

- 当前工作分支不是 `main`。如果协作者从 `main` 接管，会缺少 2026-05-07 的 WIP 移动端基线。
- `4ea401d` 是大范围 WIP snapshot，后续合入前应按功能边界复查，而不是直接视作精细拆分后的 feature commit。
- 经营分析和盈利能力分析仍按静态 mock/prototype 看待，尚不能宣传为真实报表引擎完成。
- Dashboard 内仍有 UI 层聚合逻辑，后续应迁移到 domain/report engine。
- 应收/应付现金流分类在文档和实现之间需要统一。
- 新增 Skia、Blur、Reanimated、Worklets、字体和 Babel 配置后，后续应确认它们对当前 MVP 的必要性与启动稳定性。
- 当前缺少自动化公式测试脚本，最低质量门槛仍是 `npm.cmd run typecheck`。
- 新增视觉方向为“IMCFO 暗黑液态 CFO 风格”。视觉升级不得自动扩大产品边界，也不得因为写成 AI 风格就默认接入真实 AI/API。

## 5. 最低验收

2026-05-07 已运行：

```powershell
cd D:\imcfo\mobile
npm.cmd run typecheck
```

结果：通过，实际执行 `tsc --noEmit`。

建议接管后继续运行：

```powershell
cd D:\imcfo
git status --short --branch
git log --oneline --decorate -10
git diff --name-status main..HEAD

cd D:\imcfo\mobile
npm.cmd run typecheck
```
