# IMCFO Constitution v2 Markdown Landing Rules

## 1. Recommended Framework

推荐框架：

> Doctrine + Contracts + Experiments Framework

原因：

- constitution 保护项目灵魂和底线。
- doctrine 描述当前原则。
- contracts 描述模块边界。
- discovery 描述当前代码事实。
- specs 描述当前实现规格。
- experiments 保留创新空间。
- ADR 记录重大决策。

## 2. Future Docs Layers

### 2.1 constitution/

放：

- 项目灵魂。
- 不可破坏的底线。
- 长期原则。
- 变更机制。

不放：

- 具体技术栈。
- 具体页面结构。
- 具体按钮位置。
- 具体 API 供应商。
- 当前实现细节。

### 2.2 discovery/

放：

- 当前代码事实。
- 当前技术栈。
- 当前目录结构。
- 当前数据流、财务流、AI 流。

规则：

- discovery 是事实记录，不是长期限制。
- discovery 不能替代 constitution。

### 2.3 specs/

放：

- 当前功能规格。
- 页面规格。
- 交互规格。
- 视觉规格。
- 可随版本更新的实现约定。

规则：

- specs 可以随版本更新。
- specs 不得冒充永久宪法。

### 2.4 experiments/

放：

- 可探索的新方向。
- 可试错的新交互。
- 可废弃的原型。
- 未验证的产品假设。

规则：

- 不得把 experiments 误写成核心规则。
- experiments 成熟后必须经过 review 才能进入 specs、doctrine 或 constitution。

### 2.5 adr/

放：

- 重大技术决策。
- 重大架构变化。
- 重大产品方向变化。
- AI 服务边界变化。
- 数据层变化。

规则：

- 未来如更换技术栈、改数据层、改 AI 服务边界，应写 ADR。
- ADR 记录决策背景、选项、取舍和影响。

### 2.6 context/

放：

- 当前项目状态。
- 当前分支。
- 当前实现阶段。
- 最新重要决策。
- 工作区注意事项。

规则：

- context 不作为永久宪法。
- context 可以频繁更新。

## 3. Rule Levels

### Level 1: Core Invariants

不可轻易改变的项目灵魂和底线。

示例方向：

- IMCFO 必须保持个人 CFO 产品灵魂。
- 财务底线不能被 UI、AI 或视觉效果破坏。
- AI 不得直接写账。
- UI 不得发明会计公式。
- 后端不得被默认为账本数据库。

### Level 2: Doctrines

当前产品、财务、AI、视觉原则，可通过明确决策调整。

示例方向：

- 当前产品表达。
- 当前 AI-first 输入策略。
- 当前视觉方向。
- 当前协作方式。

### Level 3: Contracts

模块边界和协作规则，随架构演进更新。

示例方向：

- UI layer 与 domain layer 边界。
- transaction rules 与 report engine 边界。
- storage adapter 与业务逻辑边界。
- AI service 与正式入账边界。

### Level 4: Experiments

允许探索、试错、废弃。

示例方向：

- 新视觉原型。
- 新输入方式。
- 新反馈机制。
- 新 agent workflow。

## 4. Placement Rules

如果一条规则未来可能合理变化，就不要写进 constitution。

如果一条规则描述的是当前代码状态，就放进 discovery。

如果一条规则描述的是当前页面或功能规格，就放进 specs。

如果一条规则是探索方向，就放进 experiments。

如果一条规则是重大决策，就放进 ADR。

如果一条规则是当前项目状态，就放进 context。

## 5. Prohibited Constitution Content

不要写进 Constitution：

- 必须使用某个技术栈。
- 必须使用某个 UI 库。
- 必须使用某个导航结构。
- 必须只有某几个页面。
- 某个按钮必须在某个位置。
- 某个动画必须用某个实现方式。
- 某个 API 必须使用某个供应商。
- 某个模型供应商必须永久使用。
- 某个临时实验必须长期保留。

## 6. Safety Boundaries

任何 Markdown 落地不得：

- 恢复旧 `AGENTS.md`。
- 恢复旧 `docs/00-10`。
- 把旧规则当作 source of truth。
- 把当前实现事实写成永久限制。
- 把 AI 设定为可直接写账。
- 允许 UI 发明会计公式。
- 允许后端成为账本数据库。
- 自动提交。

## 7. Future File Structure

建议后续正式执行阶段生成：

```text
docs/
├─ council/
├─ constitution/
├─ discovery/
├─ specs/
├─ experiments/
├─ adr/
└─ context/
```

本轮 Bootstrap 只创建 `docs/council/`。

