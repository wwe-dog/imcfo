# 我为CFO · 当前项目上下文快照

> 用途：供下次 Codex 新会话、上下文压缩后恢复、或项目交接时快速加载。继续任何实现任务前，先读取 `AGENTS.md` 和本文档，并用当前 Git 状态核对。

更新时间：2026-04-29  
当前主分支：`main`  
当前开发模式：trunk-based development，直接在 `main` 上小步提交。  
本次快照原因：完成 V0.1 层级账户管理后，按上下文压缩恢复规则刷新。

## 1. 项目定位与关键决策

“我为CFO”不是普通记账 App，而是把个人生活翻译成公司式财务报表的个人经营系统。

V0.1 只服务普通自然人，核心闭环是：

记录数据 → 归类为资产、负债、收入、费用、现金流 → 生成三大报表 → 查看个人财务全貌 → 下月优化。

当前明确不做：

- 后端、登录、数据库、云同步、支付、会员、AI、外部 API。
- 个体工商户、超级个体、经营所得、增值税、发票、正式税务申报。
- 企业法定财报、审计披露、正式对外报表。

专业账务逻辑以中国企业会计准则的基础框架为底座：

- 六大会计要素：资产、负债、所有者权益、收入、费用、利润。
- 基础等式：资产 = 负债 + 所有者权益。
- 利润关系：利润 = 收入 - 费用。
- 现金流分类：经营活动现金流、投资活动现金流、筹资活动现金流。

## 2. 当前技术栈与开发模式

当前产品方向是移动 App，不继续 Web 版本。

技术栈：

- Expo
- React Native
- TypeScript
- AsyncStorage
- 本地状态与本地存储
- `react-native-svg` 用于首页图表

开发规则：

- 每次实现后在 `D:\imcfo\mobile` 运行 `npm.cmd run typecheck`。
- 屏幕不得直接调用 `AsyncStorage`，必须通过 `useAppData` 或 storage adapter。
- 报表计算函数保持纯函数，不依赖 UI，不读写存储。
- 用户可见文案使用中文，技术命名可用英文。

## 3. 已完成部分

文档与规则：

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
- `docs/10-current-project-context.md`

移动端基础：

- Expo 移动 App 已建立。
- `useAppData` 集中管理 AppData、加载、保存、导入、导出、重置、清空。
- AsyncStorage 访问集中在 storage adapter。
- 底部导航当前为：首页、管理、报表、我的。
- 首页、管理、资产负债、报表、我的相关页面能力已存在，其中资产负债不作为底部独立 tab。

核心功能：

- 首页为紧凑双视图仪表盘：`资产负债结构` 与 `收支现金流`。
- 首页默认显示 `资产负债结构`。
- 首页资产/负债构成已接入当前本地资产与负债分类汇总。
- 首页收支趋势已接入当前交易数据，并支持周线、月线、季度线、年线切换。
- 首页资产/负债构成支持二级详情和三级分类明细钻取，不新增底部 tab。
- 首页“净资产”支持进入 `净资产详情`，展示紧凑净资产、净资产趋势和本期变化近似表。
- 资产/负债详情页 donut 图表支持外部标签、引导线和稳定 15 色配色；已移除分段点击高亮。
- 管理页支持自然语言记账、识别结果 modal、确认入账、成功 modal。
- 管理页保留手动修改 / 高级填写。
- 账户管理已进入 V0.1：采用“账户大类总览 → 某类账户详情 → 新增/编辑账户”的层级结构，不新增底部 tab。
- 账户大类包括银行卡、微信钱包、支付宝、证券账户、基金账户、信用卡、其他账户。
- 账户管理支持新增、编辑、停用、删除无交易引用账户；有交易引用的账户优先停用。
- 管理页“更多”和我的页均可进入账户管理。
- 记一笔账户选择只展示启用账户；收入/支出会沿现有交易入账流更新账户余额。
- 资产负债管理能力已支持资产和负债新增、编辑、删除。
- 报表页支持资产负债表、现金流量表、利润表切换。
- 报表页支持简易版 / 专业版切换。
- 我的页支持本地数据导出、导入、恢复示例数据、清空本地数据。

## 4. 重要文件修改记录

`mobile/App.tsx`

- App 入口、页面切换、底部导航、全局数据回调。
- 当前底部导航：首页、管理、报表、我的。
- 隐藏二级页面包括资产负债管理和账户管理，不新增底部 tab。
- 已接入 safe area，避免 Android 状态栏遮挡内容。

`mobile/src/app/useAppData.ts`

- App 数据状态中心。
- 负责 load/save/reset/clear/export/import/transaction/account/asset/liability 更新。

`mobile/src/screens/AccountManagementScreen.tsx`

- V0.1 账户管理页。
- 当前结构为账户大类总览、账户分类详情、新增/编辑表单。
- 二级总览展示各账户大类金额、账户数量和入口。
- 三级分类详情展示具体账户、余额/欠款、启用状态、备注/用途。
- 支持账户新增、编辑、停用、删除无交易引用账户。
- 信用卡账户支持可选信用额度、当前欠款、账单日、还款日。
- 有交易引用的账户优先停用，避免破坏历史数据。

`mobile/src/storage/asyncStorageAdapter.ts`

- 唯一直接接触 AsyncStorage 的模块。
- 屏幕层不要绕过它直接访问存储。

`mobile/src/screens/DashboardScreen.tsx`

- 首页双视图切换、资产/负债结构卡片、收支现金流卡片。
- 支持资产构成详情、负债构成详情、资产分类三级详情、负债分类三级详情。
- 图表数据按金额降序分配稳定 15 色调色板，超过 15 项时保留前 14 项并合并为“其他”。
- 表格行颜色与图表颜色保持一致。

`mobile/src/components/charts/DonutChart.tsx`

- 基于 `react-native-svg` 的 donut 图表。
- 支持紧凑首页模式与详情页模式。
- 详情页可显示 >= 1% 分段的外部标签、金额、引导线和点击高亮。
- 入口旋转动画使用 React Native Animated，不新增重型依赖。

`mobile/src/components/charts/LineChart.tsx`

- 基于 `react-native-svg` 的轻量折线图。

`mobile/src/domain/accounting/calculations.ts`

- 核心计算函数，包括总资产、总负债、所有者权益、收入、费用、利润、现金流、资产负债率、储蓄率等。
- 必须保持纯函数。

`mobile/src/domain/accounting/transactionRules.ts`

- 交易类型映射、交易入账、账户/资产/负债 upsert/delete/disable helper。
- 收入和支出会更新所选账户余额；信用卡消费会增加信用卡账户欠款。

`mobile/src/domain/accounting/naturalLanguageParser.ts`

- 本地规则解析器。
- 支持金额、日期、交易类型、分类、现金流类别、会计影响提示。
- 不使用 AI API，不做网络调用。

`mobile/src/screens/RecordScreen.tsx`

- 当前“管理”根页面。
- 主入口是“一句话记账”。
- `更多` 提供账户管理、资产负债管理、交易记录入口，其中部分仍是占位。
- 账户选择只展示启用账户；无可用账户时提示先进入账户管理新增或启用账户。

`mobile/src/screens/ReportsScreen.tsx`

- 当前一次只显示一张报表。
- 默认资产负债表，支持现金流量表和利润表切换。

`mobile/src/screens/SettingsScreen.tsx`

- 当前对应底部导航“我的”。
- 负责本地数据管理能力。
- 已增加账户管理入口。

## 5. 当前 Git 状态与近期提交

当前分支：`main`

最新功能提交：

- `d8f5e5b feat: add hierarchical account management`
- `f2ca576 feat: add account management for V0.1`
- `39c7c64 feat: add net worth detail drilldown`
- `03533b3 style: soften net worth metric card color`
- `81579bc fix: remove donut segment highlight interaction`
- `d1ac72d docs: refresh current project context snapshot`
- `569f9d1 fix: show detail donut labels and stable chart colors`

本快照提交后，工作区应保持干净。如继续开发，请先运行：

```powershell
cd D:\imcfo
git status
```

## 6. 待办事项与风险

高优先级：

- 给核心报表计算函数补最小测试。
- 给交易映射规则补关键样例测试。
- 检查自然语言解析对“股票盈利”“分红”“朋友还我”等边界句子的处理。
- 梳理交易记录页是否进入 V0.1。
- 后续补全信用卡还款的“双账户”选择：付款账户 + 信用卡账户。
- 后续补齐账户类型迁移：旧本地数据中的 `cash`/`investment` 目前在账户管理显示层兼容归入其他账户/基金账户。

中优先级：

- Settings 导入做更严格 schema 校验。
- 增加数据版本迁移机制。
- 增加默认分类模板。
- 首页净资产趋势后续接入真实历史资产负债快照。
- 账户余额与资产/负债明细的双向同步仍较轻量，后续需要更明确的账户-资产映射规则。

风险：

- 当前主要依赖 `npm.cmd run typecheck` 保底，自动化测试不足。
- 详情页 donut 标签使用简单避让策略，在极小屏幕或分类过多时仍可能拥挤。
- PowerShell 默认编码可能导致终端显示中文乱码；应优先用 UTF-8 方式读取文件核实。
- 上下文快照 skill 无法真正挂接 Codex 内部压缩事件，只能通过 skill metadata、`AGENTS.md` 规则和恢复流程提高命中率。

## 7. 架构与数据流摘要

数据流：

用户操作屏幕 → 调用 App/useAppData 回调 → storage adapter 保存 → App state 更新 → Dashboard/Reports 基于最新数据重新计算并渲染。

边界：

- UI 层只展示和触发回调。
- `useAppData` 管理应用状态和本地持久化入口。
- storage adapter 负责 AsyncStorage。
- domain/accounting 和 domain/reports 负责纯计算与映射，不读写存储。
- 屏幕不得直接调用 AsyncStorage。

## 8. 常用命令

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

查看 Git 状态：

```powershell
cd D:\imcfo
git status
```

查看最近提交：

```powershell
cd D:\imcfo
git log --oneline --decorate -10
```

## 9. 下次新会话建议开场提示

```text
Use the project instructions in AGENTS.md.
Use the imcfo-context-snapshot skill.
Read docs/10-current-project-context.md first.
Current branch: main.
Project root: D:\imcfo.
Mobile app path: D:\imcfo\mobile.
Continue V0.1 mobile development within the documented product and technical boundaries.
Before finishing, run npm.cmd run typecheck inside mobile.
Report final results in Chinese.
```
