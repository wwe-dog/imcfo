import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import {
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  SectionList,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import AppIcon, { type AppIconName } from "../components/AppIcon";
import {
  AmountText,
  IconTile,
  InfoLineRow,
  SectionCard,
  SummaryHeroCard,
} from "../components/financeUI";
import {
  LedgerFullBleedList,
  LedgerPageHeader,
  TransactionListRow,
  TransactionSearchCard,
  getLedgerScreenPadding,
  type LedgerRowTone,
} from "../components/LedgerUI";
import ScreenTransition from "../components/ScreenTransition";
import type { Asset, Liability, Transaction } from "../domain/models";
import {
  buildTransactionDisplayRecord,
  getTransactionCashFlowLabel,
  getTransactionCashStatusLabel,
  getTransactionTypeLabel,
  hydrateAllTransactionRecords,
  isTransactionCashInflow,
  type TransactionDisplayRecord,
  type TransactionRecordsIndex,
} from "../domain/transactions/transactionDisplayIndex";
import { theme } from "../styles/theme";
import { formatCurrency } from "../utils/formatters";

interface TransactionRecordsScreenProps {
  assets: Asset[];
  isPreparingRecordsIndex: boolean;
  liabilities: Liability[];
  onBack: () => void;
  onOpenRecord?: () => void;
  recordsIndex: TransactionRecordsIndex | null;
}

const UNKNOWN_VALUE = "无";
const RULE_BASED_VALUE = "按当前规则计算";

type TimeFilter = "all" | "currentMonth" | "last7Days" | "last3Months" | "thisYear" | "custom";
type AccountFilter = "all" | "bank" | "wechat" | "alipay" | "securities" | "fund" | "creditCard" | "other";
type CashDirectionFilter = "all" | "inflow" | "outflow" | "nonCash";
type TransactionQuickFilter = "all" | "assetConversion" | "expense" | "income" | "liabilityRepayment";

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
  dateKey: string;
  dateLabel: string;
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

const quickFilterOptions: Array<{ label: string; value: TransactionQuickFilter }> = [
  { label: "全部", value: "all" },
  { label: "支出", value: "expense" },
  { label: "收入", value: "income" },
  { label: "资产转换", value: "assetConversion" },
  { label: "负债偿还", value: "liabilityRepayment" },
];

const weekLabels = ["日", "一", "二", "三", "四", "五", "六"];

const getAssetName = (assets: Asset[], assetId?: string): string | undefined =>
  assetId ? assets.find((asset) => asset.id === assetId)?.name ?? "未知资产" : undefined;

const getLiabilityName = (liabilities: Liability[], liabilityId?: string): string | undefined =>
  liabilityId ? liabilities.find((liability) => liability.id === liabilityId)?.name ?? "未知负债" : undefined;

const getTransactionAccent = (tone: TransactionDisplayRecord["amountTone"]): "blue" | "green" | "orange" => {
  if (tone === "positive") return "green";
  if (tone === "neutral") return "blue";
  return "orange";
};

const getTransactionIconName = (transaction: Transaction): AppIconName => {
  if (transaction.cashFlowType === "nonCash") return "reconcile";
  if (transaction.type === "transfer") return "cashFlow";
  if (transaction.type.includes("investment")) return "securities";
  if (transaction.type.includes("liability") || transaction.type.includes("repayment")) return "liability";
  if (transaction.type.includes("creditCard")) return "card";
  return isTransactionCashInflow(transaction) ? "wallet" : "transaction";
};

const getTransactionSubtitle = (record: TransactionDisplayRecord): string =>
  [record.dateTime, record.typeLabel, record.categoryText, record.cashStatus].filter(Boolean).join(" · ");

const formatImpact = (value: number): string => {
  if (Math.abs(value) < 0.01) return formatCurrency(0);
  return `${value > 0 ? "+" : "-"}${formatCurrency(Math.abs(value))}`;
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

const getCalendarMonthKey = (date: Date): string => toDateKey(date).slice(0, 7);

const createDefaultFilters = (latestDateKey?: string): FilterState => ({
  account: "all",
  calendarMonth: latestDateKey ? latestDateKey.slice(0, 7) : getCalendarMonthKey(new Date()),
  cashDirection: "all",
  customEndDate: null,
  customStartDate: null,
  time: "all",
});

const hasActiveFilters = (filters: FilterState): boolean =>
  filters.time !== "all" || filters.account !== "all" || filters.cashDirection !== "all";

const getDateRangeForFilters = (
  filters: FilterState,
  latestDateKey: string,
): { endDate: string; startDate: string } | null => {
  const baseDate = parseTransactionDate(latestDateKey) ?? new Date();

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

const transactionMatchesCashDirection = (
  transaction: Transaction,
  cashDirection: CashDirectionFilter,
): boolean => {
  if (cashDirection === "all") return true;
  if (cashDirection === "nonCash") return transaction.cashFlowType === "nonCash";
  if (transaction.cashFlowType === "nonCash" || transaction.type === "transfer") return false;
  return cashDirection === "inflow" ? isTransactionCashInflow(transaction) : !isTransactionCashInflow(transaction);
};

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

const assetConversionTypes = new Set<Transaction["type"]>([
  "assetDecrease",
  "assetIncrease",
  "investmentBuy",
  "investmentSell",
  "receivableCollect",
  "receivableRecognize",
  "transfer",
]);

const liabilityRepaymentTypes = new Set<Transaction["type"]>([
  "creditCardRepayment",
  "liabilityDecrease",
  "payablePay",
  "repayment",
]);

const recordMatchesQuickFilter = (
  record: TransactionDisplayRecord,
  quickFilter: TransactionQuickFilter,
): boolean => {
  const { type } = record.transaction;
  switch (quickFilter) {
    case "assetConversion":
      return assetConversionTypes.has(type);
    case "expense":
      return type === "expense" || type === "creditCardExpense";
    case "income":
      return type === "income";
    case "liabilityRepayment":
      return liabilityRepaymentTypes.has(type);
    case "all":
    default:
      return true;
  }
};

const formatDateGroupLabel = (dateKey: string): string => {
  const date = parseTransactionDate(dateKey);
  if (!date) return dateKey;
  const today = new Date();
  const todayKey = toDateKey(today);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const prefix =
    dateKey === todayKey ? "今天" : dateKey === toDateKey(yesterday) ? "昨天" : `${date.getFullYear()}年`;
  return `${prefix} · ${date.getMonth() + 1} 月 ${date.getDate()} 日`;
};

const getRecordTimeText = (record: TransactionDisplayRecord): string => {
  const [, time] = record.dateTime.split(" ");
  if (time) return time;

  const createdAt = new Date(record.transaction.createdAt);
  if (Number.isNaN(createdAt.getTime())) return "";

  const hours = String(createdAt.getHours()).padStart(2, "0");
  const minutes = String(createdAt.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const groupRecordsByDate = (records: TransactionDisplayRecord[]): TransactionSection[] => {
  const sections: TransactionSection[] = [];
  let currentSection: TransactionSection | undefined;

  records.forEach((record) => {
    if (!currentSection || currentSection.dateKey !== record.date) {
      currentSection = {
        data: [],
        dateKey: record.date,
        dateLabel: formatDateGroupLabel(record.date),
      };
      sections.push(currentSection);
    }
    currentSection.data.push(record);
  });

  return sections;
};

const getRecordTone = (record: TransactionDisplayRecord): LedgerRowTone => {
  if (record.amountTone === "positive") return "green";
  if (assetConversionTypes.has(record.transaction.type) || record.transaction.cashFlowType === "nonCash") return "blue";
  if (liabilityRepaymentTypes.has(record.transaction.type)) return "amber";
  return "default";
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
  assets,
  isPreparingRecordsIndex,
  liabilities,
  onBack,
  onOpenRecord,
  recordsIndex,
}: TransactionRecordsScreenProps) {
  const { width } = useWindowDimensions();
  const horizontalPadding = getLedgerScreenPadding(width);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState<TransactionQuickFilter>("all");
  const [selectedRecord, setSelectedRecord] = useState<TransactionDisplayRecord | null>(null);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(() => createDefaultFilters(recordsIndex?.latestDateKey));
  const [draftFilters, setDraftFilters] = useState<FilterState>(() => createDefaultFilters(recordsIndex?.latestDateKey));
  const [fullRecords, setFullRecords] = useState<TransactionDisplayRecord[] | null>(null);
  const [hydratedRecordsByMonth, setHydratedRecordsByMonth] = useState<Map<string, TransactionDisplayRecord[]>>(
    () => new Map(recordsIndex?.recordsByMonth),
  );

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 180);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!recordsIndex?.latestDateKey) return;
    const nextDefaults = createDefaultFilters(recordsIndex.latestDateKey);
    const syncCalendarMonth = (current: FilterState): FilterState =>
      current.time === "custom" || current.customStartDate || current.customEndDate
        ? current
        : { ...current, calendarMonth: nextDefaults.calendarMonth };
    setAppliedFilters(syncCalendarMonth);
    setDraftFilters(syncCalendarMonth);
  }, [recordsIndex?.latestDateKey]);

  useEffect(() => {
    setFullRecords(null);
    setHydratedRecordsByMonth(new Map(recordsIndex?.recordsByMonth));
  }, [recordsIndex]);

  useEffect(() => {
    setSelectedRecord((current) => {
      if (!current) return null;
      const transaction = recordsIndex?.transactionById.get(current.id);
      if (!transaction || !recordsIndex) return null;
      if (transaction === current.transaction) return current;
      return buildTransactionDisplayRecord(transaction, recordsIndex.accountById, recordsIndex.accountTypeById);
    });
  }, [recordsIndex]);

  const normalizedQuery = debouncedQuery.trim().toLowerCase();
  const isFilterActive = hasActiveFilters(appliedFilters);
  const hasQuickFilter = quickFilter !== "all";
  const isDefaultLazyMode = !normalizedQuery && !isFilterActive && !hasQuickFilter;

  useEffect(() => {
    if (!recordsIndex || isDefaultLazyMode || fullRecords) return;
    setFullRecords(hydrateAllTransactionRecords(recordsIndex));
  }, [fullRecords, isDefaultLazyMode, recordsIndex]);

  const filteredRecords = useMemo(() => {
    if (!recordsIndex) return [];

    const sourceRecords = isDefaultLazyMode
      ? recordsIndex.monthSummaries.flatMap((summary) => hydratedRecordsByMonth.get(summary.monthKey) ?? [])
      : fullRecords ?? [];

    if (!isDefaultLazyMode && !fullRecords) return [];

    const dateRange = appliedFilters.time === "all"
      ? null
      : getDateRangeForFilters(appliedFilters, recordsIndex.latestDateKey);

    return sourceRecords.filter((record) => {
      const matchesSearch = normalizedQuery ? record.searchableText.includes(normalizedQuery) : true;
      if (!matchesSearch) return false;
      if (!recordMatchesQuickFilter(record, quickFilter)) return false;
      if (!isFilterActive) return true;
      return displayRecordMatchesFilters(record, appliedFilters, dateRange);
    });
  }, [
    appliedFilters,
    fullRecords,
    hydratedRecordsByMonth,
    isDefaultLazyMode,
    isFilterActive,
    normalizedQuery,
    quickFilter,
    recordsIndex,
  ]);

  const sections = useMemo<TransactionSection[]>(() => groupRecordsByDate(filteredRecords), [filteredRecords]);

  const isPreparingRecords = isPreparingRecordsIndex || !recordsIndex;
  const isPreparingFilteredRecords = !isDefaultLazyMode && !fullRecords;
  const hasTransactions = Boolean(recordsIndex?.monthSummaries.length) || isPreparingRecords;
  const hasResult = !isPreparingRecords && !isPreparingFilteredRecords && filteredRecords.length > 0;
  const openFilterPanel = useCallback(() => {
    setDraftFilters(appliedFilters);
    setIsFilterVisible(true);
  }, [appliedFilters]);

  const renderTransactionRow = useCallback(
    ({ index, item, section }: { index: number; item: TransactionDisplayRecord; section: TransactionSection }) => (
      <TransactionRow
        horizontalPadding={horizontalPadding}
        isLast={index === section.data.length - 1}
        onSelect={setSelectedRecord}
        record={item}
      />
    ),
    [horizontalPadding],
  );

  const renderDateHeader = useCallback(
    ({ section }: { section: TransactionSection }) => (
      <DateHeader horizontalPadding={horizontalPadding} label={section.dateLabel} />
    ),
    [horizontalPadding],
  );

  const keyExtractor = useCallback((record: TransactionDisplayRecord) => record.id, []);

  if (selectedRecord) {
    return (
      <ScreenTransition animateOnMount transitionKey={`transaction-detail-${selectedRecord.id}`} variant="drilldown">
        <TransactionDetail
          assets={assets}
          liabilities={liabilities}
          onBack={() => setSelectedRecord(null)}
          record={selectedRecord}
        />
      </ScreenTransition>
    );
  }

  return (
    <View style={styles.screen}>
      <LedgerPageHeader onBack={onBack} title="交易记录" />

      <TransactionSearchCard
        activeFilter={quickFilter}
        filterActive={isFilterActive}
        filters={quickFilterOptions}
        onChangeText={setQuery}
        onFilterPress={openFilterPanel}
        onQuickFilterChange={setQuickFilter}
        placeholder="搜索金额、账户、分类或备注"
        value={query}
      />

      {!hasTransactions ? (
        <EmptyState
          actionLabel="去记一笔"
          description="你可以先在管理页记一笔，系统会在这里显示记录。"
          horizontalPadding={horizontalPadding}
          onAction={onOpenRecord}
          title="暂无交易记录"
        />
      ) : null}

      {hasTransactions && (isPreparingRecords || isPreparingFilteredRecords) ? (
        <EmptyState
          description="正在整理交易记录..."
          horizontalPadding={horizontalPadding}
          title="请稍候"
        />
      ) : null}

      {hasTransactions && !isPreparingRecords && !isPreparingFilteredRecords && !hasResult ? (
        <EmptyState
          description="试试调整关键词或筛选条件。"
          horizontalPadding={horizontalPadding}
          title="没有搜索结果"
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
          renderSectionHeader={renderDateHeader}
          sections={sections}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          style={[
            styles.transactionList,
            {
              marginLeft: -horizontalPadding,
              marginRight: -horizontalPadding,
            },
          ]}
          updateCellsBatchingPeriod={60}
          windowSize={7}
        />
      ) : null}

      {isFilterVisible ? (
        <FilterPanel
          draftFilters={draftFilters}
          onApply={() => {
            setAppliedFilters(draftFilters);
            setIsFilterVisible(false);
          }}
          onClose={() => setIsFilterVisible(false)}
          onReset={() => {
            const defaultFilters = createDefaultFilters(recordsIndex?.latestDateKey);
            setDraftFilters(defaultFilters);
            setAppliedFilters(defaultFilters);
            setIsFilterVisible(false);
          }}
          setDraftFilters={setDraftFilters}
          visible={isFilterVisible}
        />
      ) : null}
    </View>
  );
}

function TransactionDetail({
  assets,
  liabilities,
  onBack,
  record,
}: {
  assets: Asset[];
  liabilities: Liability[];
  onBack: () => void;
  record: TransactionDisplayRecord;
}) {
  const transaction = record.transaction;
  const accountDisplay = record.accountDisplay;
  const assetName = getAssetName(assets, transaction.relatedAssetId) ?? UNKNOWN_VALUE;
  const liabilityName = getLiabilityName(liabilities, transaction.relatedLiabilityId) ?? UNKNOWN_VALUE;
  const amountTone = record.amountTone === "positive" ? "positive" : "default";

  return (
    <ScrollView contentContainerStyle={styles.stack} showsVerticalScrollIndicator={false}>
      <LedgerPageHeader onBack={onBack} title="交易详情" />

      <SummaryHeroCard style={styles.detailHero}>
        <IconTile accent={getTransactionAccent(record.amountTone)} icon={getTransactionIconName(transaction)} size={54} />
        <Text numberOfLines={2} style={styles.detailTitle}>
          {record.title}
        </Text>
        <AmountText size="hero" tone={amountTone}>
          {record.amountText}
        </AmountText>
        <Text style={styles.detailDate}>{record.dateTime}</Text>
      </SummaryHeroCard>

      <SectionCard title="基础信息">
        <InfoLineRow label="类型" value={getTransactionTypeLabel(transaction.type)} />
        <InfoLineRow label="分类" value={transaction.category || UNKNOWN_VALUE} />
        <InfoLineRow label="账户" value={accountDisplay} />
        <InfoLineRow label="现金状态" value={getTransactionCashStatusLabel(transaction)} />
        <InfoLineRow label="备注" value={transaction.note?.trim() || UNKNOWN_VALUE} />
      </SectionCard>

      <SectionCard title="会计影响">
        <InfoLineRow label="收入/费用" value={getIncomeExpenseImpact(transaction)} />
        <InfoLineRow label="净资产" value={getNetWorthImpact(transaction)} />
      </SectionCard>

      <SectionCard title="现金流">
        <InfoLineRow label="现金流" value={getTransactionCashFlowLabel(transaction)} />
      </SectionCard>

      <SectionCard title="关联对象">
        <InfoLineRow label="关联账户" value={accountDisplay} />
        <InfoLineRow label="关联资产" value={assetName} />
        <InfoLineRow label="关联负债" value={liabilityName} />
      </SectionCard>
    </ScrollView>
  );
}

const TransactionRow = memo(function TransactionRow({
  horizontalPadding,
  isLast,
  record,
  onSelect,
}: {
  horizontalPadding: number;
  isLast: boolean;
  record: TransactionDisplayRecord;
  onSelect: (record: TransactionDisplayRecord) => void;
}) {
  const timeText = getRecordTimeText(record);
  const tone = getRecordTone(record);

  return (
    <TransactionListRow
      amount={record.amountText.replace("CN¥", "¥")}
      horizontalPadding={horizontalPadding}
      last={isLast}
      onPress={() => onSelect(record)}
      time={timeText}
      title={record.title}
      tone={tone}
    />
  );
});

const DateHeader = memo(function DateHeader({
  horizontalPadding,
  label,
}: {
  horizontalPadding: number;
  label: string;
}) {
  return <Text style={[styles.dateHeader, { paddingHorizontal: horizontalPadding }]}>{label}</Text>;
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
  const panelProgress = useRef(new Animated.Value(0)).current;
  const calendarCells = useMemo(() => buildCalendarCells(draftFilters.calendarMonth), [draftFilters.calendarMonth]);

  useEffect(() => {
    if (!visible) return;
    panelProgress.setValue(0);
    Animated.timing(panelProgress, {
      duration: 180,
      easing: Easing.out(Easing.cubic),
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [panelProgress, visible]);

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
        <Animated.View
          style={[
            styles.filterPanel,
            {
              opacity: panelProgress,
              transform: [
                {
                  translateY: panelProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-8, 0],
                  }),
                },
                {
                  scale: panelProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.98, 1],
                  }),
                },
              ],
            },
          ]}
        >
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
        </Animated.View>
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

function EmptyState({
  actionLabel,
  description,
  horizontalPadding,
  onAction,
  title,
}: {
  actionLabel?: string;
  description: string;
  horizontalPadding: number;
  onAction?: () => void;
  title: string;
}) {
  return (
    <LedgerFullBleedList horizontalPadding={horizontalPadding}>
      <View style={styles.emptyState}>
        <View style={styles.emptyIcon}>
          <AppIcon color={theme.colors.textSecondary} name="transaction" size={19} strokeWidth={1.8} />
        </View>
        <Text style={styles.emptyTitle}>{title}</Text>
        <Text style={styles.emptyDescription}>{description}</Text>
        {actionLabel ? (
          <Pressable accessibilityRole="button" onPress={onAction} style={styles.emptyAction}>
            <Text style={styles.emptyActionText}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </LedgerFullBleedList>
  );
}

const styles = StyleSheet.create({
  amount_negative: {
    color: theme.colors.textPrimary,
  },
  amount_amber: {
    color: theme.colors.warning,
  },
  amount_blue: {
    color: theme.colors.blueText,
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
  dateHeader: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 12,
    paddingHorizontal: 2,
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
    backgroundColor: theme.colors.surfaceElevated,
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
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
  emptyAction: {
    backgroundColor: "rgba(255,255,255,0.055)",
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  emptyActionText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "800",
  },
  emptyDescription: {
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    maxWidth: 250,
    textAlign: "center",
  },
  emptyIcon: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.09)",
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    height: 38,
    justifyContent: "center",
    marginBottom: 12,
    width: 38,
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 28,
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 7,
    textAlign: "center",
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
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    gap: 0,
    marginBottom: theme.spacing.md,
    overflow: "hidden",
    shadowColor: theme.colors.shadowSoft,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 2,
  },
  monthList: {
    gap: 0,
    paddingBottom: theme.spacing.xl,
  },
  monthChevronExpanded: {
    transform: [{ rotate: "90deg" }],
  },
  monthChevronIcon: {
    alignItems: "center",
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  monthExpenseText: {
    color: theme.colors.danger,
    fontSize: 12,
    fontWeight: "800",
  },
  monthHeaderCollapsed: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 0,
  },
  monthHeaderMain: {
    flex: 1,
    gap: 6,
    minWidth: 0,
  },
  monthHeaderRow: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.035)",
    borderBottomColor: theme.colors.divider,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.09)",
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: theme.spacing.sm,
    justifyContent: "space-between",
    minHeight: 58,
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  monthIncomeText: {
    color: theme.colors.success,
    fontSize: 12,
    fontWeight: "800",
  },
  monthTitle: {
    color: theme.colors.textPrimary,
    fontSize: 17,
    fontWeight: "900",
  },
  monthTotals: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
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
  quickFilterChip: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.09)",
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
    minHeight: 32,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  quickFilterChipActive: {
    backgroundColor: "rgba(255,93,187,0.13)",
    borderColor: "rgba(255,93,187,0.42)",
  },
  quickFilterRow: {
    flexDirection: "row",
    gap: 6,
    paddingRight: 4,
  },
  quickFilterText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
  },
  quickFilterTextActive: {
    color: theme.colors.textPrimary,
  },
  searchBox: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
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
    gap: 14,
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
    backgroundColor: "rgba(255,255,255,0.035)",
    borderBottomColor: "rgba(255,255,255,0.08)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.08)",
    borderTopWidth: StyleSheet.hairlineWidth,
    flex: 1,
  },
  transactionAmount: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontVariant: ["tabular-nums"],
    fontWeight: "900",
    minWidth: 92,
    textAlign: "right",
  },
  transactionAmountBox: {
    alignItems: "flex-end",
    minWidth: 104,
  },
  transactionCard: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.042)",
    borderColor: "transparent",
    borderBottomColor: theme.colors.divider,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: theme.spacing.sm,
    justifyContent: "space-between",
    minHeight: 62,
    paddingVertical: 11,
  },
  transactionCardFirst: {
    borderTopColor: "rgba(255,255,255,0.085)",
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  transactionCardLast: {
    borderBottomColor: theme.colors.divider,
    marginBottom: 12,
  },
  transactionMain: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  transactionMeta: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  transactionTitle: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
  transactionTime: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
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
