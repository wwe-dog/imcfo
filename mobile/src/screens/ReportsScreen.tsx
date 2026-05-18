import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import AppIcon, { type AppIconName } from "../components/AppIcon";
import { EmptyStateScreen } from "../components/EmptyState";
import Skeleton from "../components/Skeleton";
import SkeletonCard, { SkeletonScreenShell } from "../components/SkeletonCard";
import type { Asset, Liability, ReportMode, ReportPeriod, Transaction } from "../domain/models";
import { buildBalanceSheetSummary } from "../domain/reports/balanceSheet";
import { buildCashFlowStatementSummary } from "../domain/reports/cashFlowStatement";
import { buildIncomeStatementSummary } from "../domain/reports/incomeStatement";
import { theme } from "../styles/theme";

interface ReportsScreenProps {
  assets: Asset[];
  isLoading?: boolean;
  liabilities: Liability[];
  onBack: () => void;
  onOpenRecord: () => void;
  period: ReportPeriod;
  transactions: Transaction[];
}

interface ReportRow {
  emphasis?: boolean;
  label: string;
  value: string;
}

type ReportKey = "balanceSheet" | "cashFlow" | "incomeStatement";

const emptyReportsIllustration = require("../assets/empty/empty-reports.png");

const reportTabs: Array<{ key: ReportKey; label: string }> = [
  { key: "balanceSheet", label: "资产负债表" },
  { key: "cashFlow", label: "现金流量表" },
  { key: "incomeStatement", label: "利润表" },
];

const formatMoney = (value: number): string =>
  new Intl.NumberFormat("zh-CN", {
    currency: "CNY",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "currency",
  }).format(value);

const formatPercent = (value: number | null): string => {
  if (value === null) return "不可计算";
  return `${(value * 100).toFixed(1)}%`;
};

const formatPeriodLabel = (period: ReportPeriod): string => {
  const [year, month] = period.startDate.split("-");
  if (year && month) return `${year}年${Number(month)}月`;
  return period.label || "本期";
};

function Header({ periodLabel }: { periodLabel: string }) {
  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <View style={styles.brandCopy}>
          <View style={styles.logoRow}>
            <Text style={styles.logoText}>我为 </Text>
            <Text style={styles.logoAccent}>CFO</Text>
            <Text style={styles.versionBadge}>V0.1</Text>
          </View>
          <Text style={styles.brandSubtitle}>把自己当成一家公司经营</Text>
        </View>

        <View style={styles.periodControls}>
          <View style={styles.periodPill}>
            <Text style={styles.periodPillText}>{periodLabel}</Text>
            <AppIcon color={theme.colors.textPrimary} name="chevronRight" size={13} strokeWidth={2.4} />
          </View>
          <View style={styles.calendarButton}>
            <AppIcon color={theme.colors.textPrimary} name="calendar" size={23} strokeWidth={2} />
          </View>
        </View>
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.pageTitle}>财务报表</Text>
        <Text style={styles.pageSubtitle}>个人财务三大报表预览</Text>
      </View>
    </View>
  );
}

function MetaStrip({ periodLabel }: { periodLabel: string }) {
  const items: Array<{ icon: AppIconName; label: string; value: string }> = [
    { icon: "calendar", label: "报告期间", value: periodLabel },
    { icon: "data", label: "单位", value: "人民币（元）" },
    { icon: "reconcile", label: "报表口径", value: "个人财务" },
    { icon: "report", label: "报表状态", value: "已生成" },
  ];

  return (
    <View style={styles.metaStrip}>
      {items.map((item, index) => (
        <View key={item.label} style={[styles.metaItem, index < items.length - 1 && styles.metaDivider]}>
          <View style={styles.metaLabelRow}>
            <AppIcon color={theme.colors.warning} name={item.icon} size={17} strokeWidth={2} />
            <Text numberOfLines={1} style={styles.metaLabel}>
              {item.label}
            </Text>
          </View>
          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.metaValue}>
            {item.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

function ReportCard({
  footer,
  icon,
  onOpen,
  rows,
  title,
}: {
  footer?: string;
  icon: AppIconName;
  onOpen: () => void;
  rows: ReportRow[];
  title: string;
}) {
  return (
    <View style={styles.reportCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleGroup}>
          <View style={styles.cardIcon}>
            <AppIcon color="#FFFFFF" name={icon} size={27} strokeWidth={2.3} />
          </View>
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={onOpen} style={styles.fullReportLink}>
          <Text style={styles.fullReportText}>查看完整报表</Text>
          <AppIcon color={theme.colors.warning} name="chevronRight" size={16} strokeWidth={2.5} />
        </Pressable>
      </View>

      <View style={styles.table}>
        {rows.map((row, index) => (
          <View
            key={`${row.label}-${index}`}
            style={[
              styles.tableRow,
              index < rows.length - 1 && styles.tableDivider,
              row.emphasis && styles.totalRow,
            ]}
          >
            <Text style={[styles.rowLabel, row.emphasis && styles.totalLabel]}>{row.label}</Text>
            <Text style={[styles.rowValue, row.emphasis && styles.totalValue]}>{row.value}</Text>
          </View>
        ))}
      </View>

      {footer ? <Text style={styles.cardFooter}>{footer}</Text> : null}
    </View>
  );
}

function FullReportPanel({
  balanceRows,
  cashFlowRows,
  incomeRows,
  mode,
  onModeChange,
  onReportChange,
  selectedReport,
}: {
  balanceRows: ReportRow[];
  cashFlowRows: ReportRow[];
  incomeRows: ReportRow[];
  mode: ReportMode;
  onModeChange: (mode: ReportMode) => void;
  onReportChange: (report: ReportKey) => void;
  selectedReport: ReportKey;
}) {
  const isSimple = mode === "simple";
  const rowsByReport: Record<ReportKey, ReportRow[]> = {
    balanceSheet: isSimple ? balanceRows.slice(0, 3) : balanceRows,
    cashFlow: isSimple ? [cashFlowRows[cashFlowRows.length - 1]] : cashFlowRows,
    incomeStatement: incomeRows,
  };
  const titleByReport: Record<ReportKey, string> = {
    balanceSheet: "资产负债表详情",
    cashFlow: "现金流量表详情",
    incomeStatement: "利润表详情",
  };
  const footerByReport: Record<ReportKey, string> = {
    balanceSheet: "资产 = 负债 + 个人净资产",
    cashFlow: "现金净变化 = 经营活动现金流 + 投资活动现金流 + 筹资活动现金流",
    incomeStatement: "利润 = 收入 - 费用",
  };

  return (
    <View style={styles.fullPanel}>
      <View style={styles.fullPanelHeader}>
        <Text style={styles.fullPanelTitle}>完整报表</Text>
        <Text style={styles.fullPanelSubtitle}>保留原有报表切换和简易 / 专业视图</Text>
      </View>

      <View style={styles.reportSwitcher}>
        {reportTabs.map((tab) => {
          const isActive = selectedReport === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => onReportChange(tab.key)}
              style={[styles.reportTab, isActive && styles.reportTabActive]}
            >
              <Text style={[styles.reportTabText, isActive && styles.reportTabTextActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.modeSwitcher}>
        <Pressable
          onPress={() => onModeChange("simple")}
          style={[styles.modeButton, isSimple && styles.modeButtonActive]}
        >
          <Text style={[styles.modeButtonText, isSimple && styles.modeButtonTextActive]}>简易版</Text>
        </Pressable>
        <Pressable
          onPress={() => onModeChange("professional")}
          style={[styles.modeButton, !isSimple && styles.modeButtonActive]}
        >
          <Text style={[styles.modeButtonText, !isSimple && styles.modeButtonTextActive]}>专业版</Text>
        </Pressable>
      </View>

      <View style={styles.fullReportBlock}>
        <Text style={styles.fullReportTitle}>{titleByReport[selectedReport]}</Text>
        <View style={styles.fullReportRows}>
          {rowsByReport[selectedReport].map((row, index) => (
            <View
              key={`${selectedReport}-${row.label}-${index}`}
              style={[
                styles.fullReportRow,
                index < rowsByReport[selectedReport].length - 1 && styles.tableDivider,
                row.emphasis && styles.totalRow,
              ]}
            >
              <Text style={[styles.rowLabel, row.emphasis && styles.totalLabel]}>{row.label}</Text>
              <Text style={[styles.rowValue, row.emphasis && styles.totalValue]}>{row.value}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.fullReportFooter}>{footerByReport[selectedReport]}</Text>
      </View>
    </View>
  );
}

export default function ReportsScreen({
  assets,
  isLoading = false,
  liabilities,
  onBack,
  onOpenRecord,
  period,
  transactions,
}: ReportsScreenProps) {
  const [selectedReport, setSelectedReport] = useState<ReportKey | null>(null);
  const [mode, setMode] = useState<ReportMode>("simple");
  const balanceSheet = useMemo(() => buildBalanceSheetSummary(assets, liabilities), [assets, liabilities]);
  const incomeStatement = useMemo(() => buildIncomeStatementSummary(transactions), [transactions]);
  const cashFlowStatement = useMemo(
    () => buildCashFlowStatementSummary(transactions),
    [transactions],
  );

  const periodLabel = formatPeriodLabel(period);
  const hasReportInputs = assets.length > 0 || liabilities.length > 0 || transactions.length > 0;

  if (isLoading) {
    return <ReportsSkeleton />;
  }

  if (!hasReportInputs) {
    return (
      <EmptyStateScreen
        description={"先记录收入、支出、资产或负债，\nIMCFO 会自动生成资产负债表、利润表和现金流量表。"}
        illustration={emptyReportsIllustration}
        onBack={onBack}
        onPrimary={onOpenRecord}
        onSecondary={() => Alert.alert("三大报表", "资产负债表看底账，利润表看本期经营结果，现金流量表看资金流入流出。")}
        primaryLabel="开始记录"
        screenTitle="报表"
        secondaryLabel="了解三大报表 ›"
        title="还没有可生成的报表"
      />
    );
  }

  const balanceRows: ReportRow[] = [
    { label: "资产总计", value: formatMoney(balanceSheet.totalAssets), emphasis: true },
    { label: "负债合计", value: formatMoney(balanceSheet.totalLiabilities), emphasis: true },
    { label: "个人净资产", value: formatMoney(balanceSheet.ownerEquity), emphasis: true },
  ];
  const cashFlowRows: ReportRow[] = [
    { label: "经营活动净现金流", value: formatMoney(cashFlowStatement.operatingCashFlow), emphasis: true },
    { label: "投资活动净现金流", value: formatMoney(cashFlowStatement.investingCashFlow) },
    { label: "筹资活动净现金流", value: formatMoney(cashFlowStatement.financingCashFlow) },
    { label: "现金及现金等价物净增加额", value: formatMoney(cashFlowStatement.cashNetChange), emphasis: true },
  ];
  const incomeRows: ReportRow[] = [
    { label: "收入合计", value: formatMoney(incomeStatement.totalIncome) },
    { label: "费用合计", value: formatMoney(incomeStatement.totalExpenses) },
    { label: "本月结余", value: formatMoney(incomeStatement.profit), emphasis: true },
    { label: "结余率", value: formatPercent(incomeStatement.savingsRate) },
  ];

  return (
    <View style={styles.stack}>
      <Header periodLabel={periodLabel} />
      <MetaStrip periodLabel={periodLabel} />

      <ReportCard
        footer="资产 = 负债 + 个人净资产"
        icon="netWorth"
        onOpen={() => setSelectedReport("balanceSheet")}
        rows={balanceRows}
        title="资产负债表（预览）"
      />

      <ReportCard
        footer="单位：人民币（元）"
        icon="cashFlow"
        onOpen={() => setSelectedReport("cashFlow")}
        rows={cashFlowRows}
        title="现金流量表（预览）"
      />

      <ReportCard
        icon="chart"
        onOpen={() => setSelectedReport("incomeStatement")}
        rows={incomeRows}
        title="利润表（预览）"
      />

      {selectedReport ? (
        <FullReportPanel
          balanceRows={balanceRows}
          cashFlowRows={cashFlowRows}
          incomeRows={incomeRows}
          mode={mode}
          onModeChange={setMode}
          onReportChange={setSelectedReport}
          selectedReport={selectedReport}
        />
      ) : null}
    </View>
  );
}

function ReportsSkeleton() {
  return (
    <SkeletonScreenShell>
      <Skeleton delay={0} height={16} width={80} />
      {[0, 1, 2].map((item) => (
        <SkeletonCard
          key={item}
          rows={[
            { delay: item * 150, height: 9, width: 72 },
            { delay: item * 150 + 80, height: 16, style: { marginTop: 10 }, width: "82%" },
            { delay: item * 150 + 160, height: 9, style: { marginTop: 8 }, width: "48%" },
          ]}
          style={styles.reportSkeletonCard}
        />
      ))}
    </SkeletonScreenShell>
  );
}

const styles = StyleSheet.create({
  brandCopy: {
    flex: 1,
    gap: 6,
    minWidth: 0,
  },
  brandRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  brandSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 21,
  },
  calendarButton: {
    alignItems: "center",
    height: 48,
    justifyContent: "center",
    width: 36,
  },
  cardFooter: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.md,
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
    marginTop: 2,
    overflow: "hidden",
    paddingVertical: 11,
    textAlign: "center",
  },
  cardHeader: {
    alignItems: "center",
    borderBottomColor: theme.colors.divider,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 13,
  },
  cardIcon: {
    alignItems: "center",
    backgroundColor: "#E5A64E",
    borderRadius: theme.radius.pill,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  cardTitle: {
    color: theme.colors.textPrimary,
    flexShrink: 1,
    fontSize: 21,
    fontWeight: "900",
    lineHeight: 28,
  },
  cardTitleGroup: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 11,
    minWidth: 0,
  },
  fullReportLink: {
    alignItems: "center",
    borderRadius: theme.radius.md,
    flexDirection: "row",
    gap: 4,
    marginLeft: 8,
    minHeight: 36,
    paddingHorizontal: 2,
  },
  fullReportText: {
    color: theme.colors.warning,
    fontSize: 15,
    fontWeight: "900",
  },
  fullPanel: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: 12,
    padding: theme.spacing.md,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 3,
  },
  fullPanelHeader: {
    gap: 4,
  },
  fullPanelSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  fullPanelTitle: {
    color: theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: "900",
  },
  fullReportBlock: {
    gap: 10,
  },
  fullReportFooter: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  fullReportRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  fullReportRows: {
    borderColor: theme.colors.divider,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    overflow: "hidden",
  },
  fullReportTitle: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: "900",
  },
  header: {
    gap: 30,
    paddingTop: 8,
  },
  logoAccent: {
    color: theme.colors.primary,
    fontSize: 31,
    fontWeight: "900",
    lineHeight: 39,
  },
  logoRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  logoText: {
    color: theme.colors.textPrimary,
    fontSize: 31,
    fontWeight: "900",
    lineHeight: 39,
  },
  metaDivider: {
    borderRightColor: theme.colors.divider,
    borderRightWidth: 1,
  },
  metaItem: {
    flex: 1,
    gap: 9,
    minWidth: 0,
    paddingHorizontal: 10,
    paddingVertical: 16,
  },
  metaLabel: {
    color: theme.colors.textMuted,
    flexShrink: 1,
    fontSize: 14,
    fontWeight: "800",
  },
  metaLabelRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    minWidth: 0,
  },
  metaStrip: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 3,
  },
  metaValue: {
    color: theme.colors.textPrimary,
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 23,
    textAlign: "center",
  },
  pageSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 28,
  },
  pageTitle: {
    color: theme.colors.textPrimary,
    fontSize: 41,
    fontWeight: "900",
    lineHeight: 50,
  },
  periodControls: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    paddingTop: 3,
  },
  periodPill: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    minHeight: 48,
    paddingHorizontal: 14,
    shadowColor: theme.colors.shadowSoft,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 2,
  },
  periodPillText: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: "900",
  },
  modeButton: {
    alignItems: "center",
    borderRadius: theme.radius.md,
    flex: 1,
    minHeight: 40,
    justifyContent: "center",
  },
  modeButtonActive: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.primary,
    borderWidth: 1,
  },
  modeButtonText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: "800",
  },
  modeButtonTextActive: {
    color: theme.colors.primaryDeep,
  },
  modeSwitcher: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    padding: 3,
  },
  reportCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: 0,
    overflow: "hidden",
    paddingHorizontal: 12,
    paddingTop: 20,
    paddingBottom: 10,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 3,
  },
  rowLabel: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 24,
  },
  rowValue: {
    color: theme.colors.textPrimary,
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 24,
    minWidth: 122,
    textAlign: "right",
  },
  reportSwitcher: {
    flexDirection: "row",
    gap: 6,
  },
  reportSkeletonCard: {
    marginBottom: 10,
    minHeight: 72,
  },
  reportTab: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    flex: 1,
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  reportTabActive: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primary,
  },
  reportTabText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
  },
  reportTabTextActive: {
    color: theme.colors.primaryDeep,
  },
  stack: {
    gap: theme.spacing.md,
  },
  table: {
    paddingTop: 5,
  },
  tableDivider: {
    borderBottomColor: theme.colors.divider,
    borderBottomWidth: 1,
  },
  tableRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    minHeight: 52,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  titleBlock: {
    gap: 8,
  },
  totalLabel: {
    fontWeight: "900",
  },
  totalRow: {
    backgroundColor: theme.colors.surfaceElevated,
  },
  totalValue: {
    color: theme.colors.warning,
    fontWeight: "900",
  },
  versionBadge: {
    borderColor: theme.colors.borderStrong,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    color: theme.colors.primary,
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 23,
    marginLeft: 8,
    overflow: "hidden",
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
});
