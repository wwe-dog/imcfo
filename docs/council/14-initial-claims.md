# Round 3 Initial Claims

## 1. Product Doctrine Agent

### Claim

IMCFO 是个人 CFO 系统，不是普通记账 App。它把个人生活事件翻译成公司式财务语言，让用户像经营公司一样经营自己。

### Reasoning

外部记账产品已经覆盖快捷记账、AI 自动分类、语音记账、资产统计和图表。IMCFO 的差异不能停在输入效率，而必须建立在财务解释和经营反馈上。

### Proposed Constitution Rules

- IMCFO 的核心身份是 personal CFO system。
- IMCFO 必须保护“生活事件 -> 财务语言 -> 经营反馈 -> 行动”的闭环。
- IMCFO 不得退化为普通流水账、预算表或视觉换皮记账 App。

### What should go to Doctrine

- AI-first personal CFO MVP 是当前产品方向。
- “像经营公司一样经营自己”是当前表达方法。
- 三大报表是当前产品骨架。

### What should go to Contracts

- 产品定位不能绕过财务核心。
- 输入系统、报表系统和反馈系统必须形成闭环。

### What should go to Specs

- 当前页面、入口、文案、首页信息层级。

### What should go to Experiments

- 新的输入方式、经营建议形态、个人 CFO 视觉表达。

### Risks

- “个人 CFO”可能对普通用户太抽象。
- 三表可能显得重。
- AI-first 可能被理解成“自动记账”，削弱财务底线。

### Required Critic Review

Product Contrarian Agent、User Behavior Agent、Originality Judge。

## 2. Financial Core Agent

### Claim

会计规则高于 UI、AI 和视觉。IMCFO 的报表可信度来自统一交易规则层和可解释、可测试的报表计算，而不是页面文案或模型输出。

### Reasoning

当前代码已经有 transaction rule layer、report calculation functions 和 storage adapter 边界，但也暴露出 import 绕过规则、部分原型报告 hardcoded、复杂交易目标校验不足等风险。

### Proposed Constitution Rules

- UI 不得发明会计公式。
- AI 不得生成最终会计分录或正式交易。
- 正式入账必须经过统一 transaction rule layer。
- 报表计算必须可解释、可测试、可追溯。
- 三大报表是 IMCFO 产品骨架，不是装饰性图表。

### What should go to Doctrine

- 简易模式使用用户能懂的语言，但不能改变底层会计含义。
- 专业模式暴露更完整的三表和科目逻辑。

### What should go to Contracts

- UI layer 只能调用 report engine 输出。
- report engine 不读取 storage。
- storage 不发明财务影响。

### What should go to Specs

- 当前交易类型、现金流分类、报表行项目、导入校验策略。

### What should go to Experiments

- 是否引入完整 journal entry generation。
- 是否支持更复杂投资、应收应付和负债摊还。

### Risks

- 当前系统不是完整复式账闭环。
- 原型报告可能被误认为真实计算结果。
- importData 可引入不一致状态。

### Required Critic Review

Accounting Red-Team Agent、AI Input Agent、User Behavior Agent、Contradiction Judge。

## 3. AI Input Agent

### Claim

AI 记一笔是核心输入系统，但 AI 只能生成 Candidate Transaction Draft。正式入账必须经过用户确认和 transaction rules。

### Reasoning

当前代码链路已经把 ASR、Draft 识别和正式保存分开。外部 AI 会计产品也普遍保留 review / approve / posting gate。

### Proposed Constitution Rules

- AI 只能生成 Candidate Transaction Draft。
- AI 不得直接写账。
- AI 不得直接写 AsyncStorage。
- AI 不得绕过 transaction rules。
- 正式入账必须经过用户确认。
- API key / secret 不得进入前端。
- AI / ASR 后端不能成为账本数据库。

### What should go to Doctrine

- AI-first 是为了降低输入摩擦和增强理解，不是为了取消用户责任。

### What should go to Contracts

- ASR service boundary、record recognition service boundary、Draft schema、confirmation gate。

### What should go to Specs

- 低置信度、多笔交易、缺账户、缺日期、缺方向、复杂交易的 UI 处理。

### What should go to Experiments

- 多笔 Draft 拆分、AI 解释财务影响、AI 纠错建议、OCR 输入。

### Risks

- 用户可能把 Draft 当正式交易。
- 远端 `impactPreview` 可能误导。
- AI 可能识别错方向、金额、账户、日期和交易类型。

### Required Critic Review

AI Failure-Mode Critic、Financial Core Agent、Architecture Contract Agent、Scope Judge。

## 4. Architecture Contract Agent

### Claim

Constitution v2 应定义架构边界，不锁死技术栈。当前代码事实进入 discovery；长期规则只保护层与层之间不可越界的职责。

### Reasoning

当前实现已经有 UI、app data hook、domain rules、report calculations、storage adapter、services 和 backend proxy 的初步分层。问题不在具体技术栈，而在职责是否越界。

### Proposed Constitution Rules

- 技术栈由 current code discovery 描述，不写入永久限制。
- UI layer 不拥有会计规则。
- transaction rule layer 是正式入账唯一规则入口。
- report engine 必须纯粹、可测试、可解释。
- storage adapter 只持久化，不决定会计含义。
- AI / ASR service 只返回 text 或 Draft，不写账。
- 重大架构变化必须写 ADR。

### What should go to Doctrine

- Codebase-first + Living Constitution。

### What should go to Contracts

- Layer responsibilities。
- Cross-layer forbidden dependencies。
- ADR trigger rules。

### What should go to Specs

- 当前文件路径、接口签名、storage key、endpoint 配置。

### What should go to Experiments

- 新 storage、云同步、Web 端、新 AI vendor、新 visualization engine。

### Risks

- 架构文档可能过重。
- 把当前实现误写成永久结构。
- 未来重构被文档束缚。

### Required Critic Review

Overengineering Critic、Codebase Discovery Agent、AI Input Agent、Spec Boundary Agent。

## 5. Visual Experience Agent

### Claim

Dark Liquid CFO Style 是当前视觉 doctrine：深色、液态玻璃、HUD、球体和语音输入应服务“个人 CFO”的可信、沉浸、经营感，而不是单纯装饰。

### Reasoning

当前首页已经高度视觉化。IMCFO 需要与普通记账 App 区分，但财务产品必须首先可信、可读、稳定。

### Proposed Constitution Rules

- 视觉不得牺牲财务准确性。
- 视觉不得牺牲数字、报表、标签、交互的可读性。
- 视觉不得牺牲性能到影响输入和理解。
- 当前 Dark Liquid CFO Style 不是永久唯一风格。

### What should go to Doctrine

- 当前视觉方向、气质关键词、首页 CFO HUD 表达。

### What should go to Contracts

- Visual layer must consume finance data, not invent it。
- 动效和图形不得阻断核心流程。

### What should go to Specs

- 当前颜色、间距、组件、动效、球体、液态玻璃实现。

### What should go to Experiments

- 新视觉隐喻、图表形式、动态报告、语音交互形态。

### Risks

- 炫技。
- 可读性下降。
- 动效性能债。
- 用户觉得像概念图而不是可信财务工具。

### Required Critic Review

Visual Taste & Usability Critic、Product Doctrine Agent、User Behavior Agent、Architecture Contract Agent。

## 6. User Behavior Agent

### Claim

IMCFO 的用户行为闭环不是“连续打卡”，而是“输入一笔生活事件 -> 理解经营状态 -> 做出下一步行动”。产品必须允许用户断续使用后仍能回到理解状态。

### Reasoning

个人财务和 personal informatics 产品都面临数据输入负担和长期留存问题。AI 输入能降低起步摩擦，但真正留存来自反馈价值。

### Proposed Constitution Rules

- 输入必须服务理解。
- 报表必须服务行动。
- 简易模式必须降低理解成本，但不能扭曲财务含义。
- 产品应支持用户中断后重新理解自己的财务状态。

### What should go to Doctrine

- 输入、理解、反馈、行动闭环。
- 每日 / 每周回访理由。

### What should go to Contracts

- Input system、report engine、feedback layer 的数据依赖。

### What should go to Specs

- 当前首页反馈卡、报表摘要、周期选择、提醒和空状态。

### What should go to Experiments

- 周报、月度经营复盘、异常提醒、行动建议。

### Risks

- 三表对普通用户过重。
- 反馈没有行动价值。
- 输入摩擦仍然比用户收益高。

### Required Critic Review

Friction & Retention Critic、Product Doctrine Agent、Financial Core Agent。

## 7. Workflow Agent

### Claim

IMCFO 需要 Claude / GPT / Codex 分工协作，但协作机制必须轻量、可复用、可检查。任何重大任务先确认 source of truth，再执行 discovery、critique、landing、diff QA。

### Reasoning

旧文档废弃说明固定规则容易过时。新体系应让文档跟着代码和决策演进，不让 agent 在旧规则和当前代码之间迷路。

### Proposed Constitution Rules

- Major project work must start from current task source of truth。
- Codex 不得在文档任务中修改业务代码。
- 文档落地后必须执行 diff QA。
- 旧规则不得自动恢复。
- 上下文压缩时使用新 `docs/context/current-project-context.md` 保持连续性。

### What should go to Doctrine

- Claude：看图挑刺 + 视觉规格。
- GPT：产品架构 + 规则设计 + Codex 提示词 + QA 策略。
- Codex：代码实现 + 文档落盘 + typecheck + screenshot QA + diff 汇报。

### What should go to Contracts

- Source-of-truth check。
- Context handoff。
- Diff review。
- ADR flow。

### What should go to Specs

- 每类任务的执行模板和检查清单。

### What should go to Experiments

- 多 Agent 长任务自动化、上下文摘要格式、新 QA 机制。

### Risks

- 流程过重。
- agent 只写文档不落地。
- 多窗口上下文污染。

### Required Critic Review

Process Chaos Critic、Final QA Reporter、Codex Deliberation Controller。
