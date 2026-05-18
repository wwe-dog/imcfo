# Round 2 External Intelligence

## 1. Round Goal

引入外部信息，为 IMCFO 提供参照，但不照搬竞品、不用趋势压倒产品灵魂。外部信息只能作为启发和风险校准，不能直接进入 Constitution。

## 2. Research Scope

本轮检索覆盖：

- AI-first accounting / bookkeeping products
- Open-source personal finance products on GitHub
- 国内个人记账产品语境
- 语音 / 自然语言输入
- 用户持续记账摩擦
- 金融 dashboard 与可读性
- AI 财务工作流中的人类确认机制

## 3. Research Breadth Log

本轮执行过结构化检索，而不是只检索三次。检索主题覆盖：

- AI accounting agents：QuickBooks、Xero JAX、Sage Copilot、Zoho Zia、Digits、Dext、Ledge、Veelox、Truewind 等。
- Expense / spend AI agents：Ramp、Brex、Expensify、Navan 等。
- Personal finance apps：Monarch、Copilot Money、YNAB、Rocket Money、MoneyWiz、Walify、NALO、Coffer、Nimbler 等。
- GitHub / open-source finance：Actual Budget、Firefly III、Maybe Finance、Ivy Wallet、Alderfi、Treeline 等。
- 中国记账语境：钱迹、随手记、鲨鱼记账、有鱼记账、挖财、喵喵记账、口袋记账、松鼠记账等。
- Voice / natural language expense capture：CashVoice、Vocash、Expendy、Receeto、HeyJerni、Tracklet、VoiceSpend 等。
- Research / safety / UX：personal informatics abandonment、dashboard readability、dark mode contrast、NIST AI RMF、mobile API key leakage、Chinese finance/accounting LLM benchmarks。

说明：用户希望继续扩展到极大规模检索。本文件先记录当前已筛选出的高价值证据。营销页、重复页、低可信 SEO 页和 Reddit anecdote 只作为弱信号，不进入强证据。

## 4. External Findings

| Source | Date | Finding | Relevance to IMCFO | Limitation / Not Applicable Boundary | Confidence |
| --- | --- | --- | --- | --- | --- |
| [QuickBooks AI Accounting](https://quickbooks.intuit.com/global/ai-agents/accounting/) | Accessed 2026-05-12 | QuickBooks 将 AI 用于分类、异常检测、协作和财务洞察。 | AI 会计产品正在从录入工具走向财务工作流助手。IMCFO 可借鉴“AI 提效但保留确认”的思路。 | 面向小企业和会计工作流，不是中国个人 CFO；不能照搬税务、多人协作、企业账套。 | High |
| [Xero JAX](https://www.xero.com/us/ai-in-accounting/jax/) | Accessed 2026-05-12 | Xero 把 JAX 定位为 AI business companion，并强调用户控制、review output、数据安全和供应商披露。 | 支持 IMCFO 的 AI Draft 必须可审查、可解释、可由用户控制。 | Xero 是 SMB accounting SaaS；不能把发票、应付应收企业流程扩到 MVP。 | High |
| [Sage Copilot](https://www.sage.com/en-us/sage-copilot/) | Accessed 2026-05-12 | Sage 将 Copilot 定位为 finance/accounting assistant。 | 说明 AI 财务助手必须建立在会计专业语境上，而不是泛聊天。 | 企业软件语境重，不直接决定个人移动端产品范围。 | High |
| [Zoho Books AI Features](https://www.zoho.com/ca/books/help/ai-features/ai-features.html) | Accessed 2026-05-12 | Zoho Books 提供语音助手和财务趋势洞察。 | 语音输入和 AI 洞察已经是通用方向，IMCFO 差异不能只靠“能语音记账”。 | Zoho 是企业会计系统，不适合复制模块广度。 | Medium |
| [Digits](https://digits.com/) | Accessed 2026-05-12 | Digits 强调 AI-native ledger、实时财务报表、自动分类、质量检查和 posting review。 | 强化“AI 不能绕过账本质量门”的判断。 | 企业总账与会计服务；不适合把 IMCFO 做成重型企业系统。 | High |
| [Veelox AI](https://www.veeloxai.com/) | Accessed 2026-05-12 | AI 生成 draft journal entries，用户 review/approve 后才进入 ledger。 | 非常贴合 IMCFO 的 Candidate Draft 边界：AI 可以准备，但不能自动成为正式账。 | 面向 accounting firms；个人用户不能承受重审批流程。 | High |
| [Ledge Journal Entry Agents](https://www.ledge.co/solutions/journal-entries) | Accessed 2026-05-12 | AI 准备 journal entries，保留 evidence、review、approval 和 posting 链路。 | 支持“可追溯 + 人类确认 + 审批门”的 AI 入账边界。 | 企业 close workflow，不应扩展到 IMCFO 当前 MVP。 | High |
| [Avelor](https://avelor.io/) | Accessed 2026-05-12 | 标明 AI assists with citations and approval gates, AI never posts。 | 强证据支持“AI never posts”作为 IMCFO 底线。 | 上游 GL 企业工具，不是个人财务移动端。 | High |
| [Ramp Accounting Automation](https://ramp.com/accounting-automation-software) | Accessed 2026-05-12 | Ramp 用 AI 填充会计字段、减少人工和错误。 | 说明 AI 可减少分类摩擦，但必须保留规则和历史上下文。 | 企业 spend management；员工报销和公司政策不进入 IMCFO MVP。 | Medium |
| [Brex AI](https://www.brex.com/platform/brex-ai) | Accessed 2026-05-12 | Brex 将 expense memos、receipts、policy help 做成 AI assistants。 | 说明用户不想手动补元数据，AI 可帮助补齐上下文。 | 企业费用报销；不能把公司 policy workflow 搬进个人 App。 | Medium |
| [Expensify AI Expense Management](https://use.expensify.com/ai-expense-management) | Accessed 2026-05-12 | AI 用于 receipt scanning、expense categorization、policy enforcement 和 exception flagging。 | 支持 IMCFO “低摩擦输入 + 异常提示”的方向。 | 企业 expense report 不是个人 CFO；审批链路不能过重。 | Medium |
| [Navan Intelligence](https://navan.com/intelligence) | Accessed 2026-05-12 | Travel/expense AI agents 自动化报销材料和费用报告。 | 证明 AI expense capture 已经商品化；IMCFO 应避免只做“更快记账”。 | 差旅报销场景与中国个人日常消费不同。 | Medium |
| [Monarch AI Features](https://help.monarch.com/hc/en-us/articles/16116906962452-About-Monarch-s-AI-Features) | Accessed 2026-05-12 | Monarch AI assistant 帮用户理解财务变化、提问和导航。 | IMCFO 可以将 AI 从输入扩展为解释层，但解释必须基于可信数据。 | 主要是预算/账户聚合，不是公司式三表系统。 | High |
| [Copilot Money](https://www.copilot.money/) | Accessed 2026-05-12 | 强调自动分类、清晰、美观、可信的 personal finance experience。 | 高质量个人财务产品重视信任和信息清晰。 | 美国银行连接语境，不适合直接复制。 | Medium |
| [YNAB Method](https://www.ynab.com/what-is-a-zero-based-budget/) | Accessed 2026-05-12 | YNAB 不是只卖 app，而是卖一套方法。 | IMCFO 也必须有方法论：“像经营公司一样经营自己”。 | Zero-based budgeting 不是 IMCFO 的核心会计模型。 | High |
| [Rocket Money FAQ](https://www.rocketmoney.com/faq) | Accessed 2026-05-12 | Rocket Money 聚焦订阅取消、预算、信用、储蓄、净资产。 | 个人财务产品必须帮用户做行动，而不是只展示图表。 | 偏消费金融和账单服务，不适合中国 MVP 照搬。 | Medium |
| [Actual Budget](https://actualbudget.org/) and [actualbudget/actual](https://github.com/actualbudget/actual) | Accessed 2026-05-12 | Actual 强调 local-first、用户掌控、快速交易管理、报表、导入、undo/redo。 | 个人财务产品的隐私、可撤销和数据掌控很关键。 | Envelope budgeting 不能直接成为 IMCFO 核心。 | High |
| [Firefly III](https://github.com/firefly-iii/firefly-iii) | Accessed 2026-05-12 | 开源个人财务管理器，重视账户、交易、分类、预算、报表、导入。 | 提醒 IMCFO 需要稳固数据模型和导入边界。 | Self-hosted web 形态不适合当前移动端 MVP 直接复制。 | Medium |
| [Maybe Finance](https://maybefinance.com/about) | Accessed 2026-05-12 | 自称 open-source personal finance OS，强调强大、透明、可访问。 | “personal finance OS” 与 IMCFO 的 personal CFO 叙事有相邻性。 | 不是中国移动端记账语境；维护状态和商业路径需另查。 | Medium |
| [Alderfi](https://www.alderfi.org/) | Accessed 2026-05-12 | AI-native personal finance，local-first by default。 | 说明 AI-first + local-first 已成为新个人财务产品组合方向。 | 早期产品，不足以作为强证据。 | Low |
| [钱迹 / 李唐科技](https://www.litangkj.com/) | Accessed 2026-05-12 | 钱迹强调极简、无广告、最少 3 步完成记账。 | 中国用户对快、轻、少干扰有强需求。IMCFO 的 CFO 叙事必须建立在低摩擦输入上。 | 仍偏传统记账 / 预算工具；不能变成普通记账换皮。 | High |
| [钱迹 App Store](https://apps.apple.com/cn/app/%E9%92%B1%E8%BF%B9%E8%AE%B0%E8%B4%A6-%E6%97%A0%E5%B9%BF%E5%91%8A%E8%87%AA%E5%8A%A8%E8%AE%B0%E8%B4%A6%E8%BD%AF%E4%BB%B6-%E9%A2%84%E7%AE%97-%E8%B5%84%E4%BA%A7%E7%AE%A1%E7%90%86/id1473785373) | Accessed 2026-05-12 | 更新说明包含自动记账、AI 智能匹配、快捷指令和资产细节。 | AI 自动匹配已进入国内记账产品，不足以单独构成差异。 | App Store 文案是产品营销，需谨慎降权。 | Medium |
| [随手记 App Store](https://apps.apple.com/us/app/%E9%9A%A8%E6%89%8B%E8%A8%98-%E8%A8%98%E5%B8%B3%E5%B0%B1%E7%94%A8%E9%9A%A8%E6%89%8B%E8%A8%98/id372353614) | Accessed 2026-05-12 | 提到微信/支付宝账单导入、AI 记账、语音记账、图片输入等。 | 国内头部记账产品已经覆盖多入口输入；IMCFO 需要更强的经营反馈差异。 | 多账本和云同步不自动进入 MVP。 | Medium |
| [鲨鱼记账](https://www.shayujizhang.com/) | Accessed 2026-05-12 | 强调 3 秒快速记账、日历、图表、提醒。 | 说明速度和习惯提醒是中国记账 App 常规竞争点。 | 普通记账定位，不适合复制为 IMCFO 灵魂。 | Medium |
| [有鱼记账 App Store](https://apps.apple.com/cn/app/%E6%9C%89%E9%B1%BC%E8%AE%B0%E8%B4%A6-%E5%BF%AB%E9%80%9F%E8%AF%AD%E9%9F%B3%E8%87%AA%E5%8A%A8%E8%AE%B0%E8%B4%A6%E8%BD%AF%E4%BB%B6/id1227412316) | Accessed 2026-05-12 | 强调语音记账、截图导入、资产趋势、预算、多个账本模板。 | 多场景账本说明中国用户有生活语境分类需求。 | 多模板容易扩散 scope，不应进入核心宪法。 | Medium |
| [挖财记账 App Store](https://apps.apple.com/cn/app/%E6%8C%96%E8%B4%A2%E8%AE%B0%E8%B4%A6-%E5%A5%BD%E7%94%A8%E7%9A%84%E8%AE%B0%E8%B4%A6%E6%9C%AC/id1544045905) | Accessed 2026-05-12 | AI 自动记账、快捷指令、账单导入、资产负债、预算目标。 | 国内成熟记账产品已经有 AI + 资产负债 + 多报表组合。IMCFO 必须避免功能堆叠。 | App Store 文案强营销；不能直接证明留存。 | Medium |
| [喵喵记账 App Store](https://apps.apple.com/cn/app/%E5%96%B5%E5%96%B5%E8%AE%B0%E8%B4%A6-%E8%B6%85%E5%8F%AF%E7%88%B1%E7%9A%84%E8%90%8C%E5%AE%A0%E8%AE%B0%E8%B4%A6app/id1483024444) | Accessed 2026-05-12 | 用可爱收集、互动、成就感降低记账心理负担。 | 提醒 IMCFO 的留存要有情绪/反馈机制，不能只有严肃报表。 | 萌宠游戏化不符合 IMCFO CFO 可信气质，不应照搬。 | Medium |
| [CashVoice](https://cashvoice.app/) and [Vocash](https://www.vocash.app/) | Accessed 2026-05-12 | 多个轻量产品将 voice-first expense tracking 作为核心卖点。 | 语音记账已是常见输入形态，IMCFO 的核心应是翻译和反馈，而不是语音本身。 | 小产品可信度有限，作为市场弱信号。 | Low |
| [Receeto](https://receeto.app/) and [HeyJerni](https://www.heyjerni.com/) | Accessed 2026-05-12 | 强调 on-device OCR/AI、offline/privacy-first expense capture。 | 支持“个人财务数据敏感，能本地则本地”的方向。 | 平台能力和具体实现不适合作为永久架构限制。 | Medium |
| [Reconsidering the Device in the Drawer](https://pmc.ncbi.nlm.nih.gov/articles/PMC5432203/) | Accessed 2026-05-12 | Personal informatics 研究关注 lapsing、abandonment 和 re-engagement。 | 记账产品必须设计“断了还能回来”的机制，不能假设用户每天自律。 | 健康/个人追踪研究，不是专门记账产品。 | High |
| [Beyond Abandonment to Next Steps](https://depstein.net/assets/pubs/depstein_chi16c.pdf) | Accessed 2026-05-12 | 个人追踪工具放弃后仍可能产生后续行为变化。 | IMCFO 应把目标从“连续打卡”转为“理解后行动”。 | 不是财务专项研究，需降为行为设计启发。 | Medium |
| [Personal Data Visualisation on Mobile Devices](https://arxiv.org/abs/2203.01374) | Accessed 2026-05-12 | 移动端个人数据可视化需要考虑用户差异、屏幕限制和理解成本。 | 三表移动端展示必须控制信息密度和解释层级。 | 文献综述，不给出 IMCFO 具体界面答案。 | Medium |
| [NN/g low-contrast text](https://www.nngroup.com/articles/low-contrast/) | Accessed 2026-05-12 | 低对比文字会伤害可读性和可用性。 | Dark Liquid CFO Style 必须优先保证数字、标签、报表可读。 | 不是专门金融 App 研究。 | High |
| [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework) | Accessed 2026-05-12 | AI 系统应围绕风险治理、可信性、评估和生命周期管理。 | 支持 IMCFO 对 AI 入账设置 governance、human confirmation、可追溯边界。 | 框架通用，不能直接转为产品功能清单。 | High |
| [OWASP Mobile Cryptographic Key Storage](https://mas.owasp.org/MASTG/knowledge/android/MASVS-STORAGE/MASTG-KNOW-0047/) | Accessed 2026-05-12 | 移动端密钥存储需要谨慎，secret 暴露会影响架构。 | 支持 API key / secret 不得进入前端。 | 具体安全实现应进 specs/security ADR，而不是宪法写死方案。 | High |
| [Okta: OAuth API Keys Aren't Safe in Mobile Apps](https://developer.okta.com/blog/2019/01/22/oauth-api-keys-arent-safe-in-mobile-apps) | Accessed 2026-05-12 | 移动端 secret 可被逆向，不应把秘密当作安全地藏在 app 中。 | 强化 AI / ASR / LLM key 只能在受控后端或代理层。 | OAuth 语境，不是 IMCFO 专项，但原则高度适用。 | High |
| [Don't Leak Your Keys](https://arxiv.org/abs/2306.08151) | Accessed 2026-05-12 | 微信小程序生态中 AppSecret 泄露风险真实存在。 | 中国移动生态下前端/小程序 secret 泄露尤其 relevant。 | 小程序不是 Expo app，但风险模式相邻。 | High |
| [Kuaiji](https://arxiv.org/abs/2402.13866) | Accessed 2026-05-12 | 中文会计 LLM 已出现，强调会计数据集和真实场景评估。 | 中国会计语义可被专门模型增强，但模型能力不等于可直接写账。 | 研究模型不能替代 transaction rules。 | Medium |
| [CFinBench](https://arxiv.org/abs/2407.02301) and [FinEval](https://arxiv.org/abs/2308.09975) | Accessed 2026-05-12 | 中文金融 benchmark 显示金融任务需要专门评估。 | IMCFO 不能假设通用模型总能正确处理金额、方向、会计语义。 | benchmark 与个人记账 Draft 任务不同。 | Medium |
| [Personal Balance Sheet - Britannica Money](https://www.britannica.com/money/personal-balance-sheet) | Accessed 2026-05-12 | 个人资产负债表用于理解个人拥有和欠债的状态。 | 支持 IMCFO 把个人当作经营主体来理解。 | 不提供三表 App 交互方案。 | High |
| [Lumen Personal Finance Accounting and Financial Statements](https://courses.lumenlearning.com/suny-personalfinance/chapter/3-1-accounting-and-financial-statements/) | Accessed 2026-05-12 | 个人财务也可使用 income statement、cash flow statement、balance sheet。 | 直接支持 IMCFO 的个人三表方向。 | 教学材料，不是产品设计规范。 | High |
| [OpenAI Ramp app](https://openai.com/business/apps/ramp/) | Accessed 2026-05-12 | Ramp 可通过 ChatGPT 以权限控制方式查询和处理公司财务数据。 | AI agent + financial data 的未来方向需要 permissions 和 scoped access。 | 企业 connector 语境；IMCFO 当前不能把 agent 写成可直接操作账本。 | Medium |

## 4. GitHub Search Notes

用户允许搜索 GitHub。本轮将 GitHub 项目作为外部参照，但只用于识别成熟个人财务产品的结构模式：

- local-first / user-owned data 是个人财务产品常见优势。
- 交易导入、撤销、分类、转账、报表是用户信任的基础能力。
- 开源项目通常有明确 core / UI / sync / import 分层，说明 IMCFO 也需要架构契约，而不是把规则散在 screen 里。

不采纳为 Constitution 的内容：

- 不采纳 Actual 的 envelope budgeting 为 IMCFO 核心。
- 不采纳 Firefly III 的 self-hosted web app 形态。
- 不采纳任何 GitHub 项目的技术栈作为 IMCFO 永久限制。

## 5. Evidence Quality Critic Review

### 5.1 Evidence Risks

- 企业会计 AI 产品的成熟度不等于个人 CFO 产品可直接使用。
- 国内“AI 记账”搜索结果存在强营销倾向，不能证明用户长期留存。
- GitHub 项目能提供结构参照，但不能证明中国移动端用户偏好。
- 可读性研究能约束视觉底线，但不能替代 IMCFO 的视觉 identity。

### 5.2 Required Boundaries

- 外部信息不得直接决定宪法规则。
- 趋势不能替代 IMCFO 的产品灵魂。
- 竞品功能不能自动进入 scope。
- 外部产品中的 AI 自动化不能削弱 IMCFO 的用户确认和交易规则边界。

## 6. Product Doctrine Agent Takeaway

外部世界说明：AI 记账、自动分类、dashboard 都已经不稀缺。IMCFO 的独特性必须放在“个人 CFO 系统”上：

```text
输入一笔生活事件
-> 系统翻译成公司式财务语言
-> 用户理解自己的经营状态
-> 形成下一步行动
```

## 7. Stop Condition

Round 2 已完成。可以进入 Round 3 Initial Claims。
