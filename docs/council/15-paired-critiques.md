# Round 4 Paired Critiques

## 1. Product Contrarian Agent

### Attack

“个人 CFO”容易成为漂亮但空泛的口号。如果用户只看到记账、图表、资产负债，那它仍然是普通记账 App。

### Weak Assumptions

- 假设普通用户理解 CFO。
- 假设三表天然有吸引力。
- 假设 AI-first 足够差异化。

### Failure Cases

- 用户只想快速记录支出，不想学习财务语言。
- 首页显示很多高级词，但用户不知道下一步做什么。
- 产品被营销成 AI 记账，结果和国内竞品无差异。

### Risks

- 定位过重。
- 传播语不锋利。
- MVP 超出用户耐心。

### Required Revisions

- 产品定位必须用用户能懂的话表达。
- CFO 不是职位崇拜，而是“把自己当经营主体”。
- 首页必须输出经营判断和行动线索。

### Better Alternatives

- “把生活流水翻译成你的个人经营报表。”
- “每一笔生活事件，都进入你的个人公司账。”
- “不是记你花了多少，而是告诉你这个月经营得怎么样。”

### Decision

Revised。

## 2. Accounting Red-Team Agent

### Attack

当前代码还不是完整 double-entry accounting closed loop。若文档写成“已有三表会计系统”，会高估实现。

### Weak Assumptions

- 假设交易规则已经覆盖所有复杂类型。
- 假设 report engine 已经是真实报表唯一来源。
- 假设 importData 不会破坏一致性。

### Failure Cases

- import JSON 直接导入不一致的 transactions / assets / liabilities。
- liability target 缺失时误更新第一条负债。
- transfer 只记录交易但账户余额未完整移动。
- UI 硬编码财务结论误导用户。

### Risks

- 三表不一致。
- AI Draft 被误认为正式账。
- UI 或 remote impactPreview 发明会计影响。

### Required Revisions

- Constitution 写底线，不宣称当前实现已完美。
- Discovery 明确当前局限。
- Contracts 要求所有财务展示可追溯到 domain/report engine。
- Specs 追加 import validation、complex target validation、transfer rule hardening。

### Better Alternatives

- “当前是交易规则驱动的个人财务状态系统，目标是逐步加强会计一致性。”
- “报表可信度来自可测试规则，而不是当前 UI 覆盖面。”

### Decision

Revised。

## 3. AI Failure-Mode Critic

### Attack

AI 输入最危险的不是识别失败，而是“看起来识别成功但财务含义错了”。

### Weak Assumptions

- 假设用户会认真检查 Draft。
- 假设自然语言都能映射成单笔交易。
- 假设金额、方向、账户和交易类型足够清楚。

### Failure Cases

- “今天早餐 18，午餐 32，都用支付宝”：应拆成两笔支出，不能合并成一笔 50。
- “我还了花呗 500”：可能是现金减少、负债减少、非经营现金流或融资现金流处理，不能当普通支出。
- “买了基金 3000”：现金减少、投资资产增加，通常不是费用。
- “朋友转我 200，我又请他吃饭 80”：包含收入/应收/往来和支出两种事件，不能单笔粗暴入账。

### Risks

- AI 污染账本。
- 用户确认太弱，误点保存。
- 低置信度处理不明确。
- AI impactPreview 误导用户。

### Required Revisions

- 多笔、复杂、低置信、缺账户、缺方向、缺科目必须停在 Draft。
- Draft 必须显示“候选，不是正式入账”。
- 复杂类型必须要求目标账户 / 科目选择。
- AI 解释不得替代 report engine 计算。

### Better Alternatives

- 将 Draft 分为 `postableDraft` 和 `needsMoreInfoDraft`。
- 用“需要补充信息”代替“识别失败”。

### Decision

Revised。

## 4. Overengineering Critic

### Attack

架构契约容易把 MVP 写成企业系统。文档越复杂，后续 agent 越可能读错重点。

### Weak Assumptions

- 假设每次变化都需要重流程。
- 假设完整层级图能自动带来更好代码。
- 假设当前模块边界必须长期保持。

### Failure Cases

- 为了 ADR 而 ADR。
- 小页面调整被升级成宪法审查。
- 文档成为实现负担。

### Risks

- 速度下降。
- MVP 被流程拖慢。
- 创新空间被 contracts 误锁死。

### Required Revisions

- 只把不可越界的职责写入 contracts。
- 具体技术、文件名、页面结构进入 discovery/specs。
- ADR 只用于重大产品、数据、架构、AI 边界变化。

### Better Alternatives

- “Contracts define responsibilities, not implementation shape.”

### Decision

Revised。

## 5. Visual Taste & Usability Critic

### Attack

Dark Liquid CFO Style 有辨识度，但也可能让财务产品看起来不可信或难长期使用。

### Weak Assumptions

- 假设暗黑和液态玻璃天然高级。
- 假设球体能帮助理解财务状态。
- 假设动画不会影响性能和录入。

### Failure Cases

- 玻璃层影响数字对比度。
- 球体占据空间但没有表达真实财务信息。
- 动效掉帧影响输入。
- 用户觉得像概念 Demo 而不是个人财务工具。

### Risks

- 金融可信度下降。
- 报表可读性下降。
- 性能债积累。

### Required Revisions

- 视觉服务财务理解，不服务炫技。
- 关键数字、表格、标签和错误状态必须优先可读。
- 当前视觉是 doctrine，不是永久风格。

### Better Alternatives

- 将液态 / HUD 作为品牌表达层，把报表区保持清晰、克制、可扫描。

### Decision

Revised。

## 6. Friction & Retention Critic

### Attack

用户不会因为产品叫 CFO 就长期记账。留存来自持续反馈和低摩擦恢复，而不是第一次的新鲜感。

### Weak Assumptions

- 假设 AI 识别总比表单快。
- 假设用户愿意每天记录。
- 假设三表能自然带来行动。

### Failure Cases

- 用户三天不记，回来发现数据缺口太大而放弃。
- AI 识别复杂交易需要太多补充，反而比表单慢。
- 报表显示专业但没有“这意味着什么”。

### Risks

- 输入收益不成比例。
- 反馈滞后。
- 用户理解成本过高。

### Required Revisions

- 支持断续使用后的重新进入。
- 首页要给出经营状态摘要和行动线索。
- 简易模式必须降低财务语言门槛。

### Better Alternatives

- “经营复盘”比“每日打卡”更适合 IMCFO。

### Decision

Revised。

## 7. Process Chaos Critic

### Attack

多 agent 流程如果没有明确 source-of-truth 和落盘边界，会再次产生文档与代码脱节。

### Weak Assumptions

- 假设所有 agent 都知道该读哪个文件。
- 假设旧文档删除后不会被误恢复。
- 假设长任务不会丢上下文。

### Failure Cases

- Codex 被旧 AGENTS.md prompt 影响。
- 上下文压缩后继续读旧 docs/10。
- 多窗口分别改规则，互相覆盖。

### Risks

- 规则漂移。
- 文档重复。
- 后续任务误改业务代码。

### Required Revisions

- 新 context snapshot 放在 `docs/context/current-project-context.md`。
- 明确旧 `AGENTS.md` 和旧 `docs/00-10` 不再作为 source of truth。
- 每次重大任务前执行 source-of-truth check。
- 每次文档任务后执行 diff QA。

### Better Alternatives

- 用少量入口文件指向新体系，不恢复旧规则。

### Decision

Revised。

## 8. Evidence Quality Critic

### Attack

外部情报样本多但噪声高。营销页和 SEO 页不能支撑核心宪法。

### Weak Assumptions

- 假设竞品宣传等于真实能力。
- 假设国外企业会计 AI 可直接用于中国个人财务。
- 假设 GitHub 项目结构适合移动端 MVP。

### Risks

- 同质化。
- scope 膨胀。
- 把趋势写进宪法。

### Required Revisions

- 官方 / 开源 / 标准 / 论文优先。
- App Store 和营销页只作为市场信号。
- 外部信息只影响 doctrine 和 risk framing。

### Decision

Accepted with boundaries。

## 9. Implementation Reality Critic

### Attack

当前 discovery 必须继续强调“不确定”和“原型”，否则后续 Constitution 会建立在过度乐观的代码认知上。

### Required Revisions

- 把 hardcoded reports 标为 prototype。
- 把 AI remote endpoint backend 缺失标为 unknown external service。
- 把 importData 绕过规则写进风险。
- 把 current stack 放 discovery，不进 constitution。

### Decision

Accepted。
