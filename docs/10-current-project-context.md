# 我为 CFO 当前项目上下文快照

更新时间：2026-05-01  
当前分支：`main`，相对 `origin/main` ahead 16  
快照原因：完成一轮移动端暖色金融 UI 重构与截图验收后，按压缩上下文规则刷新。  
提交状态：本快照已按规则单独更新；当前仍有未提交的 UI 代码与截图产物，未在本快照提交中一并处理。

## 1. 项目定位

“我为 CFO”是把普通自然人的个人财务按公司经营视角组织起来的移动端 MVP。产品核心不是普通记账，而是用资产负债表、利润表、现金流量表、经营结论和个人净资产视角帮助用户理解自己的财务经营状态。

当前范围继续保持 V0.1 简单边界：

- Expo + React Native + TypeScript + AsyncStorage。
- 不新增后端、登录、数据库、云同步、AI/API、支付、税务申报、VAT、发票逻辑、个体工商户逻辑。
- 底部导航固定为：首页 / 管理 / 报表 / 我的。
- 用户可见文案保持中文。
- “我为 CFO”“经营结论”“资产负债管理”这些关键文案保持不变。

## 2. 技术栈与开发方式

- 移动端：Expo 54 + React Native 0.81 + React 19 + TypeScript strict。
- 本地存储：AsyncStorage，通过 `mobile/src/hooks/useAppData.ts` 统一读写。
- 会计与报表逻辑：`mobile/src/domain/accounting` 下的纯函数。
- 交易展示索引：`mobile/src/domain/transactions/transactionDisplayIndex.ts`。
- 当前可用脚本：`npm.cmd run web`、`npm.cmd run typecheck`。

架构边界继续保持：

- UI 屏幕不直接读写 AsyncStorage。
- 报表计算函数保持纯函数、可测试。
- UI 不发明或修改会计公式。
- 不改 storage schema、transaction mapping、自然语言解析行为、route/storage/domain key。

## 3. 本轮已完成工作

本轮主要完成“暖色中国个人金融 + CFO 仪表盘”视觉系统统一，覆盖根页和主要二/三级页面。

已完成的 UI 方向：

- `mobile/src/styles/theme.ts`：建立暖米色背景、橙色主色、白色卡片、软阴影、金额颜色、分割线、底部导航样式等 token。
- `mobile/src/components/financeUI.tsx`：新增共享 UI primitives，包括 `TopBar`、`SummaryHeroCard`、`SectionCard`、`LineListCard`、`LineListRow`、`InfoLineRow`、`AmountText`、`IconTile`、`ActionTile`、`SegmentedControl`、`SearchFilterBar`、`BottomSheetFrame`、`DangerActionButton`。
- 根页更新：
  - `DashboardScreen.tsx`：暖色首页、深色净资产 hero、经营结论、图表/结构卡片统一。
  - `RecordScreen.tsx`：记一笔主操作区、支出/收入/转账/借还分段、分类 icon chips、常用操作、账务中心。
  - `ReportsScreen.tsx`：报表详情、简易版/专业版、经营结论、资产与负债结构卡片统一。
  - `SettingsScreen.tsx`：我的页 profile/summary、常用工具、设置与管理列表。
- 二/三级页面更新：
  - `TransactionRecordsScreen.tsx`：交易记录改为搜索筛选行、月份分组卡、右对齐金额、交易详情分区卡。
  - `AccountManagementScreen.tsx`：账户管理改为总览 summary、现金与活期/信用与借记/投资账户等分组、分类详情、账户详情/新增账户底部弹层。
  - `AssetsLiabilitiesScreen.tsx`：资产负债管理保留会计科目列表结构，改为 summary、分段切换、科目行、科目详情、明细详情、暖色底部表单。
- `mobile/App.tsx`：根页与二级页入口、底部导航视觉统一。

行为保持：

- 未改会计公式。
- 未改存储 schema。
- 未改交易映射规则。
- 未改自然语言解析。
- 未新增后端、登录、云同步、支付或税务能力。
- 交易搜索/筛选/月分组折叠、账户保存/删除/对账、资产负债帮助气泡和明细操作继续走原有数据流。

## 4. 验证结果

已运行：

```powershell
cd D:\imcfo\mobile
npm.cmd run typecheck
```

结果：通过，`tsc --noEmit` 无错误。

已生成当前 UI 截图 PDF：

```text
D:\imcfo\docs\ui-snapshots\2026-05-01-warm-fintech\imcfo-ui-screenshots.pdf
```

PDF 对应截图覆盖：

- 首页
- 管理
- 报表
- 我的
- 交易记录
- 交易详情
- 账户管理
- 账户分类详情
- 账户详情弹层
- 资产负债管理
- 资产科目详情
- 资产详情

## 5. 当前已知限制与风险

- 当前工作区仍有未提交 UI 代码和截图产物，尚未形成最终 UI feature commit。
- `docs/handoff/` 为未跟踪目录，当前任务未修改其内容。
- 截图验收基于 Expo Web + Playwright/Edge 的移动视口，不能完全替代真机 Expo 预览。
- 部分长标题在交易记录中会截断，这是当前紧凑金融列表布局的预期处理，后续可按产品优先级继续优化。
- 资产详情页底部操作区在长截图中会被固定底部导航遮住一部分，真机滚动可继续验证底部 safe-area 间距。

## 6. 重要文件变动记录

当前未提交的主要文件：

- `mobile/App.tsx`
- `mobile/src/styles/theme.ts`
- `mobile/src/components/financeUI.tsx`
- `mobile/src/screens/DashboardScreen.tsx`
- `mobile/src/screens/RecordScreen.tsx`
- `mobile/src/screens/ReportsScreen.tsx`
- `mobile/src/screens/SettingsScreen.tsx`
- `mobile/src/screens/TransactionRecordsScreen.tsx`
- `mobile/src/screens/AccountManagementScreen.tsx`
- `mobile/src/screens/AssetsLiabilitiesScreen.tsx`
- `docs/ui-snapshots/2026-05-01-warm-fintech/`

## 7. 架构与数据流摘要

- 页面操作进入 `useAppData`。
- `useAppData` 调用 accounting / reconciliation / transaction rule 层生成状态变化。
- 持久化仍由 AsyncStorage adapter 负责。
- Dashboard 和 Reports 消费 domain 层计算结果，不在 UI 层拼公式。
- TransactionRecords 消费交易展示索引，UI 只负责搜索、筛选、分组展示和详情展示。
- 账户与资产负债页面只重构展示结构和弹层，不改 save/delete/reconciliation 的数据入口。

## 8. 当前 Git 状态与最近提交

当前 Git 状态：

```text
main...origin/main [ahead 16]
modified: mobile/App.tsx
modified: mobile/src/screens/AccountManagementScreen.tsx
modified: mobile/src/screens/AssetsLiabilitiesScreen.tsx
modified: mobile/src/screens/DashboardScreen.tsx
modified: mobile/src/screens/RecordScreen.tsx
modified: mobile/src/screens/ReportsScreen.tsx
modified: mobile/src/screens/SettingsScreen.tsx
modified: mobile/src/screens/TransactionRecordsScreen.tsx
modified: mobile/src/styles/theme.ts
untracked: docs/handoff/
untracked: docs/ui-snapshots/
untracked: mobile/src/components/financeUI.tsx
```

最近提交：

- `d9d8584` `fix: polish assets liabilities modal and delete flow`
- `35e73f3` `feat: convert account forms to modal sheets`
- `f55a6b2` `chore: sync current mobile refinements`
- `3c8fb60` `style: unify secondary pages with line list style`
- `74fb8a8` `style: align help caret with subject title baseline`

## 9. 常用命令

```powershell
cd D:\imcfo\mobile
npm install
npm.cmd run web -- --port 8091 --host localhost
npm.cmd run typecheck

cd D:\imcfo
git status --short --branch
git log --oneline --decorate -10
```

## 10. 下次会话建议首句

```text
Use AGENTS.md and docs/10-current-project-context.md as source of truth.
Project root: D:\imcfo.
Continue the mobile warm fintech UI work without changing accounting formulas, storage schema, transaction mapping, parser behavior, route keys, storage keys, or domain model fields.
Before finishing, run npm.cmd run typecheck inside D:\imcfo\mobile.
Report final results in Chinese.
```
