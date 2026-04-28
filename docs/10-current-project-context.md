# 我为CFO · 当前项目上下文快照

> 用途：供下次 Codex 新会话或上下文压缩后快速恢复项目背景。继续任何实现任务前，先读 `AGENTS.md`、本文档，并按需核对当前 Git 状态。

更新时间：2026-04-28  
当前主分支：`main`  
当前最新提交：`3a40a46 feat: refactor management page recognition modal flow`

## 1. 项目定位与关键决策

“我为CFO”不是普通记账 App，而是一个把个人生活翻译成公司式财务报表的个人经营系统。

V0.1 只服务普通自然人，目标是跑通最小个人经营闭环：

记录数据 → 归类为资产/负债/收入/费用/现金流 → 生成三大报表 → 查看个人财务全貌 → 下月优化。

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

开发方式：

- 当前采用 trunk-based development，直接在 `main` 上小步提交。
- 每次实现后运行 `cd D:\imcfo\mobile` 与 `npm.cmd run typecheck`。
- 屏幕不得直接调用 `AsyncStorage`，必须通过 `useAppData` 或 storage adapter。
- 报表计算函数必须保持纯函数，不依赖 UI，不读写存储。

## 3. 上下文快照规则

已经补强 `imcfo-context-snapshot` skill：

- Skill 文件位置：`C:\Users\liyuxiang\.codex\skills\imcfo-context-snapshot\SKILL.md`
- 触发场景：上下文压缩、compaction、model switch、summary、resume、新会话、handoff、继续、检查之前上下文。
- 压缩前或完成较大工作后：刷新并提交 `docs/10-current-project-context.md`。
- 压缩后或新会话恢复时：先读 `AGENTS.md` 和 `docs/10-current-project-context.md`，再继续项目工作。

重要限制：

Skill 不能安装 Codex 内部低层压缩事件钩子。当前能做到的是增强 skill metadata、skill 操作规则，以及在 `AGENTS.md` 写入项目级 fallback 规则。

## 4. 已完成部分

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
- Dashboard、管理、资产负债、报表、我的页面已存在。
- 底部导航当前为：首页、管理、报表、我的。

核心功能：

- Dashboard 展示资产、负债、收入、费用、利润、所有者权益。
- RecordScreen 支持自然语言记账入口、识别结果 modal、确认入账、成功 modal。
- RecordScreen 保留手动修改 / 高级填写。
- AssetsLiabilitiesScreen 支持资产和负债新增、编辑、删除。
- ReportsScreen 支持资产负债表、现金流量表、利润表切换。
- ReportsScreen 支持简易版 / 专业版切换。
- SettingsScreen 支持导出、导入、恢复示例数据、清空本地数据。

UI 状态：

- 已根据 `stitch (1).zip` 参考稿做过移动端 UI 风格迁移。
- 已提交 UI 对齐与清理：
  - `9f0ea51 style: align mobile UI with stitch reference`
  - `d1eeaec style: finish stitch mobile UI alignment`
  - `4b40e32 style: complete stitch mobile UI cleanup`
- 当前还有一次更新后的管理页 modal 提交：
  - `3a40a46 feat: refactor management page recognition modal flow`

## 5. 重要文件修改记录

`mobile/App.tsx`

- App 入口、页面切换、底部导航、全局数据回调。
- 将保存、删除、导入、导出、重置、清空等动作转发到 `useAppData`。

`mobile/src/app/useAppData.ts`

- 当前 App 数据状态中心。
- 负责 load/save/reset/clear/export/import/transaction/asset/liability 更新。

`mobile/src/storage/asyncStorageAdapter.ts`

- 唯一直接接触 AsyncStorage 的模块。
- 屏幕层不要绕过它直接访问存储。

`mobile/src/domain/accounting/calculations.ts`

- 核心计算函数，包括总资产、总负债、所有者权益、收入、费用、利润、现金流、资产负债率、储蓄率等。
- 必须保持纯函数。

`mobile/src/domain/accounting/transactionRules.ts`

- 交易类型映射、交易入账、资产/负债 upsert/delete helper。

`mobile/src/domain/accounting/naturalLanguageParser.ts`

- 本地规则解析器。
- 支持金额、日期、交易类型、分类、现金流类别、会计影响提示。
- 不使用 AI API，不做网络调用。

`mobile/src/screens/RecordScreen.tsx`

- 当前“管理”根页面。
- 主入口是“一句话记账”。
- `更多` 提供账户管理、资产负债管理、交易记录入口，其中部分仍是占位。

`mobile/src/screens/ReportsScreen.tsx`

- 当前一次只展示一张报表。
- 默认资产负债表，支持现金流量表和利润表切换。

`mobile/src/screens/SettingsScreen.tsx`

- 当前对应底部导航“我的”。
- 负责本地数据管理能力。

## 6. 当前 Git 状态与近期提交

当前分支：`main`

刷新本快照前的工作区状态：

- `AGENTS.md` 已修改，用于加入 Context Snapshot Rules。

近期提交：

- `3a40a46 feat: refactor management page recognition modal flow`
- `4b40e32 style: complete stitch mobile UI cleanup`
- `d1eeaec style: finish stitch mobile UI alignment`
- `9f0ea51 style: align mobile UI with stitch reference`
- `5cf2221 feat: refactor management page recognition modal flow`
- `b615a4c style: unify mobile UI for V0.1`
- `123f88e chore: clean up Chinese mobile copy`
- `6a488fd feat: add natural language bookkeeping entry`
- `05a1c80 feat: enhance mobile record form`
- `a99c133 docs: add current project context snapshot`

## 7. 待办事项与风险

高优先级：

- 给核心报表计算函数补最小测试。
- 给交易映射规则补关键样例测试。
- 检查自然语言解析对“股票盈利”“分红”“朋友还我”等句子的边界处理。
- 梳理账户管理与交易记录页是否进入 V0.1。

中优先级：

- Settings 导入做更严格 schema 校验。
- 增加数据版本迁移机制。
- 增加默认分类模板。
- 继续细化移动端真机视觉检查。

风险：

- 当前主要依靠 `npm.cmd run typecheck` 保底，自动化测试不足。
- PowerShell 可能以 GBK 显示 UTF-8 中文，看到乱码时要用 UTF-8 读取方式核实，不能直接判断源码损坏。
- Skill 不能真正挂接 Codex 内部压缩事件，只能通过 metadata、AGENTS 规则和恢复流程尽量提高命中率。

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
