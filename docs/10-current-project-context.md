# 我为 CFO 当前项目上下文快照

更新时间：2026-05-15
项目根目录：`D:\imcfo`
移动端目录：`D:\imcfo\mobile`
当前分支：`main`
当前 HEAD：`bf8070c chore: remove stale screenshots and generated PDFs`
快照原因：记录 2026-05-15 移动端保守维护审计结果，便于后续会话从 Git 和文档恢复上下文。

## 1. 项目定位与边界

“我为 CFO”是自然人个人财务系统，用公司化财务视角组织资产、负债、收入、费用、利润和现金流。当前 V0.1 继续保持移动端本地 MVP 边界：

- Expo + React Native + TypeScript + AsyncStorage。
- 底部导航保持：首页 / 管理 / 报表 / 我的。
- 用户可见文案保持中文。
- 不新增后端、登录、云同步、支付、税务申报、VAT、发票模块或新底部 Tab。
- UI 不发明会计公式，报表和交易规则仍由 `mobile/src/domain/accounting` 与 `mobile/src/domain/reports` 负责。

## 2. 本次审计范围

本次维护审计覆盖：

- `mobile/package.json`、`mobile/tsconfig.json`、`mobile/App.tsx`。
- `mobile/src/screens`、`mobile/src/components`、`mobile/src/domain`、`mobile/src/hooks`、`mobile/src/storage`、`mobile/src/styles`。
- 交易记录、账户管理、资产负债管理、对账、加载/空状态、筛选弹窗、删除后详情状态。
- `seedData.ts` 和 2026-04 高复杂度演示快照。

## 3. 本次修复与清理

本次只做保守维护，没有改会计政策、现金流口径、交易规则方向或 storage schema。

关键修复：

- `useAppData` 初始加载失败时不再从 `useEffect` 中抛出未处理 Promise，而是进入错误状态并交给全屏错误 UI 展示。
- 账户管理页在账户被删除、清空或重置后，会自动关闭已失效的账户详情表单和对账弹窗，避免 stale account 被重新保存。
- 资产负债页在资产/负债被删除、清空或重置后，会关闭失效删除确认和资产对账弹窗，并把已失效详情页退回科目页。
- 交易记录页清理了不可达的重复加载/空状态分支，并把“自定义日期但未选择日期”的筛选应用归一为“全部”，避免出现无效激活筛选。

冗余清理：

- 移除交易记录页中不可达的 `LoadingPanel` 逻辑。
- 保留已有共享 `SearchFilterBar` / `TopBar`，未恢复旧的本地搜索框、筛选按钮和标题样式。
- 未删除 V0.1 范围内仍可能使用的页面、规则或演示数据。

性能与稳定性：

- 交易记录页继续使用索引、按月懒水合、`SectionList` 和筛选弹窗懒挂载。
- 删除/重置后不再让失效详情、失效对账和失效确认框继续持有旧对象。
- 未引入重型依赖或新架构。

## 4. 会计安全验证

已用 PowerShell 从 `mobile/src/storage/seedData.ts` 按当前计算口径复算 2026-04 演示快照，结果保持不变：

- assets: 5,000,000
- liabilities: 1,186,000
- net worth: 3,814,000
- income: 93,500
- expenses: 45,600
- profit: 47,900
- operating cash flow: 56,900
- investing cash flow: -64,000
- financing cash flow: -69,200
- cash net change: -76,300

## 5. 验证结果与限制

- `git diff --check` 通过，仅有既有 LF/CRLF 工作区提示。
- `npm.cmd run typecheck` 未能执行：当前沙箱找不到 `npm.cmd`。
- 直接执行 `node .\node_modules\typescript\bin\tsc --noEmit` 也被当前沙箱拒绝访问 `node.exe`。
- `mobile/package.json` 当前只有 `typecheck/start/android/ios/web` 脚本，没有 lint/test/build 脚本可运行。
- 因 typecheck 无法在当前环境执行，本次未按自动化要求提交 Git commit。

## 6. 后续注意事项

- 在有可执行 Node/npm 的本地环境中优先运行 `cd D:\imcfo\mobile && npm.cmd run typecheck`。
- 如果继续清理，应先处理当前工作区已有的大量未提交文档删除和移动端 WIP 改动，避免把不相关变更混入维护提交。
- 不要为了空状态和加载状态继续扩大暗黑视觉到管理页主体；管理页仍以清晰、紧凑、线分隔列表为主。
