import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import DonutChart from "../components/charts/DonutChart";
import LineChart from "../components/charts/LineChart";
import type { Asset, Liability, ReportSummary, Transaction } from "../domain/models";
import { sharedStyles, theme } from "../styles/theme";
import { formatCurrency } from "../utils/formatters";

interface DashboardScreenProps {
  assets: Asset[];
  liabilities: Liability[];
  summary: ReportSummary;
  transactions: Transaction[];
}

type DashboardView = "cashFlow" | "balance";
type PeriodLabel = "周线" | "月线" | "季度线" | "年线";

interface CompositionItem {
  label: string;
  value: number;
  color: string;
}

interface TrendBucket {
  label: string;
  income: number;
  outflow: number;
  net: number;
}

interface EquityTrendPoint {
  label: string;
  value: number;
}

const viewOptions: Array<{ key: DashboardView; label: string }> = [
  { key: "cashFlow", label: "收支现金流" },
  { key: "balance", label: "资产负债结构" },
];

const periodOptions: PeriodLabel[] = ["周线", "月线", "季度线", "年线"];
const chartColors = [theme.colors.primary, "#A8D6F4", theme.colors.warning, "#D1B5EA"];

const assetCategoryLabels: Record<Asset["category"], string> = {
  bankDeposit: "银行卡",
  cash: "现金",
  fixedAsset: "固定资产",
  investment: "投资资产",
  other: "其他资产",
  paymentAccount: "支付账户",
  receivable: "应收款",
};

const liabilityCategoryLabels: Record<Liability["category"], string> = {
  borrowing: "借款",
  creditCard: "信用卡",
  huabei: "花呗/白条",
  loan: "贷款",
  other: "其他负债",
  payable: "应付款",
};

const formatCompactCurrency = (value: number): string => {
  const sign = value < 0 ? "-" : "";
  const absoluteValue = Math.abs(value);

  if (absoluteValue >= 10000) {
    const displayValue =
      absoluteValue >= 100000 ? (absoluteValue / 10000).toFixed(0) : (absoluteValue / 10000).toFixed(1);
    return `${sign}¥${displayValue}万`;
  }

  return formatCurrency(value);
};

const isCashInflow = (transaction: Transaction): boolean =>
  transaction.type === "income" ||
  transaction.type === "investmentSell" ||
  transaction.type === "assetIncrease" ||
  transaction.type === "liabilityIncrease";

const getCashFlowDirection = (transaction: Transaction): "inflow" | "outflow" | "none" => {
  if (transaction.cashFlowType === "nonCash") return "none";
  return isCashInflow(transaction) ? "inflow" : "outflow";
};

const getEquityImpact = (transaction: Transaction): number => {
  if (transaction.type === "income") return transaction.amount;
  if (transaction.type === "expense" || transaction.type === "creditCardExpense") return -transaction.amount;
  return 0;
};

const startOfDay = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date: Date, days: number): Date => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const addMonths = (date: Date, months: number): Date => {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + months);
  return nextDate;
};

const formatMonthLabel = (date: Date): string => `${date.getMonth() + 1}月`;

const formatQuarterLabel = (date: Date): string => `${date.getFullYear()}Q${Math.floor(date.getMonth() / 3) + 1}`;

const buildBucketRanges = (periodLabel: PeriodLabel, now = new Date()): Array<{ label: string; start: Date; end: Date }> => {
  if (periodLabel === "周线") {
    const today = startOfDay(now);
    return Array.from({ length: 7 }, (_, index) => {
      const start = addDays(today, index - 6);
      return {
        label: index === 6 ? "今天" : `${start.getMonth() + 1}/${start.getDate()}`,
        start,
        end: addDays(start, 1),
      };
    });
  }

  if (periodLabel === "季度线") {
    const currentQuarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    return Array.from({ length: 4 }, (_, index) => {
      const start = addMonths(currentQuarterStart, (index - 3) * 3);
      return {
        label: formatQuarterLabel(start),
        start,
        end: addMonths(start, 3),
      };
    });
  }

  if (periodLabel === "年线") {
    return Array.from({ length: 5 }, (_, index) => {
      const year = now.getFullYear() + index - 4;
      return {
        label: `${year}`,
        start: new Date(year, 0, 1),
        end: new Date(year + 1, 0, 1),
      };
    });
  }

  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  return Array.from({ length: 6 }, (_, index) => {
    const start = addMonths(currentMonthStart, index - 5);
    return {
      label: formatMonthLabel(start),
      start,
      end: addMonths(start, 1),
    };
  });
};

const parseTransactionDate = (transaction: Transaction): Date => startOfDay(new Date(`${transaction.date}T00:00:00`));

const buildCashFlowTrend = (transactions: Transaction[], periodLabel: PeriodLabel): TrendBucket[] => {
  const buckets = buildBucketRanges(periodLabel);

  return buckets.map((bucket) => {
    const bucketTransactions = transactions.filter((transaction) => {
      const transactionDate = parseTransactionDate(transaction);
      return transactionDate >= bucket.start && transactionDate < bucket.end;
    });

    return bucketTransactions.reduce<TrendBucket>(
      (result, transaction) => {
        const direction = getCashFlowDirection(transaction);

        if (direction === "inflow") {
          return {
            ...result,
            income: result.income + transaction.amount,
            net: result.net + transaction.amount,
          };
        }

        if (direction === "outflow") {
          return {
            ...result,
            outflow: result.outflow + transaction.amount,
            net: result.net - transaction.amount,
          };
        }

        return result;
      },
      { income: 0, label: bucket.label, net: 0, outflow: 0 },
    );
  });
};

const buildEquityTrend = (
  transactions: Transaction[],
  periodLabel: PeriodLabel,
  currentOwnerEquity: number,
): EquityTrendPoint[] => {
  const cashFlowBuckets = buildBucketRanges(periodLabel).map((bucket) => {
    const impact = transactions
      .filter((transaction) => {
        const transactionDate = parseTransactionDate(transaction);
        return transactionDate >= bucket.start && transactionDate < bucket.end;
      })
      .reduce((sum, transaction) => sum + getEquityImpact(transaction), 0);

    return {
      impact,
      label: bucket.label,
    };
  });

  const totalImpact = cashFlowBuckets.reduce((sum, bucket) => sum + bucket.impact, 0);
  let runningEquity = currentOwnerEquity - totalImpact;

  return cashFlowBuckets.map((bucket) => {
    runningEquity += bucket.impact;
    return {
      label: bucket.label,
      value: runningEquity,
    };
  });
};

const buildCompositionItems = <T extends { category: string }>(
  records: T[],
  getValue: (record: T) => number,
  labels: Record<string, string>,
): CompositionItem[] => {
  const grouped = records.reduce<Record<string, number>>((result, record) => {
    const value = getValue(record);
    if (value <= 0) return result;
    return {
      ...result,
      [record.category]: (result[record.category] ?? 0) + value,
    };
  }, {});

  const sortedItems = Object.entries(grouped)
    .map(([category, value]) => ({
      label: labels[category] ?? category,
      value,
    }))
    .sort((left, right) => right.value - left.value);

  return sortedItems.map((item, index) => ({
    ...item,
    color: chartColors[index % chartColors.length],
  }));
};

export default function DashboardScreen({ assets, liabilities, summary, transactions }: DashboardScreenProps) {
  const [selectedView, setSelectedView] = useState<DashboardView>("balance");
  const [periodLabel, setPeriodLabel] = useState<PeriodLabel>("月线");
  const [isPeriodSelectorVisible, setIsPeriodSelectorVisible] = useState(false);

  const handleOpenPeriodSelector = () => {
    setIsPeriodSelectorVisible(true);
  };

  const handleClosePeriodSelector = () => {
    setIsPeriodSelectorVisible(false);
  };

  const handleSelectPeriod = (label: PeriodLabel) => {
    setPeriodLabel(label);
    setIsPeriodSelectorVisible(false);
  };

  return (
    <View style={styles.stack}>
      <View style={styles.segmentedControl}>
        {viewOptions.map((option) => {
          const isActive = selectedView === option.key;
          return (
            <Pressable
              key={option.key}
              onPress={() => setSelectedView(option.key)}
              style={[styles.segmentButton, isActive && styles.segmentButtonActive]}
            >
              <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {selectedView === "balance" ? (
        <BalanceStructureCard
          assets={assets}
          liabilities={liabilities}
          periodLabel={periodLabel}
          summary={summary}
          transactions={transactions}
        />
      ) : (
        <CashFlowCard
          onOpenPeriodSelector={handleOpenPeriodSelector}
          periodLabel={periodLabel}
          summary={summary}
          transactions={transactions}
        />
      )}

      {isPeriodSelectorVisible ? (
        <Modal
          animationType="fade"
          onRequestClose={handleClosePeriodSelector}
          transparent
          visible={isPeriodSelectorVisible}
        >
          <View style={styles.periodModalRoot}>
            <Pressable
              accessibilityLabel="关闭时间周期选择器"
              onPress={handleClosePeriodSelector}
              style={styles.periodModalBackdrop}
            />
            <View style={[sharedStyles.card, styles.periodModalCard]}>
              <View style={styles.periodModalHeader}>
                <Text style={styles.periodModalTitle}>选择时间周期</Text>
                <Text style={styles.periodModalSubtitle}>收支趋势会按所选周期重新汇总。</Text>
              </View>

              <View style={styles.periodOptionList}>
                {periodOptions.map((label) => {
                  const isSelected = periodLabel === label;

                  return (
                    <Pressable
                      key={label}
                      onPress={() => handleSelectPeriod(label)}
                      style={[styles.periodOptionButton, isSelected && styles.periodOptionButtonActive]}
                    >
                      <Text style={[styles.periodOptionText, isSelected && styles.periodOptionTextActive]}>{label}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <Pressable onPress={handleClosePeriodSelector} style={sharedStyles.secondaryButton}>
                <Text style={sharedStyles.secondaryButtonText}>取消</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

interface BalanceStructureCardProps extends DashboardScreenProps {
  periodLabel: PeriodLabel;
}

function BalanceStructureCard({
  assets,
  liabilities,
  periodLabel,
  summary,
  transactions,
}: BalanceStructureCardProps) {
  const assetComposition = buildCompositionItems(assets, (asset) => asset.currentValue, assetCategoryLabels);
  const liabilityComposition = buildCompositionItems(liabilities, (liability) => liability.amount, liabilityCategoryLabels);
  const equityTrend = buildEquityTrend(transactions, periodLabel, summary.ownerEquity);

  return (
    <View style={[sharedStyles.card, styles.mainCard]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>资产负债结构</Text>
        <Text style={styles.cardMeta}>截至今日</Text>
      </View>

      <View style={styles.metricRow}>
        <MetricPill label="资产" value={formatCompactCurrency(summary.totalAssets)} />
        <MetricPill label="负债" tone="muted" value={formatCompactCurrency(summary.totalLiabilities)} />
        <MetricPill label="净资产" tone="strong" value={formatCompactCurrency(summary.ownerEquity)} />
      </View>

      <View style={styles.chartGrid}>
        <CompositionChartCard
          emptyText="暂无资产构成数据"
          items={assetComposition}
          label="资产构成"
          primaryText={formatCompactCurrency(summary.totalAssets)}
        />
        <CompositionChartCard
          emptyText="暂无负债构成数据"
          items={liabilityComposition}
          label="负债构成"
          primaryText={formatCompactCurrency(summary.totalLiabilities)}
        />
      </View>

      <View style={styles.trendSection}>
        <View style={styles.trendHeader}>
          <Text style={styles.sectionLabel}>净资产趋势</Text>
          <Text style={styles.dataTag}>本期趋势</Text>
        </View>
        <LineChart emptyText="暂无净资产趋势数据" points={equityTrend} />
      </View>
    </View>
  );
}

interface CashFlowCardProps {
  periodLabel: PeriodLabel;
  onOpenPeriodSelector: () => void;
  summary: ReportSummary;
  transactions: Transaction[];
}

function CashFlowCard({ onOpenPeriodSelector, periodLabel, summary, transactions }: CashFlowCardProps) {
  const trendBuckets = buildCashFlowTrend(transactions, periodLabel);

  return (
    <View style={[sharedStyles.card, styles.mainCard]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>收支现金流</Text>
        <Pressable onPress={onOpenPeriodSelector} style={styles.periodButton}>
          <Text style={styles.periodButtonText}>{periodLabel}</Text>
          <Text style={styles.periodIcon}>日历</Text>
        </Pressable>
      </View>

      <View style={styles.metricRow}>
        <MetricPill label="收入" value={formatCompactCurrency(summary.totalIncome)} />
        <MetricPill label="支出" tone="muted" value={formatCompactCurrency(summary.totalExpenses)} />
        <MetricPill label="净流入" tone="strong" value={formatCompactCurrency(summary.cashNetChange)} />
      </View>

      <View style={styles.trendSection}>
        <View style={styles.trendHeader}>
          <Text style={styles.sectionLabel}>收支趋势</Text>
          <Text style={styles.dataTag}>{periodLabel}</Text>
        </View>
        <CashFlowTrendPreview buckets={trendBuckets} />
      </View>
    </View>
  );
}

interface MetricPillProps {
  label: string;
  value: string;
  tone?: "default" | "muted" | "strong";
}

function MetricPill({ label, tone = "default", value }: MetricPillProps) {
  const isStrong = tone === "strong";

  return (
    <View style={[styles.metricPill, tone === "muted" && styles.metricPillMuted, isStrong && styles.metricPillStrong]}>
      <Text style={[styles.metricLabel, isStrong && styles.metricLabelStrong]}>{label}</Text>
      <Text style={[styles.metricValue, isStrong && styles.metricValueStrong]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

interface CompositionChartCardProps {
  emptyText: string;
  items: CompositionItem[];
  label: string;
  primaryText: string;
}

function CompositionChartCard({ emptyText, items, label, primaryText }: CompositionChartCardProps) {
  return (
    <View style={styles.chartCard}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <Text style={styles.chartValue}>{primaryText}</Text>
      <DonutChart data={items} emptyText={emptyText} size={92} strokeWidth={15} />
    </View>
  );
}

interface CashFlowTrendPreviewProps {
  buckets: TrendBucket[];
}

function CashFlowTrendPreview({ buckets }: CashFlowTrendPreviewProps) {
  const maxValue = Math.max(...buckets.map((bucket) => Math.abs(bucket.net)), 1);

  return (
    <View style={styles.trendChart}>
      {buckets.map((bucket) => {
        const barHeight = Math.max(8, (Math.abs(bucket.net) / maxValue) * 74);
        const isPositive = bucket.net >= 0;

        return (
          <View key={bucket.label} style={styles.trendColumn}>
            <View style={styles.trendBarTrack}>
              <View
                style={[
                  styles.trendBar,
                  { height: barHeight },
                  isPositive ? styles.trendBarPositive : styles.trendBarNegative,
                ]}
              />
            </View>
            <Text style={styles.trendLabel}>{bucket.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardMeta: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  cardTitle: {
    color: theme.colors.textPrimary,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  chartCard: {
    backgroundColor: theme.colors.surfaceSoft,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flex: 1,
    gap: theme.spacing.sm,
    minHeight: 174,
    padding: theme.spacing.md,
  },
  chartGrid: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  chartValue: {
    color: theme.colors.textPrimary,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  dataTag: {
    backgroundColor: theme.colors.successSoft,
    borderRadius: theme.radius.pill,
    color: theme.colors.success,
    fontSize: 12,
    fontWeight: "700",
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  mainCard: {
    gap: theme.spacing.md,
  },
  metricLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  metricLabelStrong: {
    color: theme.colors.textInverse,
  },
  metricPill: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    minHeight: 72,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  metricPillMuted: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  metricPillStrong: {
    backgroundColor: theme.colors.surfaceStrong,
  },
  metricRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  metricValue: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  metricValueStrong: {
    color: theme.colors.textInverse,
  },
  periodButton: {
    alignItems: "center",
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    minHeight: 36,
    paddingHorizontal: 12,
  },
  periodButtonText: {
    color: theme.colors.primaryDeep,
    fontSize: 13,
    fontWeight: "800",
  },
  periodIcon: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  periodModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(24, 16, 44, 0.18)",
  },
  periodModalCard: {
    gap: theme.spacing.md,
    width: "100%",
  },
  periodModalHeader: {
    gap: 6,
  },
  periodModalRoot: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: theme.spacing.container,
  },
  periodModalSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  periodModalTitle: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  periodOptionButton: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceSoft,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    minHeight: 48,
    paddingHorizontal: theme.spacing.md,
    justifyContent: "center",
  },
  periodOptionButtonActive: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primary,
  },
  periodOptionList: {
    gap: theme.spacing.sm,
  },
  periodOptionText: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  periodOptionTextActive: {
    color: theme.colors.primaryDeep,
  },
  sectionLabel: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
  segmentButton: {
    alignItems: "center",
    borderRadius: theme.radius.pill,
    flex: 1,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: theme.spacing.sm,
  },
  segmentButtonActive: {
    backgroundColor: theme.colors.surfaceStrong,
  },
  segmentText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: "700",
  },
  segmentTextActive: {
    color: theme.colors.textInverse,
  },
  segmentedControl: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.xs,
    padding: theme.spacing.xs,
  },
  stack: {
    gap: theme.spacing.md,
  },
  trendBar: {
    borderRadius: theme.radius.pill,
    width: 14,
  },
  trendBarNegative: {
    backgroundColor: theme.colors.warning,
  },
  trendBarPositive: {
    backgroundColor: theme.colors.primary,
  },
  trendBarTrack: {
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
  },
  trendChart: {
    alignItems: "stretch",
    backgroundColor: theme.colors.surfaceSoft,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    height: 128,
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  trendColumn: {
    alignItems: "center",
    flex: 1,
    gap: 6,
    justifyContent: "flex-end",
  },
  trendHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  trendLabel: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: "600",
  },
  trendSection: {
    gap: theme.spacing.sm,
  },
});
