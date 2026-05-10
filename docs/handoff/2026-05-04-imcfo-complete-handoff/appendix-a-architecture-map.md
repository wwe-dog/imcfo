# 附录 A：架构地图

最近同步：2026-05-07  
当前分支：`wip/mobile-baseline-before-worktree`  
当前 HEAD：`4148dcb wip: snapshot current mobile state before worktree`

## 1. 当前技术栈

- Expo 54
- React Native 0.81
- React 19
- TypeScript strict
- AsyncStorage
- `@shopify/react-native-skia`
- `expo-blur`
- `react-native-reanimated`
- `react-native-worklets`
- `NotoSansSC-Regular.otf`
- 无后端、无登录、无数据库、无云同步

移动端命令入口在 `D:\imcfo\mobile\package.json`：

```powershell
cd D:\imcfo\mobile
npm.cmd install
npm.cmd run typecheck
npm.cmd run web -- --port 8091 --host localhost
npm.cmd start
npm.cmd run android
```

## 2. 关键目录

```text
mobile/
  App.tsx
  assets/
    fonts/
      NotoSansSC-Regular.otf
  babel.config.js
  src/
    app/
      useAppData.ts
    components/
      AppIcon.tsx
      financeUI.tsx
      DrilldownIncomeSankeySection.tsx
      charts/
    domain/
      models/
      accounting/
      reports/
      transactions/
    hooks/
    screens/
    storage/
    styles/
    utils/
```

## 3. 数据流

```text
Screen
  -> useAppData
  -> transactionRules / reconciliationRules
  -> asyncStorageAdapter
  -> AsyncStorage

Screen
  -> domain/reports or domain/accounting/calculations
  -> View model
  -> UI components
```

## 4. 模块职责

- `App.tsx`：页面路由、底部导航、跨页面 props 组装。
- `useAppData.ts`：应用数据门面，屏幕只通过它读写业务数据。
- `storage/*`：本地存储边界，隐藏 AsyncStorage 细节。
- `domain/models/*`：typed data model。
- `domain/accounting/calculations.ts`：基础报表公式和 Dashboard summary。
- `domain/accounting/transactionRules.ts`：交易输入到财务状态变更。
- `domain/accounting/reconciliationRules.ts`：账户和资产对账调整。
- `domain/accounting/periodFilters.ts`：报表期间过滤。
- `domain/reports/*`：三大报表与分析报告 view model。
- `domain/transactions/transactionDisplayIndex.ts`：交易记录展示索引，当前交易记录页统一依赖该入口。
- `screens/*`：页面展示、交互状态、弹层和导航。
- `components/financeUI.tsx`：WIP 共享金融 UI primitives。
- `styles/theme.ts`：当前移动端视觉 token。后续视觉治理以 `docs/standards/imcfo-visual-system.md` 的“IMCFO 暗黑液态 CFO 风格”为准。

## 5. 2026-05-07 WIP 基线

当前分支相对 `main` 新增两个 WIP 提交：

- `4ea401d`：记录大范围移动端基线，包含当时的金融 UI 基线、共享 UI primitives、经营分析/盈利能力分析页面、收入结构下钻 view model、字体和新增图形/动画依赖。当前正式视觉规则已升级为“IMCFO 暗黑液态 CFO 风格”。
- `4148dcb`：删除旧 Expo error log，清理交易记录和账户管理相关的 stale record/debug 风险。

这些提交已经在当前分支中存在，但还没有合入 `main`。接管者如果从 `main` 开始，需要先明确是否切换到 `wip/mobile-baseline-before-worktree` 或把该基线合入。

## 6. 已知架构风险

- `DashboardScreen.tsx` 内仍有部分趋势、现金流方向、资产/负债构成等聚合逻辑，后续应迁入 domain/report engine。
- `operatingAnalysisReport.ts` 和 `profitabilityAnalysis.ts` 仍按静态 mock/prototype 看待，不应被当成真实计算引擎。
- `calculateCashFlowByType` 与交易展示索引的现金流入判断存在口径漂移风险。
- 应收/应付现金流分类在文档和实现之间需要再统一。
- 当前没有自动化公式测试，最低质量门槛是 `npm.cmd run typecheck`。
- 新增 Skia、Blur、Reanimated、Worklets 应继续接受依赖必要性审查，避免为静态页面保留过重依赖。

## 7. 验证记录

2026-05-07 已运行：

```powershell
cd D:\imcfo\mobile
npm.cmd run typecheck
```

结果：通过。
