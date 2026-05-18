# IMCFO Constitution v2 Council Operating Protocol

## 1. Purpose

本协议定义 IMCFO Constitution v2 Council 的议会运行方式。

核心原则：

> 宪法不是为了禁止变化，而是为了保证变化不会破坏 IMCFO 的灵魂。

## 2. Bootstrap Boundary

当前 Bootstrap 阶段只允许创建 council 文档。

没有用户明确确认，不得进入正式 Constitution v2 Rebuild 执行阶段。

Bootstrap 阶段禁止：

- 恢复旧 `AGENTS.md`。
- 恢复旧 `docs/00-10`。
- 执行完整 codebase discovery。
- 收集外部情报。
- 写最终 Constitution v2 正文。
- 修改 mobile 业务代码。
- 修改 backend 业务代码。
- 修改 package / lockfile。
- 自动提交。

## 3. Claim Flow

任何主 Agent 的主张不能直接进入 Constitution。

标准流转：

```text
Main Agent claim
→ Paired Critic challenge
→ Cross-Debate Arena
→ Revised claim
→ Constitution Court ruling
→ Markdown Landing Studio placement
→ Markdown QA
→ Final QA Gate
```

## 4. Critic Requirement

每个主 Agent 必须经过对应 Critic Agent 挑刺。

Critic Agent 必须：

- 攻击假设。
- 指出风险。
- 提出替代方案。
- 标记不适合进入 Constitution 的内容。
- 区分 rejected、moved to specs、moved to experiments、moved to ADR。

Critic Agent 不得：

- 只反对不替代。
- 直接改写最终宪法。
- 越权决定产品方向。

## 5. Cross-Debate Arena

各 Doctrine Chamber 必须参与 Cross-Debate Arena。

至少进行以下交叉质询：

- Product ↔ User Behavior
- Product ↔ Visual
- Financial ↔ AI Input
- Financial ↔ User Behavior
- Architecture ↔ AI Input
- Architecture ↔ Visual
- Workflow ↔ All

交叉质询目标：

- 找出产品主张与用户行为是否一致。
- 找出 AI 输入是否破坏财务底线。
- 找出视觉体验是否牺牲可读性和性能。
- 找出架构契约是否锁死技术栈。
- 找出流程是否过重或容易失控。

## 6. Constitution Court Ruling

Constitution Court 决定每条候选规则的归属：

- accepted
- rejected
- moved to specs
- moved to experiments
- moved to ADR
- moved to discovery
- needs rewrite

Court 权限：

- Chief Constitution Architect 负责整体裁决整合。
- Scope Judge 有权阻止范围膨胀。
- Contradiction Judge 有权阻止矛盾规则进入文档。
- Originality Judge 有权删除普通、空泛、无差异规则。

Court 禁止：

- 直接落盘。
- 绕过 Markdown Landing Studio。
- 把 implementation facts 和 constitution rules 混在一起。

## 7. Markdown Landing Studio Rules

Document Writer 只能根据裁决落盘。

Innovation Freedom Agent 有权阻止过度限制创新的规则。

Spec Boundary Agent 有权阻止实现细节进入 Constitution。

Markdown QA Agent 必须检查：

- 标题层级。
- 文件职责。
- 重复规则。
- 矛盾规则。
- 空泛规则。
- 当前实现事实是否被误写为长期限制。

## 8. Final QA Gate

Final QA Gate 必须检查 diff。

Diff Reviewer 必须输出：

```powershell
git diff --name-status
```

必须确认：

- 没有误恢复旧 `AGENTS.md`。
- 没有误恢复旧 `docs/00-10`。
- 没有误改 mobile 业务代码。
- 没有误改 backend 业务代码。
- 没有误改 package / lockfile。
- 没有把当前技术栈写成永久限制。
- 没有把 AI 设定为可直接写账。
- 没有允许 UI 发明会计公式。
- 没有允许后端成为账本数据库。

## 9. Permanent Safety Rules

除非用户另行明确授权，否则任何 council 执行都不得：

- 自动提交。
- `git add .`
- 修改业务代码。
- 恢复旧规则。
- 跳过用户确认进入下一阶段。

## 10. User Confirmation Rule

没有用户明确确认，不得进入正式 Constitution v2 Rebuild 执行阶段。

`docs/council/next-execution-prompt.md` 是下一阶段提示词草案，本轮不能执行。

