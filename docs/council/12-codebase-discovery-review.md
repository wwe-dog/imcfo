# Round 1 Codebase Discovery Review

## 1. Round Goal

从当前代码、配置、目录结构中读取真实实现状态，并区分 current implementation facts、原型代码、历史残留和不确定状态。

## 2. Active Agents

- Codebase Discovery Agent
- Implementation Reality Critic
- Architecture Contract Agent
- Contradiction Judge

## 3. Codebase Discovery Agent Output

已生成：

- `docs/discovery/current-codebase-map.md`
- `docs/discovery/current-data-flow.md`
- `docs/discovery/current-financial-flow.md`
- `docs/discovery/current-ai-record-flow.md`

核心发现：

- 当前主应用是 `mobile/` 下的 Expo / React Native / TypeScript app。
- 当前主要本地数据源是 AsyncStorage adapter。
- 当前正式入账链路通过 `useAppData.saveTransaction -> transactionRules -> storageAdapter.saveData`。
- 当前基础三表由 `calculations.ts` 等 domain/report function 生成。
- 当前经营分析、盈利分析和部分首页视觉内容存在原型 / hardcoded 特征。
- 当前 AI / ASR 链路生成 Candidate Draft，不直接写账。
- 当前 `backend/asr-scf` 是 ASR proxy，不是账本后端。

## 4. Implementation Reality Critic Findings

### 4.1 False Positive Corrections

- 不应把当前系统描述成完整 double-entry ledger closed loop；journal entry model/storage 存在，但未发现分录生成闭环。
- 不应把 operating analysis / profitability analysis 当成实时 report engine；当前包含硬编码数据和原型 view model。
- 不应把 `naturalLanguageParser.ts` 等存在的 helper 文件当成当前活跃主链路，除非有明确调用证据。
- 不应把当前页面结构写成长期规则。
- 不应把当前 Expo / React Native / AsyncStorage 写成长期限制。

### 4.2 Missing Or Weak Links

- importData 可绕过 transaction rules 回放，存在一致性风险。
- complex transaction target 校验不足，未来开放更多类型时可能误更新 liability。
- transfer 规则当前不完整，不能把它当作已完成闭环。
- AI `impactPreview` 可能来自远端，不一定由 report engine 推导。
- UI 中部分财务结论可能是硬编码文案，必须被区分为当前实现风险。

### 4.3 Confirmed Boundaries

- screen 未发现直接调用 AsyncStorage。
- report calculations 未发现直接调用 AsyncStorage。
- ASR backend 未发现账本写入。
- AI Draft 当前不直接写账。

## 5. Architecture Contract Agent Notes

Constitution v2 应定义边界，而不是定义永久实现：

- UI layer 只展示和收集输入。
- Application orchestration layer 协调 state 和 callbacks。
- Transaction rule layer 负责正式入账影响。
- Report engine layer 负责财务计算。
- Storage adapter layer 负责持久化。
- AI / ASR service boundary 只生成文字或候选 Draft。
- Backend service 可以做代理，但不得隐式成为账本数据库。

## 6. Contradiction Judge Notes

后续文档必须避免以下矛盾：

- 一处说不锁技术栈，另一处把 Expo / AsyncStorage 写成永久规则。
- 一处说 AI 不能写账，另一处允许自动入账。
- 一处说 UI 不发明公式，另一处允许 Settings / Dashboard 写死财务结论。
- 一处说 codebase-first，另一处恢复旧 `docs/00-10`。
- 一处说 backend 不是账本数据库，另一处把 SCF 扩展成 ledger source of truth。

## 7. Stop Condition

Round 1 已完成。可以进入 Round 2 External Intelligence。
