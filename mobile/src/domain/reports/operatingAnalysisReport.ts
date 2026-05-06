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

export function buildOperatingAnalysisReport(): OperatingAnalysisReport {
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
