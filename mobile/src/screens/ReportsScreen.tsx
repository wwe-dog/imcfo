import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import ReportBlock from "../components/ReportBlock";
import type { Asset, Liability, ReportMode, ReportPeriod, Transaction } from "../domain/models";
import { buildBalanceSheetSummary } from "../domain/reports/balanceSheet";
import { buildCashFlowStatementSummary } from "../domain/reports/cashFlowStatement";
import { buildIncomeStatementSummary } from "../domain/reports/incomeStatement";
import { sharedStyles, theme } from "../styles/theme";
import { formatCurrency } from "../utils/formatters";

interface ReportsScreenProps {
  assets: Asset[];
  liabilities: Liability[];
  period: ReportPeriod;
  transactions: Transaction[];
}

type ReportKey = "balanceSheet" | "cashFlow" | "incomeStatement";

const reportTabs: Array<{ key: ReportKey; label: string }> = [
  { key: "balanceSheet", label: "资产负债表" },
  { key: "cashFlow", label: "现金流量表" },
  { key: "incomeStatement", label: "利润表" },
];

const getCashFlowDirection = (cashNetChange: number): string => {
  if (cashNetChange > 0) return "本期现金以净流入为主。";
  if (cashNetChange < 0) return "本期现金以净流出为主。";
  return "本期现金整体保持平衡。";
};

const getBalanceHint = (
  totalAssets: number,
  totalLiabilities: number,
  ownerEquity: number,
): string => {
  const isBalanced = Math.abs(totalAssets - (totalLiabilities + ownerEquity)) < 0.01;
  return isBalanced ? "资产 = 负债 + 所有者权益" : "当前数据未平衡，请检查资产和负债录入。";
};

export default function ReportsScreen({
  assets,
  liabilities,
  period,
  transactions,
}: ReportsScreenProps) {
  const [selectedReport, setSelectedReport] = useState<ReportKey>("balanceSheet");
  const [mode, setMode] = useState<ReportMode>("simple");
  const isSimple = mode === "simple";

  const balanceSheet = useMemo(() => buildBalanceSheetSummary(assets, liabilities), [assets, liabilities]);
  const incomeStatement = useMemo(() => buildIncomeStatementSummary(transactions), [transactions]);
  const cashFlowStatement = useMemo(
    () => buildCashFlowStatementSummary(transactions),
    [transactions],
  );

  const renderCurrentReport = () => {
    if (selectedReport === "balanceSheet") {
      return (
        <ReportBlock
          title="资产负债表"
          subtitle={
            isSimple
              ? "先看清你现在一共拥有多少、欠了多少，以及真正属于自己的净资产。"
              : "按专业口径展示资产、负债和所有者权益之间的平衡关系。"
          }
          rows={
            isSimple
              ? [
                  { label: "总资产", value: formatCurrency(balanceSheet.totalAssets) },
                  { label: "总负债", value: formatCurrency(balanceSheet.totalLiabilities) },
                  {
                    label: "所有者权益（个人净资产）",
                    value: formatCurrency(balanceSheet.ownerEquity),
                  },
                ]
              : [
                  { label: "资产", value: formatCurrency(balanceSheet.totalAssets) },
                  { label: "负债", value: formatCurrency(balanceSheet.totalLiabilities) },
                  { label: "所有者权益", value: formatCurrency(balanceSheet.ownerEquity) },
                ]
          }
          footer={
            isSimple
              ? "这张表回答：我现在真正属于自己的钱还有多少。"
              : getBalanceHint(
                  balanceSheet.totalAssets,
                  balanceSheet.totalLiabilities,
                  balanceSheet.ownerEquity,
                )
          }
        />
      );
    }

    if (selectedReport === "incomeStatement") {
      return (
        <ReportBlock
          title="利润表"
          subtitle={
            isSimple
              ? "先看本期赚了多少、花了多少，最后剩下多少利润。"
              : "按专业口径直接展示收入、费用和利润的关系。"
          }
          rows={
            isSimple
              ? [
                  { label: "本期收入", value: formatCurrency(incomeStatement.totalIncome) },
                  { label: "本期费用", value: formatCurrency(incomeStatement.totalExpenses) },
                  { label: "本期利润", value: formatCurrency(incomeStatement.profit) },
                ]
              : [
                  { label: "收入", value: formatCurrency(incomeStatement.totalIncome) },
                  { label: "费用", value: formatCurrency(incomeStatement.totalExpenses) },
                  { label: "利润", value: formatCurrency(incomeStatement.profit) },
                ]
          }
          footer={isSimple ? "这张表回答：本期到底是盈利还是亏损。" : "利润 = 收入 - 费用"}
        />
      );
    }

    return (
      <ReportBlock
        title="现金流量表"
        subtitle={
          isSimple
            ? "先看现金最终是增加还是减少，再判断本期现金压力。"
            : "按专业口径区分经营、投资、筹资三类现金流。"
        }
        rows={
          isSimple
            ? [
                { label: "现金净变化", value: formatCurrency(cashFlowStatement.cashNetChange) },
                { label: "主要现金流方向", value: getCashFlowDirection(cashFlowStatement.cashNetChange) },
              ]
            : [
                { label: "经营活动现金流", value: formatCurrency(cashFlowStatement.operatingCashFlow) },
                { label: "投资活动现金流", value: formatCurrency(cashFlowStatement.investingCashFlow) },
                { label: "筹资活动现金流", value: formatCurrency(cashFlowStatement.financingCashFlow) },
                { label: "现金净变化", value: formatCurrency(cashFlowStatement.cashNetChange) },
              ]
        }
        footer={
          isSimple
            ? "这张表回答：现金主要是流进来了，还是流出去了。"
            : "现金净变化 = 经营活动现金流 + 投资活动现金流 + 筹资活动现金流"
        }
      />
    );
  };

  return (
    <View style={styles.stack}>
      <View style={sharedStyles.pageHeaderCentered}>
        <Text style={styles.title}>财务报表详情</Text>
        <Text style={sharedStyles.pageCopy}>{period.label}</Text>
      </View>

      <View style={[sharedStyles.card, styles.controlCard]}>
        <View style={styles.reportSwitcher}>
          {reportTabs.map((tab) => {
            const isActive = selectedReport === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setSelectedReport(tab.key)}
                style={[sharedStyles.chip, styles.reportButton, isActive && sharedStyles.chipActiveLight]}
              >
                <Text style={sharedStyles.chipText}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.modeRow}>
          <Text style={styles.modeLabel}>简易版</Text>
          <View style={styles.modeSwitchTrack}>
            <Pressable
              onPress={() => setMode("simple")}
              style={[styles.modeSwitchThumb, isSimple ? styles.modeSwitchThumbLeft : styles.modeSwitchThumbRight]}
            />
            <Pressable onPress={() => setMode("simple")} style={styles.modeSwitchHitArea} />
            <Pressable
              onPress={() => setMode("professional")}
              style={[styles.modeSwitchHitArea, styles.modeSwitchRightHitArea]}
            />
          </View>
          <Text style={styles.modeLabel}>专业版</Text>
        </View>

        <Text style={styles.modeHint}>
          {isSimple
            ? "简易版用更直白的语言，先帮你看懂当前个人财务状态。"
            : "专业版保留财务报表表达，便于核对底层会计含义。"}
        </Text>
      </View>

      {renderCurrentReport()}
    </View>
  );
}

const styles = StyleSheet.create({
  controlCard: {
    gap: 14,
  },
  modeHint: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
  modeLabel: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },
  modeRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
    justifyContent: "center",
  },
  modeSwitchHitArea: {
    bottom: 0,
    left: 0,
    position: "absolute",
    top: 0,
    width: "50%",
  },
  modeSwitchRightHitArea: {
    left: "50%",
  },
  modeSwitchThumb: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.pill,
    height: 28,
    position: "absolute",
    top: 2,
    width: 28,
  },
  modeSwitchThumbLeft: {
    left: 2,
  },
  modeSwitchThumbRight: {
    left: 34,
  },
  modeSwitchTrack: {
    backgroundColor: theme.colors.surfaceSoft,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    height: 32,
    position: "relative",
    width: 64,
  },
  reportButton: {
    flex: 1,
    minHeight: 38,
    paddingHorizontal: 8,
  },
  reportSwitcher: {
    flexDirection: "row",
    gap: 6,
  },
  stack: {
    gap: theme.spacing.md,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.6,
    textAlign: "center",
  },
});
