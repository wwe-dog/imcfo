import { StyleSheet, Text, View } from "react-native";
import MetricCard from "../components/MetricCard";
import type { ReportSummary } from "../domain/models";
import { formatCurrency, formatRatio } from "../utils/formatters";

interface DashboardScreenProps {
  summary: ReportSummary;
}

export default function DashboardScreen({ summary }: DashboardScreenProps) {
  return (
    <View style={styles.stack}>
      <View>
        <Text style={styles.eyebrow}>{summary.period.label}</Text>
        <Text style={styles.title}>个人财报总览</Text>
        <Text style={styles.copy}>先看清资产、负债、收入、费用、利润和所有者权益。</Text>
      </View>
      <View style={styles.grid}>
        <MetricCard label="资产" value={formatCurrency(summary.totalAssets)} />
        <MetricCard label="负债" value={formatCurrency(summary.totalLiabilities)} />
        <MetricCard label="所有者权益（个人净资产）" value={formatCurrency(summary.ownerEquity)} hint="资产 - 负债" />
        <MetricCard label="收入" value={formatCurrency(summary.totalIncome)} />
        <MetricCard label="费用" value={formatCurrency(summary.totalExpenses)} />
        <MetricCard label="利润" value={formatCurrency(summary.profit)} />
      </View>
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>本期经营提示</Text>
        <Text style={styles.copy}>
          本期利润为{summary.profit >= 0 ? "正" : "负"}，现金净变化为
          {formatCurrency(summary.cashNetChange)}，资产负债率为
          {formatRatio(summary.assetLiabilityRatio)}。
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  copy: {
    color: "#50604d",
    fontSize: 14,
    lineHeight: 22,
  },
  eyebrow: {
    color: "#7f8c54",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  panel: {
    backgroundColor: "#fbfaf3",
    borderColor: "#d5dcc7",
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  panelTitle: {
    color: "#18201a",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 8,
  },
  stack: {
    gap: 20,
  },
  title: {
    color: "#18201a",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },
});
