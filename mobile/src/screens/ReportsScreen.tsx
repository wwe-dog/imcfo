import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import ReportBlock from "../components/ReportBlock";
import { buildBalanceSheetSummary } from "../domain/reports/balanceSheet";
import { buildCashFlowStatementSummary } from "../domain/reports/cashFlowStatement";
import { buildIncomeStatementSummary } from "../domain/reports/incomeStatement";
import type { Asset, Liability, ReportMode, ReportPeriod, Transaction } from "../domain/models";
import { formatCurrency } from "../utils/formatters";

interface ReportsScreenProps {
  assets: Asset[];
  liabilities: Liability[];
  period: ReportPeriod;
  transactions: Transaction[];
}

const getCashFlowDirection = (cashNetChange: number): string => {
  if (cashNetChange > 0) return "本期现金主要呈净流入";
  if (cashNetChange < 0) return "本期现金主要呈净流出";
  return "本期现金总体持平";
};

const getBalanceHint = (totalAssets: number, totalLiabilities: number, ownerEquity: number): string => {
  const isBalanced = Math.abs(totalAssets - (totalLiabilities + ownerEquity)) < 0.01;
  return isBalanced ? "平衡成立：资产 = 负债 + 所有者权益" : "平衡异常：请检查底层数据";
};

export default function ReportsScreen({
  assets,
  liabilities,
  period,
  transactions,
}: ReportsScreenProps) {
  const [mode, setMode] = useState<ReportMode>("simple");
  const isSimple = mode === "simple";

  const balanceSheet = useMemo(() => buildBalanceSheetSummary(assets, liabilities), [assets, liabilities]);
  const incomeStatement = useMemo(() => buildIncomeStatementSummary(transactions), [transactions]);
  const cashFlowStatement = useMemo(() => buildCashFlowStatementSummary(transactions), [transactions]);

  return (
    <View style={styles.stack}>
      <View>
        <Text style={styles.eyebrow}>Reports</Text>
        <Text style={styles.title}>三大报表</Text>
        <Text style={styles.copy}>{period.label}，简易版和专业版共用同一套数据和同一套计算逻辑。</Text>
      </View>

      <View style={styles.segmented}>
        <Pressable
          onPress={() => setMode("simple")}
          style={[styles.segmentButton, isSimple && styles.segmentActive]}
        >
          <Text style={[styles.segmentText, isSimple && styles.segmentTextActive]}>简易版</Text>
        </Pressable>
        <Pressable
          onPress={() => setMode("professional")}
          style={[styles.segmentButton, !isSimple && styles.segmentActive]}
        >
          <Text style={[styles.segmentText, !isSimple && styles.segmentTextActive]}>专业版</Text>
        </Pressable>
      </View>

      <ReportBlock
        footer={
          isSimple
            ? "这里回答：我现在拥有多少、欠了多少、真正属于我的钱是多少。"
            : getBalanceHint(
                balanceSheet.totalAssets,
                balanceSheet.totalLiabilities,
                balanceSheet.ownerEquity,
              )
        }
        rows={
          isSimple
            ? [
                { label: "总资产", value: formatCurrency(balanceSheet.totalAssets) },
                { label: "总负债", value: formatCurrency(balanceSheet.totalLiabilities) },
                { label: "所有者权益，也就是个人净资产", value: formatCurrency(balanceSheet.ownerEquity) },
              ]
            : [
                { label: "资产", value: formatCurrency(balanceSheet.totalAssets) },
                { label: "负债", value: formatCurrency(balanceSheet.totalLiabilities) },
                { label: "所有者权益", value: formatCurrency(balanceSheet.ownerEquity) },
              ]
        }
        subtitle={isSimple ? "看清你现在真正拥有和欠下的规模。" : "专业口径下核对资产、负债和权益是否平衡。"}
        title="资产负债表"
      />

      <ReportBlock
        footer={isSimple ? "这里回答：这个期间是赚了还是亏了。" : "公式提示：利润 = 收入 - 费用"}
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
        subtitle={isSimple ? "看清本期赚了多少、花了多少、最后剩下多少。" : "专业口径下直接展示收入、费用和利润关系。"}
        title="利润表"
      />

      <ReportBlock
        footer={
          isSimple
            ? getCashFlowDirection(cashFlowStatement.cashNetChange)
            : "专业口径下区分经营、投资、筹资三类现金流。"
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
        subtitle={isSimple ? "先看本期现金整体是增加还是减少。" : "把现金变动拆成三条主线，便于复盘。"}
        title="现金流量表"
      />
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
  segmented: {
    flexDirection: "row",
    gap: 10,
  },
  segmentActive: {
    backgroundColor: "#17251b",
    borderColor: "#17251b",
  },
  segmentButton: {
    backgroundColor: "#fbfaf3",
    borderColor: "#c7d2b7",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  segmentText: {
    color: "#18201a",
    fontWeight: "700",
  },
  segmentTextActive: {
    color: "#f8f4e7",
  },
  stack: {
    gap: 18,
  },
  title: {
    color: "#18201a",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },
});
