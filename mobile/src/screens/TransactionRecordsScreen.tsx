import { memo, useCallback, useEffect, useMemo, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import type { LayoutAnimationConfig } from "react-native";
import {
  InteractionManager,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  SectionList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from "react-native";
import AppIcon from "../components/AppIcon";
import type { Account, AccountType, Asset, Liability, Transaction, TransactionType } from "../domain/models";
import { sharedStyles, theme } from "../styles/theme";
import { formatCurrency } from "../utils/formatters";

interface TransactionRecordsScreenProps {
  accounts: Account[];
  assets: Asset[];
  liabilities: Liability[];
  transactions: Transaction[];
  onBack: () => void;
}

const UNKNOWN_VALUE = "无";
const RULE_BASED_VALUE = "按当前规则计算";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const monthCollapseAnimation = {
  duration: 210,
  update: {
    duration: 210,
    property: LayoutAnimation.Properties.opacity,
    type: LayoutAnimation.Types.easeInEaseOut,
  },
  delete: {
    duration: 170,
    property: LayoutAnimation.Properties.opacity,
    type: LayoutAnimation.Types.easeInEaseOut,
  },
  create: {
    duration: 190,
    property: LayoutAnimation.Properties.opacity,
    type: LayoutAnimation.Types.easeInEaseOut,
  },
} satisfies LayoutAnimationConfig;

type TimeFilter = "all" | "currentMonth" | "last7Days" | "last3Months" | "thisYear" | "custom";
type AccountFilter = "all" | "bank" | "wechat" | "alipay" | "securities" | "fund" | "creditCard" | "other";
type CashDirectionFilter = "all" | "inflow" | "outflow" | "nonCash";

interface FilterState {
  account: AccountFilter;
  calendarMonth: string;
  cashDirection: CashDirectionFilter;
  customEndDate: string | null;
  customStartDate: string | null;
  time: TimeFilter;
}

interface CalendarCell {
  dateKey: string;
  day: number;
}

interface TransactionSection {
  data: TransactionDisplayRecord[];
  monthKey: string;
  monthLabel: string;
}

interface TransactionDisplayRecord {
  accountTypeBuckets: AccountFilter[];
  amountText: string;
  amountTone: "positive" | "negative" | "neutral";
  cashStatus: string;
  dateTime: string;
  id: string;
  monthKey: string;
  monthLabel: string;
  searchableText: string;
  timestamp: number;
  title: string;
  transaction: Transaction;
}

const timeFilterOptions: Array<{ label: string; value: TimeFilter }> = [
  { label: "全部", value: "all" },
  { label: "本月", value: "currentMonth" },
  { label: "近7天", value: "last7Days" },
  { label: "近3个月", value: "last3Months" },
  { label: "今年", value: "thisYear" },
  { label: "自定义", value: "custom" },
];

const accountFilterOptions: Array<{ label: string; value: AccountFilter }> = [
  { label: "全部", value: "all" },
  { label: "银行卡", value: "bank" },
  { label: "微信", value: "wechat" },
  { label: "支付宝", value: "alipay" },
  { label: "证券账户", value: "securities" },
  { label: "基金账户", value: "fund" },
  { label: "信用卡", value: "creditCard" },
  { label: "其他", value: "other" },
];

const cashDirectionOptions: Array<{ label: string; value: CashDirectionFilter }> = [
  { label: "全部", value: "all" },
  { label: "现金流入", value: "inflow" },
  { label: "现金流出", value: "outflow" },
  { label: "非现金", value: "nonCash" },
];

const weekLabels = ["日", "一", "二", "三", "四", "五", "六"];

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

const getTypeLabel = (type: Transaction["type"]): string => transactionTypeLabels[type] ?? "未知类型";

const getAccountName = (accounts: Account[], accountId?: string): string | undefined =>
  accountId ? accounts.find((account) => account.id === accountId)?.name ?? "未知账户" : undefined;

const getAssetName = (assets: Asset[], assetId?: string): string | undefined =>
  assetId ? assets.find((asset) => asset.id === assetId)?.name ?? "未知资产" : undefined;

const getLiabilityName = (liabilities: Liability[], liabilityId?: string): string | undefined =>
  liabilityId ? liabilities.find((liability) => liability.id === liabilityId)?.name ?? "未知负债" : undefined;

const getTransactionTitle = (transaction: Transaction): string =>
  transaction.note?.trim() || transaction.category || getTypeLabel(transaction.type);

const getTransactionDateTime = (transaction: Transaction): string => {
  const createdAt = new Date(transaction.createdAt);
  if (!Number.isNaN(createdAt.getTime())) {
    const hours = String(createdAt.getHours()).padStart(2, "0");
    const minutes = String(createdAt.getMinutes()).padStart(2, "0");
    if (hours !== "00" || minutes !== "00") {
      return `${transaction.date} ${hours}:${minutes}`;
    }
  }

  return transaction.date;
};

const getMonthLabel = (date: string): string => {
  const [year, month] = date.split("-");
  if (!year || !month) return "未分组";
  return `${year}年${Number(month)}月`;
};

const isCashInflow = (transaction: Transaction): boolean => {
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

const getAmountTone = (transaction: Transaction): "positive" | "negative" | "neutral" => {
  if (transaction.cashFlowType === "nonCash") return "neutral";
  if (transaction.type === "transfer") return "neutral";
  return isCashInflow(transaction) ? "positive" : "negative";
};

const formatSignedAmount = (transaction: Transaction): string => {
  const tone = getAmountTone(transaction);
  if (tone === "positive") return `+${formatCurrency(transaction.amount)}`;
  if (tone === "negative") return `-${formatCurrency(transaction.amount)}`;
  return formatCurrency(transaction.amount);
};

const formatImpact = (value: number): string => {
  if (Math.abs(value) < 0.01) return formatCurrency(0);
  return `${value > 0 ? "+" : "-"}${formatCurrency(Math.abs(value))}`;
};

const getCashStatusLabel = (transaction: Transaction): string => {
  if (transaction.cashFlowType === "nonCash") return "非现金";
  if (transaction.type === "transfer") return "无";
  return isCashInflow(transaction) ? "现金流入" : "现金流出";
};

const getCashFlowLabel = (transaction: Transaction): string => {
  if (transaction.cashFlowType === "nonCash") return "非现金";
  if (transaction.type === "transfer") return "无";

  const direction = isCashInflow(transaction) ? "流入" : "流出";

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

const getIncomeExpenseImpact = (transaction: Transaction): string => {
  switch (transaction.type) {
    case "income":
      return formatImpact(transaction.amount);
    case "expense":
    case "creditCardExpense":
      return formatImpact(-transaction.amount);
    case "assetDecrease":
    case "assetIncrease":
    case "creditCardRepayment":
    case "investmentBuy":
    case "investmentSell":
    case "liabilityDecrease":
    case "liabilityIncrease":
    case "payablePay":
    case "payableRecognize":
    case "receivableCollect":
    case "receivableRecognize":
    case "repayment":
    case "transfer":
      return formatCurrency(0);
    default:
      return RULE_BASED_VALUE;
  }
};

const getNetWorthImpact = (transaction: Transaction): string => {
  switch (transaction.type) {
    case "income":
    case "receivableRecognize":
      return formatImpact(transaction.amount);
    case "expense":
    case "creditCardExpense":
    case "payableRecognize":
      return formatImpact(-transaction.amount);
    case "assetIncrease":
      return transaction.cashFlowType === "nonCash" ? formatImpact(transaction.amount) : RULE_BASED_VALUE;
    case "assetDecrease":
      return transaction.cashFlowType === "nonCash" ? formatImpact(-transaction.amount) : RULE_BASED_VALUE;
    case "creditCardRepayment":
    case "investmentBuy":
    case "investmentSell":
    case "liabilityDecrease":
    case "receivableCollect":
    case "repayment":
    case "transfer":
    case "payablePay":
      return formatCurrency(0);
    case "liabilityIncrease":
      return transaction.cashFlowType === "nonCash" ? formatImpact(-transaction.amount) : formatCurrency(0);
    default:
      return RULE_BASED_VALUE;
  }
};

const resolveAccountDisplay = (accounts: Account[], transaction: Transaction): string => {
  const accountName = getAccountName(accounts, transaction.accountId);
  const counterAccountName = getAccountName(accounts, transaction.counterAccountId);
  if (accountName && counterAccountName) return `${accountName} → ${counterAccountName}`;
  return accountName ?? counterAccountName ?? UNKNOWN_VALUE;
};

const resolveAccountDisplayFromMap = (
  accountNameById: Map<string, string>,
  transaction: Transaction,
): string => {
  const accountName = transaction.accountId ? accountNameById.get(transaction.accountId) : undefined;
  const counterAccountName = transaction.counterAccountId ? accountNameById.get(transaction.counterAccountId) : undefined;
  if (accountName && counterAccountName) return `${accountName} → ${counterAccountName}`;
  return accountName ?? counterAccountName ?? UNKNOWN_VALUE;
};

const getTransactionSearchText = (transaction: Transaction, accounts: Account[]): string => {
  const amountText = [
    String(transaction.amount),
    formatCurrency(transaction.amount),
    formatSignedAmount(transaction),
  ].join(" ");

  return [
    getTransactionTitle(transaction),
    amountText,
    transaction.category,
    transaction.note ?? "",
    getTypeLabel(transaction.type),
    resolveAccountDisplay(accounts, transaction),
  ]
    .join(" ")
    .toLowerCase();
};

const getTransactionSearchTextFromMap = (
  transaction: Transaction,
  accountNameById: Map<string, string>,
): string => {
  const accountName = accountNameById.get(transaction.accountId);
  const counterAccountName = transaction.counterAccountId ? accountNameById.get(transaction.counterAccountId) : undefined;
  const accountDisplay = accountName && counterAccountName ? `${accountName} → ${counterAccountName}` : accountName ?? counterAccountName ?? "";
  const amountText = [
    String(transaction.amount),
    formatCurrency(transaction.amount),
    formatSignedAmount(transaction),
  ].join(" ");

  return [
    getTransactionTitle(transaction),
    amountText,
    transaction.category,
    transaction.note ?? "",
    getTypeLabel(transaction.type),
    accountDisplay,
  ]
    .join(" ")
    .toLowerCase();
};

const parseTransactionDate = (date: string): Date | null => {
  const [yearText, monthText, dayText] = date.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const toDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatCalendarMonthTitle = (monthKey: string): string => {
  const [year, month] = monthKey.split("-");
  if (!year || !month) return "选择日期";
  return `${year}年${Number(month)}月`;
};

const formatSelectedDate = (dateKey: string): string => {
  const [, month, day] = dateKey.split("-");
  return `${month}.${day}`;
};

const getLatestTransactionDate = (transactions: Transaction[]): Date => {
  const latestDate = transactions
    .map((transaction) => parseTransactionDate(transaction.date))
    .filter((date): date is Date => Boolean(date))
    .sort((first, second) => second.getTime() - first.getTime())[0];

  return latestDate ?? new Date();
};

const getCalendarMonthKey = (date: Date): string => toDateKey(date).slice(0, 7);

const createDefaultFilters = (transactions: Transaction[]): FilterState => ({
  account: "all",
  calendarMonth: getCalendarMonthKey(getLatestTransactionDate(transactions)),
  cashDirection: "all",
  customEndDate: null,
  customStartDate: null,
  time: "all",
});

const hasActiveFilters = (filters: FilterState): boolean =>
  filters.time !== "all" || filters.account !== "all" || filters.cashDirection !== "all";

const getDateRangeForFilters = (
  filters: FilterState,
  transactions: Transaction[],
): { endDate: string; startDate: string } | null => {
  const baseDate = getLatestTransactionDate(transactions);

  if (filters.time === "currentMonth") {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    return {
      endDate: toDateKey(new Date(year, month + 1, 0)),
      startDate: toDateKey(new Date(year, month, 1)),
    };
  }

  if (filters.time === "last7Days") {
    const startDate = new Date(baseDate);
    startDate.setDate(baseDate.getDate() - 6);
    return { endDate: toDateKey(baseDate), startDate: toDateKey(startDate) };
  }

  if (filters.time === "last3Months") {
    const startDate = new Date(baseDate.getFullYear(), baseDate.getMonth() - 2, 1);
    return { endDate: toDateKey(baseDate), startDate: toDateKey(startDate) };
  }

  if (filters.time === "thisYear") {
    const startDate = new Date(baseDate.getFullYear(), 0, 1);
    return { endDate: toDateKey(baseDate), startDate: toDateKey(startDate) };
  }

  if (filters.time === "custom" && filters.customStartDate) {
    return {
      endDate: filters.customEndDate ?? filters.customStartDate,
      startDate: filters.customStartDate,
    };
  }

  return null;
};

const mapAccountTypeToFilter = (type: AccountType): AccountFilter => {
  if (type === "cash") return "other";
  return type;
};

const transactionMatchesAccountFilter = (
  transaction: Transaction,
  accounts: Account[],
  accountFilter: AccountFilter,
): boolean => {
  if (accountFilter === "all") return true;
  const relatedAccountIds = [transaction.accountId, transaction.counterAccountId].filter(
    (accountId): accountId is string => Boolean(accountId),
  );
  return relatedAccountIds.some((accountId) => {
    const account = accounts.find((item) => item.id === accountId);
    return account ? mapAccountTypeToFilter(account.type) === accountFilter : false;
  });
};

const transactionMatchesAccountFilterFromMap = (
  transaction: Transaction,
  accountTypeById: Map<string, AccountType>,
  accountFilter: AccountFilter,
): boolean => {
  if (accountFilter === "all") return true;
  const relatedAccountIds = [transaction.accountId, transaction.counterAccountId].filter(
    (accountId): accountId is string => Boolean(accountId),
  );
  return relatedAccountIds.some((accountId) => {
    const type = accountTypeById.get(accountId);
    return type ? mapAccountTypeToFilter(type) === accountFilter : false;
  });
};

const transactionMatchesCashDirection = (
  transaction: Transaction,
  cashDirection: CashDirectionFilter,
): boolean => {
  if (cashDirection === "all") return true;
  if (cashDirection === "nonCash") return transaction.cashFlowType === "nonCash";
  if (transaction.cashFlowType === "nonCash" || transaction.type === "transfer") return false;
  return cashDirection === "inflow" ? isCashInflow(transaction) : !isCashInflow(transaction);
};

const transactionMatchesFilters = (
  transaction: Transaction,
  accounts: Account[],
  filters: FilterState,
  transactions: Transaction[],
): boolean => {
  const dateRange = getDateRangeForFilters(filters, transactions);
  if (dateRange && (transaction.date < dateRange.startDate || transaction.date > dateRange.endDate)) {
    return false;
  }

  if (!transactionMatchesAccountFilter(transaction, accounts, filters.account)) return false;
  return transactionMatchesCashDirection(transaction, filters.cashDirection);
};

const transactionMatchesFiltersFromMaps = (
  transaction: Transaction,
  accountTypeById: Map<string, AccountType>,
  filters: FilterState,
  transactions: Transaction[],
): boolean => {
  const dateRange = getDateRangeForFilters(filters, transactions);
  if (dateRange && (transaction.date < dateRange.startDate || transaction.date > dateRange.endDate)) {
    return false;
  }

  if (!transactionMatchesAccountFilterFromMap(transaction, accountTypeById, filters.account)) return false;
  return transactionMatchesCashDirection(transaction, filters.cashDirection);
};

const groupTransactionsByMonth = (items: Transaction[]): Array<{ month: string; items: Transaction[] }> =>
  items.reduce<Array<{ month: string; items: Transaction[] }>>((groups, transaction) => {
    const month = getMonthLabel(transaction.date);
    const existingGroup = groups.find((group) => group.month === month);
    if (existingGroup) {
      existingGroup.items.push(transaction);
    } else {
      groups.push({ month, items: [transaction] });
    }
    return groups;
  }, []);

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

const getAccountTypeBuckets = (
  transaction: Transaction,
  accountTypeById: Map<string, AccountType>,
): AccountFilter[] => {
  const buckets = new Set<AccountFilter>();
  const relatedAccountIds = [transaction.accountId, transaction.counterAccountId].filter(Boolean) as string[];

  relatedAccountIds.forEach((accountId) => {
    const type = accountTypeById.get(accountId);
    if (type) buckets.add(mapAccountTypeToFilter(type));
  });

  return Array.from(buckets);
};

const buildTransactionDisplayRecords = (
  transactions: Transaction[],
  accountNameById: Map<string, string>,
  accountTypeById: Map<string, AccountType>,
): TransactionDisplayRecord[] =>
  transactions
    .map((transaction) => {
      const monthKey = getTransactionMonthKey(transaction);
      const title = getTransactionTitle(transaction);
      const amountText = formatSignedAmount(transaction);
      const cashStatus = getCashStatusLabel(transaction);
      const typeLabel = getTypeLabel(transaction.type);
      const accountDisplay = resolveAccountDisplayFromMap(accountNameById, transaction);
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
        accountTypeBuckets: getAccountTypeBuckets(transaction, accountTypeById),
        amountText,
        amountTone: getAmountTone(transaction),
        cashStatus,
        dateTime: getTransactionDateTime(transaction),
        id: transaction.id,
        monthKey,
        monthLabel: getMonthLabel(transaction.date),
        searchableText,
        timestamp: getTransactionTimestamp(transaction),
        title,
        transaction,
      };
    })
    .sort((first, second) => {
      if (first.timestamp !== second.timestamp) return second.timestamp - first.timestamp;
      return second.id.localeCompare(first.id);
    });

const displayRecordMatchesFilters = (
  record: TransactionDisplayRecord,
  filters: FilterState,
  dateRange: { endDate: string; startDate: string } | null,
): boolean => {
  if (dateRange && (record.transaction.date < dateRange.startDate || record.transaction.date > dateRange.endDate)) {
    return false;
  }

  if (filters.account !== "all" && !record.accountTypeBuckets.includes(filters.account)) return false;
  return transactionMatchesCashDirection(record.transaction, filters.cashDirection);
};

const groupDisplayRecordsByMonth = (
  records: TransactionDisplayRecord[],
): Array<{ items: TransactionDisplayRecord[]; monthKey: string; monthLabel: string }> => {
  const groups: Array<{ items: TransactionDisplayRecord[]; monthKey: string; monthLabel: string }> = [];
  let currentGroup: { items: TransactionDisplayRecord[]; monthKey: string; monthLabel: string } | undefined;

  records.forEach((record) => {
    if (!currentGroup || currentGroup.monthKey !== record.monthKey) {
      currentGroup = { items: [], monthKey: record.monthKey, monthLabel: record.monthLabel };
      groups.push(currentGroup);
    }
    currentGroup.items.push(record);
  });

  return groups;
};

const buildCalendarCells = (monthKey: string): Array<CalendarCell | null> => {
  const [yearText, monthText] = monthKey.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  if (!year || !month) return [];

  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: Array<CalendarCell | null> = Array.from({ length: firstDay }, () => null);

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      dateKey: `${yearText}-${monthText}-${String(day).padStart(2, "0")}`,
      day,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
};

const shiftMonthKey = (monthKey: string, offset: number): string => {
  const [yearText, monthText] = monthKey.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  if (!year || !month) return monthKey;
  return getCalendarMonthKey(new Date(year, month - 1 + offset, 1));
};

const getSelectedDateText = (filters: FilterState): string => {
  if (filters.customStartDate && filters.customEndDate) {
    return `已选：${formatSelectedDate(filters.customStartDate)} - ${formatSelectedDate(filters.customEndDate)}`;
  }
  if (filters.customStartDate) return `已选：${formatSelectedDate(filters.customStartDate)}`;
  return "已选：未选择";
};

export default function TransactionRecordsScreen({
  accounts,
  assets,
  liabilities,
  transactions,
  onBack,
}: TransactionRecordsScreenProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(() => createDefaultFilters(transactions));
  const [draftFilters, setDraftFilters] = useState<FilterState>(() => createDefaultFilters(transactions));
  const [collapsedMonths, setCollapsedMonths] = useState<Record<string, boolean>>({});
  const [displayRecords, setDisplayRecords] = useState<TransactionDisplayRecord[]>([]);
  const [isPreparingRecords, setIsPreparingRecords] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 180);
    return () => clearTimeout(timer);
  }, [query]);

  const accountNameById = useMemo(
    () => new Map(accounts.map((account) => [account.id, account.name])),
    [accounts],
  );
  const accountTypeById = useMemo(
    () => new Map(accounts.map((account) => [account.id, account.type])),
    [accounts],
  );

  useEffect(() => {
    let isCancelled = false;
    setIsPreparingRecords(true);

    const task = InteractionManager.runAfterInteractions(() => {
      const nextRecords = buildTransactionDisplayRecords(transactions, accountNameById, accountTypeById);
      if (isCancelled) return;

      const latestMonthKey = nextRecords[0]?.monthKey;
      const monthKeys = new Set(nextRecords.map((record) => record.monthKey));

      setDisplayRecords(nextRecords);
      setCollapsedMonths((current) => {
        const next: Record<string, boolean> = {};
        monthKeys.forEach((monthKey) => {
          next[monthKey] = current[monthKey] ?? monthKey !== latestMonthKey;
        });
        return next;
      });
      setIsPreparingRecords(false);
    });

    return () => {
      isCancelled = true;
      task.cancel();
    };
  }, [accountNameById, accountTypeById, transactions]);

  const filteredGroups = useMemo(() => {
    if (isPreparingRecords) return [];

    const normalizedQuery = debouncedQuery.trim().toLowerCase();
    const isFilterActive = hasActiveFilters(appliedFilters);
    const dateRange = appliedFilters.time === "all" ? null : getDateRangeForFilters(appliedFilters, transactions);

    const filtered = displayRecords.filter((record) => {
        const matchesSearch = normalizedQuery
          ? record.searchableText.includes(normalizedQuery)
          : true;
        if (!matchesSearch) return false;
        if (!isFilterActive) return true;
        return displayRecordMatchesFilters(record, appliedFilters, dateRange);
      });

    return groupDisplayRecordsByMonth(filtered);
  }, [appliedFilters, debouncedQuery, displayRecords, isPreparingRecords, transactions]);

  const sections = useMemo<TransactionSection[]>(
    () =>
      filteredGroups.map((group) => ({
        data: collapsedMonths[group.monthKey] ? [] : group.items,
        monthKey: group.monthKey,
        monthLabel: group.monthLabel,
      })),
    [collapsedMonths, filteredGroups],
  );

  const hasTransactions = transactions.length > 0;
  const hasResult = !isPreparingRecords && filteredGroups.length > 0;
  const isFilterActive = hasActiveFilters(appliedFilters);

  const openFilterPanel = useCallback(() => {
    setDraftFilters(appliedFilters);
    setIsFilterVisible(true);
  }, [appliedFilters]);

  const toggleMonthCollapse = useCallback((month: string) => {
    LayoutAnimation.configureNext(monthCollapseAnimation);
    setCollapsedMonths((current) => ({
      ...current,
      [month]: !current[month],
    }));
  }, []);

  const renderTransactionRow = useCallback(
    ({ item }: { item: TransactionDisplayRecord }) => (
      <TransactionRow
        onSelect={setSelectedTransaction}
        record={item}
      />
    ),
    [],
  );

  const renderMonthHeader = useCallback(
    ({ section }: { section: TransactionSection }) => (
      <MonthHeader
        isCollapsed={Boolean(collapsedMonths[section.monthKey])}
        month={section.monthLabel}
        onPress={() => toggleMonthCollapse(section.monthKey)}
      />
    ),
    [collapsedMonths, toggleMonthCollapse],
  );

  const keyExtractor = useCallback((record: TransactionDisplayRecord) => record.id, []);

  if (selectedTransaction) {
    return (
      <TransactionDetail
        accounts={accounts}
        assets={assets}
        liabilities={liabilities}
        onBack={() => setSelectedTransaction(null)}
        transaction={selectedTransaction}
      />
    );
  }

  return (
    <View style={styles.screen}>
      <TopBar onBack={onBack} title="交易记录" />

      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <AppIcon color={theme.colors.textMuted} name="search" size={18} />
          <TextInput
            onChangeText={setQuery}
            placeholder="搜索交易、金额、备注"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.searchInput}
            value={query}
          />
        </View>
        <Pressable
          accessibilityLabel="筛选交易"
          onPress={openFilterPanel}
          style={[styles.filterButton, isFilterActive ? styles.filterButtonActive : null]}
        >
          <AppIcon color={isFilterActive ? "#FFFFFF" : theme.colors.primaryDeep} name="filter" size={19} />
          {isFilterActive ? <View style={styles.filterActiveDot} /> : null}
        </Pressable>
      </View>

      {!hasTransactions ? (
        <EmptyState
          description="你可以先在管理页记一笔，系统会在这里显示记录。"
          title="暂无交易记录"
        />
      ) : null}

      {hasTransactions && isPreparingRecords ? (
        <EmptyState
          description="正在整理交易记录..."
          title="请稍候"
        />
      ) : null}

      {hasTransactions && !isPreparingRecords && !hasResult ? (
        <EmptyState
          description="试试调整关键词或筛选条件。"
          title="没有找到符合条件的交易"
        />
      ) : null}

      {hasResult ? (
        <SectionList
          contentContainerStyle={styles.monthList}
          initialNumToRender={14}
          keyExtractor={keyExtractor}
          maxToRenderPerBatch={18}
          removeClippedSubviews={Platform.OS === "android"}
          renderItem={renderTransactionRow}
          renderSectionHeader={renderMonthHeader}
          sections={sections}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          style={styles.transactionList}
          updateCellsBatchingPeriod={60}
          windowSize={7}
        />
      ) : null}

      <FilterPanel
        draftFilters={draftFilters}
        onApply={() => {
          setAppliedFilters(draftFilters);
          setIsFilterVisible(false);
        }}
        onClose={() => setIsFilterVisible(false)}
        onReset={() => {
          const defaultFilters = createDefaultFilters(transactions);
          setDraftFilters(defaultFilters);
          setAppliedFilters(defaultFilters);
          setIsFilterVisible(false);
        }}
        setDraftFilters={setDraftFilters}
        visible={isFilterVisible}
      />
    </View>
  );
}

function TransactionDetail({
  accounts,
  assets,
  liabilities,
  onBack,
  transaction,
}: {
  accounts: Account[];
  assets: Asset[];
  liabilities: Liability[];
  onBack: () => void;
  transaction: Transaction;
}) {
  const amountTone = getAmountTone(transaction);
  const accountDisplay = resolveAccountDisplay(accounts, transaction);
  const assetName = getAssetName(assets, transaction.relatedAssetId) ?? UNKNOWN_VALUE;
  const liabilityName = getLiabilityName(liabilities, transaction.relatedLiabilityId) ?? UNKNOWN_VALUE;

  return (
    <ScrollView contentContainerStyle={styles.stack} showsVerticalScrollIndicator={false}>
      <TopBar onBack={onBack} title="交易详情" />

      <View style={styles.detailHero}>
        <Text style={styles.detailTitle}>{getTransactionTitle(transaction)}</Text>
        <Text style={[styles.detailAmount, styles[`amount_${amountTone}`]]}>{formatSignedAmount(transaction)}</Text>
        <Text style={styles.detailDate}>{getTransactionDateTime(transaction)}</Text>
      </View>

      <DetailSection title="基础信息">
        <DetailRow label="类型" value={getTypeLabel(transaction.type)} />
        <DetailRow label="分类" value={transaction.category || UNKNOWN_VALUE} />
        <DetailRow label="账户" value={accountDisplay} />
        <DetailRow label="现金状态" value={getCashStatusLabel(transaction)} />
        <DetailRow label="备注" value={transaction.note?.trim() || UNKNOWN_VALUE} />
      </DetailSection>

      <DetailSection title="会计影响">
        <DetailRow label="收入/费用" value={getIncomeExpenseImpact(transaction)} />
        <DetailRow label="净资产" value={getNetWorthImpact(transaction)} />
      </DetailSection>

      <DetailSection title="现金流">
        <DetailRow label="现金流" value={getCashFlowLabel(transaction)} />
      </DetailSection>

      <DetailSection title="关联对象">
        <DetailRow label="关联账户" value={accountDisplay} />
        <DetailRow label="关联资产" value={assetName} />
        <DetailRow label="关联负债" value={liabilityName} />
      </DetailSection>
    </ScrollView>
  );
}

function TopBar({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <View style={styles.headerRow}>
      <Pressable onPress={onBack} style={styles.backButton}>
        <AppIcon color={theme.colors.backButtonText} name="back" size={15} strokeWidth={2.2} />
        <Text style={styles.backButtonText}>返回</Text>
      </Pressable>
      <Text style={styles.pageTitle}>{title}</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}

const TransactionRow = memo(function TransactionRow({
  record,
  onSelect,
}: {
  record: TransactionDisplayRecord;
  onSelect: (transaction: Transaction) => void;
}) {
  return (
    <Pressable onPress={() => onSelect(record.transaction)} style={styles.transactionCard}>
      <View style={styles.transactionMain}>
        <Text numberOfLines={1} style={styles.transactionTitle}>
          {record.title}
        </Text>
        <Text numberOfLines={1} style={styles.transactionMeta}>
          {record.dateTime} · {record.cashStatus}
        </Text>
      </View>
      <Text style={[styles.transactionAmount, styles[`amount_${record.amountTone}`]]}>{record.amountText}</Text>
    </Pressable>
  );
});

const MonthHeader = memo(function MonthHeader({
  isCollapsed,
  month,
  onPress,
}: {
  isCollapsed: boolean;
  month: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={`${month}${isCollapsed ? "已折叠" : "已展开"}`}
      onPress={onPress}
      style={styles.monthHeaderRow}
    >
      <Text style={styles.monthTitle}>{month}</Text>
      <Text style={styles.monthChevron}>{isCollapsed ? "›" : "˅"}</Text>
    </Pressable>
  );
});

function FilterPanel({
  draftFilters,
  onApply,
  onClose,
  onReset,
  setDraftFilters,
  visible,
}: {
  draftFilters: FilterState;
  onApply: () => void;
  onClose: () => void;
  onReset: () => void;
  setDraftFilters: Dispatch<SetStateAction<FilterState>>;
  visible: boolean;
}) {
  const calendarCells = useMemo(() => buildCalendarCells(draftFilters.calendarMonth), [draftFilters.calendarMonth]);

  const updateDraft = (partial: Partial<FilterState>) => {
    setDraftFilters((current) => ({ ...current, ...partial }));
  };

  const handleDatePress = (dateKey: string) => {
    setDraftFilters((current) => {
      if (current.customStartDate && !current.customEndDate && current.customStartDate === dateKey) {
        return {
          ...current,
          customEndDate: null,
          customStartDate: null,
          time: "custom",
        };
      }

      if (!current.customStartDate || current.customEndDate) {
        return {
          ...current,
          customEndDate: null,
          customStartDate: dateKey,
          time: "custom",
        };
      }

      const startDate = dateKey < current.customStartDate ? dateKey : current.customStartDate;
      const endDate = dateKey < current.customStartDate ? current.customStartDate : dateKey;
      return {
        ...current,
        customEndDate: endDate,
        customStartDate: startDate,
        time: "custom",
      };
    });
  };

  const isDateSelected = (dateKey: string): boolean =>
    dateKey === draftFilters.customStartDate || dateKey === draftFilters.customEndDate;

  const isDateInRange = (dateKey: string): boolean =>
    Boolean(
      draftFilters.customStartDate &&
        draftFilters.customEndDate &&
        dateKey > draftFilters.customStartDate &&
        dateKey < draftFilters.customEndDate,
    );

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.filterModalRoot}>
        <Pressable accessibilityLabel="关闭筛选面板" onPress={onClose} style={styles.filterBackdrop} />
        <View style={styles.filterPanel}>
          <ScrollView contentContainerStyle={styles.filterPanelContent} showsVerticalScrollIndicator={false}>
            <View style={styles.filterPanelHeader}>
              <Text style={styles.filterPanelTitle}>筛选交易</Text>
              <Pressable accessibilityLabel="关闭筛选面板" onPress={onClose} style={styles.filterCloseButton}>
                <AppIcon color={theme.colors.textMuted} name="close" size={18} />
              </Pressable>
            </View>

            <FilterSection title="时间">
              <View style={styles.filterChipRow}>
                {timeFilterOptions.map((option) => (
                  <FilterChip
                    key={option.value}
                    active={draftFilters.time === option.value}
                    label={option.label}
                    onPress={() => updateDraft({ time: option.value })}
                  />
                ))}
              </View>
            </FilterSection>

            {draftFilters.time === "custom" ? (
              <View style={styles.calendarBox}>
                <View style={styles.calendarHeader}>
                  <Pressable
                    onPress={() => updateDraft({ calendarMonth: shiftMonthKey(draftFilters.calendarMonth, -1) })}
                    style={styles.calendarNavButton}
                  >
                    <Text style={styles.calendarNavText}>上月</Text>
                  </Pressable>
                  <Text style={styles.calendarTitle}>{formatCalendarMonthTitle(draftFilters.calendarMonth)}</Text>
                  <Pressable
                    onPress={() => updateDraft({ calendarMonth: shiftMonthKey(draftFilters.calendarMonth, 1) })}
                    style={styles.calendarNavButton}
                  >
                    <Text style={styles.calendarNavText}>下月</Text>
                  </Pressable>
                </View>

                <View style={styles.weekRow}>
                  {weekLabels.map((label) => (
                    <Text key={label} style={styles.weekLabel}>
                      {label}
                    </Text>
                  ))}
                </View>

                <View style={styles.calendarGrid}>
                  {calendarCells.map((cell, index) =>
                    cell ? (
                      <Pressable
                        key={cell.dateKey}
                        onPress={() => handleDatePress(cell.dateKey)}
                        style={[
                          styles.calendarDay,
                          isDateInRange(cell.dateKey) ? styles.calendarDayInRange : null,
                          isDateSelected(cell.dateKey) ? styles.calendarDaySelected : null,
                        ]}
                      >
                        <Text
                          style={[
                            styles.calendarDayText,
                            isDateSelected(cell.dateKey) ? styles.calendarDayTextSelected : null,
                          ]}
                        >
                          {cell.day}
                        </Text>
                      </Pressable>
                    ) : (
                      <View key={`empty-${index}`} style={styles.calendarDay} />
                    ),
                  )}
                </View>

                <Text style={styles.selectedDateText}>{getSelectedDateText(draftFilters)}</Text>
              </View>
            ) : null}

            <FilterSection title="账户">
              <View style={styles.filterChipRow}>
                {accountFilterOptions.map((option) => (
                  <FilterChip
                    key={option.value}
                    active={draftFilters.account === option.value}
                    label={option.label}
                    onPress={() => updateDraft({ account: option.value })}
                  />
                ))}
              </View>
            </FilterSection>

            <FilterSection title="资金方向">
              <View style={styles.filterChipRow}>
                {cashDirectionOptions.map((option) => (
                  <FilterChip
                    key={option.value}
                    active={draftFilters.cashDirection === option.value}
                    label={option.label}
                    onPress={() => updateDraft({ cashDirection: option.value })}
                  />
                ))}
              </View>
            </FilterSection>
          </ScrollView>

          <View style={styles.filterFooter}>
            <Pressable onPress={onReset} style={styles.filterResetButton}>
              <Text style={styles.filterResetText}>重置</Text>
            </Pressable>
            <Pressable onPress={onApply} style={styles.filterApplyButton}>
              <Text style={styles.filterApplyText}>应用筛选</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function FilterSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <View style={styles.filterSection}>
      <Text style={styles.filterSectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function FilterChip({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.filterChip, active ? styles.filterChipActive : null]}>
      <Text style={[styles.filterChipText, active ? styles.filterChipTextActive : null]}>{label}</Text>
    </Pressable>
  );
}

function DetailSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <View style={styles.detailSection}>
      <Text style={styles.detailSectionTitle}>{title}</Text>
      <View style={styles.detailRows}>{children}</View>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function EmptyState({ description, title }: { description: string; title: string }) {
  return (
    <View style={[sharedStyles.card, styles.emptyCard]}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={sharedStyles.emptyText}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  amount_negative: {
    color: theme.colors.danger,
  },
  amount_neutral: {
    color: theme.colors.textPrimary,
  },
  amount_positive: {
    color: theme.colors.success,
  },
  backButton: {
    alignItems: "center",
    backgroundColor: theme.colors.backButtonBackground,
    borderColor: theme.colors.backButtonBorder,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backButtonText: {
    color: theme.colors.backButtonText,
    fontSize: 13,
    fontWeight: "800",
  },
  detailAmount: {
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -0.6,
    lineHeight: 38,
    textAlign: "center",
  },
  detailDate: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  detailHero: {
    alignItems: "center",
    gap: 6,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  detailLabel: {
    color: theme.colors.textMuted,
    fontSize: 14,
    width: 86,
  },
  detailRow: {
    borderBottomColor: theme.colors.divider,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.md,
    minHeight: 40,
    paddingVertical: 8,
  },
  detailRows: {
    borderTopColor: theme.colors.divider,
    borderTopWidth: 1,
  },
  detailSection: {
    gap: 8,
  },
  detailSectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  detailTitle: {
    color: theme.colors.textPrimary,
    fontSize: 21,
    fontWeight: "900",
    lineHeight: 28,
    textAlign: "center",
  },
  detailValue: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 22,
    textAlign: "right",
  },
  emptyCard: {
    gap: theme.spacing.sm,
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontSize: 17,
    fontWeight: "900",
  },
  filterButton: {
    alignItems: "center",
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  filterActiveDot: {
    backgroundColor: theme.colors.warningSoft,
    borderColor: "#FFFFFF",
    borderRadius: 4,
    borderWidth: 1,
    height: 8,
    position: "absolute",
    right: 6,
    top: 6,
    width: 8,
  },
  filterApplyButton: {
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    flex: 1,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.md,
  },
  filterApplyText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  filterBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(28, 27, 34, 0.28)",
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChip: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceSoft,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 34,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  filterChipText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "800",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  filterCloseButton: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceSoft,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  filterFooter: {
    borderTopColor: theme.colors.divider,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  filterModalRoot: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingTop: 92,
  },
  filterPanel: {
    alignSelf: "center",
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    maxHeight: "82%",
    overflow: "hidden",
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 28,
    width: "100%",
    elevation: 6,
  },
  filterPanelContent: {
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  filterPanelHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  filterPanelTitle: {
    color: theme.colors.textPrimary,
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  filterResetButton: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.md,
    width: 96,
  },
  filterResetText: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    fontWeight: "900",
  },
  filterSection: {
    gap: theme.spacing.sm,
  },
  filterSectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: "900",
  },
  calendarBox: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  calendarDay: {
    alignItems: "center",
    borderRadius: theme.radius.md,
    height: 34,
    justifyContent: "center",
    width: `${100 / 7}%`,
  },
  calendarDayInRange: {
    backgroundColor: theme.colors.primarySoft,
  },
  calendarDaySelected: {
    backgroundColor: theme.colors.primary,
  },
  calendarDayText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "800",
  },
  calendarDayTextSelected: {
    color: "#FFFFFF",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  calendarNavButton: {
    backgroundColor: theme.colors.surfaceSoft,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  calendarNavText: {
    color: theme.colors.primaryDeep,
    fontSize: 12,
    fontWeight: "900",
  },
  calendarTitle: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: "900",
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
    justifyContent: "space-between",
  },
  headerSpacer: {
    width: 58,
  },
  monthGroup: {
    gap: 0,
  },
  monthList: {
    gap: 0,
    paddingBottom: theme.spacing.xl,
  },
  monthHeaderRow: {
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderBottomColor: theme.colors.divider,
    borderBottomWidth: 1,
    borderTopColor: theme.colors.divider,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 38,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
  },
  monthTitle: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: "900",
  },
  monthChevron: {
    color: theme.colors.textMuted,
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 22,
  },
  pageTitle: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  searchBox: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: theme.spacing.sm,
    minHeight: 44,
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.sm,
  },
  searchInput: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: 15,
    minHeight: 38,
    paddingHorizontal: theme.spacing.sm,
  },
  screen: {
    flex: 1,
    gap: theme.spacing.md,
  },
  selectedDateText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
  },
  stack: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  toolbar: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
    minHeight: 48,
  },
  transactionList: {
    flex: 1,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "900",
    minWidth: 92,
    textAlign: "right",
  },
  transactionCard: {
    alignItems: "center",
    borderBottomColor: theme.colors.divider,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "space-between",
    minHeight: 58,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 9,
  },
  transactionMain: {
    flex: 1,
    gap: 4,
  },
  transactionMeta: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  transactionTitle: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "900",
  },
  weekLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
    width: `${100 / 7}%`,
  },
  weekRow: {
    flexDirection: "row",
  },
});
