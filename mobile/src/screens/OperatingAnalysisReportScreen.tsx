import type { ReactNode } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Line, Polyline } from "react-native-svg";
import AppIcon, { type AppIconName } from "../components/AppIcon";
import { EmptyStateScreen } from "../components/EmptyState";
import {
  type AnalysisMetric,
  type AnalysisRiskRow,
  type AnalysisStatusBlock,
  type AnalysisTableRow,
  type AnalysisTone,
  buildOperatingAnalysisReport,
} from "../domain/reports/operatingAnalysisReport";
import type { Asset, Liability, ReportPeriod, Transaction } from "../domain/models";
import { theme } from "../styles/theme";

interface OperatingAnalysisReportScreenProps {
  assets: Asset[];
  liabilities: Liability[];
  onBack: () => void;
  onOpenRecord?: () => void;
  onOpenProfitabilityAnalysis?: () => void;
  period: ReportPeriod;
  transactions: Transaction[];
}

const emptyAnalysisIllustration = require("../assets/empty/empty-analysis.png");

const percent = (value: number): `${number}%` => `${Math.max(0, Math.min(100, value))}%` as `${number}%`;

const toneColor: Record<AnalysisTone, string> = {
  danger: theme.colors.danger,
  good: theme.colors.success,
  neutral: theme.colors.textSecondary,
  primary: theme.colors.blueText,
  warning: theme.colors.warning,
};

const toneSoft: Record<AnalysisTone, string> = {
  danger: theme.colors.dangerSoft,
  good: theme.colors.successSoft,
  neutral: "rgba(255,255,255,0.055)",
  primary: theme.colors.blueSoft,
  warning: theme.colors.warningSoft,
};

export default function OperatingAnalysisReportScreen({
  assets,
  liabilities,
  onBack,
  onOpenRecord,
  onOpenProfitabilityAnalysis,
  period,
  transactions,
}: OperatingAnalysisReportScreenProps) {
  const hasAnalysisBasis = transactions.length > 0 || assets.length > 0 || liabilities.length > 0;

  if (!hasAnalysisBasis) {
    return (
      <EmptyStateScreen
        description={"IMCFO 需要先了解你的收入、支出和现金流，\n才能判断你的经营状态。"}
        illustration={emptyAnalysisIllustration}
        onBack={onBack}
        onPrimary={onOpenRecord ?? onBack}
        onSecondary={() => Alert.alert("经营分析", "经营分析会在基础交易和现金流数据形成后，判断个人财务状态和下一步行动重点。")}
        primaryLabel="开始记录"
        screenTitle="经营分析"
        secondaryLabel="了解经营分析 ›"
        title="暂时无法形成经营分析"
      />
    );
  }

  const report = buildOperatingAnalysisReport({ assets, liabilities, period, transactions });

  return (
    <View style={styles.reportRoot}>
      <View style={styles.topBar}>
        <Pressable onPress={onBack} style={({ pressed }) => [styles.backButton, pressed && styles.pressFeedback]}>
          <AppIcon color={theme.colors.textPrimary} name="back" size={23} strokeWidth={2.4} />
        </Pressable>
        <View style={styles.titleBlock}>
          <Text maxFontSizeMultiplier={1} style={styles.pageTitle}>经营分析报告</Text>
          <Text maxFontSizeMultiplier={1} numberOfLines={1} style={styles.pageSubtitle}>{report.basisText}</Text>
        </View>
        <View style={styles.periodPill}>
          <Text maxFontSizeMultiplier={1} style={styles.periodText}>{report.periodLabel}</Text>
          <Text maxFontSizeMultiplier={1} style={styles.periodArrow}>⌄</Text>
        </View>
      </View>

      <View style={styles.metaStrip}>
        <Text maxFontSizeMultiplier={1} style={styles.metaText}>报告日期：{report.generatedDate}</Text>
        <View style={styles.metaDot} />
        <Text maxFontSizeMultiplier={1} style={styles.metaText}>单位：{report.unit}</Text>
      </View>

      <ReportSection number="01" title="综合结论">
        <View style={styles.summaryStrip}>
          <Text maxFontSizeMultiplier={1} style={styles.summaryParagraph}>{report.summaryText}</Text>
        </View>
        <View style={styles.statusRow}>
          {report.statusBlocks.map((item, index) => (
            <StatusTile
              key={item.label}
              icon={(["chart", "netWorth", "cashFlow", "warning"] as AppIconName[])[index] ?? "report"}
              item={item}
            />
          ))}
        </View>
      </ReportSection>

      <ReportSection number="02" title="核心指标总览">
        <ReportTable headers={["指标", "本期值", "上期值", "判断"]} rows={report.coreTable} />
      </ReportSection>

      <ReportSection number="03" title="盈利能力分析" onPress={onOpenProfitabilityAnalysis}>
        <AnalysisBody
          conclusion="本期收入能够覆盖支出，个人经营结果为正，收入留存能力较好。"
          metrics={[
            { label: "本月净收益", value: "¥8,432.19" },
            { label: "净收益率", value: "29.4%" },
            { label: "收入增长率", tone: "good", value: "+6.21%" },
          ]}
        >
          <ProgressVisual
            label="净收益率（目标 35%）"
            markerLabel="35%"
            markerPercent={58.3}
            maxLabel="60%"
            minLabel="0%"
            valueLabel="29.4%"
            valuePercent={49}
          />
        </AnalysisBody>
      </ReportSection>

      <ReportSection number="04" title="偿债能力分析">
        <AnalysisBody
          conclusion="当前负债压力处于可控区间，短期现金资产可覆盖主要待还款项。"
          metrics={[
            { label: "负债率", value: "28.6%" },
            { label: "待还信用卡", value: "¥3,520.00" },
            { label: "现金覆盖倍数", value: "3.21" },
          ]}
        >
          <RangeBar
            label="负债率安全区间"
            markerLabel="28.6%"
            markerPercent={28.6}
            segments={[
              { color: "rgba(74,222,128,0.14)", label: "低风险\n(<20%)", size: 20 },
              { color: "rgba(59,139,255,0.14)", label: "合理区间\n(20%-50%)", size: 30 },
              { color: "rgba(248,113,113,0.14)", label: "高风险\n(>50%)", size: 50 },
            ]}
          />
        </AnalysisBody>
      </ReportSection>

      <ReportSection number="05" title="营运能力分析">
        <AnalysisBody
          conclusion="资金流动性较强，但待收款回收效率仍需关注。"
          metrics={[
            { label: "待收款", tone: "warning", value: "¥5,800.00 尚未到账" },
            { label: "闲置现金占比", value: "19.4%" },
            { label: "记账完成度", tone: "good", value: "92%" },
          ]}
        >
          <ProgressVisual
            fillColor={theme.colors.blueText}
            label="记账完成度"
            markerLabel="50%"
            markerPercent={50}
            maxLabel="100%"
            minLabel="0%"
            valueLabel="92%"
            valuePercent={92}
          />
        </AnalysisBody>
      </ReportSection>

      <ReportSection number="06" title="成长能力分析">
        <AnalysisBody
          conclusion="净资产和收入均保持增长，个人财富规模继续扩大。"
          metrics={[
            { label: "净资产变化率", tone: "good", value: "+2.63%" },
            { label: "收入增长率", tone: "good", value: "+6.21%" },
            { label: "资产增长率", tone: "good", value: "+1.84%" },
          ]}
        >
          <SparklinePanel />
        </AnalysisBody>
      </ReportSection>

      <ReportSection number="07" title="现金流质量分析">
        <AnalysisBody
          conclusion="本期现金流为正，没有依赖借贷维持日常支出，现金流质量较好。"
          metrics={[
            { label: "现金流入", value: "¥28,650.00" },
            { label: "现金流出", value: "¥20,217.81" },
            { label: "净现金流", tone: "good", value: "+¥8,432.19" },
          ]}
        >
          <CashQualityVisual />
        </AnalysisBody>
      </ReportSection>

      <ReportSection number="08" title="资产负债结构分析">
        <AnalysisBody
          conclusion="个人净资产占比较高，资产负债结构整体稳健。"
          metrics={[
            { label: "总资产", value: "¥745,860.00" },
            { label: "总负债", value: "¥213,000.00" },
            { label: "净资产占比", tone: "good", value: "71.4%" },
          ]}
        >
          <StructureVisual />
        </AnalysisBody>
      </ReportSection>

      <ReportSection number="09" title="费用控制分析">
        <AnalysisBody
          conclusion="本月支出较上月下降，费用控制有所改善，但仍有继续优化空间。"
          metrics={[
            { label: "本月支出", value: "¥20,217.81" },
            { label: "支出变化率", tone: "good", value: "-3.47%" },
            { label: "支出收入比", tone: "warning", value: "70.6%" },
          ]}
        >
          <ProgressVisual
            fillColor={theme.colors.primary}
            label="支出收入比（建议控制线 65%）"
            markerLabel="65%"
            markerPercent={65}
            maxLabel="100%"
            minLabel="0%"
            valueLabel="70.6%"
            valuePercent={70.6}
          />
        </AnalysisBody>
      </ReportSection>

      <ReportSection number="10" title="风险事项">
        <RiskTable rows={report.riskRows} />
        <Conclusion text="短期需要关注信用卡还款、待收款到账和投资资产波动。" />
      </ReportSection>

      <ReportSection number="11" title="下期建议">
        <View style={styles.recommendationList}>
          {report.recommendations.map((item, index) => (
            <View key={item} style={styles.recommendationRow}>
              <View style={styles.recommendationIndex}>
                <Text maxFontSizeMultiplier={1} style={styles.recommendationIndexText}>{index + 1}</Text>
              </View>
              <Text maxFontSizeMultiplier={1} style={styles.recommendationText}>{item}</Text>
            </View>
          ))}
        </View>
      </ReportSection>

      <ReportSection number="12" title="数据依据说明" compact>
        <Text maxFontSizeMultiplier={1} style={styles.footerNote}>
          本报告基于资产负债表、现金流量表、利润表及本地交易记录生成，仅用于个人财务管理参考。
        </Text>
      </ReportSection>
    </View>
  );
}

function ReportSection({
  children,
  compact,
  number,
  onPress,
  title,
}: {
  children: ReactNode;
  compact?: boolean;
  number: string;
  onPress?: () => void;
  title: string;
}) {
  return (
    <View style={[styles.section, compact && styles.sectionCompact]}>
      <View style={styles.sectionHeader}>
        <Text maxFontSizeMultiplier={1} style={styles.sectionNumber}>{number}</Text>
        <Text maxFontSizeMultiplier={1} style={styles.sectionTitle}>{title}</Text>
        {onPress ? (
          <Pressable onPress={onPress} style={({ pressed }) => [styles.sectionLink, pressed && styles.pressFeedback]}>
            <Text maxFontSizeMultiplier={1} style={styles.sectionLinkText}>查看详情</Text>
            <AppIcon color={theme.colors.primaryDeep} name="chevronRight" size={13} strokeWidth={2.2} />
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function StatusTile({ icon, item }: { icon: AppIconName; item: AnalysisStatusBlock }) {
  return (
    <View style={styles.statusTile}>
      <View style={[styles.statusIcon, { backgroundColor: toneSoft[item.tone] }]}>
        <AppIcon color={toneColor[item.tone]} name={icon} size={15} strokeWidth={2.2} />
      </View>
      <View style={styles.statusCopy}>
        <Text adjustsFontSizeToFit maxFontSizeMultiplier={1} minimumFontScale={0.72} numberOfLines={1} style={styles.statusLabel}>{item.label}</Text>
        <Text maxFontSizeMultiplier={1} style={[styles.statusValue, { color: toneColor[item.tone] }]}>{item.value}</Text>
      </View>
    </View>
  );
}

function ReportTable({ headers, rows }: { headers: string[]; rows: AnalysisTableRow[] }) {
  return (
    <View style={styles.table}>
      <View style={[styles.tableRow, styles.tableHeaderRow]}>
        {headers.map((header, index) => (
          <Text key={header} maxFontSizeMultiplier={1} numberOfLines={1} style={[styles.tableHeaderCell, index === 0 && styles.tableCellFirst]}>
            {header}
          </Text>
        ))}
      </View>
      {rows.map((row, rowIndex) => (
        <View key={`${row.cells[0]}-${rowIndex}`} style={[styles.tableRow, rowIndex < rows.length - 1 && styles.tableDivider]}>
          {row.cells.map((cell, cellIndex) => (
            <Text
              key={`${row.cells[0]}-${cellIndex}`}
              maxFontSizeMultiplier={1}
              numberOfLines={1}
              style={[
                styles.tableCell,
                cellIndex === 0 && styles.tableCellFirst,
                cellIndex === row.cells.length - 1 && row.tone && { color: toneColor[row.tone], fontWeight: "900" },
              ]}
            >
              {cell}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

function AnalysisBody({
  children,
  conclusion,
  metrics,
}: {
  children: ReactNode;
  conclusion: string;
  metrics: AnalysisMetric[];
}) {
  return (
    <View style={styles.analysisBlock}>
      <MetricList metrics={metrics} />
      <View style={styles.visualPane}>{children}</View>
      <Conclusion text={conclusion} />
    </View>
  );
}

function MetricList({ metrics }: { metrics: AnalysisMetric[] }) {
  return (
    <View style={styles.metricList}>
      {metrics.map((metric, index) => (
        <View key={metric.label} style={[styles.metricRow, index < metrics.length - 1 && styles.metricRowDivider]}>
          <Text maxFontSizeMultiplier={1} numberOfLines={1} style={styles.metricLabel}>• {metric.label}</Text>
          <Text
            adjustsFontSizeToFit
            maxFontSizeMultiplier={1}
            minimumFontScale={0.72}
            numberOfLines={1}
            style={[styles.metricValue, metric.tone && { color: toneColor[metric.tone] }]}
          >
            {metric.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

function Conclusion({ text }: { text: string }) {
  return (
    <Text maxFontSizeMultiplier={1} style={styles.conclusion}>
      <Text style={styles.conclusionLabel}>• 结论：</Text>
      {text}
    </Text>
  );
}

function ProgressVisual({
  fillColor = theme.colors.primary,
  label,
  markerLabel,
  markerPercent,
  maxLabel,
  minLabel,
  valueLabel,
  valuePercent,
}: {
  fillColor?: string;
  label: string;
  markerLabel: string;
  markerPercent: number;
  maxLabel: string;
  minLabel: string;
  valueLabel: string;
  valuePercent: number;
}) {
  return (
    <View style={styles.progressPane}>
      <View style={styles.visualHeaderRow}>
        <Text maxFontSizeMultiplier={1} style={styles.visualTitle}>{label}</Text>
        <Text maxFontSizeMultiplier={1} style={styles.visualValue}>{valueLabel}</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { backgroundColor: fillColor, width: percent(valuePercent) }]} />
        <View style={[styles.progressMarker, { left: percent(markerPercent) }]} />
      </View>
      <View style={styles.progressScale}>
        <Text maxFontSizeMultiplier={1} style={styles.scaleText}>{minLabel}</Text>
        <Text maxFontSizeMultiplier={1} style={styles.scaleText}>{markerLabel}</Text>
        <Text maxFontSizeMultiplier={1} style={styles.scaleText}>{maxLabel}</Text>
      </View>
    </View>
  );
}

function RangeBar({
  label,
  markerLabel,
  markerPercent,
  segments,
}: {
  label: string;
  markerLabel: string;
  markerPercent: number;
  segments: Array<{ color: string; label: string; size: number }>;
}) {
  return (
    <View style={styles.progressPane}>
      <Text maxFontSizeMultiplier={1} style={styles.visualTitle}>{label}</Text>
      <View style={styles.rangeTrack}>
        {segments.map((segment) => (
          <View key={segment.label} style={[styles.rangeSegment, { backgroundColor: segment.color, flex: segment.size }]}>
            <Text maxFontSizeMultiplier={1} style={styles.rangeSegmentText}>{segment.label}</Text>
          </View>
        ))}
        <View style={[styles.rangeMarker, { left: percent(markerPercent) }]}>
          <View style={styles.rangeMarkerDot} />
          <Text maxFontSizeMultiplier={1} style={styles.rangeMarkerLabel}>{markerLabel}</Text>
        </View>
      </View>
    </View>
  );
}

function SparklinePanel() {
  const rows = [
    { color: theme.colors.blueText, points: "6,35 24,24 42,28 60,24 78,38 96,36 114,32 132,33 150,24 168,20", value: "+2.63% ↗" },
    { color: theme.colors.primary, points: "6,58 24,45 42,54 60,52 78,40 96,46 114,52 132,55 150,50 168,39", value: "+6.21% ↗" },
    { color: theme.colors.success, points: "6,77 24,67 42,71 60,76 78,64 96,70 114,77 132,75 150,68 168,62", value: "+1.84% ↗" },
  ];

  return (
    <View style={styles.sparkPanel}>
      <View style={styles.sparkHeader}>
        <Text maxFontSizeMultiplier={1} style={styles.visualTitle}>趋势（近6期）</Text>
        <Text maxFontSizeMultiplier={1} style={styles.visualTitle}>本期变化</Text>
      </View>
      <View style={styles.sparkContent}>
        <Svg height={86} viewBox="0 0 174 86" width="70%">
          <Line stroke={theme.colors.divider} strokeWidth="1" x1="0" x2="174" y1="28" y2="28" />
          <Line stroke={theme.colors.divider} strokeWidth="1" x1="0" x2="174" y1="56" y2="56" />
          {rows.map((row) => (
            <Polyline key={row.color} fill="none" points={row.points} stroke={row.color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" />
          ))}
        </Svg>
        <View style={styles.sparkValues}>
          {rows.map((row) => (
            <Text key={row.color} maxFontSizeMultiplier={1} style={styles.sparkValue}>{row.value}</Text>
          ))}
        </View>
      </View>
    </View>
  );
}

function CashQualityVisual() {
  return (
    <View style={styles.cashVisual}>
      <Text maxFontSizeMultiplier={1} style={styles.visualTitle}>流入 vs 流出</Text>
      <HorizontalBar label="流入" max={28650} value={28650} valueText="¥28,650.00" />
      <HorizontalBar color={theme.colors.primary} label="流出" max={28650} value={20217.81} valueText="¥20,217.81" />
      <View style={styles.coverageBox}>
        <Text maxFontSizeMultiplier={1} style={styles.coverageLabel}>流入覆盖支出</Text>
        <Text maxFontSizeMultiplier={1} style={styles.coverageValue}>141.7%</Text>
      </View>
    </View>
  );
}

function HorizontalBar({
  color = theme.colors.blueText,
  label,
  max,
  value,
  valueText,
}: {
  color?: string;
  label: string;
  max: number;
  value: number;
  valueText: string;
}) {
  return (
    <View style={styles.horizontalBarRow}>
      <Text maxFontSizeMultiplier={1} style={styles.horizontalBarLabel}>{label}</Text>
      <View style={styles.horizontalBarTrack}>
        <View style={[styles.horizontalBarFill, { backgroundColor: color, width: percent((value / max) * 100) }]} />
      </View>
      <Text maxFontSizeMultiplier={1} numberOfLines={1} style={styles.horizontalBarValue}>{valueText}</Text>
    </View>
  );
}

function StructureVisual() {
  return (
    <View style={styles.structureVisual}>
      <Text maxFontSizeMultiplier={1} style={styles.visualTitle}>资产结构占比</Text>
      <StructureRow color={theme.colors.success} label="净资产" percentValue={71.4} />
      <StructureRow color={theme.colors.primary} label="负债" percentValue={28.6} />
      <View style={styles.structureLegend}>
        <Text maxFontSizeMultiplier={1} style={styles.structureLegendText}>● 净资产 71.4%</Text>
        <Text maxFontSizeMultiplier={1} style={[styles.structureLegendText, styles.structureLegendOrange]}>● 负债 28.6%</Text>
      </View>
    </View>
  );
}

function StructureRow({ color, label, percentValue }: { color: string; label: string; percentValue: number }) {
  return (
    <View style={styles.structureRow}>
      <Text maxFontSizeMultiplier={1} style={styles.structureLabel}>{label}</Text>
      <View style={styles.structureTrack}>
        <View style={[styles.structureFill, { backgroundColor: color, width: percent(percentValue) }]} />
      </View>
      <Text maxFontSizeMultiplier={1} style={[styles.structurePercent, { color }]}>{percentValue.toFixed(1)}%</Text>
    </View>
  );
}

function RiskTable({ rows }: { rows: AnalysisRiskRow[] }) {
  return (
    <View style={styles.riskTable}>
      {rows.map((row, index) => (
        <View key={row.item} style={[styles.riskRecord, index < rows.length - 1 && styles.tableDivider]}>
          <View style={styles.riskRecordTop}>
            <RiskCell label="事项" value={row.item} />
            <RiskCell label="金额/变动" value={row.amount} />
            <RiskCell label="风险等级" tone={row.tone} value={`● ${row.level}`} />
          </View>
          <View style={styles.riskHintRow}>
            <Text maxFontSizeMultiplier={1} style={styles.riskFieldLabel}>提示</Text>
            <Text maxFontSizeMultiplier={1} style={styles.riskHintText}>{row.hint}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function RiskCell({ label, tone, value }: { label: string; tone?: AnalysisTone; value: string }) {
  return (
    <View style={styles.riskField}>
      <Text maxFontSizeMultiplier={1} style={styles.riskFieldLabel}>{label}</Text>
      <Text maxFontSizeMultiplier={1} numberOfLines={1} style={[styles.riskFieldValue, tone && { color: toneColor[tone] }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  analysisBlock: {
    gap: 10,
  },
  backButton: {
    alignItems: "center",
    height: 36,
    justifyContent: "center",
    width: 30,
  },
  cashVisual: {
    gap: 8,
  },
  conclusion: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 19,
  },
  conclusionLabel: {
    color: theme.colors.primaryDeep,
    fontWeight: "900",
  },
  coverageBox: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: theme.colors.blueSoft,
    borderColor: theme.colors.blueBorder,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 2,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  coverageLabel: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    fontWeight: "700",
  },
  coverageValue: {
    color: theme.colors.blueText,
    fontSize: 18,
    fontWeight: "900",
  },
  footerNote: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 20,
  },
  horizontalBarFill: {
    borderRadius: 4,
    height: 14,
  },
  horizontalBarLabel: {
    color: theme.colors.textPrimary,
    fontSize: 11,
    fontWeight: "800",
    width: 30,
  },
  horizontalBarRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  horizontalBarTrack: {
    backgroundColor: "rgba(255,255,255,0.075)",
    borderRadius: 4,
    flex: 1,
    height: 14,
    overflow: "hidden",
  },
  horizontalBarValue: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    fontWeight: "800",
    textAlign: "right",
    width: 74,
  },
  metaDot: {
    backgroundColor: theme.colors.borderStrong,
    borderRadius: 2,
    height: 3,
    width: 3,
  },
  metaStrip: {
    alignItems: "center",
    borderBottomColor: theme.colors.divider,
    borderBottomWidth: 1,
    borderTopColor: theme.colors.divider,
    borderTopWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    paddingVertical: 8,
  },
  metaText: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
  },
  metricLabel: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
  },
  metricList: {
    backgroundColor: "rgba(255,255,255,0.035)",
    borderColor: theme.colors.divider,
    borderRadius: 7,
    borderWidth: 1,
    overflow: "hidden",
  },
  metricRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
    minHeight: 34,
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  metricRowDivider: {
    borderBottomColor: theme.colors.divider,
    borderBottomWidth: 1,
  },
  metricValue: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: "900",
    textAlign: "right",
  },
  pageSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 3,
    textAlign: "center",
  },
  pageTitle: {
    color: theme.colors.textPrimary,
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: -0.2,
    textAlign: "center",
  },
  periodArrow: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: "900",
  },
  periodPill: {
    alignItems: "center",
    flexDirection: "row",
    gap: 3,
    justifyContent: "flex-end",
    width: 72,
  },
  periodText: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: "900",
  },
  pressFeedback: {
    opacity: 0.6,
  },
  progressFill: {
    borderRadius: 5,
    height: 11,
  },
  progressMarker: {
    backgroundColor: theme.colors.textPrimary,
    bottom: -4,
    position: "absolute",
    top: -4,
    width: 1,
  },
  progressPane: {
    backgroundColor: "rgba(255,255,255,0.035)",
    borderColor: theme.colors.divider,
    borderRadius: 7,
    borderWidth: 1,
    gap: 9,
    paddingHorizontal: 9,
    paddingVertical: 10,
  },
  progressScale: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressTrack: {
    backgroundColor: "rgba(255,255,255,0.075)",
    borderRadius: 5,
    height: 11,
    overflow: "visible",
  },
  rangeMarker: {
    alignItems: "center",
    bottom: -21,
    position: "absolute",
  },
  rangeMarkerDot: {
    backgroundColor: theme.colors.textPrimary,
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  rangeMarkerLabel: {
    color: theme.colors.textPrimary,
    fontSize: 11,
    fontWeight: "900",
    marginTop: 1,
    transform: [{ translateX: -16 }],
  },
  rangeSegment: {
    alignItems: "center",
    justifyContent: "center",
  },
  rangeSegmentText: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    fontWeight: "800",
    lineHeight: 14,
    textAlign: "center",
  },
  rangeTrack: {
    borderColor: theme.colors.divider,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    height: 64,
    marginBottom: 20,
    overflow: "visible",
  },
  recommendationIndex: {
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    borderRadius: 9,
    height: 18,
    justifyContent: "center",
    marginTop: 1,
    width: 18,
  },
  recommendationIndexText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },
  recommendationList: {
    gap: 7,
  },
  recommendationRow: {
    flexDirection: "row",
    gap: 8,
  },
  recommendationText: {
    color: theme.colors.textSecondary,
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 19,
  },
  reportRoot: {
    gap: 8,
  },
  riskField: {
    flex: 1,
    gap: 3,
    minWidth: 0,
    paddingHorizontal: 6,
  },
  riskFieldLabel: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    fontWeight: "900",
  },
  riskFieldValue: {
    color: theme.colors.textPrimary,
    fontSize: 11,
    fontWeight: "800",
  },
  riskHintRow: {
    backgroundColor: "rgba(255,255,255,0.035)",
    borderColor: theme.colors.divider,
    borderRadius: 6,
    borderWidth: 1,
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  riskHintText: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 17,
  },
  riskRecord: {
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 9,
  },
  riskRecordTop: {
    flexDirection: "row",
    gap: 4,
  },
  riskTable: {
    borderColor: theme.colors.divider,
    borderRadius: 7,
    borderWidth: 1,
    overflow: "hidden",
  },
  scaleText: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: "700",
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 11,
  },
  sectionCompact: {
    paddingBottom: 10,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  sectionLink: {
    alignItems: "center",
    flexDirection: "row",
    gap: 2,
    marginLeft: "auto",
    minHeight: 28,
  },
  sectionLinkText: {
    color: theme.colors.primaryDeep,
    fontSize: 11,
    fontWeight: "900",
  },
  sectionNumber: {
    color: theme.colors.primaryDeep,
    fontSize: 17,
    fontWeight: "900",
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "900",
  },
  sparkContent: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  sparkHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sparkPanel: {
    backgroundColor: "rgba(255,255,255,0.035)",
    borderColor: theme.colors.divider,
    borderRadius: 7,
    borderWidth: 1,
    gap: 2,
    paddingHorizontal: 9,
    paddingVertical: 8,
  },
  sparkValue: {
    color: theme.colors.success,
    fontSize: 12,
    fontWeight: "900",
  },
  sparkValues: {
    gap: 10,
  },
  statusCopy: {
    alignItems: "center",
    gap: 1,
    minWidth: 0,
  },
  statusIcon: {
    alignItems: "center",
    borderRadius: 12,
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  statusLabel: {
    color: theme.colors.textSecondary,
    fontSize: 9,
    fontWeight: "800",
    textAlign: "center",
  },
  statusRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  statusTile: {
    alignItems: "center",
    borderColor: theme.colors.border,
    borderRadius: 7,
    borderWidth: 1,
    flex: 1,
    gap: 5,
    minHeight: 66,
    minWidth: 0,
    paddingHorizontal: 4,
    paddingVertical: 7,
  },
  statusValue: {
    fontSize: 11,
    fontWeight: "900",
    textAlign: "center",
  },
  structureFill: {
    borderRadius: 4,
    height: 14,
  },
  structureLabel: {
    color: theme.colors.textPrimary,
    fontSize: 11,
    fontWeight: "800",
    width: 42,
  },
  structureLegend: {
    alignSelf: "flex-end",
    backgroundColor: theme.colors.surfaceSoft,
    borderColor: theme.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    marginTop: 3,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  structureLegendOrange: {
    color: theme.colors.primaryDeep,
  },
  structureLegendText: {
    color: theme.colors.success,
    fontSize: 10,
    fontWeight: "800",
  },
  structurePercent: {
    fontSize: 11,
    fontWeight: "900",
    textAlign: "right",
    width: 42,
  },
  structureRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  structureTrack: {
    backgroundColor: "rgba(255,255,255,0.075)",
    borderRadius: 4,
    flex: 1,
    height: 14,
    overflow: "hidden",
  },
  structureVisual: {
    backgroundColor: "rgba(255,255,255,0.035)",
    borderColor: theme.colors.divider,
    borderRadius: 7,
    borderWidth: 1,
    gap: 9,
    paddingHorizontal: 9,
    paddingVertical: 10,
  },
  summaryParagraph: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 19,
  },
  summaryStrip: {
    backgroundColor: theme.colors.surfaceSoft,
    borderColor: theme.colors.border,
    borderRadius: 7,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  table: {
    borderColor: theme.colors.divider,
    borderRadius: 7,
    borderWidth: 1,
    overflow: "hidden",
  },
  tableCell: {
    color: theme.colors.textPrimary,
    flex: 0.92,
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 5,
    paddingVertical: 8,
    textAlign: "center",
  },
  tableCellFirst: {
    flex: 1.05,
    textAlign: "left",
  },
  tableDivider: {
    borderBottomColor: theme.colors.divider,
    borderBottomWidth: 1,
  },
  tableHeaderCell: {
    color: theme.colors.textSecondary,
    flex: 0.92,
    fontSize: 11,
    fontWeight: "900",
    paddingHorizontal: 5,
    paddingVertical: 8,
    textAlign: "center",
  },
  tableHeaderRow: {
    backgroundColor: "rgba(255,255,255,0.045)",
  },
  tableRow: {
    flexDirection: "row",
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  visualHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  visualPane: {
    gap: 8,
    minWidth: 0,
    width: "100%",
  },
  visualTitle: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: "900",
  },
  visualValue: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: "900",
  },
});
