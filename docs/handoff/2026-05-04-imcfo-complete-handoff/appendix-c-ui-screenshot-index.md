# 附录 C：UI 截图索引

截图目录：`D:\imcfo\docs\handoff\2026-05-04-imcfo-complete-handoff\screenshots`

本轮截图主要来自当前 Android 模拟器中的 Expo Go 运行画面。资产负债和交易细节页在本轮 adb 定点导航中未全部稳定复现，因此从旧交接包复制了已经确认来自 Android 模拟器的补充截图，并在文件名中标注 `supplement`。

## 1. 本轮当前模拟器截图

1. `01-home-top.png`：首页顶部，净资产 hero、经营结论、现金流和资产结构摘要。
2. `02-home-middle.png`：首页中段，滚动后的关注事项和摘要区域。
3. `03-home-bottom.png`：首页底部，更多经营复盘内容。
4. `04-manage-top.png`：管理页顶部，自然语言记一笔和按钮记账入口。
5. `05-manage-lower.png`：管理页账务中心，账户、资产负债、对账、交易记录入口。
6. `06-reports-top.png`：报表页顶部，三大报表预览和报表元信息。
7. `07-reports-full-report.png`：报表页完整报表入口附近。
8. `08-reports-lower.png`：报表页下半部分，完整报表和模式切换区域。
9. `09-settings-top.png`：我的/设置页顶部，个人摘要和工具入口。
10. `10-settings-data.png`：我的/设置页数据管理区域。
11. `11-operating-analysis-report.png`：经营分析报告，综合结论和核心指标。
12. `13-profitability-analysis-middle.png`：盈利能力分析中段，收入结构、分析说明和改进建议。
13. `14-manage-accounting-center.png`：管理页账务中心入口区。
14. `15-account-management-overview.png`：账户管理总览。
15. `16-account-category-detail.png`：账户分类详情。
16. `17-account-detail-sheet.png`：账户详情底部弹层。

## 2. 补充参考截图

以下文件已从旧交接包复制到当前截图目录，作为子页面补充参考：

17. `18-transaction-records-supplement.png`：交易记录。
18. `19-transaction-detail-supplement.png`：交易详情。
19. `20-assets-liabilities-overview-supplement.png`：资产负债管理总览。
20. `21-asset-subject-detail-supplement.png`：资产科目详情。
21. `22-asset-detail-supplement.png`：资产明细详情。
22. `23-liability-overview-supplement.png`：负债总览。
23. `24-liability-subject-detail-supplement.png`：负债科目详情。

## 3. UI 验收重点

- 首页、球体、智能记一笔、AI 输入入口和 HUD 后续可以采用“IMCFO 暗黑液态 CFO 风格”，包括深色数字金融背景、液态玻璃财务球体、HUD 数据流和轻量空间层级。
- 橙色保留为品牌锚点、关键行动色和警示色之一，不再是唯一视觉主色。
- 首页和报表摘要可以保留卡片和图表，但必须保证金额和指标可读。
- 二级/三级管理页应保持线分隔列表风格，不应堆叠大量玻璃卡片或发光透明层。
- 底部导航固定为：首页 / 管理 / 报表 / 我的。
- 长页面底部内容不能被底部导航遮挡。
- 金额、状态、风险颜色要一致。
- 经营分析和盈利能力分析目前是静态报告 UI，不能误判为真实计算完成。
