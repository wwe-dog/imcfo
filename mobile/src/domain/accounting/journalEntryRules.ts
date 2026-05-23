import type { JournalEntry, JournalEntryLine, Transaction } from "../models";
import { validateJournalEntryBalance } from "./calculations";

export const areJournalEntriesBalanced = (entries: JournalEntry[]): boolean =>
  entries.every(validateJournalEntryBalance);

const line = (
  accountCode: string,
  accountName: string,
  reportElement: JournalEntryLine["reportElement"],
  debit: number,
  credit: number,
): JournalEntryLine => ({
  accountCode,
  accountName,
  debit,
  credit,
  reportElement,
});

const cashDebit = (amount: number) => line("1001", "现金及银行存款", "asset", amount, 0);
const cashCredit = (amount: number) => line("1001", "现金及银行存款", "asset", 0, amount);
const assetDebit = (amount: number) => line("1101", "资产", "asset", amount, 0);
const assetCredit = (amount: number) => line("1101", "资产", "asset", 0, amount);
const liabilityDebit = (amount: number) => line("2001", "负债", "liability", amount, 0);
const liabilityCredit = (amount: number) => line("2001", "负债", "liability", 0, amount);
const incomeCredit = (amount: number) => line("4001", "收入", "income", 0, amount);
const expenseDebit = (amount: number) => line("5001", "费用", "expense", amount, 0);

const buildLines = (transaction: Transaction): JournalEntryLine[] => {
  const amount = transaction.amount;

  switch (transaction.type) {
    case "income":
      return [cashDebit(amount), incomeCredit(amount)];
    case "expense":
      return [expenseDebit(amount), cashCredit(amount)];
    case "creditCardExpense":
      return [expenseDebit(amount), liabilityCredit(amount)];
    case "creditCardRepayment":
    case "liabilityDecrease":
    case "repayment":
      return [liabilityDebit(amount), cashCredit(amount)];
    case "liabilityIncrease":
      return transaction.cashFlowType === "nonCash"
        ? [assetDebit(amount), liabilityCredit(amount)]
        : [cashDebit(amount), liabilityCredit(amount)];
    case "assetIncrease":
    case "receivableRecognize":
      return [assetDebit(amount), line("3001", "个人净资产", "ownerEquity", 0, amount)];
    case "assetDecrease":
      return [line("3001", "个人净资产", "ownerEquity", amount, 0), assetCredit(amount)];
    case "investmentBuy":
      return [assetDebit(amount), cashCredit(amount)];
    case "investmentSell":
    case "receivableCollect":
      return [cashDebit(amount), assetCredit(amount)];
    case "payableRecognize":
      return [expenseDebit(amount), liabilityCredit(amount)];
    case "payablePay":
      return [liabilityDebit(amount), cashCredit(amount)];
    case "transfer":
      return [
        line("1001", "转入账户", "asset", amount, 0),
        line("1001", "转出账户", "asset", 0, amount),
      ];
    default:
      return [cashDebit(amount), incomeCredit(amount)];
  }
};

export const generateJournalEntryForTransaction = (
  transaction: Transaction,
  timestamp = new Date().toISOString(),
): JournalEntry => ({
  id: `je-${transaction.id}`,
  transactionId: transaction.id,
  date: transaction.date,
  description: transaction.note || transaction.category || "本地记账凭证",
  lines: buildLines(transaction),
  createdAt: timestamp,
  updatedAt: timestamp,
});
