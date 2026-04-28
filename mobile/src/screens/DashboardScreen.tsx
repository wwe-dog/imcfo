import { StyleSheet, Text, View } from "react-native";
import MetricCard from "../components/MetricCard";
import type { ReportSummary } from "../domain/models";
import { sharedStyles, theme } from "../styles/theme";
import { formatCurrency, formatRatio } from "../utils/formatters";

interface DashboardScreenProps {
  summary: ReportSummary;
}

const metricTones = [
  "#A8D6F4",
  "#D1B5EA",
  "#A8B7EA",
  "#A8D6F4",
  "#D7B6EA",
  "#A8B7EA",
];

export default function DashboardScreen({ summary }: DashboardScreenProps) {
  const insight = `本期利润为${summary.profit >= 0 ? "正" : "负"}，净现金变动为${formatCurrency(
    summary.cashNetChange,
  )}，资产负债率为${formatRatio(summary.assetLiabilityRatio)}。`;

  return (
    <View style={styles.stack}>
      <View style={sharedStyles.pageHeaderCentered}>
        <Text style={styles.heroTitle}>个人财务总览</Text>
        <Text style={styles.heroSubtitle}>{summary.period.label}</Text>
      </View>

      <View style={styles.grid}>
        <MetricCard accentColor={metricTones[0]} label="资产" value={formatCurrency(summary.totalAssets)} />
        <MetricCard accentColor={metricTones[1]} label="负债" value={formatCurrency(summary.totalLiabilities)} />
        <MetricCard
          accentColor={metricTones[2]}
          hint="所有者权益（个人净资产）"
          label="净资产"
          value={formatCurrency(summary.ownerEquity)}
        />
        <MetricCard accentColor={metricTones[3]} label="收入" value={formatCurrency(summary.totalIncome)} />
        <MetricCard accentColor={metricTones[4]} label="费用" value={formatCurrency(summary.totalExpenses)} />
        <MetricCard accentColor={metricTones[5]} label="利润" value={formatCurrency(summary.profit)} />
      </View>

      <View style={[sharedStyles.card, styles.analysisCard]}>
        <Text style={styles.analysisTitle}>月度分析</Text>
        <Text style={sharedStyles.pageCopy}>{insight}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  analysisCard: {
    gap: theme.spacing.sm,
  },
  analysisTitle: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md,
  },
  heroSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: 18,
    fontWeight: "500",
  },
  heroTitle: {
    color: theme.colors.textPrimary,
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -1,
    textAlign: "center",
  },
  stack: {
    gap: theme.spacing.lg,
  },
});
