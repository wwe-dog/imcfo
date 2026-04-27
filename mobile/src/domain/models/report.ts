export type ReportPeriodType = "day" | "week" | "month" | "quarter" | "year" | "custom";
export type ReportMode = "simple" | "professional";

export interface ReportPeriod {
  id: string;
  type: ReportPeriodType;
  startDate: string;
  endDate: string;
  label: string;
}

export interface ReportSummary {
  period: ReportPeriod;
  totalAssets: number;
  totalLiabilities: number;
  ownerEquity: number;
  totalIncome: number;
  totalExpenses: number;
  profit: number;
  operatingCashFlow: number;
  investingCashFlow: number;
  financingCashFlow: number;
  cashNetChange: number;
  assetLiabilityRatio: number | null;
  savingsRate: number | null;
}

export interface AppSettings {
  currency: string;
  defaultPeriod: ReportPeriodType;
  defaultReportMode: ReportMode;
  enableSampleData: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BalanceSheetSummary {
  totalAssets: number;
  totalLiabilities: number;
  ownerEquity: number;
  assetLiabilityRatio: number | null;
}

export interface IncomeStatementSummary {
  totalIncome: number;
  totalExpenses: number;
  profit: number;
  savingsRate: number | null;
}

export interface CashFlowStatementSummary {
  operatingCashFlow: number;
  investingCashFlow: number;
  financingCashFlow: number;
  cashNetChange: number;
}
