# Current Codebase Map

> 本文件记录 current implementation facts。它不是长期宪法，不锁死技术栈、目录结构、页面结构或供应商。

## 1. Root

当前仓库根目录包含：

- `mobile/`：当前主要移动端应用。
- `backend/`：当前仅发现 ASR SCF 代理服务。
- `docs/`：正在重建的新文档体系，以及已废弃旧文档的删除状态。
- `references/`、`_reference/`：参考材料区域。
- `scripts/`：辅助脚本区域。

根目录未发现当前有效的 root `package.json` 或 monorepo workspace 配置。

## 2. Mobile App

当前移动端位于 `mobile/`。

当前实现事实：

- Entry：`mobile/index.ts` 注册 `App`。
- App shell：`mobile/App.tsx`。
- 数据入口：`mobile/src/app/useAppData.ts`。
- 当前导航：`App.tsx` 内部 `useState` 管理的本地 screen routing，不是长期页面结构约束。
- 当前底部入口：`dashboard`、`record`、`reports`、`settings`。
- 当前 drilldown：资产负债、账户、交易记录等由本地 screen key 切换。

当前 package/config 事实：

- 当前移动端使用 Expo、React Native、TypeScript。
- 当前使用 AsyncStorage、Skia、expo-audio、expo-file-system、expo-blur、Reanimated、SVG 等依赖。
- 当前 `mobile/.env` 暴露两个 public endpoint：
  - `EXPO_PUBLIC_IMCFO_ASR_ENDPOINT`
  - `EXPO_PUBLIC_IMCFO_RECORD_AI_ENDPOINT`

这些是当前实现事实，不是 Constitution v2 的永久技术栈限制。

## 3. Mobile Source Structure

当前 `mobile/src` 主要结构：

- `app/`：应用数据 hook。
- `components/`：共享 UI、图表、语音输入、转场等组件。
- `domain/accounting/`：交易规则、现金流规则、报表计算、期间过滤、对账规则、自然语言解析等。
- `domain/models/`：Account、Asset、Liability、Transaction、Report、JournalEntry 等类型。
- `domain/reports/`：资产负债表、利润表、现金流量表、经营分析、盈利分析等报告模块。
- `domain/transactions/`：交易展示索引。
- `hooks/`：交易记录索引等 hook。
- `screens/`：当前页面实现。
- `services/`：ASR 与交易识别服务。
- `storage/`：AsyncStorage adapter、seed/demo 数据、storage interface。
- `styles/`：主题。
- `utils/`：格式化工具。

## 4. Screens

当前 screen 事实：

- `DashboardScreen.tsx`：当前首页 / CFO HUD 风格入口，包含 Skia、动画、手势、内部 route。
- `RecordScreen.tsx`：当前语音 / 文本记账入口，包含 Candidate Draft 确认流程。
- `ReportsScreen.tsx`：当前三表预览和 full report panel。
- `AccountManagementScreen.tsx`：账户管理。
- `AssetsLiabilitiesScreen.tsx`：资产负债管理。
- `TransactionRecordsScreen.tsx`：交易记录查看与筛选。
- `SettingsScreen.tsx`：数据导入导出、重置、说明类入口。
- `OperatingAnalysisReportScreen.tsx`、`ProfitabilityAnalysisScreen.tsx`：当前经营分析和盈利分析展示。

页面结构属于 current implementation facts。未来可以通过 specs / ADR 调整，不应进入 Core Invariants。

## 5. Domain And Report Modules

当前会计 / 报表模块：

- `transactionRules.ts`：从 `TransactionInput` 创建交易，并把交易影响应用到账户、资产、负债状态。
- `calculations.ts`：构建 dashboard summary、资产负债表、利润表、现金流量表等计算。
- `periodFilters.ts`：按月、季度、年度过滤交易。
- `reconciliationRules.ts`：对账辅助规则。
- `journalEntryRules.ts`：当前仅发现分录平衡校验能力，没有发现完整分录生成闭环。
- `balanceSheet.ts`、`incomeStatement.ts`、`cashFlowStatement.ts`：当前主要 re-export 计算函数。
- `operatingAnalysisReport.ts`、`profitabilityAnalysis.ts`：当前存在硬编码 / 原型性质的报告内容，不能当成已闭环的真实报表引擎。

## 6. Storage

当前 storage 边界：

- `AsyncStorage` 调用集中在 `mobile/src/storage/asyncStorageAdapter.ts`。
- screen 不直接调用 AsyncStorage。
- `useAppData` 默认使用 `asyncStorageAdapter`，但通过 `StorageAdapter` 接口接入。

当前 AsyncStorage keys：

- `imcfo.accounts`
- `imcfo.transactions`
- `imcfo.assets`
- `imcfo.liabilities`
- `imcfo.journalEntries`
- `imcfo.settings`
- `imcfo.version`
- `imcfo.currentPeriod`

## 7. Services

当前服务边界：

- `speechTranscriptionService.ts`：读取本地音频文件、base64 编码、调用 ASR endpoint、返回文本。
- `recordRecognitionService.ts`：把自然语言文本识别为 `CandidateTransactionDraft`，先本地规则，再可选远端模型 endpoint。

当前未发现移动端服务直接写账或直接写 AsyncStorage。

## 8. Backend

当前后端位于 `backend/asr-scf/`。

当前实现事实：

- Node.js Tencent Cloud ASR proxy。
- 接收 audio base64 和格式参数。
- 调用腾讯云 ASR `SentenceRecognition`。
- 返回 transcription text、provider、engine、requestId 等。
- 不做交易识别。
- 不做 Candidate Draft 生成。
- 不做记账。
- 不写 storage。
- 不计算报表。

当前风险：

- CORS 默认允许范围较宽。
- 当前未发现明显认证 / rate limit。
- 这属于 backend service hardening 问题，不改变其当前“ASR 代理而非账本数据库”的事实。

## 9. Uncertain Or Prototype Areas

需要明确标为不稳定事实：

- `DashboardScreen` 存在 hardcoded home spec 和高度视觉化实现，部分 props 未明显转化为完整实时财务视图。
- `operatingAnalysisReport.ts`、`profitabilityAnalysis.ts` 当前更像原型 / demo report view model。
- `naturalLanguageParser.ts`、`cashFlowRules.ts`、`journalEntryRules.ts` 存在，但不都处在当前主链路上。
- 当前未发现 `backend` 下有交易识别后端实现，移动端 record AI endpoint 可能指向外部 SCF 或未纳入当前仓库的服务。

## 10. Codebase Discovery Boundary

本文件只陈述当前代码事实。不得由此推出：

- 必须永远使用 Expo / React Native。
- 必须永远使用 AsyncStorage。
- 必须永远保持当前页面结构。
- 必须永远使用当前视觉实现。
- 必须永远使用当前 ASR / AI endpoint 或供应商。
