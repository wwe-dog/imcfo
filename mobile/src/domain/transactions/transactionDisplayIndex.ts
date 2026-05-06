import type { Account, AccountType, Transaction, TransactionType } from "../models";
import { formatCurrency } from "../../utils/formatters";

export type TransactionAccountFilter =
  | "all"
  | "bank"
  | "wechat"
  | "alipay"
  | "securities"
  | "fund"
  | "creditCard"
  | "other";

export type TransactionAmountDirection = "inflow" | "outflow" | "nonCash" | "none";

export interface TransactionDisplayRecord {
  accountDisplay: string;
  accountIds: string[];
  accountTypeBuckets: TransactionAccountFilter[];
  amountDirection: TransactionAmountDirection;
  amountText: string;
  amountTone: "positive" | "negative" | "neutral";
  cashFlowLabel: string;
  cashStatus: string;
  categoryText: string;
  date: string;
  dateTime: string;
  id: string;
  monthKey: string;
  monthLabel: string;
  noteText: string;
  relatedAssetId?: string;
  relatedLiabilityId?: string;
  searchableText: string;
  timestamp: number;
  title: string;
  transaction: Transaction;
  typeLabel: string;
}

export interface TransactionDisplayMonthGroup {
  items: TransactionDisplayRecord[];
  monthKey: string;
  monthLabel: string;
}

export interface TransactionMonthSummary {
  latestTimestamp: number;
  monthKey: string;
  monthLabel: string;
  transactionCount: number;
}

export interface TransactionRecordsIndex {
  accountById: Map<string, Account>;
  accountTypeById: Map<string, AccountType>;
  latestDateKey: string;
  latestMonthKey: string;
  monthSummaries: TransactionMonthSummary[];
  recordsByMonth: Map<string, TransactionDisplayRecord[]>;
  rawTransactionsByMonth: Map<string, Transaction[]>;
  transactionById: Map<string, Transaction>;
}

const UNKNOWN_VALUE = "无";

const transactionTypeLabels: Record<TransactionType, string> = {
  assetDecrease: "资产减少",
  assetIncrease: "资产增加",
  creditCardExpense: "信用卡消费",
  creditCardRepayment: "信用卡还款",
  expense: "支出",
  income: "收入",
  investmentBuy: "投资买入",
  investmentSell: "投资卖出",
  liabilityDecrease: "负债减少",
  liabilityIncrease: "负债增加",
  payablePay: "应付支付",
  payableRecognize: "应付确认",
  receivableCollect: "应收收回",
  receivableRecognize: "应收确认",
  repayment: "还款",
  transfer: "转账 / 内部转换",
};

export const getTransactionTypeLabel = (type: Transaction["type"]): string =>
  transactionTypeLabels[type] ?? "未知类型";

export const isTransactionCashInflow = (transaction: Transaction): boolean => {
  switch (transaction.type) {
    case "assetIncrease":
    case "income":
    case "investmentSell":
    case "liabilityIncrease":
    case "receivableCollect":
      return true;
    default:
      return false;
  }
};

export const getTransactionAmountDirection = (transaction: Transaction): TransactionAmountDirection => {
  if (transaction.cashFlowType === "nonCash") return "nonCash";
  if (transaction.type === "transfer") return "none";
  return isTransactionCashInflow(transaction) ? "inflow" : "outflow";
};

const getAmountTone = (transaction: Transaction): "positive" | "negative" | "neutral" => {
  const direction = getTransactionAmountDirection(transaction);
  if (direction === "inflow") return "positive";
  if (direction === "outflow") return "negative";
  return "neutral";
};

const formatSignedAmount = (transaction: Transaction): string => {
  const tone = getAmountTone(transaction);
  if (tone === "positive") return `+${formatCurrency(transaction.amount)}`;
  if (tone === "negative") return `-${formatCurrency(transaction.amount)}`;
  return formatCurrency(transaction.amount);
};

const getCashStatusLabel = (transaction: Transaction): string => {
  const direction = getTransactionAmountDirection(transaction);
  if (direction === "inflow") return "现金流入";
  if (direction === "outflow") return "现金流出";
  if (direction === "nonCash") return "非现金";
  return "无";
};

const getCashFlowLabel = (transaction: Transaction): string => {
  if (transaction.cashFlowType === "nonCash") return "非现金";
  if (transaction.type === "transfer") return "无";

  const direction = isTransactionCashInflow(transaction) ? "流入" : "流出";

  switch (transaction.cashFlowType) {
    case "operating":
      return `经营活动现金${direction}`;
    case "investing":
      return `投资活动现金${direction}`;
    case "financing":
      return `筹资活动现金${direction}`;
    default:
      return "无";
  }
};

const getTransactionTitle = (transaction: Transaction): string =>
  transaction.note?.trim() || transaction.category || getTransactionTypeLabel(transaction.type);

const getTransactionDateTime = (transaction: Transaction): string => {
  const createdAt = new Date(transaction.createdAt);
  if (!Number.isNaN(createdAt.getTime())) {
    const hours = String(createdAt.getHours()).padStart(2, "0");
    const minutes = String(createdAt.getMinutes()).padStart(2, "0");
    if (hours !== "00" || minutes !== "00") return `${transaction.date} ${hours}:${minutes}`;
  }

  return transaction.date;
};

const getMonthLabel = (date: string): string => {
  const [year, month] = date.split("-");
  if (!year || !month) return "未分组";
  return `${year}年${Number(month)}月`;
};

const getTransactionTimestamp = (transaction: Transaction): number => {
  const createdAtTime = Date.parse(transaction.createdAt);
  if (!Number.isNaN(createdAtTime)) return createdAtTime;

  const dateTime = Date.parse(`${transaction.date}T00:00:00`);
  return Number.isNaN(dateTime) ? 0 : dateTime;
};

const getTransactionMonthKey = (transaction: Transaction): string => {
  const monthKey = transaction.date.slice(0, 7);
  return monthKey.length === 7 ? monthKey : "unknown";
};

const mapAccountTypeToFilter = (type: AccountType): TransactionAccountFilter => {
  if (type === "cash") return "other";
  return type;
};

const getAccountDisplay = (accountById: Map<string, Account>, transaction: Transaction): string => {
  const accountName = transaction.accountId ? accountById.get(transaction.accountId)?.name : undefined;
  const counterAccountName = transaction.counterAccountId
    ? accountById.get(transaction.counterAccountId)?.name
    : undefined;
  if (accountName && counterAccountName) return `${accountName} → ${counterAccountName}`;
  return accountName ?? counterAccountName ?? UNKNOWN_VALUE;
};

const getAccountTypeBuckets = (
  transaction: Transaction,
  accountTypeById: Map<string, AccountType>,
): TransactionAccountFilter[] => {
  const buckets = new Set<TransactionAccountFilter>();
  const relatedAccountIds = [transaction.accountId, transaction.counterAccountId].filter(Boolean) as string[];

  relatedAccountIds.forEach((accountId) => {
    const type = accountTypeById.get(accountId);
    if (type) buckets.add(mapAccountTypeToFilter(type));
  });

  return Array.from(buckets);
};

export const buildTransactionDisplayRecord = (
  transaction: Transaction,
  accountById: Map<string, Account>,
  accountTypeById: Map<string, AccountType>,
): TransactionDisplayRecord => {
  const title = getTransactionTitle(transaction);
  const amountText = formatSignedAmount(transaction);
  const typeLabel = getTransactionTypeLabel(transaction.type);
  const accountDisplay = getAccountDisplay(accountById, transaction);
  const accountIds = [transaction.accountId, transaction.counterAccountId].filter(Boolean) as string[];
  const categoryText = transaction.category || UNKNOWN_VALUE;
  const noteText = transaction.note?.trim() || UNKNOWN_VALUE;
  const cashStatus = getCashStatusLabel(transaction);
  const cashFlowLabel = getCashFlowLabel(transaction);
  const monthKey = getTransactionMonthKey(transaction);
  const searchableText = [
    title,
    transaction.note,
    transaction.category,
    typeLabel,
    accountDisplay,
    String(transaction.amount),
    amountText,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return {
    accountDisplay,
    accountIds,
    accountTypeBuckets: getAccountTypeBuckets(transaction, accountTypeById),
    amountDirection: getTransactionAmountDirection(transaction),
    amountText,
    amountTone: getAmountTone(transaction),
    cashFlowLabel,
    cashStatus,
    categoryText,
    date: transaction.date,
    dateTime: getTransactionDateTime(transaction),
    id: transaction.id,
    monthKey,
    monthLabel: getMonthLabel(transaction.date),
    noteText,
    relatedAssetId: transaction.relatedAssetId,
    relatedLiabilityId: transaction.relatedLiabilityId,
    searchableText,
    timestamp: getTransactionTimestamp(transaction),
    title,
    transaction,
    typeLabel,
  };
};

export const hydrateTransactionMonth = (
  index: TransactionRecordsIndex,
  monthKey: string,
): TransactionDisplayRecord[] => {
  const cachedRecords = index.recordsByMonth.get(monthKey);
  if (cachedRecords) return cachedRecords;

  const rawRecords = index.rawTransactionsByMonth.get(monthKey) ?? [];
  const records = rawRecords.map((transaction) =>
    buildTransactionDisplayRecord(transaction, index.accountById, index.accountTypeById),
  );
  index.recordsByMonth.set(monthKey, records);
  return records;
};

export const hydrateAllTransactionRecords = (index: TransactionRecordsIndex): TransactionDisplayRecord[] =>
  index.monthSummaries.flatMap((summary) => hydrateTransactionMonth(index, summary.monthKey));

export const groupTransactionDisplayRecords = (
  records: TransactionDisplayRecord[],
): TransactionDisplayMonthGroup[] => {
  const groups: TransactionDisplayMonthGroup[] = [];
  let currentGroup: TransactionDisplayMonthGroup | undefined;

  records.forEach((record) => {
    if (!currentGroup || currentGroup.monthKey !== record.monthKey) {
      currentGroup = { items: [], monthKey: record.monthKey, monthLabel: record.monthLabel };
      groups.push(currentGroup);
    }
    currentGroup.items.push(record);
  });

  return groups;
};

export const buildTransactionRecordsIndex = (
  transactions: Transaction[],
  accounts: Account[],
): TransactionRecordsIndex => {
  const accountById = new Map(accounts.map((account) => [account.id, account]));
  const accountTypeById = new Map(accounts.map((account) => [account.id, account.type]));
  const sortedTransactions = [...transactions].sort((first, second) => {
    const firstTimestamp = getTransactionTimestamp(first);
    const secondTimestamp = getTransactionTimestamp(second);
    if (firstTimestamp !== secondTimestamp) return secondTimestamp - firstTimestamp;
    return second.id.localeCompare(first.id);
  });

  const rawTransactionsByMonth = new Map<string, Transaction[]>();
  sortedTransactions.forEach((transaction) => {
    const monthKey = getTransactionMonthKey(transaction);
    const monthTransactions = rawTransactionsByMonth.get(monthKey);
    if (monthTransactions) {
      monthTransactions.push(transaction);
    } else {
      rawTransactionsByMonth.set(monthKey, [transaction]);
    }
  });

  const monthSummaries = Array.from(rawTransactionsByMonth.entries()).map(([monthKey, monthTransactions]) => ({
    latestTimestamp: getTransactionTimestamp(monthTransactions[0]),
    monthKey,
    monthLabel: getMonthLabel(monthTransactions[0]?.date ?? monthKey),
    transactionCount: monthTransactions.length,
  }));

  const latestDateKey = sortedTransactions[0]?.date ?? "";
  const latestMonthKey = monthSummaries[0]?.monthKey ?? "";
  const recordsByMonth = new Map<string, TransactionDisplayRecord[]>();
  if (latestMonthKey) {
    recordsByMonth.set(
      latestMonthKey,
      (rawTransactionsByMonth.get(latestMonthKey) ?? []).map((transaction) =>
        buildTransactionDisplayRecord(transaction, accountById, accountTypeById),
      ),
    );
  }

  const transactionById = new Map(transactions.map((transaction) => [transaction.id, transaction]));

  return {
    accountById,
    accountTypeById,
    latestDateKey,
    latestMonthKey,
    monthSummaries,
    recordsByMonth,
    rawTransactionsByMonth,
    transactionById,
  };
};
