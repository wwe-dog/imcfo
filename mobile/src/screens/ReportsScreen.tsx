import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import AppIcon, { type AppIconName } from "../components/AppIcon";
import { EmptyStateScreen } from "../components/EmptyState";
import {
  LedgerFullBleedList,
  LedgerGlassHero,
  LedgerPageHeader,
  LedgerSectionHeader,
  LedgerValueRow,
  getLedgerScreenPadding,
  type LedgerRowTone,
} from "../components/LedgerUI";
import ScreenTransition from "../components/ScreenTransition";
import Skeleton from "../components/Skeleton";
import SkeletonCard, { SkeletonScreenShell } from "../components/SkeletonCard";
import type { Asset, Liability, ReportMode, ReportPeriod, Transaction } from "../domain/models";
import { buildBalanceSheetSummary } from "../domain/reports/balanceSheet";
import { buildCashFlowStatementSummary } from "../domain/reports/cashFlowStatement";
import { buildIncomeStatementSummary } from "../domain/reports/incomeStatement";
import { useRouteTransition } from "../hooks/useRouteTransition";
import { theme } from "../styles/theme";
import OperatingAnalysisReportScreen from "./OperatingAnalysisReportScreen";
import ProfitabilityAnalysisScreen from "./ProfitabilityAnalysisScreen";

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
  tone?: LedgerRowTone;
  value: string;
}

type ReportKey = "balanceSheet" | "cashFlow" | "incomeStatement";
type ReportsRoute =
  | { name: "root" }
  | { name: "detail"; report: ReportKey }
  | { name: "operationAnalysis" }
  | { name: "profitabilityAnalysis" };

const getReportsRouteKey = (route: ReportsRoute): string =>
  route.name === "detail" ? `reports-detail-${route.report}` : `reports-${route.name}`;

const getReportsRouteDepth = (route: ReportsRoute): number => {
  if (route.name === "root") return 0;
  if (route.name === "profitabilityAnalysis") return 2;
  return 1;
};

const emptyReportsIllustration = require("../assets/empty/empty-reports.png");

const reportMeta: Record<
  ReportKey,
  {
    formula: string;
    icon: AppIconName;
    title: string;
    subtitle: string;
  }
> = {
  balanceSheet: {
    formula: "资产 = 负债 + 个人净资产",
    icon: "netWorth",
    subtitle: "看清资产、负债与净资产结构",
    title: "资产负债表",
  },
  cashFlow: {
    formula: "现金净变化 = 经营 + 投资 + 筹资现金流",
    icon: "cashFlow",
    subtitle: "看清资金流入、流出和现金质量",
    title: "现金流量表",
  },
  incomeStatement: {
    formula: "利润 = 收入 - 费用",
    icon: "chart",
    subtitle: "看清本期经营结果和结余率",
    title: "利润表",
  },
};

const reportTabs: Array<{ key: ReportKey; label: string }> = [
  { key: "balanceSheet", label: "资产负债" },
  { key: "cashFlow", label: "现金流" },
  { key: "incomeStatement", label: "利润" },
];

const formatMoney = (value: number): string =>
  new Intl.NumberFormat("zh-CN", {
    currency: "CNY",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "currency",
  }).format(value);

const formatHeroMoney = (value: number): string => {
  const sign = value < 0 ? "-" : "";
  const absoluteValue = Math.abs(value);

  if (absoluteValue >= 100000000) {
    const digits = absoluteValue >= 1000000000 ? 1 : 2;
    return `${sign}¥${(absoluteValue / 100000000).toFixed(digits)}亿`;
  }

  if (absoluteValue >= 10000) {
    const digits = absoluteValue >= 100000 ? 1 : 2;
    return `${sign}¥${(absoluteValue / 10000).toFixed(digits)}万`;
  }

  return `${sign}¥${absoluteValue.toLocaleString("zh-CN", { maximumFractionDigits: 0 })}`;
};

const formatHeroDisplayValue = (value: string): string => {
  if (!value.includes("¥")) {
    return value;
  }

  const numericValue = Number(value.replace(/[^\d.-]/g, ""));
  if (!Number.isFinite(numericValue)) {
    return value;
  }

  return formatHeroMoney(numericValue);
};

const formatPercent = (value: number | null): string => {
  if (value === null) return "不可计算";
  return `${(value * 100).toFixed(1)}%`;
};

const formatPeriodLabel = (period: ReportPeriod): string => {
  const [year, month] = period.startDate.split("-");
  if (year && month) return `${year}年${Number(month)}月`;
  return period.label || "本期";
};

export default function ReportsScreen({
  assets,
  isLoading = false,
  liabilities,
  onBack,
  onOpenRecord,
  period,
  transactions,
}: ReportsScreenProps) {
  const { width } = useWindowDimensions();
  const horizontalPadding = getLedgerScreenPadding(width);
  const { direction, goBack, navigate, route, transitionKey } = useRouteTransition<ReportsRoute>(
    { name: "root" },
    getReportsRouteKey,
    getReportsRouteDepth,
  );
  const [mode, setMode] = useState<ReportMode>("simple");
  const balanceSheet = useMemo(() => buildBalanceSheetSummary(assets, liabilities), [assets, liabilities]);
  const incomeStatement = useMemo(() => buildIncomeStatementSummary(transactions), [transactions]);
  const cashFlowStatement = useMemo(
    () => buildCashFlowStatementSummary(transactions),
    [transactions],
  );

  const periodLabel = formatPeriodLabel(period);
  const hasReportInputs = assets.length > 0 || liabilities.length > 0 || transactions.length > 0;

  const balanceRows: ReportRow[] = [
    { label: "资产总计", value: formatMoney(balanceSheet.totalAssets), emphasis: true, tone: "green" },
    { label: "负债合计", value: formatMoney(balanceSheet.totalLiabilities), emphasis: true, tone: "amber" },
    { label: "个人净资产", value: formatMoney(balanceSheet.ownerEquity), emphasis: true, tone: "blue" },
  ];
  const cashFlowRows: ReportRow[] = [
    { label: "经营活动净现金流", value: formatMoney(cashFlowStatement.operatingCashFlow), emphasis: true, tone: "green" },
    { label: "投资活动净现金流", value: formatMoney(cashFlowStatement.investingCashFlow) },
    { label: "筹资活动净现金流", value: formatMoney(cashFlowStatement.financingCashFlow) },
    { label: "现金及现金等价物净增加额", value: formatMoney(cashFlowStatement.cashNetChange), emphasis: true, tone: "blue" },
  ];
  const incomeRows: ReportRow[] = [
    { label: "收入合计", value: formatMoney(incomeStatement.totalIncome), tone: "green" },
    { label: "费用合计", value: formatMoney(incomeStatement.totalExpenses) },
    { label: "本月结余", value: formatMoney(incomeStatement.profit), emphasis: true, tone: incomeStatement.profit >= 0 ? "green" : "danger" },
    { label: "结余率", value: formatPercent(incomeStatement.savingsRate), tone: "blue" },
  ];
  const rowsByReport: Record<ReportKey, ReportRow[]> = {
    balanceSheet: balanceRows,
    cashFlow: cashFlowRows,
    incomeStatement: incomeRows,
  };

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
        secondaryLabel="了解三大报表"
        title="还没有可生成的报表"
      />
    );
  }

  if (route.name === "operationAnalysis") {
    return (
      <ScreenTransition animateOnMount direction={direction} transitionKey={transitionKey} variant="drilldown">
        <OperatingAnalysisReportScreen
          assets={assets}
          liabilities={liabilities}
          onBack={() => goBack({ name: "root" })}
          onOpenRecord={onOpenRecord}
          onOpenProfitabilityAnalysis={() => navigate({ name: "profitabilityAnalysis" })}
          period={period}
          transactions={transactions}
        />
      </ScreenTransition>
    );
  }

  if (route.name === "profitabilityAnalysis") {
    return (
      <ScreenTransition animateOnMount direction={direction} transitionKey={transitionKey} variant="drilldown">
        <ProfitabilityAnalysisScreen
          onBack={() => goBack({ name: "operationAnalysis" })}
          period={period}
          transactions={transactions}
        />
      </ScreenTransition>
    );
  }

  if (route.name === "detail") {
    return (
      <ScreenTransition animateOnMount direction={direction} transitionKey={transitionKey} variant="drilldown">
        <ReportDetailView
          horizontalPadding={horizontalPadding}
          mode={mode}
          onBack={() => goBack({ name: "root" })}
          onModeChange={setMode}
          onReportChange={(report) => navigate({ name: "detail", report })}
          rowsByReport={rowsByReport}
          selectedReport={route.report}
        />
      </ScreenTransition>
    );
  }

  return (
    <ScreenTransition animateOnMount direction={direction} transitionKey={transitionKey} variant="drilldown">
      <View style={[styles.screen, { marginHorizontal: -horizontalPadding, paddingHorizontal: horizontalPadding }]}>
      <View style={styles.stack}>
        <LedgerPageHeader title="报表" />
        <LedgerGlassHero
          badge="已生成"
          badgeTone="blue"
          eyebrow={`${periodLabel} · 个人财务报表`}
          metrics={[
            { label: "净资产", tone: "green", value: formatHeroMoney(balanceSheet.ownerEquity) },
            { label: "本期结余", tone: incomeStatement.profit >= 0 ? "green" : "amber", value: formatHeroMoney(incomeStatement.profit) },
            { label: "净现金流", tone: cashFlowStatement.cashNetChange >= 0 ? "blue" : "amber", value: formatHeroMoney(cashFlowStatement.cashNetChange) },
          ]}
          title={"三大报表已按本地账本生成，\n经营分析可继续下钻。"}
        />

        <LedgerSectionHeader title="三大报表" />
        <LedgerFullBleedList horizontalPadding={horizontalPadding}>
          {reportTabs.map((item, index) => (
            <ReportEntryRow
              key={item.key}
              last={index === reportTabs.length - 1}
              onPress={() => navigate({ name: "detail", report: item.key })}
              rows={rowsByReport[item.key]}
              reportKey={item.key}
            />
          ))}
        </LedgerFullBleedList>

        <LedgerSectionHeader title="分析报告" />
        <LedgerFullBleedList horizontalPadding={horizontalPadding}>
          <LedgerValueRow
            icon="report"
            onPress={() => navigate({ name: "operationAnalysis" })}
            subtitle="综合盈利、偿债、营运、成长和风险事项"
            title="经营分析报告"
            value="12 节"
            valueDetail="可下钻"
          />
          <LedgerValueRow
            icon="chart"
            last
            onPress={() => navigate({ name: "profitabilityAnalysis" })}
            subtitle="查看结余趋势、指标解释和收入结构流向"
            title="盈利能力分析"
            tone="green"
            value={formatPercent(incomeStatement.savingsRate)}
            valueDetail="结余率"
          />
        </LedgerFullBleedList>
      </View>
      </View>
    </ScreenTransition>
  );
}

function ReportEntryRow({
  last,
  onPress,
  reportKey,
  rows,
}: {
  last?: boolean;
  onPress: () => void;
  reportKey: ReportKey;
  rows: ReportRow[];
}) {
  const meta = reportMeta[reportKey];
  const primary = rows.find((row) => row.emphasis) ?? rows[0];

  return (
    <LedgerValueRow
      icon={meta.icon}
      last={last}
      onPress={onPress}
      subtitle={meta.subtitle}
      title={meta.title}
      tone={primary.tone ?? "default"}
      value={primary.value}
      valueDetail={primary.label}
    />
  );
}

function ReportDetailView({
  horizontalPadding,
  mode,
  onBack,
  onModeChange,
  onReportChange,
  rowsByReport,
  selectedReport,
}: {
  horizontalPadding: number;
  mode: ReportMode;
  onBack: () => void;
  onModeChange: (mode: ReportMode) => void;
  onReportChange: (report: ReportKey) => void;
  rowsByReport: Record<ReportKey, ReportRow[]>;
  selectedReport: ReportKey;
}) {
  const meta = reportMeta[selectedReport];
  const isSimple = mode === "simple";
  const visibleRows =
    selectedReport === "balanceSheet" && isSimple
      ? rowsByReport[selectedReport].slice(0, 3)
      : selectedReport === "cashFlow" && isSimple
        ? [rowsByReport[selectedReport][rowsByReport[selectedReport].length - 1]]
        : rowsByReport[selectedReport];

  return (
    <View style={[styles.screen, { marginHorizontal: -horizontalPadding, paddingHorizontal: horizontalPadding }]}>
      <View style={styles.stack}>
        <LedgerPageHeader onBack={onBack} title={meta.title} />
        <LedgerGlassHero
          badge={isSimple ? "简明版" : "专业版"}
          badgeTone={isSimple ? "green" : "blue"}
          eyebrow="完整报表"
          metrics={visibleRows.slice(0, 3).map((row) => ({
            label: row.label,
            tone: row.tone === "danger" ? "amber" : row.tone === "default" ? undefined : row.tone,
            value: formatHeroDisplayValue(row.value),
          }))}
          title={meta.subtitle}
        />

        <View style={styles.segmented}>
          {reportTabs.map((tab) => {
            const active = selectedReport === tab.key;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                key={tab.key}
                onPress={() => onReportChange(tab.key)}
                style={[styles.segmentButton, active && styles.segmentButtonActive]}
              >
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.segmented}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: isSimple }}
            onPress={() => onModeChange("simple")}
            style={[styles.segmentButton, isSimple && styles.segmentButtonActive]}
          >
            <Text style={[styles.segmentText, isSimple && styles.segmentTextActive]}>简明版</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: !isSimple }}
            onPress={() => onModeChange("professional")}
            style={[styles.segmentButton, !isSimple && styles.segmentButtonActive]}
          >
            <Text style={[styles.segmentText, !isSimple && styles.segmentTextActive]}>专业版</Text>
          </Pressable>
        </View>

        <LedgerSectionHeader title="报表行" />
        <LedgerFullBleedList horizontalPadding={horizontalPadding}>
          {visibleRows.map((row, index) => (
            <LedgerValueRow
              key={`${row.label}-${index}`}
              last={index === visibleRows.length - 1}
              title={row.label}
              tone={row.tone ?? (row.emphasis ? "blue" : "default")}
              value={row.value}
            />
          ))}
        </LedgerFullBleedList>
        <Text style={styles.formulaNote}>{meta.formula}</Text>
      </View>
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
  formulaNote: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 17,
    paddingHorizontal: 2,
  },
  reportSkeletonCard: {
    marginBottom: 10,
    minHeight: 72,
  },
  screen: {
    backgroundColor: theme.colors.background,
  },
  segmented: {
    backgroundColor: "rgba(255,255,255,0.035)",
    borderColor: "rgba(255,255,255,0.075)",
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 3,
    padding: 3,
  },
  segmentButton: {
    alignItems: "center",
    borderRadius: 999,
    flex: 1,
    justifyContent: "center",
    minHeight: 34,
    paddingHorizontal: 8,
  },
  segmentButtonActive: {
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  segmentText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
  },
  segmentTextActive: {
    color: theme.colors.textPrimary,
  },
  stack: {
    gap: 14,
    paddingBottom: 176,
    paddingTop: 18,
  },
});
