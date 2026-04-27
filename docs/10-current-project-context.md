# 我为CFO · 当前项目上下文快照

> 用途：供下次 Codex 新会话快速加载项目背景。建议新会话先阅读 `AGENTS.md`、`docs/00-project-constitution.md` 和本文档。

更新时间：2026-04-27  
当前主分支：`main`  
当前最新提交：`fcb5da6 feat: add report tab switcher on mobile reports screen`

## 1. 项目定位与关键决策

### 1.1 产品定位

“我为CFO”不是普通记账 App，而是一个把个人生活翻译成公司式财务报表的个人经营系统。

V0.1 的核心目标是让普通自然人先跑通最小个人经营闭环：

记录数据 → 归类为资产/负债/收入/费用/现金流 → 生成三大报表 → 查看个人财务全貌 → 下月优化。

### 1.2 当前用户边界

V0.1 只服务普通自然人。

当前明确不做：

- 个体工商户
- 超级个体模式
- 经营所得核算
- 增值税
- 发票管理
- 正式税务申报
- 企业法定财报
- 审计披露

### 1.3 技术决策

- 最终产品方向是移动 App，不再继续 Web 版本。
- 当前移动端使用 `Expo + React Native + TypeScript + AsyncStorage`。
- 当前没有后端、登录、数据库、云同步、支付、AI、外部 API。
- 本地数据只保存在移动端本地存储中。
- 所有屏幕不得直接调用 `AsyncStorage`，必须通过 `useAppData` 或 storage adapter。
- 报表计算函数必须保持纯函数，不能读写存储，不能依赖 UI。
- 简易版和专业版不是两套数据，只是同一套数据的两种展示语言。

### 1.4 会计底座

V0.1 专业逻辑以中国企业会计准则的基本框架为参考：

- 六大会计要素：资产、负债、所有者权益、收入、费用、利润
- 会计等式：资产 = 负债 + 所有者权益
- 利润关系：利润 = 收入 - 费用
- 现金流分类：经营活动现金流、投资活动现金流、筹资活动现金流

重要边界：这是个人经营管理工具，不是正式企业财报系统。

## 2. 当前代码架构

### 2.1 目录结构

核心移动端目录：

- `mobile/App.tsx`：App 入口、简单页面切换、状态回调接线
- `mobile/src/app/useAppData.ts`：集中式 App 数据状态与持久化更新入口
- `mobile/src/screens/`：移动端页面
- `mobile/src/components/`：通用展示组件
- `mobile/src/domain/models/`：TypeScript 数据模型
- `mobile/src/domain/accounting/`：交易规则、会计映射、报表计算基础
- `mobile/src/domain/reports/`：报表 summary 构建函数导出层
- `mobile/src/storage/`：本地存储 adapter、seed data、storage interface
- `mobile/src/utils/`：格式化工具

### 2.2 数据流

当前主数据流：

```text
Screen
  -> App callback
  -> useAppData
  -> storageAdapter
  -> AsyncStorage
  -> setData
  -> Dashboard / Reports 自动重算
```

关键原则：

- 屏幕只接收 `data` 和 callbacks。
- `useAppData` 负责加载、保存、导入、导出、重置、清空、交易保存、资产负债保存。
- `asyncStorageAdapter` 是唯一直接接触 `AsyncStorage` 的地方。
- `calculations.ts` 只做纯计算。

### 2.3 当前页面

当前移动端有 5 个页面：

- `DashboardScreen`：展示资产、负债、收入、费用、利润、所有者权益等摘要
- `RecordScreen`：保存交易，并触发首页和报表重算
- `AssetsLiabilitiesScreen`：资产与负债的新增、编辑、删除
- `ReportsScreen`：三大报表展示，支持报表切换与简易版/专业版切换
- `SettingsScreen`：本地数据导出、导入、恢复示例数据、清空本地数据

## 3. 已完成部分

### 3.1 项目规则与文档

已创建/维护：

- `AGENTS.md`
- `.codex/agents/*.toml`
- `docs/00-project-constitution.md`
- `docs/01-v0.1-product-scope.md`
- `docs/02-v0.1-page-structure.md`
- `docs/03-v0.1-data-model.md`
- `docs/04-v0.1-accounting-rules.md`
- `docs/05-v0.1-report-rules.md`
- `docs/06-v0.1-transaction-mapping.md`
- `docs/07-v0.1-implementation-roadmap.md`
- `docs/08-mobile-app-migration-plan.md`
- `docs/09-branch-merge-checklist.md`
- `docs/standards/*`
- `docs/mappings/*`

### 3.2 Git 与开发方式

当前仓库已经初始化 Git。

关键历史：

- 曾尝试 feature branch 并行开发，但空分支已清理。
- 当前临时采用 trunk-based development，直接在 `main` 上小步提交。
- 当前 `main` 是主要开发分支。

重要提交：

- `4f1e396 chore: establish mobile MVP baseline`
- `b9946d5 refactor: improve mobile data state foundation`
- `fc811c3 feat: add mobile assets and liabilities CRUD`
- `73325b2 feat: improve mobile reports detail display`
- `5cf43da feat: add mobile settings data management`
- `fcb5da6 feat: add report tab switcher on mobile reports screen`

### 3.3 移动端基础

已完成：

- Expo 移动端项目初始化
- TypeScript 配置
- AsyncStorage 本地存储
- 简单底部 tab 切换
- 本地 seed/demo data
- `npm.cmd run typecheck` 可运行

启动命令：

```powershell
cd D:\imcfo\mobile
npm.cmd start
```

类型检查命令：

```powershell
cd D:\imcfo\mobile
npm.cmd run typecheck
```

### 3.4 数据与状态基础

已完成集中状态 hook：

- `loadData`
- `saveTransaction`
- `saveAsset`
- `deleteAsset`
- `saveLiability`
- `deleteLiability`
- `resetDemoData`
- `clearAllData`
- `exportData`
- `importData`
- `replaceData`

核心文件：

- `mobile/src/app/useAppData.ts`
- `mobile/src/storage/storageAdapter.ts`
- `mobile/src/storage/asyncStorageAdapter.ts`
- `mobile/src/storage/seedData.ts`

### 3.5 交易记录

已实现 `RecordScreen` 交易保存链路。

支持的 V0.1 交易类型包括：

- `income`
- `expense`
- `assetIncrease`
- `assetDecrease`
- `liabilityIncrease`
- `liabilityDecrease`
- `investmentBuy`
- `investmentSell`
- `creditCardExpense`
- `creditCardRepayment`

交易保存后会进入本地存储，并触发 Dashboard 和 Reports 重算。

### 3.6 资产负债 CRUD

已实现：

- 新增资产
- 编辑资产
- 删除资产
- 新增负债
- 编辑负债
- 删除负债

数据更新通过 `useAppData`，不会由屏幕直接调用 storage。

当前规则：

- 资产影响总资产
- 负债影响总负债
- 所有者权益 = 总资产 - 总负债

### 3.7 报表页

已实现：

- 三大报表展示
- 简易版/专业版切换
- 报表类型切换

当前 `ReportsScreen` 交互：

1. 标题区：`三大报表总览`
2. 报表切换：`资产负债表` / `现金流量表` / `利润表`
3. 模式切换：`简易版` / `专业版`
4. 一次只显示当前选中的一张报表

默认：

- 默认报表：资产负债表
- 默认模式：简易版

### 3.8 设置页数据管理

已实现：

- 显示数据版本
- 显示存储模式：本地移动存储
- 导出完整 AppData JSON
- 粘贴 JSON 导入数据
- 恢复示例数据
- 清空本地数据

导入当前是轻量校验和归一化，不是严格业务校验。

## 4. 重要文件修改记录

### 4.1 `mobile/App.tsx`

当前职责：

- 维护当前 tab
- 调用 `useAppData`
- 将数据和回调传给各 screen
- 处理保存成功/失败提示
- 不直接调用 `AsyncStorage`

### 4.2 `mobile/src/app/useAppData.ts`

当前职责：

- 集中管理 AppData
- 统一读写 storage adapter
- 提供交易、资产、负债、导入导出、重置、清空等状态更新入口
- 计算 `summary` 供 Dashboard 使用

### 4.3 `mobile/src/storage/asyncStorageAdapter.ts`

当前职责：

- 唯一直接调用 `AsyncStorage` 的模块
- 保存分片数据字段
- 加载本地数据
- 重置为 seed data
- 清空为 empty app data
- 导出 JSON
- 导入 JSON 并做轻量归一化

### 4.4 `mobile/src/domain/accounting/calculations.ts`

当前职责：

- `calculateTotalAssets`
- `calculateTotalLiabilities`
- `calculateOwnerEquity`
- `calculateTotalIncome`
- `calculateTotalExpenses`
- `calculateProfit`
- `calculateOperatingCashFlow`
- `calculateInvestingCashFlow`
- `calculateFinancingCashFlow`
- `calculateCashNetChange`
- `calculateAssetLiabilityRatio`
- `calculateSavingsRate`
- `buildDashboardSummary`
- `buildBalanceSheetSummary`
- `buildIncomeStatementSummary`
- `buildCashFlowStatementSummary`
- `validateJournalEntryBalance`

必须保持纯函数。

### 4.5 `mobile/src/domain/accounting/transactionRules.ts`

当前职责：

- 交易类型规则
- 交易 input -> Transaction
- 交易对账户、资产、负债数组的状态变更
- 资产/负债 upsert/delete helper

### 4.6 `mobile/src/screens/AssetsLiabilitiesScreen.tsx`

当前职责：

- 资产表单
- 负债表单
- 编辑已有资产/负债
- 删除确认
- 展示资产/负债列表

### 4.7 `mobile/src/screens/ReportsScreen.tsx`

当前职责：

- 报表类型切换
- 简易版/专业版切换
- 调用已有 report summary 构建函数
- 渲染当前选中的一张报表

### 4.8 `mobile/src/screens/SettingsScreen.tsx`

当前职责：

- 本地数据导出显示
- JSON 导入输入
- 恢复示例数据确认
- 清空本地数据确认
- 显示数据版本和存储模式

## 5. 当前待办事项

### 5.1 高优先级

- 全量检查用户可见中文文案，修复可能存在的编码异常。
- 为核心报表计算函数补最小测试。
- 为交易映射规则补几个关键样例测试。
- 检查 `RecordScreen` 的交易类型与交易规则是否完全匹配 V0.1 文档。
- 明确信用卡消费、信用卡还款、投资买入/卖出的 V0.1 限制说明。

### 5.2 中优先级

- 改善 Record 表单的输入体验，例如日期、金额、账户选择。
- 增加默认分类模板。
- 增加账户管理能力。
- Settings 导入做更严格 schema 校验。
- 增加数据版本迁移机制。
- 增加清空数据后的空状态文案。

### 5.3 后续版本

- 月报/季度报/年报
- 趋势图
- 预算系统
- 成长投入分析
- 个人经营结论
- 云同步
- 登录
- AI 分析

## 6. 风险与注意事项

### 6.1 代码质量风险

- 当前主要靠 `npm.cmd run typecheck` 保底，自动化测试不足。
- 报表公式需要用固定样例验证，避免后续 UI 修改时引入计算偏差。
- `importData` 只是轻量归一化，不保证导入数据完全符合业务约束。

### 6.2 产品边界风险

后续任务不得引入：

- 后端
- 登录
- 数据库
- 云同步
- AI
- 支付
- 外部 API
- 个体工商户
- 经营所得
- 增值税
- 发票
- 正式税务申报

### 6.3 合并/分支风险

当前临时采用 trunk-based development。继续开发时建议：

1. 每次只做一个小任务。
2. 修改后运行 `npm.cmd run typecheck`。
3. 通过后立刻提交。
4. 不要混合多个功能点到一个提交。

## 7. 下次新会话建议加载顺序

建议新会话第一步阅读：

```text
AGENTS.md
docs/00-project-constitution.md
docs/10-current-project-context.md
mobile/src/app/useAppData.ts
mobile/src/domain/accounting/calculations.ts
mobile/src/domain/accounting/transactionRules.ts
```

建议新会话开场提示：

```text
Use the project instructions in AGENTS.md.
Read docs/10-current-project-context.md first.
Current branch: main.
Project root: D:\imcfo.
Mobile app path: D:\imcfo\mobile.
Continue V0.1 mobile development within the documented product and technical boundaries.
Before finishing, run npm.cmd run typecheck inside mobile.
Report final results in Chinese.
```

## 8. 当前可运行命令

安装依赖：

```powershell
cd D:\imcfo\mobile
npm.cmd install
```

启动 Expo：

```powershell
cd D:\imcfo\mobile
npm.cmd start
```

类型检查：

```powershell
cd D:\imcfo\mobile
npm.cmd run typecheck
```

查看最近提交：

```powershell
cd D:\imcfo
git log --oneline --decorate -10
```

查看工作区状态：

```powershell
cd D:\imcfo
git status
```
