# 我为 CFO · 当前项目上下文快照

> 用途：供下次 Codex 新会话、上下文压缩恢复、模型切换或项目交接时快速加载。继续任何实现任务前，先读取 `AGENTS.md` 和本文档，并用当前 Git 状态核对。

更新时间：2026-04-29  
当前主分支：`main`  
当前开发模式：trunk-based development，直接在 `main` 上小步提交。  
本次快照原因：完成 2023-05 至 2026-04 三年高复杂度历史示例账套后刷新上下文。

## 1. 项目定位与关键决策

“我为 CFO”不是普通记账 App，而是把个人生活翻译成公司式财务报表的个人经营系统。

V0.1 只服务普通自然人，核心闭环是：

记录数据 -> 归类为资产、负债、收入、费用、现金流 -> 生成三大报表 -> 查看个人财务全貌 -> 下月优化。

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
- `react-native-svg` 用于首页图表

开发规则：

- 每次实现后在 `D:\imcfo\mobile` 运行 `npm.cmd run typecheck`。
- 屏幕不得直接调用 `AsyncStorage`，必须通过 `useAppData` 或 storage adapter。
- 报表计算函数保持纯函数，不依赖 UI，不读写存储。
- 会计 / 报表逻辑与 UI 分离。
- 用户可见文案使用中文，技术命名可用英文。
- 不引入 Arco Web/Admin 依赖；Arco Design Pro 2.0 仅作视觉参考。

## 3. 已完成工作

文档与规则：

- `AGENTS.md`
- `.codex/agents/*.toml`
- `docs/00-project-constitution.md` 至 `docs/09-branch-merge-checklist.md`
- `docs/10-current-project-context.md`
- `references/arco-design-pro-2/*` 本地 Arco Design Pro 2.0 视觉参考归档

移动端基础：

- Expo 移动 App 已建立。
- `useAppData` 集中管理 AppData、加载、保存、导入、导出、重置、清空、交易、账户、资产、负债和对账更新。
- AsyncStorage 访问集中在 storage adapter。
- 底部导航当前为：首页、管理、报表、我的。
- Safe area 已接入，避免 Android 状态栏遮挡内容。

核心功能：

- 首页为紧凑双视图仪表盘：`资产负债结构` 和 `收支现金流`。
- 首页支持资产、负债、净资产 drilldown。
- 资产/负债详情 donut 图表支持外部标签、引导线和稳定 15 色配色。
- 管理页支持自然语言记账、识别结果 modal、确认入账、成功 modal。
- 管理页保留手动修改 / 高级填写。
- 管理页“更多”使用自定义管理中心 modal。
- 账户管理为大类总览 -> 某类账户详情 -> 新增账户 / 账户详情三层结构。
- 账户详情锁定账户类型，只允许修改名称、余额/欠款、启用状态和备注/用途。
- 修改普通账户余额会确认“影响总资产”；修改信用卡欠款会确认“影响总负债”。
- 信用卡 `creditLimit` 只作信息展示，不计入资产或负债。
- 信用卡 `currentDebt` 作为负债处理。
- 记一笔账户选择只展示启用账户。
- 信用卡还款支持付款账户 + 信用卡账户双账户选择。
- 资产负债管理支持资产和负债新增、编辑、删除。
- 报表页支持资产负债表、现金流量表、利润表切换。
- 报表页支持简易版 / 专业版切换。
- 我的页支持本地数据导出、导入、恢复示例数据、清空本地数据、账户管理入口和交易记录入口。
- 交易记录 Phase 1 已完成：只读查看交易列表、搜索、按月分组、月份折叠、账本式行布局、交易详情和筛选弹层。
- 交易记录筛选支持全部、本月、近7天、近3个月、今年、自定义日期、账户类别和资金方向。
- 对账 / 资产盘点已支持账户余额和资产估值的安全调整。

已完成的账务安全规则：

- 非现金资产调整只更新 `relatedAssetId` 指向的资产，不更新现金账户。
- 非现金负债确认只更新 `relatedLiabilityId` 指向的负债，不增加现金资产。
- 账户余额同步资产时只允许一对一账户/资产自动同步；一对多时跳过，防止覆盖多个资产明细。
- 交易入账更新负债时优先使用 `relatedLiabilityId`。
- 信用卡消费增加费用、信用卡欠款和对应负债，不减少现金，现金流为 `nonCash`。
- 信用卡还款减少付款账户现金、信用卡欠款和对应负债，不重复确认费用。
- 应收确认、应收收回、应付确认、应付支付已支持。
- 应收/应付生命周期规则缺少 `relatedAssetId` 或 `relatedLiabilityId` 时不 fallback 到随机资产/负债。

## 4. 本次最新变更

最新功能提交：

- `54d04f7 chore: add three year high complexity demo data`
- `b8318a5 feat: add collapsible transaction month sections`
- `90cdc59 feat: add transaction calendar filters`
- `cef48c7 style: soften back button appearance`
- `a6d0533 style: add arco inspired mobile icon system`
- `51764c0 feat: add read-only transaction detail page`
- `bab72b8 style: apply arco inspired mobile visual polish`

本次新增三年历史示例交易数据和当前期间交易过滤输入，未修改账务公式、交易规则、现金流规则、存储 schema 或报表计算函数。

读取的 Arco 本地参考：

- `references/arco-design-pro-2/README.md`
- `references/arco-design-pro-2/design-guidelines-for-imcfo.md`
- `references/arco-design-pro-2/reference-pages.md`
- `references/arco-design-pro-2/imcfo-usage-rules.md`

本次最新交易记录筛选覆盖：

- `mobile/src/storage/historicalDemoData.ts`：新增 36 个月历史快照（2023-05 至 2026-04）和历史交易生成器；生成 2023-05 至 2026-03 历史交易，保留 2026-04 原始高复杂度交易。
- `mobile/src/storage/seedData.ts`：恢复示例数据现在加载三年历史交易，共 36 个月、约 1054 笔交易；2026-04 资产、负债、利润表和现金流期望值保持不变。
- `mobile/src/domain/accounting/periodFilters.ts`：新增按 `currentPeriod` 过滤交易的 helper，供摘要和报表输入使用，避免历史交易污染当前月报表。
- `mobile/src/app/useAppData.ts` 与 `mobile/App.tsx`：仪表盘摘要和报表页使用当前期间交易输入；交易记录页仍显示完整历史交易。
- `mobile/src/screens/TransactionRecordsScreen.tsx`：时间筛选新增“近3个月”和“今年”，便于验证三年历史账套。
- `mobile/src/screens/TransactionRecordsScreen.tsx`：月份分组标题改为全宽浅灰可点击行，右侧用展开/折叠符号提示状态。
- `mobile/src/screens/TransactionRecordsScreen.tsx`：新增 `collapsedMonths` 本地状态，每个月份可独立折叠；新出现月份默认展开，搜索/筛选后的月份分组继续正常更新。
- `mobile/src/screens/TransactionRecordsScreen.tsx`：漏斗按钮从原生 Alert 占位改为自定义筛选面板，支持 backdrop 和 Android back 关闭。
- `mobile/src/screens/TransactionRecordsScreen.tsx`：新增时间筛选（全部、本月、近7天、自定义）、自定义月历范围选择、账户类别筛选和资金方向筛选。
- `mobile/src/screens/TransactionRecordsScreen.tsx`：自定义日历支持先选起始日、再选结束日、反向选择自动重排、同日二次点击清空、完整范围后再次点击重开新范围。
- `mobile/src/screens/TransactionRecordsScreen.tsx`：关键词搜索与筛选条件采用 AND 逻辑，过滤后按月分组自动更新；筛选仅影响列表展示，不修改交易数据。
- `mobile/src/screens/TransactionRecordsScreen.tsx`：漏斗按钮在存在筛选条件时显示激活状态。

近期视觉 / 图标 / 详情覆盖：

- `mobile/src/screens/TransactionRecordsScreen.tsx`：交易记录行点击后进入 `交易详情` 只读页，支持基础信息、会计影响、现金流、关联对象四个分区；不提供编辑、删除、撤销或冲销操作。
- `mobile/App.tsx`：向交易记录页传入 `assets` 和 `liabilities`，用于只读解析关联资产和关联负债名称。
- `mobile/src/components/AppIcon.tsx`：新增基于 `react-native-svg` 的项目内语义化线性图标组件，不引入 Arco Web 或 Expo 图标依赖。
- `references/arco-design-pro-2/icon-usage-notes.md`：记录图标使用边界，说明当前没有直接复制 Arco 图标包运行时代码。
- `mobile/App.tsx`：底部导航接入首页、管理、报表、我的图标。
- `mobile/src/screens/RecordScreen.tsx`：管理中心 modal 条目接入账户、资产、对账、交易记录图标。
- `mobile/src/screens/TransactionRecordsScreen.tsx`：搜索框使用搜索图标，筛选按钮使用独立 funnel 图标，不使用“筛”字按钮。
- `mobile/src/screens/AccountManagementScreen.tsx`：账户分类、返回、新增和启用/停用状态接入统一图标。
- `mobile/src/screens/DashboardScreen.tsx`：首页资产、负债、净资产、现金流指标和周期按钮接入统一图标。
- `mobile/src/screens/ReportsScreen.tsx`：三大报表切换按钮接入统一图标。
- `mobile/src/screens/SettingsScreen.tsx`：我的页入口列表接入统一图标。
- `mobile/src/styles/theme.ts`：增加 `surfaceElevated`、`divider`、浅蓝 token，收敛卡片、按钮、输入框、chip、文字层级和阴影。
- `mobile/App.tsx`：根内容边距、顶部品牌栏、底部导航密度和阴影更轻。
- `mobile/src/screens/DashboardScreen.tsx`：首页指标 pill、图表卡片、趋势区和详情页表格密度更统一。
- `mobile/src/screens/RecordScreen.tsx`：一句话记账、表单、成功/提示框和管理中心 modal 更紧凑。
- `mobile/src/screens/TransactionRecordsScreen.tsx`：账本行、搜索工具栏、分组列表视觉更接近紧凑 ledger。
- `mobile/src/screens/AccountManagementScreen.tsx`：账户分类、账户列表、详情表单和 modal 视觉统一。
- `mobile/src/screens/AssetsLiabilitiesScreen.tsx`：资产/负债列表、摘要面板和操作按钮统一。
- `mobile/src/screens/ReportsScreen.tsx` 与 `mobile/src/components/ReportBlock.tsx`：报表卡片、报表行和模式切换更像结构化财务数据卡。
- `mobile/src/screens/SettingsScreen.tsx`：我的页入口列表、数据管理面板和头像区更紧凑。

## 5. 高复杂度示例数据

`mobile/src/storage/seedData.ts` 与 `mobile/src/storage/historicalDemoData.ts` 当前组成高净值自然人压力测试数据集。

覆盖期间：2023-05 至 2026-04，共 36 个月、约 1054 笔交易。  
最终测试日期：2026-04-30。

期望值：

- 资产合计：5,000,000
- 负债合计：1,186,000
- 所有者权益（个人净资产）：3,814,000
- 2026 年 4 月收入：93,500
- 2026 年 4 月费用：45,600
- 2026 年 4 月利润：47,900
- 经营活动现金流：56,900
- 投资活动现金流：-64,000
- 筹资活动现金流：-69,200
- 现金净变化：-76,300

本次三年历史数据扩展后已重新核对，以上 2026-04 当前期间值仍然匹配。

## 6. 重要文件职责

`mobile/App.tsx`

- App 入口、页面切换、底部导航、全局数据回调。
- 隐藏二级页面包括资产负债管理、账户管理和交易记录。

`mobile/src/app/useAppData.ts`

- App 数据状态中心。
- 负责 load/save/reset/clear/export/import/transaction/account/asset/liability/reconciliation 更新。
- 摘要计算前会按 `currentPeriod` 过滤交易，避免多年历史交易污染当前期间利润表和现金流量表。

`mobile/src/domain/accounting/periodFilters.ts`

- 只负责按报表期间过滤交易输入，不改变报表计算公式。

`mobile/src/domain/accounting/transactionRules.ts`

- 交易类型映射、交易入账、账户/资产/负债 upsert/delete/disable helper。
- 保持核心交易规则，不直接处理 UI。

`mobile/src/domain/accounting/reconciliationRules.ts`

- 手动对账 / 资产盘点领域规则。
- 负责差额计算、差额原因、调整交易生成和安全同步。

`mobile/src/domain/accounting/calculations.ts`

- 核心报表计算函数。
- 必须保持纯函数。

`mobile/src/screens/DashboardScreen.tsx`

- 首页双视图、资产/负债/净资产 drilldown、图表展示。

`mobile/src/screens/RecordScreen.tsx`

- 当前“管理”根页面。
- 自然语言记账、手动高级填写和管理中心 modal。

`mobile/src/screens/AccountManagementScreen.tsx`

- 账户管理三层结构和账户对账入口。

`mobile/src/screens/AssetsLiabilitiesScreen.tsx`

- 资产和负债 CRUD，资产估值更新入口。

`mobile/src/screens/TransactionRecordsScreen.tsx`

- 只读交易记录中心。
- 支持搜索、筛选弹层、本月/近7天/近3个月/今年/自定义日期范围、账户类别筛选、资金方向筛选、按月分组、月份折叠、账本式交易行和只读详情。

`mobile/src/storage/seedData.ts`

- 当前高复杂度示例账套，最终资产负债表仍以 2026-04-30 静态资产/负债为准。
- 用户需要在“我的”页执行“恢复示例数据”才能加载最新示例数据。

`mobile/src/storage/historicalDemoData.ts`

- 三年历史示例账套生成器。
- 包含 36 个月月度快照和历史交易模板，用于交易记录、筛选、折叠月份和趋势类页面压力测试。

## 7. 待办事项与风险

高优先级：

- 给核心报表计算函数补最小自动化测试。
- 给交易映射、应收/应付、对账规则补关键样例测试。
- 梳理交易记录编辑/删除/冲销是否进入 V0.1。
- 完善账户余额与资产/负债明细的更完整双向同步规则。

中优先级：

- Settings 导入做更严格 schema 校验。
- 增加数据版本迁移机制。
- 增加默认分类模板。
- 首页净资产趋势后续接入真实历史资产负债快照。
- 对账 / 资产盘点可做独立管理页，目前主要入口在账户详情和资产列表。

风险：

- 当前主要依赖 `npm.cmd run typecheck` 保底，自动化测试不足。
- 趋势图没有独立历史快照 schema，当前主要基于交易或当前值近似生成。
- 对账规则已经避免随机 fallback，但如果资产/负债缺少明确关联，系统只会更新可确认目标。
- 普通账户若关联多个资产，不会自动覆盖多个资产，用户需要到资产明细中分别更新。
- 投资分红现金流当前按 V0.1 个人财务适配口径计入经营活动现金流，未来可按更严格准则扩展。
- 信用卡退款/冲正当前作为安全负债调减处理，尚未实现费用冲减模型。

## 8. 本次验证结果

已运行：

```powershell
cd D:\imcfo\mobile
npm.cmd run typecheck
```

结果：通过。

已核对高复杂度示例账套：

- 资产：5,000,000，匹配。
- 负债：1,186,000，匹配。
- 所有者权益：3,814,000，匹配。
- 收入：93,500，匹配。
- 费用：45,600，匹配。
- 利润：47,900，匹配。
- 经营活动现金流：56,900，匹配。
- 投资活动现金流：-64,000，匹配。
- 筹资活动现金流：-69,200，匹配。
- 现金净变化：-76,300，匹配。

## 9. 常用命令

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

## 10. 下次新会话建议开场提示

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
