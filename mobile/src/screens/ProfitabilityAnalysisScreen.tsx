import { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Svg, { Circle, G, Line, Polyline, Rect, Text as SvgText } from "react-native-svg";
import DrilldownIncomeSankeySection from "../components/DrilldownIncomeSankeySection";
import AppIcon from "../components/AppIcon";
import { buildIncomeStructureFlowRoot } from "../domain/reports/incomeStructureFlow";
import type { ReportPeriod, Transaction } from "../domain/models";
import {
  buildProfitabilityAnalysisReport,
  type CompositionItem,
  type NetIncomeTrendPoint,
  type ProfitabilityMetricRow,
  type ProfitabilityTone,
} from "../domain/reports/profitabilityAnalysis";
import { theme } from "../styles/theme";

interface ProfitabilityAnalysisScreenProps {
  onBack: () => void;
  period: ReportPeriod;
  transactions: Transaction[];
}

type SheetState =
  | { type: "composition"; group: "收入构成" | "支出构成"; item: CompositionItem }
  | { type: "metric"; item: ProfitabilityMetricRow }
  | { type: "period" }
  | null;

type TrendRange = "six" | "twelve";

const periodOptions = ["2026年4月", "2026年3月", "2026年2月", "最近6期", "最近12期"];

const toneColor: Record<ProfitabilityTone, string> = {
  danger: theme.colors.danger,
  good: theme.colors.success,
  neutral: theme.colors.textSecondary,
  primary: theme.colors.blueText,
  warning: theme.colors.warning,
};


export default function ProfitabilityAnalysisScreen({ onBack, period, transactions }: ProfitabilityAnalysisScreenProps) {
  const report = useMemo(
    () => buildProfitabilityAnalysisReport({ period, transactions }),
    [period, transactions],
  );
  const incomeStructureRoot = useMemo(
    () => buildIncomeStructureFlowRoot(report.incomeStructureRoot),
    [report],
  );
  const { width } = useWindowDimensions();
  const [selectedPeriod, setSelectedPeriod] = useState(report.periodLabel);
  const [sheet, setSheet] = useState<SheetState>(null);
  const [trendRange, setTrendRange] = useState<TrendRange>("six");
  const [isTrendTableExpanded, setTrendTableExpanded] = useState(true);
  const [selectedTrendPeriod, setSelectedTrendPeriod] = useState<string | null>(null);

  const trendPoints = trendRange === "six" ? report.trendPoints : report.trendPoints12;
  const selectedTrendIndex = trendPoints.findIndex((point) => point.period === selectedTrendPeriod);
  const selectedTrend = selectedTrendIndex >= 0 ? trendPoints[selectedTrendIndex] : null;
  const chartWidth = Math.max(320, Math.min(width - 44, 660));

  const handleSelectTrendRange = (nextRange: TrendRange) => {
    setTrendRange(nextRange);
    setSelectedTrendPeriod(null);
  };

  const handleSelectTrendPoint = (period: string) => {
    setSelectedTrendPeriod((current) => (current === period ? null : period));
  };

  return (
    <Pressable onPress={() => setSelectedTrendPeriod(null)} style={styles.root}>
      <View style={styles.topBar}>
        <Pressable
          onPress={(event) => {
            event.stopPropagation();
            onBack();
          }}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressFeedback]}
        >
          <AppIcon color={theme.colors.textPrimary} name="back" size={23} strokeWidth={2.4} />
        </Pressable>
        <View style={styles.titleCenter}>
          <Text maxFontSizeMultiplier={1} style={styles.pageTitle}>
            盈利能力分析
          </Text>
          <Text maxFontSizeMultiplier={1} style={styles.pagePeriodLine}>
            {selectedPeriod} ｜ {report.unitLabel}
          </Text>
        </View>
        <Pressable
          onPress={(event) => {
            event.stopPropagation();
            setSheet({ type: "period" });
          }}
          style={({ pressed }) => [styles.periodButton, pressed && styles.pressFeedback]}
        >
          <Text maxFontSizeMultiplier={1} style={styles.periodText}>
            {selectedPeriod}
          </Text>
          <Text maxFontSizeMultiplier={1} style={styles.periodArrow}>
            ▼
          </Text>
        </Pressable>
      </View>

      <View style={styles.subtitleRow}>
        <Text maxFontSizeMultiplier={1} style={styles.subtitle}>
          {report.subtitle}
        </Text>
        <View style={styles.statusBadge}>
          <AppIcon color={theme.colors.success} name="chart" size={16} strokeWidth={2.2} />
          <Text maxFontSizeMultiplier={1} style={styles.statusText}>
            {report.statusLabel}
          </Text>
        </View>
      </View>

      <ReportSection number="01" title="结论摘要">
        <Text maxFontSizeMultiplier={1} style={styles.summaryText}>
          {report.conclusionSummary}
        </Text>
      </ReportSection>

      <ReportSection number="02" title="核心指标总览">
        <MetricTable rows={report.metricRows} onPressRow={(item) => setSheet({ type: "metric", item })} />
      </ReportSection>

      <ReportSection number="04" title="净收益趋势">
        <View style={styles.trendHeaderRow}>
          <View style={styles.trendHeaderCopy}>
            <View style={styles.sectionSubheadRow}>
              <Text maxFontSizeMultiplier={1} style={styles.sectionSubhead}>
                {trendRange === "six" ? "近6期净收益与净收益率变化" : "近12期净收益与净收益率变化"}
              </Text>
              <Text maxFontSizeMultiplier={1} style={styles.infoDot}>
                i
              </Text>
            </View>
            <View style={styles.legendRow}>
              <LegendDot color={theme.colors.blueText} label="净收益（元）" />
              <LegendDot color={theme.colors.primary} label="净收益率（%）" line />
            </View>
          </View>
          <View style={styles.segmented}>
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                handleSelectTrendRange("six");
              }}
              style={[styles.segment, trendRange === "six" && styles.segmentActive]}
            >
              <Text
                maxFontSizeMultiplier={1}
                style={[styles.segmentText, trendRange === "six" && styles.segmentTextActive]}
              >
                最近6期
              </Text>
            </Pressable>
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                handleSelectTrendRange("twelve");
              }}
              style={[styles.segment, trendRange === "twelve" && styles.segmentActive]}
            >
              <Text
                maxFontSizeMultiplier={1}
                style={[styles.segmentText, trendRange === "twelve" && styles.segmentTextActive]}
              >
                最近12期
              </Text>
            </Pressable>
          </View>
        </View>

        <TrendChart
          chartWidth={chartWidth}
          onSelectPoint={handleSelectTrendPoint}
          points={trendPoints}
          selectedIndex={selectedTrendIndex}
          selectedPoint={selectedTrend}
        />

        <View style={styles.trendAnalysisBlock}>
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              setTrendTableExpanded((value) => !value);
            }}
            style={({ pressed }) => [styles.trendAnalysisHeader, pressed && styles.pressFeedback]}
          >
            <View style={styles.trendAnalysisTitleRow}>
              <AppIcon color={theme.colors.primaryDeep} name="report" size={16} strokeWidth={2.2} />
              <Text maxFontSizeMultiplier={1} style={styles.trendAnalysisTitle}>
                展开分析
              </Text>
            </View>
            <View style={styles.trendAnalysisRight}>
              <Text maxFontSizeMultiplier={1} style={styles.trendAnalysisToggle}>
                {isTrendTableExpanded ? "收起" : "展开"}
              </Text>
              <AppIcon
                color={theme.colors.textSecondary}
                name="chevronRight"
                size={15}
                strokeWidth={2.1}
              />
            </View>
          </Pressable>
          {isTrendTableExpanded ? (
            <TrendAnalysisTable
              onSelectPoint={handleSelectTrendPoint}
              points={trendPoints}
              selectedPeriod={selectedTrend?.period ?? null}
            />
          ) : null}
        </View>

        <Text maxFontSizeMultiplier={1} style={styles.formulaNote}>
          *净收益率 = 净收益 ÷ 本期收入 × 100%
        </Text>
      </ReportSection>

      <ReportSection number="05" title="收入结构">
        <DrilldownIncomeSankeySection root={incomeStructureRoot} />
      </ReportSection>

      <ReportSection number="06" title="分析说明">
        <Text maxFontSizeMultiplier={1} style={styles.bodyText}>
          {report.analysisText}
        </Text>
      </ReportSection>

      <ReportSection number="07" title="改进建议">
        <View style={styles.suggestionGrid}>
          {report.suggestions.map((item, index) => (
            <View key={item.title} style={styles.suggestionCard}>
              <View style={styles.suggestionIcon}>
                <Text maxFontSizeMultiplier={1} style={styles.suggestionIndex}>
                  {index + 1}
                </Text>
              </View>
              <View style={styles.suggestionCopy}>
                <Text maxFontSizeMultiplier={1} style={styles.suggestionTitle}>
                  {item.title}
                </Text>
                <Text maxFontSizeMultiplier={1} style={styles.suggestionBody}>
                  {item.body}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ReportSection>

      <Text maxFontSizeMultiplier={1} style={styles.footerNote}>
        {report.footerNote}
      </Text>

      <InfoSheet
        onClose={() => setSheet(null)}
        onSelectPeriod={(value) => {
          setSelectedPeriod(value);
          setSheet(null);
        }}
        sheet={sheet}
      />
    </Pressable>
  );
}

function ReportSection({
  children,
  number,
  title,
}: {
  children: React.ReactNode;
  number: string;
  title: string;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleRow}>
        <Text maxFontSizeMultiplier={1} style={styles.sectionNumber}>
          {number}
        </Text>
        <Text maxFontSizeMultiplier={1} style={styles.sectionTitle}>
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

function MetricTable({
  onPressRow,
  rows,
}: {
  onPressRow: (item: ProfitabilityMetricRow) => void;
  rows: ProfitabilityMetricRow[];
}) {
  return (
    <View style={styles.metricTable}>
      <View style={[styles.metricTableRow, styles.metricTableHeader]}>
        {["指标", "本期值", "上期值", "变化", "判断"].map((header, index) => (
          <Text
            key={header}
            maxFontSizeMultiplier={1}
            numberOfLines={1}
            style={[styles.metricHeaderCell, index === 0 && styles.metricFirstCell]}
          >
            {header}
          </Text>
        ))}
      </View>
      {rows.map((row, index) => (
        <Pressable
          key={row.indicator}
          onPress={(event) => {
            event.stopPropagation();
            onPressRow(row);
          }}
          style={({ pressed }) => [
            styles.metricTableRow,
            index < rows.length - 1 && styles.tableDivider,
            pressed && styles.pressFeedback,
          ]}
        >
          <Text maxFontSizeMultiplier={1} numberOfLines={1} style={[styles.metricCell, styles.metricFirstCell]}>
            {row.indicator}
          </Text>
          <Text
            adjustsFontSizeToFit
            maxFontSizeMultiplier={1}
            minimumFontScale={0.72}
            numberOfLines={1}
            style={styles.metricCell}
          >
            {row.current}
          </Text>
          <Text
            adjustsFontSizeToFit
            maxFontSizeMultiplier={1}
            minimumFontScale={0.72}
            numberOfLines={1}
            style={styles.metricCell}
          >
            {row.previous}
          </Text>
          <Text
            adjustsFontSizeToFit
            maxFontSizeMultiplier={1}
            minimumFontScale={0.68}
            numberOfLines={1}
            style={[styles.metricCell, { color: toneColor[row.changeTone] }]}
          >
            {row.change}
          </Text>
          <Text
            maxFontSizeMultiplier={1}
            numberOfLines={1}
            style={[styles.metricCell, styles.metricJudgement, { color: toneColor[row.judgementTone] }]}
          >
            {row.judgement}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function TrendChart({
  chartWidth,
  onSelectPoint,
  points,
  selectedIndex,
  selectedPoint,
}: {
  chartWidth: number;
  onSelectPoint: (period: string) => void;
  points: NetIncomeTrendPoint[];
  selectedIndex: number;
  selectedPoint: NetIncomeTrendPoint | null;
}) {
  const height = points.length > 6 ? 286 : 270;
  const left = 44;
  const right = 42;
  const top = 34;
  const bottom = 48;
  const plotWidth = chartWidth - left - right;
  const plotHeight = height - top - bottom;
  const maxNetIncome = 12000;
  const maxRate = 30;
  const step = plotWidth / points.length;
  const barWidth = Math.max(9, Math.min(32, step * 0.42));
  const selectedX = selectedIndex >= 0 ? left + step * selectedIndex + step / 2 : left + plotWidth;
  const tooltipLeft = Math.max(8, Math.min(chartWidth - 164, selectedX - 78));

  const linePoints = points
    .map((point, index) => {
      const x = left + step * index + step / 2;
      const y = top + plotHeight - (point.netIncomeRate / maxRate) * plotHeight;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <View style={styles.trendChartShell}>
      {selectedPoint ? (
        <View pointerEvents="none" style={[styles.trendFloatingTooltip, { left: tooltipLeft }]}>
          <Text maxFontSizeMultiplier={1} style={styles.trendFloatingTitle}>
            {selectedPoint.period}
          </Text>
          <Text maxFontSizeMultiplier={1} style={styles.trendFloatingLine}>
            • 净收益：{selectedPoint.netIncomeLabel}
          </Text>
          <Text maxFontSizeMultiplier={1} style={styles.trendFloatingLine}>
            • 净收益率：{selectedPoint.netIncomeRate.toFixed(1)}%
          </Text>
        </View>
      ) : null}

      <Svg height={height} viewBox={`0 0 ${chartWidth} ${height}`} width={chartWidth}>
        {[0, 4000, 8000, 12000].map((tick) => {
          const y = top + plotHeight - (tick / maxNetIncome) * plotHeight;
          return (
            <G key={`tick-${tick}`}>
              <Line
                stroke="rgba(255,255,255,0.12)"
                strokeDasharray={tick === 0 ? undefined : "3 4"}
                strokeWidth={1}
                x1={left}
                x2={chartWidth - right}
                y1={y}
                y2={y}
              />
              <SvgText
                fill={theme.colors.textMuted}
                fontSize="10"
                fontWeight="700"
                textAnchor="end"
                x={left - 7}
                y={y + 3}
              >
                {tick === 0 ? "0" : tick.toLocaleString("zh-CN")}
              </SvgText>
            </G>
          );
        })}

        <SvgText
          fill={theme.colors.textMuted}
          fontSize="10"
          fontWeight="800"
          textAnchor="middle"
          x={left - 22}
          y={top - 8}
        >
          元
        </SvgText>

        {[0, 10, 20, 30].map((tick) => {
          const y = top + plotHeight - (tick / maxRate) * plotHeight;
          return (
            <SvgText
              key={`rate-${tick}`}
              fill={theme.colors.textMuted}
              fontSize="10"
              fontWeight="700"
              textAnchor="start"
              x={chartWidth - right + 8}
              y={y + 3}
            >
              {tick}%
            </SvgText>
          );
        })}

        <Line
          stroke="rgba(255,255,255,0.16)"
          strokeWidth={1.2}
          x1={left}
          x2={chartWidth - right}
          y1={top + plotHeight}
          y2={top + plotHeight}
        />

        {points.map((point, index) => {
          const x = left + step * index + step / 2;
          const barHeight = (point.netIncome / maxNetIncome) * plotHeight;
          const y = top + plotHeight - barHeight;
          const isSelected = index === selectedIndex;
          return (
            <G
              key={point.period}
              onPress={(event) => {
                event.stopPropagation?.();
                onSelectPoint(point.period);
              }}
            >
              {isSelected ? (
                <Line
                  stroke="rgba(59,139,255,0.26)"
                  strokeDasharray="4 4"
                  strokeWidth={1.2}
                  x1={x}
                  x2={x}
                  y1={top}
                  y2={top + plotHeight + 24}
                />
              ) : null}
              <Rect
                fill={isSelected ? theme.colors.primaryDeep : "rgba(59,139,255,0.48)"}
                height={barHeight}
                rx={4}
                width={barWidth}
                x={x - barWidth / 2}
                y={y}
              />
              <SvgText
                fill={isSelected ? "#1664E8" : "#2F7BEA"}
                fontSize={points.length > 6 ? "8" : "10"}
                fontWeight="800"
                textAnchor="middle"
                x={x}
                y={y - 7}
              >
                {formatCompactCurrency(point.netIncome)}
              </SvgText>
            </G>
          );
        })}

        <Polyline
          fill="none"
          points={linePoints}
          stroke={theme.colors.primary}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.2}
        />

        {points.map((point, index) => {
          const x = left + step * index + step / 2;
          const y = top + plotHeight - (point.netIncomeRate / maxRate) * plotHeight;
          const isSelected = index === selectedIndex;
          return (
            <G
              key={`point-${point.period}`}
              onPress={(event) => {
                event.stopPropagation?.();
                onSelectPoint(point.period);
              }}
            >
              <SvgText
                fill={theme.colors.primaryDeep}
                fontSize={points.length > 6 ? "8" : "10"}
                fontWeight="800"
                textAnchor="middle"
                x={x}
                y={y - 12}
              >
                {point.netIncomeRate.toFixed(1)}%
              </SvgText>
              <Circle
                cx={x}
                cy={y}
                fill="#FFFFFF"
                r={isSelected ? 5.4 : 4.2}
                stroke={theme.colors.primary}
                strokeWidth={2}
              />
            </G>
          );
        })}

        {points.map((point, index) => {
          const x = left + step * index + step / 2;
          return (
            <SvgText
              key={`label-${point.period}`}
              fill={index === selectedIndex ? theme.colors.primaryDeep : theme.colors.textSecondary}
              fontSize={points.length > 6 ? "8" : "10"}
              fontWeight={index === selectedIndex ? "900" : "700"}
              textAnchor="middle"
              x={x}
              y={height - 10}
              onPress={(event) => {
                event.stopPropagation?.();
                onSelectPoint(point.period);
              }}
            >
              {formatTrendPeriod(point.period)}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}

function TrendAnalysisTable({
  onSelectPoint,
  points,
  selectedPeriod,
}: {
  onSelectPoint: (period: string) => void;
  points: NetIncomeTrendPoint[];
  selectedPeriod: string | null;
}) {
  return (
    <View style={styles.trendTable}>
      <View style={[styles.trendTableRow, styles.trendTableHeader]}>
        {["期间", "净收益（元）", "净收益率（%）", "环比变化"].map((header) => (
          <Text key={header} maxFontSizeMultiplier={1} numberOfLines={1} style={styles.trendTableHeadText}>
            {header}
          </Text>
        ))}
      </View>
      {[...points].reverse().map((point, index, allRows) => {
        const isSelected = point.period === selectedPeriod;
        const changeColor =
          point.changeRate == null
            ? theme.colors.textMuted
            : point.changeRate >= 0
              ? theme.colors.primaryDeep
              : theme.colors.success;
        const changeText =
          point.changeRate == null
            ? "--"
            : `${point.changeRate >= 0 ? "+" : ""}${point.changeRate.toFixed(2)}% ${point.changeRate >= 0 ? "↑" : "↓"}`;

        return (
          <Pressable
            key={point.period}
            onPress={(event) => {
              event.stopPropagation();
              onSelectPoint(point.period);
            }}
            style={({ pressed }) => [
              styles.trendTableRow,
              index < allRows.length - 1 && styles.tableDivider,
              isSelected && styles.trendTableRowActive,
              pressed && styles.pressFeedback,
            ]}
          >
            <Text maxFontSizeMultiplier={1} style={[styles.trendTableCell, isSelected && styles.trendTableCellActive]}>
              {formatTrendPeriod(point.period)}
            </Text>
            <Text maxFontSizeMultiplier={1} style={[styles.trendTableCell, isSelected && styles.trendTableCellActive]}>
              {point.netIncomeLabel}
            </Text>
            <Text maxFontSizeMultiplier={1} style={[styles.trendTableCell, isSelected && styles.trendTableCellActive]}>
              {point.netIncomeRate.toFixed(1)}%
            </Text>
            <Text maxFontSizeMultiplier={1} style={[styles.trendTableCell, { color: changeColor }]}>
              {changeText}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function LegendDot({ color, label, line }: { color: string; label: string; line?: boolean }) {
  return (
    <View style={styles.legendItem}>
      {line ? (
        <View style={styles.legendLineWrap}>
          <View style={[styles.legendLine, { backgroundColor: color }]} />
          <View style={[styles.legendLineDot, { borderColor: color }]} />
        </View>
      ) : (
        <View style={[styles.legendSquareLarge, { backgroundColor: color }]} />
      )}
      <Text maxFontSizeMultiplier={1} style={styles.legendText}>
        {label}
      </Text>
    </View>
  );
}

function InfoSheet({
  onClose,
  onSelectPeriod,
  sheet,
}: {
  onClose: () => void;
  onSelectPeriod: (value: string) => void;
  sheet: SheetState;
}) {
  if (!sheet) return null;

  let title = "";
  let content: React.ReactNode = null;

  if (sheet.type === "period") {
    title = "选择期间";
    content = (
      <View style={styles.sheetOptionList}>
        {periodOptions.map((period) => (
          <Pressable key={period} onPress={() => onSelectPeriod(period)} style={styles.sheetOption}>
            <Text maxFontSizeMultiplier={1} style={styles.sheetOptionText}>
              {period}
            </Text>
            <AppIcon color={theme.colors.textMuted} name="chevronRight" size={15} strokeWidth={2.1} />
          </Pressable>
        ))}
      </View>
    );
  }

  if (sheet.type === "metric") {
    title = sheet.item.indicator;
    content = (
      <View style={styles.sheetInfoList}>
        <SheetInfoRow label="本期值" value={sheet.item.current} />
        <SheetInfoRow label="上期值" value={sheet.item.previous} />
        <SheetInfoRow label="变化" value={sheet.item.change} valueColor={toneColor[sheet.item.changeTone]} />
        <SheetInfoRow
          label="判断"
          value={sheet.item.judgement}
          valueColor={toneColor[sheet.item.judgementTone]}
        />
        <SheetInfoRow label="公式" value={sheet.item.formula} />
        <SheetInfoRow label="含义" value={sheet.item.interpretation} />
        <SheetInfoRow label="数据来源" value={sheet.item.dataSource} />
      </View>
    );
  }

  if (sheet.type === "composition") {
    title = sheet.item.label;
    content = (
      <View style={styles.sheetInfoList}>
        <SheetInfoRow label="类别" value={sheet.group} />
        <SheetInfoRow label="金额" value={sheet.item.amount} />
        <SheetInfoRow label="占比" value={sheet.item.percentLabel} valueColor={sheet.item.color} />
        <SheetInfoRow label="说明" value={sheet.item.explanation} />
      </View>
    );
  }

  return (
    <Modal animationType="fade" transparent visible onRequestClose={onClose}>
      <Pressable onPress={onClose} style={styles.sheetBackdrop}>
        <Pressable onPress={(event) => event.stopPropagation()} style={styles.sheetPanel}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text maxFontSizeMultiplier={1} style={styles.sheetTitle}>
              {title}
            </Text>
            <Pressable onPress={onClose} style={styles.sheetClose}>
              <AppIcon color={theme.colors.textMuted} name="close" size={18} strokeWidth={2.2} />
            </Pressable>
          </View>
          {content}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function SheetInfoRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.sheetInfoRow}>
      <Text maxFontSizeMultiplier={1} style={styles.sheetInfoLabel}>
        {label}
      </Text>
      <Text maxFontSizeMultiplier={1} style={[styles.sheetInfoValue, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
    </View>
  );
}

function formatTrendPeriod(period: string) {
  const [year, month] = period.split("-");
  return `${year}-${month}`;
}

function formatCompactCurrency(value: number) {
  return value.toLocaleString("zh-CN", {
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  });
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: "center",
    height: 36,
    justifyContent: "center",
    width: 30,
  },
  bodyText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 21,
  },
  compositionAmount: {
    color: theme.colors.textPrimary,
    fontSize: 11,
    fontWeight: "800",
    textAlign: "right",
  },
  compositionBlock: {
    backgroundColor: "rgba(255,255,255,0.035)",
    borderColor: theme.colors.divider,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    overflow: "hidden",
  },
  compositionDivider: {
    borderBottomColor: theme.colors.divider,
    borderBottomWidth: 1,
  },
  compositionFill: {
    borderRadius: 4,
    height: 8,
  },
  compositionGrid: {
    flexDirection: "row",
    gap: 9,
  },
  compositionGridStack: {
    flexDirection: "column",
  },
  compositionHeader: {
    backgroundColor: theme.colors.surfaceSoft,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  compositionLabel: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: 11,
    fontWeight: "800",
  },
  compositionLabelRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    minWidth: 72,
  },
  compositionMiddle: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  compositionPercent: {
    color: theme.colors.textPrimary,
    fontSize: 11,
    fontWeight: "800",
    textAlign: "right",
    width: 42,
  },
  compositionRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 9,
    paddingVertical: 8,
  },
  compositionTitle: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: "900",
  },
  compositionTotalLabel: {
    fontWeight: "900",
  },
  compositionTrack: {
    backgroundColor: "rgba(255,255,255,0.075)",
    borderRadius: 4,
    height: 8,
    overflow: "hidden",
  },
  footerNote: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 18,
    paddingHorizontal: 8,
    textAlign: "center",
  },
  formulaNote: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 18,
  },
  infoDot: {
    borderColor: theme.colors.textMuted,
    borderRadius: 8,
    borderWidth: 1,
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: "900",
    height: 16,
    lineHeight: 14,
    textAlign: "center",
    width: 16,
  },
  legendItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  legendLine: {
    borderRadius: 999,
    height: 2,
    width: 18,
  },
  legendLineDot: {
    backgroundColor: theme.colors.backgroundAlt,
    borderRadius: 6,
    borderWidth: 2,
    height: 9,
    left: 6,
    position: "absolute",
    top: -3.5,
    width: 9,
  },
  legendLineWrap: {
    height: 10,
    justifyContent: "center",
    position: "relative",
    width: 18,
  },
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 11,
    marginTop: 6,
  },
  legendSquare: {
    borderRadius: 3,
    height: 8,
    width: 8,
  },
  legendSquareLarge: {
    borderRadius: 3,
    height: 10,
    width: 10,
  },
  legendText: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: "800",
  },
  metricCell: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: 10,
    fontWeight: "700",
    paddingHorizontal: 4,
    paddingVertical: 8,
    textAlign: "center",
  },
  metricFirstCell: {
    flex: 1.08,
    textAlign: "left",
  },
  metricHeaderCell: {
    color: theme.colors.textSecondary,
    flex: 1,
    fontSize: 10,
    fontWeight: "900",
    paddingHorizontal: 4,
    paddingVertical: 8,
    textAlign: "center",
  },
  metricJudgement: {
    fontWeight: "900",
  },
  metricTable: {
    borderColor: theme.colors.divider,
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  metricTableHeader: {
    backgroundColor: theme.colors.surfaceSoft,
  },
  metricTableRow: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 36,
  },
  pagePeriodLine: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 2,
  },
  pageTitle: {
    color: theme.colors.textPrimary,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  periodArrow: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: "900",
  },
  periodButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    minHeight: 36,
    paddingHorizontal: 4,
  },
  periodText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "900",
  },
  pressFeedback: {
    opacity: 0.62,
  },
  root: {
    gap: 10,
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
  sectionNumber: {
    color: theme.colors.primaryDeep,
    fontSize: 17,
    fontWeight: "900",
  },
  sectionSubhead: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: "800",
  },
  sectionSubheadRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "900",
  },
  sectionTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  segment: {
    alignItems: "center",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 32,
    minWidth: 74,
    paddingHorizontal: 10,
  },
  segmentActive: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primary,
    borderWidth: 1,
  },
  segmentText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "900",
  },
  segmentTextActive: {
    color: theme.colors.primaryDeep,
  },
  segmented: {
    backgroundColor: "rgba(255,255,255,0.035)",
    borderColor: theme.colors.divider,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    padding: 2,
  },
  sheetBackdrop: {
    backgroundColor: "rgba(0,0,0,0.54)",
    flex: 1,
    justifyContent: "flex-end",
  },
  sheetClose: {
    alignItems: "center",
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  sheetHandle: {
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.28)",
    borderRadius: 3,
    height: 5,
    marginBottom: 12,
    width: 44,
  },
  sheetHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sheetInfoLabel: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "800",
  },
  sheetInfoList: {
    borderColor: theme.colors.divider,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 12,
    overflow: "hidden",
  },
  sheetInfoRow: {
    borderBottomColor: theme.colors.divider,
    borderBottomWidth: 1,
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sheetInfoValue: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
  },
  sheetOption: {
    alignItems: "center",
    borderBottomColor: theme.colors.divider,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 48,
    paddingHorizontal: 12,
  },
  sheetOptionList: {
    borderColor: theme.colors.divider,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 12,
    overflow: "hidden",
  },
  sheetOptionText: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: "800",
  },
  sheetPanel: {
    backgroundColor: theme.colors.backgroundAlt,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingBottom: 30,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  sheetTitle: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  statusBadge: {
    alignItems: "center",
    backgroundColor: theme.colors.successSoft,
    borderColor: "#BFE9CC",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  statusText: {
    color: theme.colors.success,
    fontSize: 14,
    fontWeight: "900",
  },
  subtitle: {
    color: theme.colors.textSecondary,
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
    textAlign: "center",
  },
  subtitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
  suggestionBody: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
  },
  suggestionCard: {
    backgroundColor: "rgba(74,222,128,0.07)",
    borderColor: "rgba(74,222,128,0.16)",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    padding: 10,
  },
  suggestionCopy: {
    flex: 1,
    gap: 3,
  },
  suggestionGrid: {
    gap: 8,
  },
  suggestionIcon: {
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    borderRadius: 15,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  suggestionIndex: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
  suggestionTitle: {
    color: theme.colors.success,
    fontSize: 14,
    fontWeight: "900",
  },
  summaryText: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 22,
  },
  tableDivider: {
    borderBottomColor: theme.colors.divider,
    borderBottomWidth: 1,
  },
  titleCenter: {
    alignItems: "center",
    flex: 1,
  },
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    minHeight: 52,
  },
  totalLine: {
    backgroundColor: theme.colors.divider,
    height: 1,
  },
  trendAnalysisBlock: {
    borderColor: theme.colors.divider,
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden",
  },
  trendAnalysisHeader: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.035)",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  trendAnalysisRight: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  trendAnalysisTitle: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "900",
  },
  trendAnalysisTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  trendAnalysisToggle: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "800",
  },
  trendChartShell: {
    backgroundColor: "rgba(255,255,255,0.035)",
    borderColor: theme.colors.divider,
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden",
    paddingBottom: 4,
    paddingTop: 54,
  },
  trendFloatingLine: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 17,
  },
  trendFloatingTitle: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 4,
  },
  trendFloatingTooltip: {
    backgroundColor: "rgba(8,12,28,0.96)",
    borderRadius: 10,
    minWidth: 148,
    paddingHorizontal: 12,
    paddingVertical: 10,
    position: "absolute",
    top: 10,
    zIndex: 1,
  },
  trendHeaderCopy: {
    flex: 1,
    gap: 2,
  },
  trendHeaderRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
  trendTable: {
    backgroundColor: theme.colors.surfaceSoft,
  },
  trendTableCell: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 6,
    paddingVertical: 10,
    textAlign: "center",
  },
  trendTableCellActive: {
    color: theme.colors.primaryDeep,
    fontWeight: "900",
  },
  trendTableHeadText: {
    color: theme.colors.textSecondary,
    flex: 1,
    fontSize: 11,
    fontWeight: "900",
    paddingHorizontal: 6,
    paddingVertical: 10,
    textAlign: "center",
  },
  trendTableHeader: {
    backgroundColor: theme.colors.surfaceSoft,
  },
  trendTableRow: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 42,
  },
  trendTableRowActive: {
    backgroundColor: theme.colors.primarySoft,
  },
});
