import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import type { ReportSummary } from "../domain/models";
import { sharedStyles, theme } from "../styles/theme";
import { formatCurrency } from "../utils/formatters";

interface DashboardScreenProps {
  summary: ReportSummary;
}

type DashboardView = "cashFlow" | "balance";
type PeriodLabel = "周线" | "月线" | "季度线" | "年线";

const viewOptions: Array<{ key: DashboardView; label: string }> = [
  { key: "cashFlow", label: "收支现金流" },
  { key: "balance", label: "资产负债结构" },
];

const periodOptions: PeriodLabel[] = ["周线", "月线", "季度线", "年线"];

const formatCompactCurrency = (value: number): string => {
  const sign = value < 0 ? "-" : "";
  const absoluteValue = Math.abs(value);

  if (absoluteValue >= 10000) {
    const displayValue = absoluteValue >= 100000 ? (absoluteValue / 10000).toFixed(0) : (absoluteValue / 10000).toFixed(1);
    return `${sign}¥${displayValue}万`;
  }

  return formatCurrency(value);
};

export default function DashboardScreen({ summary }: DashboardScreenProps) {
  const [selectedView, setSelectedView] = useState<DashboardView>("balance");
  const [periodLabel, setPeriodLabel] = useState<PeriodLabel>("月线");

  const openPeriodSelector = () => {
    Alert.alert(
      "选择时间周期",
      "当前仅切换展示标签，趋势图先使用示例预览。",
      [
        ...periodOptions.map((label) => ({
          text: label,
          onPress: () => setPeriodLabel(label),
        })),
        { text: "取消", style: "cancel" as const },
      ],
    );
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
        <BalanceStructureCard summary={summary} />
      ) : (
        <CashFlowCard onOpenPeriodSelector={openPeriodSelector} periodLabel={periodLabel} summary={summary} />
      )}
    </View>
  );
}

function BalanceStructureCard({ summary }: DashboardScreenProps) {
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
        <DonutPreview
          caption="示例构成"
          label="资产构成"
          primaryText={formatCompactCurrency(summary.totalAssets)}
          tone="asset"
        />
        <DonutPreview
          caption="示例构成"
          label="负债构成"
          primaryText={formatCompactCurrency(summary.totalLiabilities)}
          tone="liability"
        />
      </View>

      <View style={styles.trendSection}>
        <View style={styles.trendHeader}>
          <Text style={styles.sectionLabel}>净资产趋势</Text>
          <Text style={styles.placeholderTag}>示例趋势</Text>
        </View>
        <TrendPreview value={summary.ownerEquity} />
      </View>
    </View>
  );
}

interface CashFlowCardProps extends DashboardScreenProps {
  periodLabel: PeriodLabel;
  onOpenPeriodSelector: () => void;
}

function CashFlowCard({ onOpenPeriodSelector, periodLabel, summary }: CashFlowCardProps) {
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
          <Text style={styles.placeholderTag}>示例趋势</Text>
        </View>
        <TrendPreview value={summary.cashNetChange} />
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

interface DonutPreviewProps {
  caption: string;
  label: string;
  primaryText: string;
  tone: "asset" | "liability";
}

function DonutPreview({ caption, label, primaryText, tone }: DonutPreviewProps) {
  const accentStyle = tone === "asset" ? styles.donutAccentAsset : styles.donutAccentLiability;

  return (
    <View style={styles.chartCard}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.donutWrap}>
        <View style={[styles.donutBase, accentStyle]}>
          <View style={styles.donutCutout} />
          <View style={styles.donutMarker} />
        </View>
      </View>
      <Text style={styles.chartValue}>{primaryText}</Text>
      <Text style={styles.chartCaption}>{caption}</Text>
    </View>
  );
}

interface TrendPreviewProps {
  value: number;
}

function TrendPreview({ value }: TrendPreviewProps) {
  const isPositive = value >= 0;
  const bars = isPositive ? [32, 38, 44, 50, 58, 66] : [66, 58, 50, 44, 38, 32];

  return (
    <View style={styles.trendChart}>
      {bars.map((height, index) => (
        <View key={`${height}-${index}`} style={styles.trendColumn}>
          <View style={[styles.trendBar, { height }, isPositive ? styles.trendBarPositive : styles.trendBarNegative]} />
        </View>
      ))}
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
  chartCaption: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  chartCard: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceSoft,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flex: 1,
    gap: theme.spacing.xs,
    minHeight: 180,
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
  donutAccentAsset: {
    backgroundColor: theme.colors.primary,
  },
  donutAccentLiability: {
    backgroundColor: theme.colors.warning,
  },
  donutBase: {
    alignItems: "center",
    borderRadius: theme.radius.pill,
    height: 86,
    justifyContent: "center",
    width: 86,
  },
  donutCutout: {
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radius.pill,
    height: 52,
    width: 52,
  },
  donutMarker: {
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: theme.radius.pill,
    height: 18,
    position: "absolute",
    right: 8,
    top: 12,
    width: 18,
  },
  donutWrap: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 96,
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
  placeholderTag: {
    backgroundColor: theme.colors.warningSoft,
    borderRadius: theme.radius.pill,
    color: theme.colors.warning,
    fontSize: 12,
    fontWeight: "700",
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 4,
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
  trendChart: {
    alignItems: "flex-end",
    backgroundColor: theme.colors.surfaceSoft,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    height: 128,
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  trendColumn: {
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
  },
  trendHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  trendSection: {
    gap: theme.spacing.sm,
  },
});
