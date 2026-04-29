import type { ReportPeriod, Transaction } from "../models";

export const filterTransactionsByReportPeriod = (
  transactions: Transaction[],
  period: ReportPeriod,
): Transaction[] =>
  transactions.filter((transaction) => transaction.date >= period.startDate && transaction.date <= period.endDate);
