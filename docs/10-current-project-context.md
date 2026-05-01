# 我为 CFO 当前项目上下文快照

更新时间：2026-05-01  
当前分支：`main`  
当前已验证基线提交：`3c8fb60`  
本次快照原因：完成一轮保守型移动端审计、修补、清理与不变量复核后刷新上下文。  
提交状态说明：本轮代码已完成并通过校验，但当前环境写入 `.git/index.lock` 被拒绝，暂未形成新的 Git 提交。

## 1. 项目定位与边界

“我为 CFO” 是把自然人财务按公司报表视角组织起来的个人经营系统，不是普通记账 App。当前移动端 MVP 继续坚持 Expo + React Native + TypeScript + AsyncStorage，不新增后端、登录、云同步、支付、AI/API、税务/VAT/发票模块，不改变底部导航结构、核心页面层级、产品中文定位或项目宪法。

V0.1 继续围绕这些能力：

- 首页仪表盘
- 管理页
- 账户管理
- 资产负债管理
- 交易记录
- 手动对账 / 资产估值更新
- 报表
- 我的 / 设置 / 数据工具

## 2. 当前技术栈与开发方式

- 移动端：Expo 54 + React Native 0.81 + React 19 + TypeScript strict
- 本地存储：AsyncStorage，经 `useAppData` 统一读写
- 报表与会计逻辑：`mobile/src/domain/accounting` 下纯函数
- 交易记录索引：`mobile/src/domain/transactions/transactionDisplayIndex.ts`
- 当前 `mobile/package.json` 仅提供 `start/android/ios/web/typecheck`

约束继续保持：

- 屏幕层不直接读写 `AsyncStorage`
- 报表计算函数保持纯函数、可测试
- 前端不自行发明会计公式
- 存储适配器与会计计算逻辑分离

## 3. 本轮审计范围

- 仓库结构与可达性检查：`mobile/App.tsx`、`mobile/src/screens`、`components`、`domain`、`hooks`、`storage`、`styles`
- TypeScript 编译稳定性检查
- 运行时风险点检查：管理页、账户页、资产负债页、交易录入页
- 一对多账户/资产联动安全性检查
- 高复杂度示例数据 2026-04 财务不变量复核

## 4. 本轮已完成修补

- 修正 `mobile/src/domain/accounting/transactionRules.ts`
  - 账户联动资产更新改为“仅一对一链接时自动同步”，避免一个账户挂多条资产时被批量误改。
  - `investmentBuy` / `investmentSell` 不再错误地修改“第一个投资资产”，改为只更新明确传入的 `relatedAssetId`。
- 修正 `mobile/src/screens/RecordScreen.tsx`
  - 增加投资交易对关联资产的自动选择与保持逻辑，避免投资买入/卖出落到错误资产或丢失关联资产。
  - 统一 `relatedAssetId` / `relatedLiabilityId` 透传条件，避免投资交易仍走旧的应收/应付专用分支。
  - 清理旧的应收/应付默认选择辅助函数，改为基于当前交易类型与候选集合自动维护状态。
- 清理 `mobile/src/screens/AssetsLiabilitiesScreen.tsx`
  - 删除未使用的 `summary` 类型与属性，减少无效接口负担。
- 清理 `mobile/App.tsx`
  - 移除传给 `AssetsLiabilitiesScreen` 的无效 `summary` 属性。

## 5. 验证结果

已运行：

```powershell
cd D:\imcfo\mobile
node node_modules/typescript/bin/tsc --noEmit
```

结果：通过。

已额外执行本地 TypeScript 加载脚本复核 2026-04 高复杂度示例汇总，不变量保持不变：

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

未运行：

- `npm.cmd run lint`
- `npm.cmd run test`
- `npm.cmd run build`

原因：当前 `mobile/package.json` 没有这些脚本；同时本环境未将 `npm.cmd` 暴露到 PATH，本轮验证以本地 `node` + `typescript` 完成。

## 6. 当前实现状态

- 底部导航仍为：首页 / 管理 / 报表 / 我的
- `DashboardScreen` 负责首页结果、结构与趋势
- `RecordScreen` 负责一句话记账、手动录入和管理入口
- `AccountManagementScreen` 负责账户分层管理与对账
- `AssetsLiabilitiesScreen` 负责资产/负债维护与资产估值调整
- `TransactionRecordsScreen` 继续使用索引预处理 + 月份懒展开策略
- `useAppData` 仍是唯一应用数据读写入口

## 7. 已知限制与风险

- 自动化测试仍不足，当前主要依赖 `typecheck` 与规则复核
- `RecordScreen` 对普通“资产增加/减少”“负债增加/减少”仍缺少显式关联对象选择 UI；本轮重点修了投资交易误关联问题，后续可继续细化这两类录入体验
- 当前工作区仍有一项无关改动：`mobile/expo-start-8083.out.log`
- 当前环境无法写入 `.git/index.lock`，所以这轮变更暂时无法正常提交

## 8. 重要文件变动记录

- `mobile/App.tsx`
- `mobile/src/domain/accounting/transactionRules.ts`
- `mobile/src/screens/AssetsLiabilitiesScreen.tsx`
- `mobile/src/screens/RecordScreen.tsx`
- `docs/10-current-project-context.md`

## 9. 架构与数据流摘要

- 页面操作先进入 `useAppData`
- `useAppData` 调用 `transactionRules.ts` / `reconciliationRules.ts` 生成新的财务状态
- 新状态经 `asyncStorageAdapter` 持久化
- 首页与报表直接读取 `assets / liabilities / period transactions` 计算结果，不从 UI 层拼公式
- 交易记录页优先消费 `transactionDisplayIndex`，避免首屏重复全量分组与搜索预处理

## 10. 当前 Git 状态与最近提交

当前工作区状态（快照生成时）：

- 已修改但未提交：`mobile/App.tsx`
- 已修改但未提交：`mobile/src/domain/accounting/transactionRules.ts`
- 已修改但未提交：`mobile/src/screens/AssetsLiabilitiesScreen.tsx`
- 已修改但未提交：`mobile/src/screens/RecordScreen.tsx`
- 无关日志改动：`mobile/expo-start-8083.out.log`

最近提交（已验证）：

- `3c8fb60` `style: unify secondary pages with line list style`
- `74fb8a8` `style: align help caret with subject title baseline`
- `586f072` `style: offset help bubble caret from question icon`
- `f9eada5` `style: align help bubble caret with question icon`
- `b1d2c91` `style: align help bubble below question icon`

## 11. 常用命令

```powershell
cd D:\imcfo\mobile
npm install
npx expo start
node node_modules/typescript/bin/tsc --noEmit

cd D:\imcfo
git status --short --branch
git log --oneline --decorate -8
```

## 12. 下次会话建议首句

```text
Use AGENTS.md and current main branch as source of truth.
Read docs/10-current-project-context.md first.
Project root: D:\imcfo.
Mobile app path: D:\imcfo\mobile.
Continue conservative mobile audit/fix work without changing accounting policy or storage schema.
Before finishing, run node node_modules/typescript/bin/tsc --noEmit inside mobile.
Report final results in Chinese.
```
