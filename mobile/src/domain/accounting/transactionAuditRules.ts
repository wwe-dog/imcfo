import type { Transaction } from "../models";

export interface EffectiveTransactionOptions {
  includeReversals?: boolean;
  includeVoided?: boolean;
}

export const getTransactionStatus = (transaction: Transaction): NonNullable<Transaction["status"]> =>
  transaction.status ?? "active";

export const isEffectiveTransaction = (
  transaction: Transaction,
  options: EffectiveTransactionOptions = {},
): boolean => {
  const status = getTransactionStatus(transaction);
  if (status === "active") return true;
  if (status === "voided") return Boolean(options.includeVoided);
  if (status === "reversal") return Boolean(options.includeReversals);
  return false;
};

export const getEffectiveTransactions = (
  transactions: Transaction[],
  options: EffectiveTransactionOptions = {},
): Transaction[] => transactions.filter((transaction) => isEffectiveTransaction(transaction, options));

export const getHiddenAuditTransactions = (transactions: Transaction[]): Transaction[] =>
  transactions.filter((transaction) => getTransactionStatus(transaction) !== "active");
