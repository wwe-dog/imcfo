import type { Asset, JournalEntry, Liability, ReportSummary, Transaction } from "../models";
import type {
  BalanceSheetSummary,
  CashFlowStatementSummary,
  IncomeStatementSummary,
  ReportPeriod,
} from "../models/report";

const isIncomeTransaction = (transaction: Transaction): boolean =>
  transaction.type === "income";

const isExpenseTransaction = (transaction: Transaction): boolean =>
  transaction.type === "expense" || transaction.type === "creditCardExpense";

export const calculateTotalAssets = (assets: Asset[]): number =>
  assets.reduce((sum, asset) => sum + asset.currentValue, 0);

export const calculateTotalLiabilities = (liabilities: Liability[]): number =>
  liabilities.reduce((sum, liability) => sum + liability.amount, 0);

export const calculateOwnerEquity = (totalAssets: number, totalLiabilities: number): number =>
  totalAssets - totalLiabilities;

export const calculateTotalIncome = (transactions: Transaction[]): number =>
  transactions.filter(isIncomeTransaction).reduce((sum, transaction) => sum + transaction.amount, 0);

export const calculateTotalExpenses = (transactions: Transaction[]): number =>
  transactions.filter(isExpenseTransaction).reduce((sum, transaction) => sum + transaction.amount, 0);

export const calculateProfit = (totalIncome: number, totalExpenses: number): number =>
  totalIncome - totalExpenses;

const calculateCashFlowByType = (
  transactions: Transaction[],
  cashFlowType: "operating" | "investing" | "financing",
): number =>
  transactions
    .filter((transaction) => transaction.cashFlowType === cashFlowType)
    .reduce((sum, transaction) => {
      if (
        transaction.type === "income" ||
        transaction.type === "investmentSell" ||
        transaction.type === "assetIncrease" ||
        transaction.type === "liabilityIncrease"
      ) {
        return sum + transaction.amount;
      }
      return sum - transaction.amount;
    }, 0);

export const calculateOperatingCashFlow = (transactions: Transaction[]): number =>
  calculateCashFlowByType(transactions, "operating");

export const calculateInvestingCashFlow = (transactions: Transaction[]): number =>
  calculateCashFlowByType(transactions, "investing");

export const calculateFinancingCashFlow = (transactions: Transaction[]): number =>
  calculateCashFlowByType(transactions, "financing");

export const calculateCashNetChange = (
  operatingCashFlow: number,
  investingCashFlow: number,
  financingCashFlow: number,
): number => operatingCashFlow + investingCashFlow + financingCashFlow;

export const calculateAssetLiabilityRatio = (
  totalAssets: number,
  totalLiabilities: number,
): number | null => {
  if (totalAssets === 0) return null;
  return totalLiabilities / totalAssets;
};

export const calculateSavingsRate = (profit: number, totalIncome: number): number | null => {
  if (totalIncome === 0) return null;
  return profit / totalIncome;
};

export const validateJournalEntryBalance = (entry: JournalEntry): boolean => {
  const totalDebit = entry.lines.reduce((sum, line) => sum + line.debit, 0);
  const totalCredit = entry.lines.reduce((sum, line) => sum + line.credit, 0);
  return Math.abs(totalDebit - totalCredit) < 0.01;
};

export const buildBalanceSheetSummary = (
  assets: Asset[],
  liabilities: Liability[],
): BalanceSheetSummary => {
  const totalAssets = calculateTotalAssets(assets);
  const totalLiabilities = calculateTotalLiabilities(liabilities);
  const ownerEquity = calculateOwnerEquity(totalAssets, totalLiabilities);

  return {
    totalAssets,
    totalLiabilities,
    ownerEquity,
    assetLiabilityRatio: calculateAssetLiabilityRatio(totalAssets, totalLiabilities),
  };
};

export const buildIncomeStatementSummary = (
  transactions: Transaction[],
): IncomeStatementSummary => {
  const totalIncome = calculateTotalIncome(transactions);
  const totalExpenses = calculateTotalExpenses(transactions);
  const profit = calculateProfit(totalIncome, totalExpenses);

  return {
    totalIncome,
    totalExpenses,
    profit,
    savingsRate: calculateSavingsRate(profit, totalIncome),
  };
};

export const buildCashFlowStatementSummary = (
  transactions: Transaction[],
): CashFlowStatementSummary => {
  const operatingCashFlow = calculateOperatingCashFlow(transactions);
  const investingCashFlow = calculateInvestingCashFlow(transactions);
  const financingCashFlow = calculateFinancingCashFlow(transactions);

  return {
    operatingCashFlow,
    investingCashFlow,
    financingCashFlow,
    cashNetChange: calculateCashNetChange(operatingCashFlow, investingCashFlow, financingCashFlow),
  };
};

export const buildDashboardSummary = (
  period: ReportPeriod,
  assets: Asset[],
  liabilities: Liability[],
  transactions: Transaction[],
): ReportSummary => {
  const balanceSheet = buildBalanceSheetSummary(assets, liabilities);
  const incomeStatement = buildIncomeStatementSummary(transactions);
  const cashFlowStatement = buildCashFlowStatementSummary(transactions);

  return {
    period,
    ...balanceSheet,
    ...incomeStatement,
    ...cashFlowStatement,
  };
};
