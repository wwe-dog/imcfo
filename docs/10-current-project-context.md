# 我为 CFO 当前项目上下文快照

更新时间：2026-04-29  
当前分支：`main`  
开发模式：trunk-based development，直接在 `main` 上小步提交。  
本次快照原因：完成交易记录页首屏打开性能优化后刷新上下文，便于后续压缩/恢复。

## 1. 项目定位与边界

“我为 CFO”是面向普通自然人的个人经营系统，不是普通记账 App。产品把个人生活数据翻译成公司式财务视角，核心是资产负债表、利润表、现金流量表、简单/专业报告模式，以及月度/季度/年度报告。

当前 V0.1 明确不做：后端、登录、数据库、云同步、AI/API、支付、会员、银行/券商真实接口、个体工商户、VAT、发票、正式税务申报、企业法定财报。

关键规则：
- 用户可见文案保持中文。
- 会计/报表逻辑必须和 UI 分离。
- 报表计算函数保持纯函数、可测试。
- 屏幕不得直接调用 `AsyncStorage`，必须通过 `useAppData` 和 storage adapter。
- 不随意新增依赖。

## 2. 技术栈

- Expo
- React Native
- TypeScript
- AsyncStorage
- `react-native-svg` 用于移动端图表和项目内语义图标

常用命令：

```powershell
cd D:\imcfo\mobile
npm.cmd run typecheck
```

```powershell
cd D:\imcfo
git status
git log --oneline --decorate -10
```

## 3. 当前主要功能状态

- 底部导航：`首页 / 管理 / 报表 / 我的`。
- 首页：支持 `收支现金流 / 资产负债结构` 双视图，资产、负债、净资产 drilldown，SVG donut/line 图表。
- 管理页：一句话记账、识别结果 modal、确认入账成功 modal、手动高级填写、管理中心 modal。
- 账户管理：账户大类总览 -> 分类详情 -> 账户详情/新增账户；账户类型详情页只读，余额/欠款修改有确认。
- 资产负债管理：支持资产/负债 CRUD 和资产估值更新入口。
- 报表：资产负债表、利润表、现金流量表，简单/专业模式。
- 我的：数据导出/导入、恢复示例数据、清空本地数据、账户管理和交易记录入口。
- 对账/资产盘点：支持账户余额和资产市值的安全调整。
- 交易记录：只读交易中心，支持搜索、筛选面板、自定义日期范围、账户类别/资金方向筛选、按月分组、月份折叠、交易详情页。

## 4. 最近完成的工作

最新提交：
- `1be2dc1 perf: reduce transaction records initial load lag`
- `ec6dbe5 perf: optimize transaction records list rendering`
- `7c6cddc style: animate transaction month collapse`
- `54d04f7 chore: add three year high complexity demo data`

本次性能优化范围：
- 文件：`mobile/src/screens/TransactionRecordsScreen.tsx`
- 使用 `InteractionManager.runAfterInteractions` 延后构建交易显示记录，避免进入交易记录页前同步排序/分组/格式化 1000+ 条交易。
- 新增页面级 `TransactionDisplayRecord`，预计算 title、amountText、cashStatus、dateTime、monthKey、monthLabel、searchableText、accountTypeBuckets、timestamp。
- 首屏先显示标题、搜索栏、筛选按钮和“正在整理交易记录...”占位，再挂载 SectionList。
- 默认仅最新月份展开，历史月份默认折叠，减少首屏渲染行数。
- SectionList 首批渲染参数下调：`initialNumToRender=14`、`maxToRenderPerBatch=18`、`updateCellsBatchingPeriod=60`、`windowSize=7`，Android 开启 `removeClippedSubviews`。
- 搜索、筛选、自定义日期、月份折叠和交易详情入口保持不变。

## 5. 高复杂度示例数据

示例数据位于：
- `mobile/src/storage/seedData.ts`
- `mobile/src/storage/historicalDemoData.ts`

当前包含 2023-05 至 2026-04 的 36 个月历史数据，约 1000+ 条交易，用于测试交易记录、筛选、月份折叠、趋势和高净值财务复杂度。

2026-04 期望值必须保持：
- 资产：5,000,000
- 负债：1,186,000
- 净资产：3,814,000
- 收入：93,500
- 费用：45,600
- 利润：47,900
- 经营活动现金流：56,900
- 投资活动现金流：-64,000
- 筹资活动现金流：-69,200
- 现金净变化：-76,300

## 6. 重要文件职责

- `mobile/App.tsx`：App 入口、页面切换、底部导航、二级页面入口。
- `mobile/src/app/useAppData.ts`：集中管理 AppData、加载/保存/恢复/导入/导出、交易/账户/资产/负债/对账更新。
- `mobile/src/domain/accounting/calculations.ts`：核心报表计算，必须保持纯函数。
- `mobile/src/domain/accounting/transactionRules.ts`：交易入账和账户/资产/负债同步规则。
- `mobile/src/domain/accounting/reconciliationRules.ts`：对账/资产盘点调整规则。
- `mobile/src/domain/accounting/periodFilters.ts`：按当前报告期过滤交易，避免历史交易污染当前期报表。
- `mobile/src/screens/TransactionRecordsScreen.tsx`：交易记录列表、筛选、月份折叠、交易详情和性能优化。
- `mobile/src/screens/AccountManagementScreen.tsx`：账户管理层级页面和账户详情。
- `mobile/src/screens/DashboardScreen.tsx`：首页仪表盘与资产/负债/净资产 drilldown。
- `mobile/src/screens/RecordScreen.tsx`：管理页、记账和管理中心 modal。

## 7. 待办与风险

高优先级：
- 为核心报表计算函数补最小自动化测试。
- 为交易规则、应收/应付、对账规则补关键样例测试。
- 评估交易记录编辑/删除/反向冲销是否进入 V0.1。
- 完善账户余额与资产/负债明细的双向同步边界。

已知风险：
- 当前主要依赖 `npm.cmd run typecheck` 保底，自动化测试不足。
- 趋势图尚无独立历史快照 schema，部分趋势仍依赖现有数据或近似。
- 对账规则不会随机 fallback 到任意资产/负债；缺少明确关联时只更新可确认目标。
- 普通账户一对多关联资产时不会自动覆盖多个资产，需用户进入资产明细分别更新。

## 8. 当前验证

最近一次实现后已运行：

```powershell
cd D:\imcfo\mobile
npm.cmd run typecheck
```

结果：通过。

## 9. 当前 Git 状态

刷新本快照前的最近提交：

```text
1be2dc1 perf: reduce transaction records initial load lag
1edb2a5 docs: refresh current project context snapshot
ec6dbe5 perf: optimize transaction records list rendering
7c6cddc style: animate transaction month collapse
54d04f7 chore: add three year high complexity demo data
```

本快照应作为单独文档提交，不应混入功能代码。

## 10. 下次会话建议开场

```text
Use AGENTS.md and current main branch as source of truth.
Use the imcfo-context-snapshot skill.
Read docs/10-current-project-context.md first.
Project root: D:\imcfo.
Mobile app path: D:\imcfo\mobile.
Continue V0.1 mobile development within documented boundaries.
Before finishing, run npm.cmd run typecheck inside mobile.
Report final results in Chinese.
```
