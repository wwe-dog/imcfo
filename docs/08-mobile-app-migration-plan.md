# 我为 CFO · Expo 移动端迁移计划

本文档定义从当前 Vite Web MVP foundation 迁移到 Expo + React Native + TypeScript 移动端的安全方案。

## 1. 为什么从 Vite Web 转向 Expo 移动 App

“我为 CFO”的最终产品形态是移动 App。用户记录收入、费用、资产、负债和现金流的主要场景发生在手机上，例如工资到账、日常消费、信用卡消费、还款、投资买入等。

当前 Vite Web 版本不是废弃工作。它已经完成了 V0.1 的核心领域基础：

- TypeScript 数据模型
- 报表纯计算函数
- 交易规则雏形
- seed/demo 数据
- LocalStorage 数据边界
- 5 个页面的信息架构验证

移动迁移的目标不是重写产品逻辑，而是替换展示层和存储适配层。

当前决策：

最终产品不保留 Web 版本。移动端验证通过后，可以删除根目录 Web 应用文件、`src/`、`dist/`、根目录 `node_modules/` 和 Web 版 package 配置，但必须保留 `mobile/`、`docs/`、`.codex/`、`AGENTS.md`。

## 2. 可以复用的文件

可以直接复用或轻微调整：

- `src/domain/models/*`
- `src/domain/accounting/calculations.ts`
- `src/domain/accounting/cashFlowRules.ts`
- `src/domain/accounting/transactionRules.ts`
- `src/domain/accounting/journalEntryRules.ts`
- `src/domain/reports/*`
- `src/storage/seedData.ts`
- `src/utils/formatters.ts`

这些文件是纯 TypeScript 或接近纯 TypeScript，不依赖 DOM、React Web、CSS 或 LocalStorage。

## 3. 必须替换的文件

移动端必须替换：

- `src/main.tsx`
- `src/app/App.tsx`
- `src/pages/*`
- `src/components/*`
- `src/styles/global.css`
- `src/storage/localStorage.ts`

原因：

- React Native 不使用 DOM。
- React Native 不使用 CSS 文件。
- React Native 不使用浏览器 LocalStorage。
- 移动端页面应使用 `View`、`Text`、`Pressable`、`ScrollView`、`StyleSheet` 等组件。

## 4. 推荐 Expo + React Native + TypeScript 结构

移动端放在独立目录：

```text
mobile/
  App.tsx
  package.json
  tsconfig.json
  app.json
  src/
    screens/
      DashboardScreen.tsx
      RecordScreen.tsx
      AssetsLiabilitiesScreen.tsx
      ReportsScreen.tsx
      SettingsScreen.tsx
    components/
      MetricCard.tsx
      ReportBlock.tsx
    domain/
      models/
      accounting/
      reports/
    storage/
      seedData.ts
      storageAdapter.ts
      asyncStorageAdapter.ts
    utils/
      formatters.ts
```

## 5. 如何保留领域逻辑

迁移第一阶段采用“复制复用”的方式：

1. 将 Web 版本中稳定的 `domain` 目录复制到 `mobile/src/domain`。
2. 将 `seedData.ts` 复制到 `mobile/src/storage/seedData.ts`。
3. 将格式化函数复制到 `mobile/src/utils/formatters.ts`。
4. 移动端页面只调用这些纯函数和类型，不重新写公式。

后续如果 Web 和 Mobile 都要长期维护，再把 `domain` 提升为真正的共享包，例如：

```text
packages/domain/
```

V0.1 暂不引入 monorepo，避免过度工程化。

## 6. 如何替换 LocalStorage

Web 版本：

- `localStorage.ts`
- 浏览器 LocalStorage

移动端版本：

- `storageAdapter.ts` 定义统一接口
- `asyncStorageAdapter.ts` 使用 AsyncStorage 实现

屏幕组件不得直接调用 AsyncStorage。

屏幕只能通过统一存储层加载、保存、重置、导出和导入数据。

## 7. 如何避免破坏报表计算

必须坚持：

- 报表计算函数只接收显式数据输入。
- 报表计算函数不读取 AsyncStorage。
- 报表计算函数不依赖 React Native 组件状态。
- 移动端 UI 只展示 `buildDashboardSummary`、`buildBalanceSheetSummary`、`buildIncomeStatementSummary`、`buildCashFlowStatementSummary` 的结果。
- 信用卡消费必须保持 `nonCash` 规则，不进入现金净变化。

## 8. 精确迁移顺序

1. 在移动端验证通过前，暂时保留现有 Vite Web 版本作为可复制来源。
2. 创建 `mobile/` 独立 Expo 项目。
3. 安装最小 Expo 依赖和 AsyncStorage。
4. 复制可复用领域逻辑到 `mobile/src/domain`。
5. 复制 seed 数据到 `mobile/src/storage/seedData.ts`。
6. 创建 `storageAdapter.ts` 和 `asyncStorageAdapter.ts`。
7. 创建 5 个移动端 screens。
8. 使用 `App.tsx` 做简单 state-based bottom navigation。
9. Dashboard 展示六要素。
10. Reports 展示三大报表并支持简易版/专业版切换。
11. 运行 TypeScript 检查。
12. 运行 Expo 启动检查。
13. 删除 Web 应用文件和构建产物，仅保留移动端、文档和 Codex 配置。

## 9. V0.1 不迁移的内容

以下内容不进入移动端 V0.1：

- 后端
- 登录
- 数据库
- 云同步
- AI 分析
- 支付
- API 集成
- 个体工商户
- 超级个体
- 经营所得
- 增值税
- 发票
- 正式税务申报

## 10. 当前结论

Expo 移动端应独立创建，优先复用领域模型、报表计算、交易规则和 seed 数据，只替换 UI 与存储适配层。

移动端验证通过后，Web 版本可以清理，不再作为产品形态维护。
