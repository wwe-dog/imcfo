import type { BudgetPlan, ReportPeriod, Transaction } from "../models";
import { getEffectiveTransactions } from "./transactionAuditRules";

export interface BudgetProgress {
  budget: BudgetPlan;
  remaining: number;
  spent: number;
  status: "ok" | "over" | "warning";
  usagePercent: number;
}

const expenseTypes = new Set<Transaction["type"]>([
  "creditCardExpense",
  "expense",
  "investmentBuy",
  "payablePay",
  "repayment",
]);

const isExpenseLike = (transaction: Transaction): boolean => expenseTypes.has(transaction.type);

const isInPeriod = (transaction: Transaction, period: ReportPeriod): boolean =>
  transaction.date >= period.startDate && transaction.date <= period.endDate;

const matchesBudget = (budget: BudgetPlan, transaction: Transaction): boolean => {
  if (!isExpenseLike(transaction)) return false;

  if (budget.type === "category") {
    return Boolean(budget.category) && transaction.category === budget.category;
  }

  if (budget.type === "project") {
    const tag = budget.tag;
    if (!tag) return false;
    return Boolean(transaction.tags?.includes(tag));
  }

  return budget.linkedTransactionId
    ? transaction.id === budget.linkedTransactionId
    : transaction.category === budget.category || Boolean(transaction.note?.includes(budget.title));
};

export const calculateBudgetProgress = (
  budgets: BudgetPlan[],
  transactions: Transaction[],
  period: ReportPeriod,
): BudgetProgress[] => {
  const effectiveTransactions = getEffectiveTransactions(transactions).filter((transaction) =>
    isInPeriod(transaction, period),
  );

  return budgets
    .filter((budget) => budget.periodId === period.id)
    .map((budget) => {
      const spent =
        budget.type === "fixed" && budget.fixedStatus === "paid" && !budget.linkedTransactionId
          ? budget.amount
          : effectiveTransactions
              .filter((transaction) => matchesBudget(budget, transaction))
              .reduce((sum, transaction) => sum + transaction.amount, 0);
      const usagePercent = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0;
      const thresholdPercent = budget.thresholdPercent || 80;
      const status = spent > budget.amount ? "over" : usagePercent >= thresholdPercent ? "warning" : "ok";

      return {
        budget,
        remaining: budget.amount - spent,
        spent,
        status,
        usagePercent,
      };
    });
};
