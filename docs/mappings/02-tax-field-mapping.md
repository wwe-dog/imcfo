# 我为 CFO · 税务字段映射 v0.1

本文档定义 V0.1 税务字段如何服务普通自然人的记录和后续扩展。它不用于正式申报。

## 1. 自然人收入类型映射

| 产品分类 | 建议 taxCategory | 说明 |
| --- | --- | --- |
| 工资薪金 | salary | 工资、奖金、津贴等工资薪金类收入 |
| 劳务收入 | laborService | 劳务报酬类收入 |
| 稿酬 | manuscript | 稿酬类收入 |
| 特许权使用费 | royalty | 特许权使用费类收入 |
| 投资收益 | interestDividendBonus | 利息、股息、红利等 |
| 财产租赁 | propertyLease | 房屋或其他财产租赁收入 |
| 财产转让 | propertyTransfer | 出售资产等转让收入 |
| 偶然所得 | incidental | 中奖、偶然所得等 |
| 兼职收入 | simpleSideIncome | V0.1 只作为普通自然人收入记录 |
| 其他收入 | other | 无法明确归类时使用 |

## 2. 字段说明

- `taxCategory`：税务收入分类。
- `taxWithheld`：已预扣或已缴税额。
- `taxPeriod`：税务所属期间。
- `beforeTaxAmount`：税前金额。
- `afterTaxAmount`：税后到账金额。
- `socialInsuranceAmount`：社保金额。
- `housingFundAmount`：公积金金额。
- `deductionType`：扣除类型，V0.1 仅预留。
- `isTaxRelated`：是否与税务记录相关。

## 3. 工资条记录建议

如果用户知道工资条信息，可记录：

- 税前收入：`beforeTaxAmount`
- 个税：`taxWithheld`
- 社保：`socialInsuranceAmount`
- 公积金：`housingFundAmount`
- 实际到账：`afterTaxAmount`

V0.1 报表收入默认可按税后到账金额处理，税前字段用于后续年度汇总。

## 4. 不允许的产品行为

V0.1 不允许：

- 自动判断用户应纳税额。
- 自动生成纳税申报表。
- 给出节税、避税或税务筹划建议。
- 将简单副业收入自动归入个体工商户经营所得。
- 输出可提交税务机关的文件。

## 5. 合规提示

涉及正式申报、税务争议、复杂经营所得、境外所得、个体工商户、个人独资企业等场景时，应提示用户以税务机关官方口径和专业意见为准。
