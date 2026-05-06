import type { AppIconName } from "../../components/AppIcon";

export type ProfitabilityTone = "danger" | "good" | "neutral" | "primary" | "warning";

export interface ProfitabilityMetricRow {
  change: string;
  changeTone: ProfitabilityTone;
  current: string;
  dataSource: string;
  formula: string;
  indicator: string;
  interpretation: string;
  judgement: string;
  judgementTone: ProfitabilityTone;
  previous: string;
}

export interface NetIncomeTrendPoint {
  changeRate: number | null;
  expense: string;
  income: string;
  netIncome: number;
  netIncomeLabel: string;
  netIncomeRate: number;
  period: string;
}

export interface CompositionItem {
  amount: string;
  color: string;
  explanation: string;
  label: string;
  percent: number;
  percentLabel: string;
}

export interface SuggestionItem {
  body: string;
  title: string;
}

export interface IncomeStructureSummaryRow {
  label: string;
  tone?: "good" | "neutral" | "warning";
  value: string;
}

export type IncomeStructureNodeKind = "deduction" | "income" | "net" | "project" | "root";

export interface IncomeStructureSourceNode {
  amount: number;
  children?: IncomeStructureSourceNode[];
  description?: string;
  icon: AppIconName;
  id: string;
  kind: IncomeStructureNodeKind;
  label: string;
  percentage?: number;
  rootLabel?: string;
  summary?: IncomeStructureSummaryRow[];
}

export interface ProfitabilityAnalysisReport {
  analysisText: string;
  conclusionSummary: string;
  currentExpenseTotal: number;
  currentIncomeTotal: number;
  currentNetIncome: number;
  expenseComposition: CompositionItem[];
  footerNote: string;
  incomeComposition: CompositionItem[];
  incomeStructureRoot: IncomeStructureSourceNode;
  metricRows: ProfitabilityMetricRow[];
  netIncomeRateLabel: string;
  periodLabel: string;
  statusLabel: string;
  subtitle: string;
  suggestions: SuggestionItem[];
  trendPoints: NetIncomeTrendPoint[];
  trendPoints12: NetIncomeTrendPoint[];
  unitLabel: string;
}

const currency = (value: number) =>
  `¥${value.toLocaleString("zh-CN", {
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
  })}`;

const composition = (
  label: string,
  amount: number,
  percent: number,
  color: string,
  explanation: string,
): CompositionItem => ({
  amount: currency(amount),
  color,
  explanation,
  label,
  percent,
  percentLabel: `${percent.toFixed(1)}%`,
});

export function buildProfitabilityAnalysisReport(): ProfitabilityAnalysisReport {
  const currentIncomeTotal = 28650;
  const currentExpenseTotal = 20217.81;
  const currentNetIncome = 8432.19;

  const salaryTotal = 22000;
  const bonusTotal = 3500;
  const projectTotal = 1800;
  const investmentTotal = 900;
  const otherIncomeTotal = 450;

  const trendPoints: NetIncomeTrendPoint[] = [
    {
      changeRate: null,
      expense: currency(21148),
      income: currency(26468),
      netIncome: 5320,
      netIncomeLabel: currency(5320),
      netIncomeRate: 20.1,
      period: "2025-11",
    },
    {
      changeRate: 29.14,
      expense: currency(21400),
      income: currency(28270),
      netIncome: 6870,
      netIncomeLabel: currency(6870),
      netIncomeRate: 24.3,
      period: "2025-12",
    },
    {
      changeRate: 4.95,
      expense: currency(21630),
      income: currency(28840),
      netIncome: 7210,
      netIncomeLabel: currency(7210),
      netIncomeRate: 25,
      period: "2026-01",
    },
    {
      changeRate: -17.06,
      expense: currency(22095),
      income: currency(28075),
      netIncome: 5980,
      netIncomeLabel: currency(5980),
      netIncomeRate: 21.3,
      period: "2026-02",
    },
    {
      changeRate: 15.38,
      expense: currency(20945),
      income: currency(27845),
      netIncome: 6900,
      netIncomeLabel: currency(6900),
      netIncomeRate: 25.6,
      period: "2026-03",
    },
    {
      changeRate: 22.22,
      expense: currency(currentExpenseTotal),
      income: currency(currentIncomeTotal),
      netIncome: currentNetIncome,
      netIncomeLabel: currency(currentNetIncome),
      netIncomeRate: 29.4,
      period: "2026-04",
    },
  ];

  const incomeStructureRoot: IncomeStructureSourceNode = {
    amount: currentIncomeTotal,
    description: "本月全部收入来源的汇总入口，用于观察主要收入来源和可继续下钻的收入分支。",
    icon: "wallet",
    id: "total-income",
    kind: "root",
    label: "本月总收入",
    rootLabel: "本月总收入",
    summary: [
      { label: "总收入金额", value: currency(currentIncomeTotal) },
      { label: "占上月比", tone: "warning", value: "+8.6%" },
      { label: "收入来源数量", value: "5类" },
      { label: "主要收入来源", value: "工资收入（76.8%）" },
    ],
    children: [
      {
        amount: salaryTotal,
        description: "工资收入是本月最主要的收入来源，可继续查看税前构成和到手收入。",
        icon: "wallet",
        id: "salary-income",
        kind: "income",
        label: "工资收入",
        percentage: 76.8,
        rootLabel: "工资收入总额",
        summary: [
          { label: "收入金额", value: currency(salaryTotal) },
          { label: "占总收入比", value: "76.8%" },
          { label: "税收支出", value: currency(1100) },
          { label: "到手收入", tone: "good", value: currency(20900) },
        ],
        children: [
          {
            amount: 15000,
            description: "固定月薪部分，是工资收入中最稳定的来源。",
            icon: "wallet",
            id: "base-salary",
            kind: "income",
            label: "基本工资",
            percentage: 68.2,
          },
          {
            amount: 4000,
            description: "与绩效结果相关的工资收入，波动性高于基本工资。",
            icon: "chart",
            id: "performance-salary",
            kind: "income",
            label: "绩效工资",
            percentage: 18.2,
          },
          {
            amount: 3000,
            description: "交通、餐补、通讯等补贴类收入。",
            icon: "fund",
            id: "allowance",
            kind: "income",
            label: "津贴补贴",
            percentage: 13.6,
          },
          {
            amount: 1100,
            description: "工资相关税费扣减项，属于收入形成过程中的必要扣减。",
            icon: "card",
            id: "salary-tax",
            kind: "deduction",
            label: "税收支出",
            percentage: 5,
          },
          {
            amount: 20900,
            description: "工资收入扣除税费后的实际到手部分。",
            icon: "success",
            id: "take-home-pay",
            kind: "net",
            label: "到手收入",
            percentage: 95,
          },
        ],
      },
      {
        amount: bonusTotal,
        description: "奖金收入补充本月收入增长，当前未拆分更多下级项目。",
        icon: "fund",
        id: "bonus-income",
        kind: "income",
        label: "奖金收入",
        percentage: 12.2,
      },
      {
        amount: projectTotal,
        description: "项目收入来自阶段性项目回款，可继续查看项目级构成。",
        icon: "reports",
        id: "project-income",
        kind: "project",
        label: "项目收入",
        percentage: 6.3,
        rootLabel: "项目收入总额",
        summary: [
          { label: "收入金额", value: currency(projectTotal) },
          { label: "占总收入比", value: "6.3%" },
          { label: "项目数量", value: "3个" },
          { label: "主要项目", value: "项目A（55.6%）" },
        ],
        children: [
          {
            amount: 1000,
            description: "项目A是本月项目收入的主要来源，可继续查看成本、服务费、税费与净收益。",
            icon: "reports",
            id: "project-a",
            kind: "project",
            label: "项目A",
            percentage: 55.6,
            rootLabel: "项目A总收入",
            summary: [
              { label: "收入金额", value: currency(1000) },
              { label: "项目净收益", tone: "good", value: currency(450) },
              { label: "净收益率", value: "45.0%" },
              { label: "占项目收入比", value: "55.6%" },
            ],
            children: [
              {
                amount: 1000,
                description: "项目A确认的本期收入总额。",
                icon: "reports",
                id: "project-a-income",
                kind: "project",
                label: "项目收入",
                percentage: 100,
              },
              {
                amount: 400,
                description: "项目交付相关成本支出。",
                icon: "card",
                id: "project-a-cost",
                kind: "deduction",
                label: "项目成本",
                percentage: 40,
              },
              {
                amount: 100,
                description: "平台、渠道或服务类费用。",
                icon: "account",
                id: "project-a-fee",
                kind: "deduction",
                label: "平台/服务费",
                percentage: 10,
              },
              {
                amount: 50,
                description: "项目收入相关税费估算项，仅用于个人财务管理参考。",
                icon: "card",
                id: "project-a-tax",
                kind: "deduction",
                label: "税费支出",
                percentage: 5,
              },
              {
                amount: 450,
                description: "项目A收入扣除成本、服务费和税费后的留存结果。",
                icon: "success",
                id: "project-a-net",
                kind: "net",
                label: "项目净收益",
                percentage: 45,
              },
            ],
          },
          {
            amount: 500,
            description: "项目B本期收入，当前未拆分更多下级项目。",
            icon: "reports",
            id: "project-b",
            kind: "project",
            label: "项目B",
            percentage: 27.8,
          },
          {
            amount: 300,
            description: "项目C本期收入，当前未拆分更多下级项目。",
            icon: "reports",
            id: "project-c",
            kind: "project",
            label: "项目C",
            percentage: 16.6,
          },
        ],
      },
      {
        amount: investmentTotal,
        description: "投资收入来自投资资产带来的现金回报或收益确认。",
        icon: "securities",
        id: "investment-income",
        kind: "income",
        label: "投资收入",
        percentage: 3.1,
      },
      {
        amount: otherIncomeTotal,
        description: "其他零散收入，规模较小，暂不继续下钻。",
        icon: "more",
        id: "other-income",
        kind: "income",
        label: "其他收入",
        percentage: 1.6,
      },
    ],
  };

  return {
    analysisText:
      "本期收入较上月增长 6.21%，主要来自工资及奖金增加；支出较上月下降 3.47%，其中非必要支出下降明显。收入增长与支出下降共同推动本月净收益提升，净收益率达到 29.4%，盈利能力表现良好。",
    conclusionSummary:
      "本期盈利能力良好。本月收入为 ¥28,650.00，支出为 ¥20,217.81，形成净收益 ¥8,432.19，净收益率为 29.4%。收入能够覆盖支出，个人经营结果为正。",
    currentExpenseTotal,
    currentIncomeTotal,
    currentNetIncome,
    expenseComposition: [
      composition("生活支出", 8200, 40.6, "#2F7BEA", "餐饮、购物、交通、日常消费等生活相关支出。"),
      composition("固定支出", 7500, 37.1, "#1FA67A", "房租、水电、通信、保险、订阅等相对固定支出。"),
      composition("非必要支出", 4517.81, 22.3, "#FF7A1A", "可延后、可减少或非刚性的消费支出。"),
      composition("合计", currentExpenseTotal, 100, "#8B8176", "本月全部支出合计。"),
    ],
    footerNote:
      "数据来源于 IMCFO 智能记账与分析引擎，图表仅供参考，不构成财务、税务或投资建议。",
    incomeComposition: [
      composition("工资收入", salaryTotal, 76.8, "#2F7BEA", "主要来自月度工资，是本期收入的核心来源。"),
      composition("奖金收入", bonusTotal, 12.2, "#1FA67A", "本期奖金收入，对收入增长形成补充。"),
      composition("项目收入", projectTotal, 6.3, "#6E94C8", "来自阶段性项目回款，可继续下钻查看项目结构。"),
      composition("投资收入", investmentTotal, 3.1, "#7C5CE3", "来自投资资产的分红、收益兑现或回款。"),
      composition("其他收入", otherIncomeTotal, 1.6, "#A07B56", "其他临时或零散收入。"),
      composition("合计", currentIncomeTotal, 100, "#8B8176", "本月全部收入合计。"),
    ],
    incomeStructureRoot,
    metricRows: [
      {
        change: "+6.21% ↑",
        changeTone: "good",
        current: currency(currentIncomeTotal),
        dataSource: "利润表、现金流量表、交易记录",
        formula: "本月所有收入类交易合计",
        indicator: "本月收入",
        interpretation: "衡量本期个人经营活动带来的现金流入和收入规模。",
        judgement: "增长",
        judgementTone: "good",
        previous: "¥26,975.00",
      },
      {
        change: "-3.47% ↓",
        changeTone: "good",
        current: currency(currentExpenseTotal),
        dataSource: "利润表、现金流量表、交易记录",
        formula: "本月所有支出类交易合计",
        indicator: "本月支出",
        interpretation: "衡量本期个人经营活动发生的消费、固定和债务支出。",
        judgement: "改善",
        judgementTone: "good",
        previous: "¥20,945.00",
      },
      {
        change: "+22.22% ↑",
        changeTone: "good",
        current: currency(currentNetIncome),
        dataSource: "利润表、现金流量表、交易记录",
        formula: "本月收入 - 本月支出",
        indicator: "本月净收益",
        interpretation: "衡量收入覆盖支出后最终留存的经营结果。",
        judgement: "良好",
        judgementTone: "good",
        previous: "¥6,900.00",
      },
      {
        change: "+3.8个百分点 ↑",
        changeTone: "good",
        current: "29.4%",
        dataSource: "利润表、现金流量表、交易记录",
        formula: "本月净收益 ÷ 本月收入",
        indicator: "净收益率",
        interpretation: "衡量收入中最终留存为净收益的比例。",
        judgement: "良好",
        judgementTone: "good",
        previous: "25.6%",
      },
      {
        change: "+3.21个百分点 ↑",
        changeTone: "good",
        current: "+6.21%",
        dataSource: "利润表、交易记录",
        formula: "本月收入 ÷ 上月收入 - 1",
        indicator: "收入增长率",
        interpretation: "衡量收入规模相对上期的增长速度。",
        judgement: "良好",
        judgementTone: "good",
        previous: "+3.00%",
      },
      {
        change: "-5.57个百分点 ↓",
        changeTone: "good",
        current: "-3.47%",
        dataSource: "利润表、现金流量表、交易记录",
        formula: "本月支出 ÷ 上月支出 - 1",
        indicator: "支出变化率",
        interpretation: "衡量支出规模相对上期的变化情况，下降通常代表费用控制改善。",
        judgement: "改善",
        judgementTone: "good",
        previous: "+2.10%",
      },
    ],
    netIncomeRateLabel: "29.4%",
    periodLabel: "2026年4月",
    statusLabel: "良好",
    subtitle: "判断本期收入是否覆盖支出，以及个人经营结果是否为正",
    suggestions: [
      {
        body: "继续稳定主业收入，关注奖金和副业收入的持续性。",
        title: "保持收入稳定性",
      },
      {
        body: "当前非必要支出占比 22.3%，建议进一步压缩。",
        title: "控制非必要支出",
      },
      {
        body: "将净收益率目标设为 35%，逐步提高收入留存能力。",
        title: "提升净收益率",
      },
    ],
    trendPoints,
    trendPoints12: [
      {
        changeRate: null,
        expense: "¥20,620.00",
        income: "¥24,800.00",
        netIncome: 4180,
        netIncomeLabel: "¥4,180.00",
        netIncomeRate: 16.9,
        period: "2025-05",
      },
      {
        changeRate: 11.48,
        expense: "¥20,990.00",
        income: "¥25,650.00",
        netIncome: 4660,
        netIncomeLabel: "¥4,660.00",
        netIncomeRate: 18.2,
        period: "2025-06",
      },
      {
        changeRate: -3.86,
        expense: "¥21,210.00",
        income: "¥25,690.00",
        netIncome: 4480,
        netIncomeLabel: "¥4,480.00",
        netIncomeRate: 17.4,
        period: "2025-07",
      },
      {
        changeRate: 14.73,
        expense: "¥20,980.00",
        income: "¥26,120.00",
        netIncome: 5140,
        netIncomeLabel: "¥5,140.00",
        netIncomeRate: 19.7,
        period: "2025-08",
      },
      {
        changeRate: -7.98,
        expense: "¥21,560.00",
        income: "¥26,290.00",
        netIncome: 4730,
        netIncomeLabel: "¥4,730.00",
        netIncomeRate: 18,
        period: "2025-09",
      },
      {
        changeRate: 13.74,
        expense: "¥21,050.00",
        income: "¥26,430.00",
        netIncome: 5380,
        netIncomeLabel: "¥5,380.00",
        netIncomeRate: 20.4,
        period: "2025-10",
      },
      ...trendPoints,
    ],
    unitLabel: "人民币元",
  };
}
