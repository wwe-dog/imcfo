# 我为CFO · 当前项目上下文快照

> 用途：供下次 Codex 新会话、上下文压缩恢复、模型切换或项目交接时快速加载。继续任何实现任务前，先读取 `AGENTS.md` 和本文档，并用当前 Git 状态核对。

更新时间：2026-04-29  
当前主分支：`main`  
当前开发模式：trunk-based development，直接在 `main` 上小步提交。  
本次快照原因：完成账户管理 drilldown 与账户详情页行为修复后，按上下文压缩恢复规则刷新。

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

## 2. 当前技术栈与开发规则

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
- `useAppData` 集中管理 AppData、加载、保存、导入、导出、重置、清空、交易、账户、资产、负债更新。
- AsyncStorage 访问集中在 storage adapter。
- 底部导航当前为：首页、管理、报表、我的。
- 首页、管理、资产负债、报表、我的相关页面能力已存在，其中资产负债不作为底部独立 tab。

核心功能：

- 首页为紧凑双视图仪表盘：`资产负债结构` 与 `收支现金流`。
- 首页默认显示 `资产负债结构`。
- 首页资产/负债构成接入当前本地资产与负债分类汇总。
- 首页资产/负债构成支持二级详情和三级分类明细钻取，不新增底部 tab。
- 首页“净资产”支持进入 `净资产详情`，展示紧凑净资产、净资产趋势和本期变化近似表。
- 资产/负债详情页 donut 图表支持外部标签、引导线和稳定 15 色配色；已移除分段点击高亮。
- 管理页支持自然语言记账、识别结果 modal、确认入账、成功 modal。
- 管理页保留手动修改 / 高级填写。
- 账户管理已进入 V0.1：账户大类总览 → 某类账户详情 → 新增账户 / 账户详情。
- 账户管理支持新增、编辑、停用、删除无交易引用账户；有交易引用的账户优先停用。
- 进入账户分类详情不会自动打开账户表单；只有点击具体账户行才进入账户详情，点击新增才进入新增账户。
- 账户详情页锁定账户类型，只允许修改账户名称、余额/欠款、启用状态和备注/用途；余额/欠款变化会先弹确认。
- 管理页“更多”和我的页均可进入账户管理。
- 记一笔账户选择只展示启用账户；收入/支出会沿现有交易入账流更新账户余额。
- 资产负债管理支持资产和负债新增、编辑、删除。
- 报表页支持资产负债表、现金流量表、利润表切换。
- 报表页支持简易版 / 专业版切换。
- 我的页支持本地数据导出、导入、恢复示例数据、清空本地数据。

高复杂度示例数据：

- `mobile/src/storage/seedData.ts` 当前为高净值自然人压力测试数据集。
- 测试日期：2026-04-30。
- 账户数：13。
- 资产数：22。
- 负债数：7。
- 交易数：30。
- 资产合计：5,000,000。
- 负债合计：1,186,000。
- 所有者权益（个人净资产）：3,814,000。
- 2026 年 4 月收入：93,500。
- 2026 年 4 月费用：45,600。
- 2026 年 4 月利润：47,900。
- 经营活动现金流：56,900。
- 投资活动现金流：-64,000。
- 筹资活动现金流：-69,200。
- 现金净变化：-76,300。
- 该数据专门测试“利润为正但现金净变化为负”的场景。
- 已补充 `cash` 账户类型，并允许资产/负债使用 V0.1 压力测试所需的中文细分分类。

## 4. 重要文件修改记录

`mobile/App.tsx`

- App 入口、页面切换、底部导航、全局数据回调。
- 当前底部导航：首页、管理、报表、我的。
- 隐藏二级页面包括资产负债管理和账户管理，不新增底部 tab。
- 已接入 safe area，避免 Android 状态栏遮挡内容。

`mobile/src/app/useAppData.ts`

- App 数据状态中心。
- 负责 load/save/reset/clear/export/import/transaction/account/asset/liability 更新。

`mobile/src/storage/asyncStorageAdapter.ts`

- 唯一直接接触 AsyncStorage 的模块。
- 屏幕层不要绕过它直接访问存储。

`mobile/src/storage/seedData.ts`

- 当前示例数据为 5,000,000 资产、1,186,000 负债、3,814,000 净资产的高复杂度测试集。
- 覆盖现金、银行卡、支付账户、货币基金、大额存单、短债、债券基金、A股、港美股、ETF、公募基金、黄金、外币、房产、车辆、保险现金价值、应收款、项目权益。
- 覆盖房贷、车贷、信用卡、消费分期、融资负债、应付款、借款。
- 覆盖工资、咨询、副业分红、投资收益、利息、房贷/车贷利息、本金偿还、日常支出、学习成长、保险、家庭支持、信用卡消费、投资买卖、资产调整、信用卡还款、融资负债偿还、朋友借款偿还、应付个税确认。
- 已安装用户需要在“我的”页执行“恢复示例数据”才能看到新数据。

`mobile/src/domain/models/account.ts`

- `AccountType` 增加 `cash`，用于现金钱包示例账户。

`mobile/src/domain/models/asset.ts`

- `AssetCategory` 保留原有基础分类，并显式增加本次压力测试所需中文细分分类。

`mobile/src/domain/models/liability.ts`

- `LiabilityCategory` 保留原有基础分类，并显式增加本次压力测试所需中文细分分类。

`mobile/src/screens/DashboardScreen.tsx`

- 首页双视图、资产/负债结构卡片、收支现金流卡片。
- 支持资产构成详情、负债构成详情、资产分类三级详情、负债分类三级详情、净资产详情。
- 图表数据按金额降序分配稳定 15 色调色板，超过 15 项时保留前 14 项并合并为“其他”。
- 表格行颜色与图表颜色保持一致。
- 已补齐新增中文资产/负债分类标签。

`mobile/src/components/charts/DonutChart.tsx`

- 基于 `react-native-svg` 的 donut 图表。
- 支持紧凑首页模式与详情页模式。
- 详情页可显示 >= 1% 分段的外部标签、金额、引导线。
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
- 账户选择只展示启用账户。

`mobile/src/screens/ReportsScreen.tsx`

- 当前一次只显示一张报表。
- 默认资产负债表，支持现金流量表和利润表切换。

`mobile/src/screens/SettingsScreen.tsx`

- 当前对应底部导航“我的”。
- 负责本地数据管理能力。
- 已增加账户管理入口。

`mobile/src/screens/AccountManagementScreen.tsx`

- 账户管理采用大类总览、分类详情、账户详情/新增账户三层结构。
- 分类详情页只展示该分类下账户列表，不会自动打开账户详情。
- 点击具体账户行进入“账户详情”。
- 账户详情页右上角为“保存”，账户类型只读，不允许切换。
- 普通账户修改当前余额时会确认“这会影响到总资产”。
- 信用卡账户修改当前欠款时会确认“这会影响到总负债”。

## 5. 当前 Git 状态与近期提交

当前分支：`main`

最新提交：

- `e7a6096 fix: convert account edit form to account detail page`
- `d0880bb fix: prevent account form from auto opening`
- `cc3a456 docs: refresh current project context snapshot`
- `a36d298 chore: add high complexity CFO demo dataset`
- `447275b docs: refresh current project context snapshot`
- `6792cda chore: expand complex demo finance data`
- `1b83de3 docs: refresh current project context snapshot`
- `d8f5e5b feat: add hierarchical account management`
- `aed37a5 docs: refresh current project context snapshot`
- `f2ca576 feat: add account management for V0.1`

本快照提交后，工作区应保持干净。继续开发前先运行：

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
- 后续补齐账户余额与资产/负债明细的双向同步规则。

中优先级：

- Settings 导入做更严格 schema 校验。
- 增加数据版本迁移机制。
- 增加默认分类模板。
- 首页净资产趋势后续接入真实历史资产负债快照。

风险：

- 当前主要依赖 `npm.cmd run typecheck` 保底，自动化测试不足。
- 详情页 donut 标签使用简单避让策略，极小屏幕或分类过多时仍可能拥挤。
- 趋势图没有独立历史快照 schema，当前主要基于交易或当前值近似生成。
- `现金钱包` 的账户类型为 `cash`，账户管理现有层级没有独立“现金”大类时可能归入其他账户显示；后续可单独优化账户大类。
- 需求中“信用卡旅行消费 9000”出现两次，为保持预期费用 45,600，本次示例数据保留一笔，并在交易备注中说明。
- `美元换汇`、`股票账户浮盈`、`自住房估值调增`、`计提应付个税` 映射为现有 `assetIncrease` / `liabilityIncrease`，用于 V0.1 压力测试，不新增交易枚举。

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
