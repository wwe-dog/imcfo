export type AnalysisTone = "danger" | "good" | "neutral" | "primary" | "warning";

export interface AnalysisStatusBlock {
  label: string;
  tone: AnalysisTone;
  value: string;
}

export interface AnalysisMetric {
  label: string;
  tone?: AnalysisTone;
  value: string;
}

export interface AnalysisTableRow {
  cells: string[];
  tone?: AnalysisTone;
}

export interface AnalysisRiskRow {
  amount: string;
  hint: string;
  item: string;
  level: string;
  tone: AnalysisTone;
}

export interface OperatingAnalysisReport {
  basisText: string;
  coreTable: AnalysisTableRow[];
  generatedDate: string;
  periodLabel: string;
  recommendations: string[];
  riskRows: AnalysisRiskRow[];
  statusBlocks: AnalysisStatusBlock[];
  summaryText: string;
  unit: string;
}

const currency = (value: number) =>
  new Intl.NumberFormat("zh-CN", {
    currency: "CNY",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "currency",
  }).format(value);

const percent = (value: number | null) => (value === null ? "不可计算" : `${(value * 100).toFixed(1)}%`);

export function buildOperatingAnalysisReport(input?: {
  assets: Asset[];
  liabilities: Liability[];
  period: ReportPeriod;
  previousTransactions?: Transaction[];
  transactions: Transaction[];
}): OperatingAnalysisReport {
  if (input) {
    const balance = buildBalanceSheetSummary(input.assets, input.liabilities);
    const income = buildIncomeStatementSummary(input.transactions);
    const previousIncome = buildIncomeStatementSummary(input.previousTransactions ?? []);
    const cashFlow = buildCashFlowStatementSummary(input.transactions);
    const expenseIncomeRatio = income.totalIncome > 0 ? income.totalExpenses / income.totalIncome : null;
    const debtTone: AnalysisTone =
      balance.assetLiabilityRatio === null ? "neutral" : balance.assetLiabilityRatio > 0.5 ? "danger" : balance.assetLiabilityRatio > 0.3 ? "warning" : "good";
    const profitTone: AnalysisTone = income.profit >= 0 ? "good" : "danger";
    const cashTone: AnalysisTone = cashFlow.cashNetChange >= 0 ? "good" : "warning";
    const previousProfit = previousIncome.profit;

    return {
      basisText: "基于本地资产负债表、现金流量表和利润表生成",
      coreTable: [
        { cells: ["本期净收支", currency(income.profit), currency(previousProfit), income.profit >= 0 ? "为正" : "为负"], tone: profitTone },
        { cells: ["净收支率", percent(income.savingsRate), percent(previousIncome.savingsRate), income.profit >= previousProfit ? "改善" : "回落"], tone: income.profit >= previousProfit ? "good" : "warning" },
        { cells: ["负债率", percent(balance.assetLiabilityRatio), "-", debtTone === "good" ? "稳健" : debtTone === "warning" ? "可控" : "偏高"], tone: debtTone },
        { cells: ["净现金流", currency(cashFlow.cashNetChange), "-", cashFlow.cashNetChange >= 0 ? "流入" : "流出"], tone: cashTone },
        { cells: ["支出收入比", percent(expenseIncomeRatio), "-", expenseIncomeRatio !== null && expenseIncomeRatio > 0.8 ? "关注" : "正常"], tone: expenseIncomeRatio !== null && expenseIncomeRatio > 0.8 ? "warning" : "good" },
      ],
      generatedDate: new Date().toISOString().slice(0, 10),
      periodLabel: input.period.label,
      recommendations: [
        income.profit < 0 ? "优先压缩非必要支出，确保本期净收支转正。" : "继续保持收入覆盖支出，优先把结余分配给储备或负债偿还。",
        cashFlow.cashNetChange < 0 ? "关注现金流出项目，避免用短期负债维持日常支出。" : "现金流为正，可以继续跟踪固定占用和项目投入。",
        balance.assetLiabilityRatio !== null && balance.assetLiabilityRatio > 0.5 ? "负债率偏高，建议减少新增债务并安排还款优先级。" : "资产负债结构处于可控区间，继续定期核对资产估值。",
      ],
      riskRows: [
        {
          amount: currency(balance.totalLiabilities),
          hint: "负债率越高，现金流承压越明显。",
          item: "总负债",
          level: debtTone === "danger" ? "高风险" : debtTone === "warning" ? "中风险" : "低风险",
          tone: debtTone,
        },
        {
          amount: currency(cashFlow.cashNetChange),
          hint: "净现金流为负时，需要排查大额支出或投资流出。",
          item: "净现金流",
          level: cashTone === "good" ? "低风险" : "中风险",
          tone: cashTone,
        },
      ],
      statusBlocks: [
        { label: "盈利能力", tone: profitTone, value: income.profit >= 0 ? "良好" : "承压" },
        { label: "偿债能力", tone: debtTone, value: debtTone === "good" ? "稳健" : debtTone === "warning" ? "可控" : "偏高" },
        { label: "现金流质量", tone: cashTone, value: cashFlow.cashNetChange >= 0 ? "为正" : "流出" },
        { label: "风险事项", tone: debtTone === "danger" || cashTone === "warning" ? "warning" : "good", value: debtTone === "danger" || cashTone === "warning" ? "需跟进" : "正常" },
      ],
      summaryText: `本期收入 ${currency(income.totalIncome)}，支出 ${currency(income.totalExpenses)}，净收支 ${currency(income.profit)}；总资产 ${currency(balance.totalAssets)}，总负债 ${currency(balance.totalLiabilities)}。`,
      unit: "人民币（元）",
    };
  }

  return {
    basisText: "基于资产负债表、现金流量表和利润表生成",
    coreTable: [
      { cells: ["本月净收益", "¥8,432.19", "¥6,900.00", "良好"], tone: "good" },
      { cells: ["净收益率", "29.4%", "25.6%", "良好"], tone: "good" },
      { cells: ["负债率", "28.6%", "30.2%", "可控"], tone: "warning" },
      { cells: ["净现金流", "+¥8,432.19", "+¥6,900.00", "良好"], tone: "good" },
      { cells: ["支出收入比", "70.6%", "77.6%", "关注"], tone: "danger" },
    ],
    generatedDate: "2026年5月2日",
    periodLabel: "2026年4月",
    recommendations: [
      "优先处理信用卡待还与待收款，降低短期现金流扰动。",
      "继续压缩非必要支出，提升净收益率。",
      "对投资资产波动保持观察，避免短期亏损扩大影响整体净资产质量。",
    ],
    riskRows: [
      {
        amount: "¥3,520.00",
        hint: "建议按时还款，避免产生利息与罚金",
        item: "待还信用卡",
        level: "中风险",
        tone: "warning",
      },
      {
        amount: "¥5,800.00",
        hint: "持续跟进回款，提高回收效率",
        item: "待收款",
        level: "中风险",
        tone: "warning",
      },
      {
        amount: "-¥2,150.32",
        hint: "短期波动属正常，保持长期视角",
        item: "投资浮动",
        level: "低风险",
        tone: "good",
      },
    ],
    statusBlocks: [
      { label: "盈利能力", tone: "good", value: "良好" },
      { label: "偿债能力", tone: "warning", value: "可控" },
      { label: "现金流质量", tone: "good", value: "良好" },
      { label: "风险事项", tone: "danger", value: "需跟进" },
    ],
    summaryText: "本期净资产继续增长，现金流为正，负债压力可控，整体经营质量稳健偏优。",
    unit: "人民币（元）",
  };
}
import type { Asset, Liability, ReportPeriod, Transaction } from "../models";
import {
  buildBalanceSheetSummary,
  buildCashFlowStatementSummary,
  buildIncomeStatementSummary,
} from "../accounting/calculations";
