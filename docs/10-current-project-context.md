# 我为 CFO · 当前项目上下文快照

> 用途：供下次 Codex 新会话、上下文压缩恢复、模型切换或项目交接时快速加载。继续任何实现任务前，先读取 `AGENTS.md` 和本文档，并用当前 Git 状态核对。

更新时间：2026-04-29  
当前主分支：`main`  
当前开发模式：trunk-based development，直接在 `main` 上小步提交。  
本次快照原因：完成 V0.1 手动对账 / 资产盘点能力后刷新上下文。

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
- 本地状态与本地存储
- `react-native-svg` 用于首页图表

开发规则：

- 每次实现后在 `D:\imcfo\mobile` 运行 `npm.cmd run typecheck`。
- 屏幕不得直接调用 `AsyncStorage`，必须通过 `useAppData` 或 storage adapter。
- 报表计算函数保持纯函数，不依赖 UI，不读写存储。
- 会计 / 报表逻辑与 UI 分离。
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
- `useAppData` 集中管理 AppData、加载、保存、导入、导出、重置、清空、交易、账户、资产、负债和对账更新。
- AsyncStorage 访问集中在 storage adapter。
- 底部导航当前为：首页、管理、报表、我的。
- Safe area 已接入，避免 Android 状态栏遮挡内容。

核心功能：

- 首页为紧凑双视图仪表盘：`资产负债结构` 和 `收支现金流`。
- 首页默认显示 `资产负债结构`。
- 首页资产/负债/净资产支持 drilldown。
- 资产/负债详情页 donut 图表支持外部标签、引导线和稳定 15 色配色。
- 管理页支持自然语言记账、识别结果 modal、确认入账、成功 modal。
- 管理页保留手动修改 / 高级填写。
- 管理页“更多”使用自定义管理中心 modal。
- 账户管理为大类总览 -> 某类账户详情 -> 新增账户 / 账户详情三层结构。
- 账户大类包含现金账户、银行卡、微信钱包、支付宝、证券账户、基金账户、信用卡、其他账户。
- 账户详情页锁定账户类型，只允许修改名称、余额/欠款、启用状态和备注/用途。
- 修改普通账户余额会确认“影响总资产”；修改信用卡欠款会确认“影响总负债”。
- 账户保存只同步已存在的一对一账户/资产或信用卡负债映射，不自动创建资产/负债。
- 信用卡 `creditLimit` 只作信息展示，不计入资产或负债。
- 信用卡 `currentDebt` 作为负债处理。
- 记一笔账户选择只展示启用账户。
- 信用卡还款支持付款账户 + 信用卡账户双账户选择。
- 资产负债管理支持资产和负债新增、编辑、删除。
- 报表页支持资产负债表、现金流量表、利润表切换。
- 报表页支持简易版 / 专业版切换。
- 我的页支持本地数据导出、导入、恢复示例数据、清空本地数据和账户管理入口。

已完成的账务安全规则：

- 非现金资产调整只更新 `relatedAssetId` 指向的资产，不更新现金账户。
- 非现金负债确认只更新 `relatedLiabilityId` 指向的负债，不增加现金资产。
- 账户余额同步资产时只允许一对一账户/资产自动同步；一对多时跳过，防止覆盖多个资产明细。
- 交易入账更新负债时优先使用 `relatedLiabilityId`。
- 信用卡消费增加费用、信用卡欠款和对应负债，不减少现金，现金流为 `nonCash`。
- 信用卡还款减少付款账户现金、信用卡欠款和对应负债，不重复确认费用。
- 应收确认、应收收回、应付确认、应付支付已支持。
- 应收/应付生命周期规则缺少 `relatedAssetId` 或 `relatedLiabilityId` 时不 fallback 到随机资产/负债。

本次新增：

- `mobile/src/domain/accounting/reconciliationRules.ts`：手动对账 / 资产盘点领域规则。
- 账户详情页新增 `对账 / 更新余额`。
- 资产列表新增 `更新当前价值`。
- 管理页更多菜单新增 `对账 / 资产盘点` 入口，目前进入资产负债管理页。
- 对账调整统一通过 `useAppData.saveReconciliation` 保存，不直接访问 AsyncStorage。

对账处理规则：

- 银行利息到账：账户余额增加，收入增加，经营活动现金流入。
- 投资收益到账 / 基金股票分红到账：V0.1 按个人财务口径计入收入和经营活动现金流入，代码中保留注释，后续可切换更严格现金流分类。
- 资产估值上涨 / 下降：只更新目标资产，不计收入、不计费用、不进现金流。
- 漏记转入 / 漏记转出：按内部转移或余额调整处理，不影响利润。
- 漏记支出 / 手续费扣费：减少账户余额，增加费用，经营活动现金流出。
- 信用卡漏记消费 / 利息手续费：增加信用卡欠款和对应负债，增加费用，现金流为非现金。
- 信用卡漏记还款：需要选择付款账户，减少付款账户现金、信用卡欠款和对应负债，现金流为筹资流出。
- 信用卡退款/冲正：减少信用卡欠款和对应负债，不重复确认费用。

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

## 4. 重要文件修改记录

`mobile/App.tsx`

- App 入口、页面切换、底部导航、全局数据回调。
- 当前底部导航：首页、管理、报表、我的。
- 隐藏二级页面包括资产负债管理和账户管理。
- 已接入 safe area。
- 已向账户管理和资产负债管理传入 `onSaveReconciliation`。

`mobile/src/app/useAppData.ts`

- App 数据状态中心。
- 负责 load/save/reset/clear/export/import/transaction/account/asset/liability/reconciliation 更新。
- 新增 `saveReconciliation`，通过领域规则生成安全对账调整。

`mobile/src/domain/accounting/reconciliationRules.ts`

- 手动对账 / 资产盘点领域规则。
- 负责计算差额、给出差额原因选项、生成调整交易、同步账户/资产/负债。
- 估值调整不影响收入、费用或现金流。
- 账户同步资产仍遵守一对一保护。

`mobile/src/domain/accounting/transactionRules.ts`

- 交易类型映射、交易入账、账户/资产/负债 upsert/delete/disable helper。
- 保持核心交易规则，不直接处理 UI。

`mobile/src/domain/accounting/calculations.ts`

- 核心报表计算函数。
- 必须保持纯函数。

`mobile/src/screens/AccountManagementScreen.tsx`

- 账户管理三层结构。
- 账户详情支持 `对账 / 更新余额` modal。
- 普通账户对账显示当前账面值、实际余额、差额、差额原因和备注。
- 信用卡对账显示当前账面欠款、实际欠款、差额、差额原因和备注。
- 漏记信用卡还款要求选择付款账户。

`mobile/src/screens/AssetsLiabilitiesScreen.tsx`

- 资产和负债 CRUD。
- 资产列表支持 `更新当前价值` modal。
- 资产估值更新生成非现金资产调整。

`mobile/src/screens/RecordScreen.tsx`

- 当前“管理”根页面。
- 管理中心 modal 增加 `对账 / 资产盘点` 入口。
- 入口暂时打开资产负债管理页；账户对账从账户详情页进入。

`mobile/src/storage/seedData.ts`

- 当前示例数据为 5,000,000 资产、1,186,000 负债、3,814,000 净资产的高复杂度测试集。
- 用户需要在“我的”页执行“恢复示例数据”才能加载最新示例数据。

## 5. 当前 Git 状态与近期提交

当前分支：`main`

最近提交：

- `22dd155 feat: add manual reconciliation adjustments`
- `f0b4f00 docs: refresh current project context snapshot`
- `d06b76b feat: add receivable payable lifecycle rules`
- `9a344e9 docs: refresh current project context snapshot`
- `0cc13ad fix: harden accounting transaction rules`
- `0e55eec docs: refresh current project context snapshot`
- `89004d4 fix: treat credit card debt as liability`
- `195998d docs: refresh current project context snapshot`

继续开发前先运行：

```powershell
cd D:\imcfo
git status
```

## 6. 待办事项与风险

高优先级：

- 给核心报表计算函数补最小自动化测试。
- 给交易映射和对账规则补关键样例测试。
- 梳理交易记录页是否进入 V0.1。
- 后续完善账户余额与资产/负债明细的更完整双向同步规则。

中优先级：

- Settings 导入做更严格 schema 校验。
- 增加数据版本迁移机制。
- 增加默认分类模板。
- 首页净资产趋势后续接入真实历史资产负债快照。
- 对账 / 资产盘点可做独立管理页，目前入口主要在账户详情和资产列表。

风险：

- 当前主要依赖 `npm.cmd run typecheck` 保底，自动化测试不足。
- 趋势图没有独立历史快照 schema，当前主要基于交易或当前值近似生成。
- 对账规则已经避免随机 fallback，但如果资产/负债缺少明确关联，系统只会更新可确认的目标。
- 账户对账中普通账户若关联多个资产，不会自动覆盖多个资产，需用户到资产明细中分别更新。
- 投资分红现金流当前按 V0.1 个人财务适配口径计入经营活动现金流，未来可按更严格准则扩展。
- 信用卡退款/冲正当前作为安全负债调减处理，尚未实现费用冲减模型。

## 7. 架构与数据流摘要

数据流：

用户操作屏幕 -> 调用 App/useAppData 回调 -> domain/accounting 生成安全状态更新 -> storage adapter 保存 -> App state 更新 -> Dashboard/Reports 基于最新数据重新计算并渲染。

边界：

- UI 层只展示和触发回调。
- `useAppData` 管理应用状态和本地持久化入口。
- storage adapter 负责 AsyncStorage。
- domain/accounting 和 domain/reports 负责纯计算与映射，不读写存储。
- 屏幕不得直接调用 AsyncStorage。

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

已模拟：

- 自住房估值调增：只改目标资产，不改招商银行账户，交易为 `assetIncrease + nonCash`。
- 招商银行利息到账：账户和一对一资产同步增加，交易为 `income + operating`。
- 招商信用卡欠款调增：信用卡欠款和对应负债增加，交易为 `creditCardExpense + nonCash`。
- 招商信用卡漏记还款：付款账户减少、信用卡欠款减少、负债减少，交易为 `creditCardRepayment + financing`。

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
