import { describe, expect, it } from "vitest";
import { calculateBudgetProgress } from "./budgetRules";
import { generateJournalEntryForTransaction, areJournalEntriesBalanced } from "./journalEntryRules";
import {
  applyConfirmedTransactionToFinancialState,
  createTransactionFromInput,
  createTransactionReplacement,
  voidTransaction,
  type AuditedFinancialState,
} from "./transactionRules";
import { getEffectiveTransactions } from "./transactionAuditRules";
import { buildOperatingAnalysisReport } from "../reports/operatingAnalysisReport";
import { buildProfitabilityAnalysisReport } from "../reports/profitabilityAnalysis";
import { normalizeAppData } from "../../storage/asyncStorageAdapter";
import type { Account, Asset, BudgetPlan, Liability, ReportPeriod, Transaction } from "../models";

const now = "2026-04-10T00:00:00.000Z";
const period: ReportPeriod = {
  id: "period-2026-04",
  type: "month",
  startDate: "2026-04-01",
  endDate: "2026-04-30",
  label: "2026 年 4 月",
};

const account: Account = {
  id: "account-bank",
  name: "银行卡",
  type: "bank",
  balance: 1000,
  currency: "CNY",
  isEnabled: true,
  createdAt: now,
  updatedAt: now,
};

const asset: Asset = {
  id: "asset-bank",
  name: "银行卡资产",
  category: "bankDeposit",
  amount: 1000,
  currentValue: 1000,
  accountId: "account-bank",
  createdAt: now,
  updatedAt: now,
};

const liability: Liability = {
  id: "liability-card",
  name: "信用卡",
  category: "creditCard",
  amount: 300,
  createdAt: now,
  updatedAt: now,
};

const createState = (): AuditedFinancialState => ({
  accounts: [account],
  assets: [asset],
  liabilities: [liability],
  transactions: [],
  journalEntries: [],
  transactionAuditEvents: [],
});

const expenseInput = {
  accountId: "account-bank",
  amount: 120,
  category: "餐饮",
  date: "2026-04-10",
  note: "午餐",
  type: "expense" as const,
};

describe("local MVP accounting closure", () => {
  it("normalizes old imported data with new local fields", () => {
    const data = normalizeAppData({ accounts: [account], transactions: [{ ...createTransactionFromInput(expenseInput), status: undefined }] });

    expect(data.budgets).toEqual([]);
    expect(data.transactionAuditEvents).toEqual([]);
    expect(data.transactions[0].status).toBe("active");
  });

  it("generates balanced journal entries for confirmed transactions", () => {
    const transaction = createTransactionFromInput(expenseInput);
    const entry = generateJournalEntryForTransaction(transaction, now);

    expect(areJournalEntriesBalanced([entry])).toBe(true);

    const state = applyConfirmedTransactionToFinancialState(createState(), transaction);
    expect(state.journalEntries).toHaveLength(1);
    expect(state.transactions[0].journalEntryId).toBe(state.journalEntries[0].id);
  });

  it("voids and replaces transactions without keeping them effective", () => {
    const state = applyConfirmedTransactionToFinancialState(createState(), createTransactionFromInput(expenseInput));
    const originalId = state.transactions[0].id;
    const voided = voidTransaction(state, originalId, "test void");

    expect(getEffectiveTransactions(voided.transactions)).toHaveLength(0);
    expect(voided.transactions.some((transaction) => transaction.status === "reversal")).toBe(true);

    const replaced = createTransactionReplacement(state, originalId, { ...expenseInput, amount: 88 }, "test replace");
    const effective = getEffectiveTransactions(replaced.transactions);
    expect(effective).toHaveLength(1);
    expect(effective[0].amount).toBe(88);
    expect(replaced.transactionAuditEvents.some((event) => event.type === "replaced")).toBe(true);
  });

  it("calculates monthly budget progress by category and project tag", () => {
    const transactions: Transaction[] = [
      { ...createTransactionFromInput(expenseInput), id: "tx-food" },
      { ...createTransactionFromInput({ ...expenseInput, amount: 200, category: "项目", tags: ["副业"] }), id: "tx-project" },
    ];
    const budgets: BudgetPlan[] = [
      {
        id: "budget-food",
        type: "category",
        periodId: period.id,
        title: "餐饮",
        category: "餐饮",
        amount: 100,
        thresholdPercent: 80,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "budget-project",
        type: "project",
        periodId: period.id,
        title: "副业",
        tag: "副业",
        amount: 300,
        thresholdPercent: 80,
        createdAt: now,
        updatedAt: now,
      },
    ];

    const progress = calculateBudgetProgress(budgets, transactions, period);
    expect(progress.find((item) => item.budget.id === "budget-food")?.status).toBe("over");
    expect(progress.find((item) => item.budget.id === "budget-project")?.spent).toBe(200);
  });

  it("builds operating and profitability analysis from local transactions", () => {
    const transactions = [
      createTransactionFromInput({ accountId: "account-bank", amount: 1000, category: "工资", date: "2026-04-01", type: "income" }),
      createTransactionFromInput(expenseInput),
    ];

    const operating = buildOperatingAnalysisReport({
      assets: [asset],
      liabilities: [liability],
      period,
      transactions,
    });
    const profitability = buildProfitabilityAnalysisReport({ period, transactions });

    expect(operating.coreTable[0].cells[1]).toContain("880");
    expect(profitability.currentNetIncome).toBe(880);
    expect(profitability.incomeComposition[0].label).toBe("工资");
  });
});
