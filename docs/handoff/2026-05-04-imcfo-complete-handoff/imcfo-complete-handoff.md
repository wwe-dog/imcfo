# 我为 CFO 当前项目完整交接包

生成日期：2026-05-04  
项目根目录：`D:\imcfo`  
移动端目录：`D:\imcfo\mobile`  
当前分支：`main`，相对 `origin/main` ahead 17  
当前 HEAD：`346d37f docs: refresh current project context snapshot`  
最低验证：`cd D:\imcfo\mobile; npm.cmd run typecheck` 已通过

## 1. 项目定位

“我为 CFO”不是普通记账 App。它把普通自然人的个人生活翻译成公司式财务报表，把用户视为一家“个人公司”，用资产负债表、利润表、现金流量表、经营结论和净资产视角帮助用户理解自己的财务经营状态。

一句话定位：

> 像经营公司一样经营自己。

V0.1 的用户是普通自然人，包括学生、刚毕业年轻人、普通职场人、有简单兼职或副业收入的人。V0.1 不服务个体工商户、企业主体、家庭合并账本、正式税务申报、开票经营、企业级财务系统或投资组合专业管理。

## 2. MVP 边界

当前 MVP 必须保持简单：

- 技术栈：Expo + React Native + TypeScript + AsyncStorage。
- 不新增后端、登录、数据库、云同步、真实 API、AI 分析、支付、会员、税务申报、VAT、发票、经营所得或个体工商户逻辑。
- 用户可见文案保持中文。
- 底部导航固定为：首页 / 管理 / 报表 / 我的。
- 简易版和专业版共享同一套数据和计算逻辑，只改变表达方式。
- UI 只能展示和收集输入，不能发明会计公式。

## 3. 底层架构

当前移动端架构是本地优先的 Expo 应用：

- `mobile/App.tsx`：应用壳、轻量路由、底部导航、页面间入口。
- `mobile/src/app/useAppData.ts`：数据入口，统一调用 storage adapter 和 domain 层规则。
- `mobile/src/storage/asyncStorageAdapter.ts`：AsyncStorage 持久化边界。
- `mobile/src/domain/models/*`：账户、资产、负债、交易、分录、报表期间和报表输出类型。
- `mobile/src/domain/accounting/*`：会计计算、交易规则、现金流规则、对账规则、期间过滤。
- `mobile/src/domain/reports/*`：三大报表和新增分析报告 view model。
- `mobile/src/screens/*`：页面展示和交互。
- `mobile/src/components/financeUI.tsx`：当前未提交的金融 UI primitives。
- `mobile/src/styles/theme.ts`：暖色金融视觉 token。

核心数据流：

```text
用户操作
  -> React Native Screen
  -> useAppData
  -> domain/accounting 规则或 report 纯计算
  -> storage adapter
  -> AsyncStorage
  -> useAppData 派生 summary
  -> Dashboard / Reports / Management UI
```

架构红线：

- 屏幕不直接调用 AsyncStorage。
- 报表计算函数必须是纯函数。
- 报表函数不依赖 React state。
- Storage adapter 不参与会计公式。
- UI 不临时修改现金流、利润、资产负债率等口径。

## 4. 会计设计

V0.1 使用个人经营语境下的六大会计要素：

- 资产
- 负债
- 所有者权益
- 收入
- 费用
- 利润

必须保持的核心公式：

- 所有者权益 = 资产 - 负债
- 利润 = 收入 - 费用
- 现金净变化 = 经营活动现金流 + 投资活动现金流 + 筹资活动现金流
- 资产负债率 = 总负债 / 总资产，总资产为 0 时不可计算
- 储蓄率 = 利润 / 收入，收入为 0 时不可计算

三大报表：

- 资产负债表：回答“我现在拥有多少，欠了多少，真正属于我的钱是多少？”
- 利润表：回答“我这个期间赚了还是亏了？”
- 现金流量表：回答“我的现金是怎么流进和流出的？”

当前三大报表 builder 主要来自 `mobile/src/domain/accounting/calculations.ts`，`mobile/src/domain/reports/balanceSheet.ts`、`incomeStatement.ts`、`cashFlowStatement.ts` 目前是 re-export。

## 5. 功能设计

当前核心闭环：

```text
首次建账 -> 录入资产负债 -> 记录收入费用和现金流 -> 首页看六要素
-> 查看三大报表 -> 管理账户/资产/负债 -> 持续记录和复盘
```

当前页面：

- 首页：净资产 hero、经营结论、现金流简报、资产结构简报、本月关注、钻取分析入口。
- 管理：自然语言记一笔、按钮记账、账务中心、账户/资产负债/交易入口。
- 交易记录：搜索、筛选、月份分组、交易详情。
- 账户管理：账户总览、账户分类详情、账户详情、新增/编辑、对账。
- 资产负债管理：资产/负债分段、会计科目列表、科目详情、明细详情、新增/编辑、对账、删除。
- 报表：资产负债表、利润表、现金流量表，支持简易版/专业版和完整报表面板。
- 经营分析报告：报告式分析页面，目前为静态 mock 报告。
- 盈利能力分析：指标表、趋势、收入结构下钻、说明弹层，目前为静态 mock 报告。
- 我的/设置：个人摘要、工具、设置、数据管理。

重要完成度说明：

- 三大基础报表和 Dashboard summary 基于当前本地数据计算。
- 经营分析报告和盈利能力分析页面目前不是完整报表引擎，`operatingAnalysisReport.ts` 和 `profitabilityAnalysis.ts` 仍是静态 mock 数据。
- `incomeStructureFlow.ts` 是收入结构树到下钻 view model 的纯展示转换。
- Dashboard 内仍有部分趋势、结构和聚合逻辑留在 UI 层，后续应迁到 domain/report engine。

## 6. UI 设计

当前视觉方向是“暖色中国个人金融 + CFO 仪表盘”：

- 白底和暖米色背景。
- 橙色主色用于行动、强调和品牌。
- 深色卡片用于首页净资产 hero。
- 金额使用黑色、橙色、绿色、红色表达状态。
- 首页和报表摘要可以用卡片提升信息密度。
- 二级、三级管理/详情页应使用线分隔列表风格，避免大外层圆角容器和嵌套卡片。

本轮当前模拟器截图：

![首页顶部](screenshots/01-home-top.png)

![管理页](screenshots/04-manage-top.png)

![报表页](screenshots/06-reports-top.png)

![经营分析报告](screenshots/11-operating-analysis-report.png)

![盈利能力分析](screenshots/13-profitability-analysis-middle.png)

![账户管理总览](screenshots/15-account-management-overview.png)

![账户详情弹层](screenshots/17-account-detail-sheet.png)

补充参考截图已复制到本交接包中，覆盖交易记录、交易详情、资产负债总览、资产科目、资产详情、负债总览和负债科目。这些补充图来自旧交接包的 Android 模拟器截图，用于补齐子页面上下文。

## 7. 当前 Git 状态

本交接包生成前的状态：

```text
## main...origin/main [ahead 17]
 M mobile/App.tsx
 M mobile/src/components/AppIcon.tsx
 M mobile/src/screens/AccountManagementScreen.tsx
 M mobile/src/screens/AssetsLiabilitiesScreen.tsx
 M mobile/src/screens/DashboardScreen.tsx
 M mobile/src/screens/RecordScreen.tsx
 M mobile/src/screens/ReportsScreen.tsx
 M mobile/src/screens/SettingsScreen.tsx
 M mobile/src/screens/TransactionRecordsScreen.tsx
 M mobile/src/styles/theme.ts
?? docs/handoff/
?? docs/ui-reference/
?? docs/ui-snapshots/
?? mobile/src/components/DrilldownIncomeSankeySection.tsx
?? mobile/src/components/financeUI.tsx
?? mobile/src/domain/reports/incomeStructureFlow.ts
?? mobile/src/domain/reports/operatingAnalysisReport.ts
?? mobile/src/domain/reports/profitabilityAnalysis.ts
?? mobile/src/screens/OperatingAnalysisReportScreen.tsx
?? mobile/src/screens/ProfitabilityAnalysisScreen.tsx
```

本次提交只应包含：

- `docs/handoff/2026-05-04-imcfo-complete-handoff/**`
- `docs/10-current-project-context.md`

不要提交当前移动端功能代码，除非后续另开功能提交。

## 8. 交接包内容

本目录包含：

- `imcfo-complete-handoff.md`
- `imcfo-complete-handoff.pdf`
- `appendix-a-architecture-map.md/pdf`
- `appendix-b-product-and-accounting-rules.md/pdf`
- `appendix-c-ui-screenshot-index.md/pdf`
- `appendix-d-current-git-and-risks.md/pdf`
- `new-gpt-handoff-prompt.txt`
- `screenshots/`

推荐接管顺序：

1. 读 `AGENTS.md`。
2. 读 `docs/10-current-project-context.md`。
3. 读本交接包主文档。
4. 读附录 A 和 B，确认架构和会计边界。
5. 读附录 C，理解当前 UI。
6. 读附录 D，确认 dirty 状态和风险。
7. 在 `D:\imcfo\mobile` 运行 `npm.cmd run typecheck`。
