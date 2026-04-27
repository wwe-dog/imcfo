import { StyleSheet, Text, View } from "react-native";
import MetricCard from "../components/MetricCard";
import type { ReportSummary } from "../domain/models";
import { sharedStyles, theme } from "../styles/theme";
import { formatCurrency, formatRatio } from "../utils/formatters";

interface DashboardScreenProps {
  summary: ReportSummary;
}

export default function DashboardScreen({ summary }: DashboardScreenProps) {
  return (
    <View style={styles.stack}>
      <View style={sharedStyles.pageHeader}>
        <Text style={sharedStyles.eyebrow}>{summary.period.label}</Text>
        <Text style={sharedStyles.pageTitle}>个人财报总览</Text>
        <Text style={sharedStyles.pageCopy}>
          先看清资产、负债、收入、费用、利润和所有者权益。
        </Text>
      </View>

      <View style={styles.grid}>
        <MetricCard label="资产" value={formatCurrency(summary.totalAssets)} />
        <MetricCard label="负债" value={formatCurrency(summary.totalLiabilities)} />
        <MetricCard
          hint="资产 - 负债"
          label="所有者权益（个人净资产）"
          value={formatCurrency(summary.ownerEquity)}
        />
        <MetricCard label="收入" value={formatCurrency(summary.totalIncome)} />
        <MetricCard label="费用" value={formatCurrency(summary.totalExpenses)} />
        <MetricCard label="利润" value={formatCurrency(summary.profit)} />
      </View>

      <View style={[sharedStyles.card, styles.summaryCard]}>
        <Text style={sharedStyles.sectionTitle}>本期经营提示</Text>
        <Text style={sharedStyles.pageCopy}>
          本期利润为{summary.profit >= 0 ? "正" : "负"}，现金净变化为
          {formatCurrency(summary.cashNetChange)}，资产负债率为
          {formatRatio(summary.assetLiabilityRatio)}。
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md,
  },
  stack: {
    gap: theme.spacing.xl,
  },
  summaryCard: {
    gap: theme.spacing.sm,
  },
});
