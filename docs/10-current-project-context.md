# 我为 CFO 当前项目上下文快照

更新时间：2026-05-07  
项目根目录：`D:\imcfo`  
移动端目录：`D:\imcfo\mobile`  
当前分支：`wip/mobile-baseline-before-worktree`  
当前 HEAD：`a73b2bb docs: sync handoff package with wip baseline`  
`main` 当前指向：`759fb80 docs: sync handoff package with current progress`  
快照原因：把当前 WIP 移动端基线、V0.1“智能记一笔”输入系统目标和新的 IMCFO 暗黑液态 CFO 视觉规则同步进项目上下文，避免后续会话只看到旧交接状态。

## 1. 项目定位与边界

“我为 CFO”是把普通自然人的个人财务按公司经营视角组织起来的移动端 MVP。它不是普通记账 App，而是用资产负债表、利润表、现金流量表、经营结论和个人净资产视角帮助用户理解自己的财务经营状态。

当前 V0.1 边界继续保持：

- Expo + React Native + TypeScript + AsyncStorage。
- 底部导航固定为：首页 / 管理 / 报表 / 我的。
- 用户可见文案保持中文。
- 不新增后端、登录、数据库、云同步、泛 AI、AI 财务顾问、自动财务分析、支付、税务申报、VAT、发票逻辑、个体工商户逻辑。
- 唯一 API 边界例外：V0.1 允许只为“智能记一笔”的识别链路有限接入语音转文字或自然语言交易识别 API；API 只能输出结构化候选交易 Draft，不能直接写账、不能直接生成最终会计分录、不能修改资产/负债/收入/费用/利润/现金流。
- 不改项目宪法、会计政策、交易规则、现金流规则、storage schema、route/storage/domain key。

## 1.1 V0.1 输入系统目标：智能记一笔

“记一笔”从普通记账入口升级为 IMCFO V0.1 的核心输入系统：用户用语音或自然语言描述生活事件，系统把它识别为一笔结构化候选交易，并在用户确认后按个人公司视角更新资产、负债、收入、费用、利润和现金流。

一句话定义：

> 说一句生活话，IMCFO 把它翻译成一笔个人公司的财务记录。

标准链路必须是：

```text
语音输入 / 文本输入
→ 识别中状态
→ 结构化候选交易 Draft
→ 用户确认或修改
→ 调用现有 useAppData / transactionRules
→ 正式入账
→ 首页、报表、交易记录同步刷新
```

严禁做成“用户输入 → API 或 UI 直接入账”。识别 API、规则或服务层只能生成候选交易 Draft，正式入账必须由用户确认后继续走现有 `useAppData` 和 `transactionRules`。

候选交易确认卡至少包含：金额、收支方向、分类、账户、日期、备注、置信度、会计影响摘要。会计影响摘要使用生活化中文，例如“费用增加，现金减少，经营活动现金流出”。

推荐未来模块方向为 `recordRecognitionService`：接收语音转文字结果或文本输入，调用本地规则或有限真实 API，返回候选交易 Draft、置信度和待确认字段。该模块只负责识别，不负责入账。

完整产品目标已写入 `docs/product/record-input-v01-goal.md`。

## 2. 当前技术栈与架构

- 移动端：Expo 54 + React Native 0.81 + React 19 + TypeScript strict。
- 本地存储：AsyncStorage，通过 `mobile/src/app/useAppData.ts` 统一读写。
- 会计与报表逻辑：`mobile/src/domain/accounting` 下的纯函数和状态变更规则。
- 三大报表：`mobile/src/domain/reports/balanceSheet.ts`、`incomeStatement.ts`、`cashFlowStatement.ts` 当前 re-export `calculations.ts` builder。
- WIP UI/图形依赖：`@shopify/react-native-skia`、`expo-blur`、`react-native-reanimated`、`react-native-worklets`。
- 字体与构建配置：新增 `mobile/assets/fonts/NotoSansSC-Regular.otf` 和 `mobile/babel.config.js`。

架构边界继续保持：

- UI 屏幕不直接读写 AsyncStorage。
- 报表计算函数保持纯函数、可测试。
- UI 不发明或修改会计公式。
- 移动端存储适配与报表计算函数分离。

## 2.1 当前视觉系统规则

IMCFO 当前主视觉方向正式升级为：

> IMCFO 暗黑液态 CFO 风格

英文可称：

> Dark Liquid CFO Style

一句话定义：

> 深色金融操作台 + 液态玻璃卡片球体 + 赛博 HUD 数据流 + 个人 CFO AI 入口。

这意味着 IMCFO 不再被限制为传统“暖色个人金融 App”或“橙色记账 App”。橙色保留为品牌锚点、关键行动色和警示色之一，但不再是唯一视觉主色。品牌表现色可以适度使用青蓝、水绿色、薄荷绿、紫蓝、电光紫、灰白、银白等数字金融色。

财务语义色仍然固定：

- 正向 / 收入 / 改善 / 收益：绿色。
- 负向 / 支出 / 风险 / 亏损：红色。
- 警示 / 待处理 / 重点提醒：橙色或琥珀色。
- 中性金额 / 普通资产 / 普通文本：黑色、深灰或浅灰。
- 链接 / 下钻 / 可点击：蓝色或品牌强调色。

模块适用范围：

- 首页 / 球体 / 智能记一笔 / AI 输入 / HUD：可以使用暗黑背景、液态玻璃、发光边框、半透明卡片、空间层级、轻微流光、数据扫描线和球体旋转。
- 管理页 / 账户 / 资产负债 / 交易记录：必须克制，清晰优先、可读优先、线分隔列表优先，不堆叠大量玻璃卡片。
- 报表页：强调数字可读性、财务语义色和指标层级，不得为了视觉效果改动报表口径。
- 我的 / 设置：保持低干扰，以中性色和清晰操作为主。

详细视觉规则见 `docs/standards/imcfo-visual-system.md`。

## 3. 当前 WIP 基线

当前分支是 `wip/mobile-baseline-before-worktree`，不是 `main`。如果新会话从 `main` 开始，需要先切到该分支或合并对应提交，否则会看不到当前移动端基线。

相对 `main`，当前分支包含两个 WIP 提交：

- `4ea401d wip: snapshot current mobile state before worktree`  
  记录大范围移动端 WIP 基线，包括当时的金融 UI 基线、共享 `financeUI` primitives、新经营分析/盈利能力分析页面、收入结构下钻 view model、NotoSansSC 字体、Expo babel 配置和新增动画/图形依赖。后续视觉方向以“IMCFO 暗黑液态 CFO 风格”为准。
- `4148dcb wip: snapshot current mobile state before worktree`  
  做提交前清理：删除旧 Expo error log，清理交易展示索引、交易记录页和账户管理页中的 stale detail/debug 风险与冗余代码。

`main..HEAD` 涉及的主要移动端文件：

- 修改：`mobile/App.tsx`、`mobile/package.json`、`mobile/package-lock.json`、多个 screen、`theme.ts`、`formatters.ts`、`transactionDisplayIndex.ts`。
- 新增：`mobile/src/components/financeUI.tsx`、`DrilldownIncomeSankeySection.tsx`、`mobile/src/domain/reports/incomeStructureFlow.ts`、`operatingAnalysisReport.ts`、`profitabilityAnalysis.ts`、`OperatingAnalysisReportScreen.tsx`、`ProfitabilityAnalysisScreen.tsx`、NotoSansSC 字体、`babel.config.js`。
- 删除：`mobile/expo-start-8083.err.log`。

## 4. 功能完成度记录

当前可视功能方向：

- 首页：净资产与经营结论 dashboard、现金流/资产结构摘要、分析入口。
- 管理页：智能记一笔、财务中心、账户/资产负债/交易入口。
- 交易记录：搜索、筛选、月份分组、详情页，当前已统一依赖 `transactionDisplayIndex`。
- 账户管理：账户总览、分类详情、账户详情、新增/编辑、对账。
- 资产负债管理：资产/负债分段、科目列表、明细、编辑、删除确认。
- 报表：三大报表、简易/专业模式、完整报表面板。
- 经营分析报告、盈利能力分析：已形成页面与 view model 雏形，但仍按静态 mock/prototype 对待，不能写成真实报表引擎完成。
- 我的/设置：个人摘要、工具、设置、数据管理。

重要限制：

- `operatingAnalysisReport.ts` 与 `profitabilityAnalysis.ts` 仍不是已接入真实 AppData 的完整报表引擎。
- Dashboard 内仍有部分趋势、资产/负债结构和现金流方向聚合逻辑留在 UI 层，后续应迁移到 domain/report engine。
- 智能记一笔仍是产品目标同步，不代表真实识别 API 或输入链路已实现；后续实现不得绕过候选交易确认和 `transactionRules`。
- 当前没有自动化公式测试脚本，最低质量门槛仍是 TypeScript typecheck。

## 5. 验证结果

已在 2026-05-07 运行：

```powershell
cd D:\imcfo\mobile
npm.cmd run typecheck
```

结果：通过，实际执行脚本为 `tsc --noEmit`。

## 6. 当前 Git 状态

同步前状态：

```text
## wip/mobile-baseline-before-worktree
```

工作区在本次产品文档同步前是干净的。本次同步只应修改文档：

- `docs/10-current-project-context.md`
- `docs/01-v0.1-product-scope.md`
- `docs/product/record-input-v01-goal.md`
- `docs/00-project-constitution.md`
- `docs/standards/imcfo-visual-system.md`
- `docs/standards/README.md`
- `docs/handoff/2026-05-04-imcfo-complete-handoff/imcfo-complete-handoff.md`
- `docs/handoff/2026-05-04-imcfo-complete-handoff/appendix-a-architecture-map.md`
- `docs/handoff/2026-05-04-imcfo-complete-handoff/appendix-c-ui-screenshot-index.md`
- `docs/handoff/2026-05-04-imcfo-complete-handoff/new-gpt-handoff-prompt.txt`

不要把移动端功能代码混入本次文档同步提交；它们已经在当前 WIP 分支的 `4ea401d` 与 `4148dcb` 中作为基线存在。

## 7. 常用命令

```powershell
cd D:\imcfo\mobile
npm.cmd install
npm.cmd run typecheck
npm.cmd run web -- --port 8091 --host localhost
npm.cmd start
npm.cmd run android

cd D:\imcfo
git status --short --branch
git log --oneline --decorate -10
git diff --name-status main..HEAD
```

## 8. 下次会话建议首句

```text
Use AGENTS.md, docs/10-current-project-context.md, and current Git state as source of truth.
Project root: D:\imcfo.
Work from branch wip/mobile-baseline-before-worktree unless the user explicitly asks to return to main.
Continue the mobile MVP without adding backend, login, cloud sync, payment, tax, VAT, invoice, or individual-business logic. The only V0.1 real API exception is the smart record-input recognition chain, which may return candidate transaction Drafts only and must not directly post entries.
Do not change accounting formulas, storage schema, transaction mapping, parser behavior, route keys, storage keys, or domain model fields unless explicitly requested.
Before finishing implementation tasks, run npm.cmd run typecheck inside D:\imcfo\mobile.
Report final results in Chinese.
```

## 9. 2026-05-08 automation maintenance audit

Run time: 2026-05-08T02:09:53+08:00

Scope: conservative mobile maintenance audit for `D:\imcfo\mobile`, using AGENTS.md and the current worktree as source of truth. The workspace already contained broad uncommitted documentation, package, dashboard, record-input, and backend-related changes before this pass; those were treated as user work and were not reverted.

Changes made in this pass:
- `mobile/src/domain/transactions/transactionDisplayIndex.ts`: cached monthly income/expense totals in the transaction display index and filtered month groups.
- `mobile/src/screens/TransactionRecordsScreen.tsx`: removed duplicate month total reducer, reused cached totals, and kept the custom date picker month synced to the latest transaction month unless the user is actively choosing a custom range.
- `mobile/src/screens/DashboardScreen.tsx`: removed an unused `MetallicLogo` fragment, its stale `CapturedRect` type, and obsolete logo styles.
- `docs/10-current-project-context.md`: recorded this audit result.

Validation:
- `D:\imcfo\mobile\.node_modules\.bin\tsc.cmd --noEmit`: passed.
- `D:\imcfo\mobile\.node_modules\.bin\tsc.cmd --noEmit --noUnusedLocals --noUnusedParameters`: passed.
- `mobile/package.json` has no lint/test/build scripts beyond `typecheck`.
- Seed/reference audit passed: transaction ids are unique, and account/asset/liability references resolve.
- 2026-04 high-complexity totals remained unchanged: assets 5,000,000; liabilities 1,186,000; net worth 3,814,000; income 93,500; expenses 45,600; profit 47,900; operating cash flow 56,900; investing cash flow -64,000; financing cash flow -69,200; cash net change -76,300.

Known limitations:
- No commit was created because the working tree already had substantial unrelated/unreviewed dirty changes, including files also touched by this audit. Commit only after separating or accepting the existing worktree changes.
- `npm.cmd` is not on PATH in the automation shell; validation used the local TypeScript binary directly.
- No accounting formulas, transaction rules, cash-flow rules, storage schema, bottom navigation, backend/login/cloud/payment/tax scope, or seed totals were changed.

## 10. 2026-05-09 automation maintenance audit

Run time: 2026-05-09T02:08:46+08:00

Scope: conservative follow-up audit for `D:\imcfo\mobile`, using AGENTS.md, the current worktree, and current Git state as source of truth. The worktree was already dirty before this pass, including broad documentation, dashboard, record-input, backend-related, and previous audit changes; those existing changes were preserved.

Changes made in this pass:
- `mobile/src/screens/RecordScreen.tsx`: restored compact Management-page navigation entries for account management, assets/liabilities, transaction records, and reports, using existing route callbacks and the unified icon system.
- `mobile/src/screens/RecordScreen.tsx`: blocked direct posting of recognized repayment drafts until a corresponding liability/subject selector exists, so a credit-card or loan repayment cannot reduce only cash without reducing the liability.
- `mobile/src/screens/RecordScreen.tsx`: changed relative date conversion for today/yesterday/tomorrow to local-date formatting instead of UTC `toISOString().slice(0, 10)`, avoiding off-by-one dates in Asia/Shanghai.
- `mobile/src/screens/RecordScreen.tsx`: reused the shared `formatCurrency` helper and removed obsolete local title-line styles.
- `mobile/App.tsx`: removed redundant `assets` and `liabilities` props from `RecordScreen` because that screen no longer consumes those arrays.
- Local cleanup: removed four stale untracked Expo log files; `expo-clean.err.log` and `expo-clean.out.log` remained because another process held them open.

Validation:
- `npm.cmd run typecheck`: blocked because `npm.cmd` is not available in this automation shell.
- `node node_modules\typescript\bin\tsc --noEmit`: blocked because the only available `node.exe` is denied by the sandbox.
- `mobile/package.json` still has no lint/test/build scripts beyond `typecheck`.
- `git diff --check`: no mobile code whitespace issues; it still reports pre-existing trailing whitespace in documentation files.
- Static searches found no `any`, `TODO`, `FIXME`, or `console.*` in `mobile/src`.
- Accounting formula and seed files were not modified. The historical 2026-04 reference row still contains: assets 5,000,000; liabilities 1,186,000; net worth 3,814,000; income 93,500; expenses 45,600; profit 47,900; operating cash flow 56,900; investing cash flow -64,000; financing cash flow -69,200; cash net change -76,300.

Known limitations:
- No commit was created because typecheck could not run and the working tree contains substantial unrelated/unreviewed dirty files.
- Two Expo log files remain untracked because they are currently locked by another process.
- No accounting formulas, transaction rules, cash-flow rules, storage schema, bottom navigation, backend/login/cloud/payment/tax scope, or seed totals were changed.

## 11. 2026-05-11 automation maintenance audit

Run time: 2026-05-11T02:09:05+08:00

Scope: conservative overnight-quality maintenance audit for `D:\imcfo\mobile`, using AGENTS.md, the current worktree, and current Git state as source of truth. The workspace was already dirty before this pass, including `mobile/App.tsx`, `mobile/src/screens/DashboardScreen.tsx`, `mobile/src/screens/RecordScreen.tsx`, and the untracked home dashboard hardcoded spec; existing product-direction changes were preserved.

Changes made in this pass:
- `mobile/src/screens/RecordScreen.tsx`: restored the compact “报表中心” management entry so the existing `onOpenReports` navigation callback remains reachable from the management hub.
- `mobile/src/screens/RecordScreen.tsx`: tightened management action typing with a local `ManagementActionKey` union instead of a generic string key.
- `mobile/src/screens/RecordScreen.tsx`: removed obsolete sample phrase helpers and stale styles from the previous microphone/status-pill UI.
- `mobile/App.tsx`: removed unused legacy header/brand/subtitle styles.
- Removed unused untracked prototype screen `mobile/src/screens/SmartRecordPreviewScreen.tsx`; it was not imported anywhere and duplicated the current smart-record UI direction.

Validation:
- `npm.cmd run typecheck`: blocked because `npm.cmd` is not available in this automation shell.
- `node_modules\.bin\tsc.cmd --noEmit`: blocked with `Access is denied`.
- `git diff --check`: passed, with only line-ending warnings from Git.
- Static source scan found no `any`, `TODO`, `FIXME`, or `console.*` in `mobile/src`.
- Static seed/reference audit passed: referenced account/asset/liability IDs resolve and direct April seed transaction IDs are unique.
- 2026-04 high-complexity totals remained unchanged: assets 5,000,000; liabilities 1,186,000; net worth 3,814,000; income 93,500; expenses 45,600; profit 47,900; operating cash flow 56,900; investing cash flow -64,000; financing cash flow -69,200; cash net change -76,300.

Known limitations:
- No commit was created because typecheck could not run and the worktree already contains substantial unrelated/unreviewed dirty changes.
- No accounting formulas, transaction rules, cash-flow rules, storage schema, bottom navigation, backend/login/cloud/payment/tax scope, or seed totals were changed.
- Current HEAD during the audit was `80f4ded feat: add smart record input draft confirmation flow`.

## 12. 2026-05-12 workspace closeout

Run time: 2026-05-12T00:00:00+08:00

Scope: close out the dirty workspace on branch `wip/mobile-baseline-before-worktree` without continuing new homepage development. Reviewed current mobile homepage and voice-entry changes, separated committable source code from docs, QA screenshots, temporary scripts, logs, and handoff-package changes.

Committed mobile code:
- `316da42 feat: refine home voice entry and mini sphere layout`
- Files included: `mobile/App.tsx`, `mobile/src/screens/DashboardScreen.tsx`, `mobile/src/screens/RecordScreen.tsx`, `mobile/src/components/LiquidGlassVoiceInput.tsx`, and `mobile/src/screens/homeDashboardHardcodedSpec.ts`.

Workspace cleanup:
- Stashed handoff docs and screenshot changes with message `backup: handoff docs and screenshot changes before home layout work`.
- Stashed home-dashboard QA screenshots with message `backup: home dashboard QA screenshots`.
- Stashed temporary mobile QA scripts with message `backup: temporary mobile QA scripts`.
- Stashed Expo startup screenshots and log with message `backup: Expo startup screenshots and logs`; `mobile/expo-start.out.log` remained in the worktree because Git could not unlink the locked file.

Validation:
- `npm.cmd run typecheck` passed in `D:\imcfo\mobile`.
- Static review found no direct `AsyncStorage`, `fetch`, `axios`, OpenAI/API key, backend, package, storage schema, accounting formula, or report-formula changes in the committed mobile source files.
- Bottom tab route keys remained `dashboard`, `record`, `reports`, and `settings`; no bottom navigation structure change was committed.

Known limitations:
- `mobile/expo-start.out.log` may still appear as an untracked file until the process holding it is closed or the file is otherwise handled manually.
- No push or pull request was created.
