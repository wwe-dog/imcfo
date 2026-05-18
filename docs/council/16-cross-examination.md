# Round 5 Cross-Examination

## 1. Product ↔ User Behavior

### Question

产品定位是否能转化为真实用户行为？

### Agent A Position

Product Doctrine Agent：IMCFO 必须用 personal CFO 与普通记账 App 区分。

### Agent B Challenge

User Behavior Agent：如果用户输入后只看到专业名词，没有行动反馈，定位不会转化为留存。

### Resolution

“个人 CFO”必须被翻译成用户可感知的行为闭环：生活事件输入、财务语言解释、经营状态反馈、下一步行动。

### Rule Impact

进入 Constitution：IMCFO 必须保护输入 -> 理解 -> 反馈 -> 行动闭环。

## 2. Product ↔ Visual

### Question

视觉是否强化个人 CFO，还是只是科幻皮肤？

### Agent A Position

Product Doctrine Agent：视觉应让用户感到这是个人经营系统，而不是普通账本。

### Agent B Challenge

Visual Experience Agent：Dark Liquid CFO Style 有辨识度，但如果球体和 HUD 不承载财务意义，就只是装饰。

### Resolution

视觉可以表达 personal CFO 气质，但必须绑定真实财务状态和可解释反馈。当前视觉方向进入 doctrine / specs，不进入永久 Constitution。

### Rule Impact

进入 Constitution：视觉不得牺牲财务准确性、可读性、性能和信任。

## 3. Financial ↔ AI Input

### Question

AI Draft 如何不污染会计规则？

### Agent A Position

Financial Core Agent：正式入账必须经过统一 transaction rule layer。

### Agent B Challenge

AI Input Agent：如果用户看到 AI Draft 的 impactPreview，就可能相信它已经是会计结论。

### Resolution

AI 输出必须停在 Candidate Draft；impactPreview 只能作为候选解释，不能替代 report engine。复杂和低置信交易必须要求补充信息。

### Rule Impact

进入 Constitution：AI 不得直接写账、不得直接写 AsyncStorage、不得绕过 transaction rules、不得生成最终会计结论。

## 4. Financial ↔ User Behavior

### Question

三大报表如何让普通用户理解并行动？

### Agent A Position

Financial Core Agent：三大报表是产品骨架，不能被简化成普通图表。

### Agent B Challenge

User Behavior Agent：用户不一定理解资产负债表、利润表、现金流量表。

### Resolution

保留三表骨架，但提供 simple mode。simple mode 改变表达，不改变底层公式和规则。

### Rule Impact

进入 Doctrine：简易模式和专业模式必须共享同一财务核心。

## 5. Architecture ↔ AI Input

### Question

AI / ASR 服务边界是否清晰？

### Agent A Position

Architecture Contract Agent：AI / ASR service 是 service boundary，不是 storage 或 report engine。

### Agent B Challenge

AI Input Agent：远端 endpoint 容易膨胀成识别、计算、存储一体化服务。

### Resolution

ASR backend 可返回文本，record AI service 可返回 Draft，但不得成为 ledger source of truth。任何云同步或后端账本变化必须经过 Constitution Review 和 ADR。

### Rule Impact

进入 Constitution：AI / ASR 后端不能成为账本数据库。

## 6. Architecture ↔ Visual

### Question

液态玻璃、球体、动画是否会带来性能债？

### Agent A Position

Architecture Contract Agent：视觉层应受性能和数据边界约束。

### Agent B Challenge

Visual Experience Agent：视觉是 IMCFO 识别度的重要来源，不能被过度保守限制。

### Resolution

允许视觉创新，但必须有可读性、性能和数据真实性门槛。视觉实验进入 specs / experiments，不进入 Core Invariants。

### Rule Impact

进入 Contracts：visual layer consumes finance data; it does not create finance data。

## 7. Workflow ↔ All

### Question

这套流程是否能被 Codex 长期执行，而不是只写得好看？

### Agent A Position

Workflow Agent：每次重大任务先确认 source of truth，再分层执行。

### Agent B Challenge

All Critics：流程过重会导致 agent 逃避实际实现，或者上下文压缩后误读旧文件。

### Resolution

采用 lightweight governance：普通实现读 relevant docs；重大变更走 Council / ADR；上下文压缩使用 `docs/context/current-project-context.md`；旧 `docs/00-10` 不恢复。

### Rule Impact

进入 Workflow Doctrine 和 Change Governance。
