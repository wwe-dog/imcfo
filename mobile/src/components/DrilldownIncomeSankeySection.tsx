import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import AppIcon from "./AppIcon";
import {
  buildIncomeStructureFlowViewModel,
  type IncomeFlowNode,
  formatIncomeFlowCurrency,
  getIncomeFlowNodeTitle,
} from "../domain/reports/incomeStructureFlow";
import { theme } from "../styles/theme";

interface DrilldownIncomeSankeySectionProps {
  root: IncomeFlowNode;
}

interface NodeFrame {
  height: number;
  width: number;
  x: number;
  y: number;
}

const nodePalette: Record<IncomeFlowNode["kind"], { accent: string; fill: string; link: string; text: string }> = {
  deduction: {
    accent: "#C98268",
    fill: "#FBF0EC",
    link: "rgba(183,119,96,0.25)",
    text: "#8C5646",
  },
  income: {
    accent: "#D0A23A",
    fill: "#FBF2DE",
    link: "rgba(208,162,58,0.28)",
    text: "#8E681F",
  },
  net: {
    accent: "#7DA96E",
    fill: "#EFF7EA",
    link: "rgba(125,169,110,0.25)",
    text: "#456F3E",
  },
  project: {
    accent: "#6E94C8",
    fill: "#EEF5FF",
    link: "rgba(110,148,200,0.25)",
    text: "#365B8E",
  },
  root: {
    accent: "#D7A43A",
    fill: "#F9E8BE",
    link: "rgba(215,164,58,0.3)",
    text: "#7A5718",
  },
};

export default function DrilldownIncomeSankeySection({ root }: DrilldownIncomeSankeySectionProps) {
  const { width } = useWindowDimensions();
  const [path, setPath] = useState<string[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const viewModel = useMemo(
    () => buildIncomeStructureFlowViewModel(root, path, selectedNodeId),
    [path, root, selectedNodeId],
  );
  const chartWidth = Math.max(316, width - 72);
  const chartHeight = Math.max(248, 40 + Math.max(1, viewModel.children.length) * 68);
  const frames = createFrames(chartWidth, chartHeight, viewModel.children.length);
  const selectedNode = viewModel.selectedNode;
  const rootTitle = getIncomeFlowNodeTitle(viewModel.focusNode);

  const handleChildPress = (node: IncomeFlowNode) => {
    if (node.children?.length) {
      setPath((current) => [...current, node.id]);
      setSelectedNodeId(null);
      return;
    }
    setSelectedNodeId((current) => (current === node.id ? null : node.id));
  };

  const handleBack = () => {
    setPath((current) => current.slice(0, -1));
    setSelectedNodeId(null);
  };

  const handleBreadcrumbPress = (nextPath: string[]) => {
    setPath(nextPath);
    setSelectedNodeId(null);
  };

  return (
    <View style={styles.root}>
      <View style={styles.topRow}>
        <View style={styles.copyBlock}>
          <Text maxFontSizeMultiplier={1} style={styles.blockTitle}>
            收入结构
          </Text>
          <Text maxFontSizeMultiplier={1} style={styles.subtitle}>
            {viewModel.subtitle}
          </Text>
        </View>
        {path.length > 0 ? (
          <Pressable onPress={handleBack} style={({ pressed }) => [styles.backPill, pressed && styles.pressFeedback]}>
            <AppIcon color={theme.colors.textSecondary} name="back" size={14} strokeWidth={2.2} />
            <Text maxFontSizeMultiplier={1} style={styles.backText}>
              返回
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.breadcrumbRow}>
        {viewModel.breadcrumb.map((crumb, index) => (
          <View key={`${crumb.label}-${index}`} style={styles.crumbWrap}>
            {index > 0 ? (
              <Text maxFontSizeMultiplier={1} style={styles.crumbDivider}>
                /
              </Text>
            ) : null}
            <Pressable
              onPress={() => handleBreadcrumbPress(crumb.idPath)}
              style={({ pressed }) => [styles.crumbPressable, pressed && styles.pressFeedback]}
            >
              <Text
                maxFontSizeMultiplier={1}
                numberOfLines={1}
                style={[styles.crumbText, index === viewModel.breadcrumb.length - 1 && styles.crumbTextActive]}
              >
                {crumb.label}
              </Text>
            </Pressable>
          </View>
        ))}
      </View>

      <View style={styles.chartShell}>
        {viewModel.children.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text maxFontSizeMultiplier={1} style={styles.emptyText}>
              暂无收入结构数据
            </Text>
          </View>
        ) : (
          <View style={[styles.chartCanvas, { height: chartHeight, width: chartWidth }]}>
            <Svg height={chartHeight} style={StyleSheet.absoluteFill} width={chartWidth}>
              {viewModel.children.map((node, index) => (
                <FlowPath
                  key={`link-${node.id}`}
                  childFrame={frames.children[index]}
                  focusAmount={viewModel.focusNode.amount}
                  highlighted={selectedNode.id === node.id || selectedNode.id === viewModel.focusNode.id}
                  node={node}
                  rootFrame={frames.root}
                />
              ))}
            </Svg>

            <Pressable
              onPress={() => setSelectedNodeId(null)}
              style={({ pressed }) => [
                styles.rootNode,
                {
                  height: frames.root.height,
                  left: frames.root.x,
                  top: frames.root.y,
                  width: frames.root.width,
                },
                selectedNode.id === viewModel.focusNode.id && styles.nodeSelected,
                pressed && styles.pressFeedback,
              ]}
            >
              <View style={styles.rootIcon}>
                <AppIcon color="#FFFFFF" name={viewModel.focusNode.icon} size={22} strokeWidth={2.1} />
              </View>
              <Text maxFontSizeMultiplier={1} numberOfLines={2} style={styles.rootNodeTitle}>
                {rootTitle}
              </Text>
              <Text maxFontSizeMultiplier={1} numberOfLines={1} style={styles.rootNodeAmount}>
                {formatIncomeFlowCurrency(viewModel.focusNode.amount)}
              </Text>
            </Pressable>

            {viewModel.children.map((node, index) => {
              const frame = frames.children[index];
              const isSelected = selectedNode.id === node.id;
              const palette = nodePalette[node.kind];
              return (
                <Pressable
                  key={node.id}
                  onPress={() => handleChildPress(node)}
                  style={({ pressed }) => [
                    styles.childNode,
                    {
                      backgroundColor: palette.fill,
                      borderColor: isSelected ? palette.accent : theme.colors.border,
                      height: frame.height,
                      left: frame.x,
                      top: frame.y,
                      width: frame.width,
                    },
                    isSelected && styles.nodeSelected,
                    pressed && styles.pressFeedback,
                  ]}
                >
                  <View style={[styles.childAccent, { backgroundColor: palette.accent }]} />
                  <View style={styles.childCopy}>
                    <View style={styles.childTitleRow}>
                      <Text maxFontSizeMultiplier={1} numberOfLines={1} style={styles.childTitle}>
                        {node.label}
                      </Text>
                      {node.children?.length ? (
                        <AppIcon color={theme.colors.textMuted} name="chevronRight" size={13} strokeWidth={2.1} />
                      ) : null}
                    </View>
                    <View style={styles.childValueRow}>
                      <Text maxFontSizeMultiplier={1} numberOfLines={1} style={[styles.childAmount, { color: palette.text }]}>
                        {formatIncomeFlowCurrency(node.amount)}
                      </Text>
                      {typeof node.percentage === "number" ? (
                        <Text maxFontSizeMultiplier={1} style={styles.childPercent}>
                          {node.percentage.toFixed(1)}%
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      <SummaryPanel node={selectedNode} title={getIncomeFlowNodeTitle(selectedNode)} />

      <Text maxFontSizeMultiplier={1} style={styles.helperText}>
        点击收入项查看下级明细；进入下级后，同级分支会隐藏，帮助聚焦当前收入来源。
      </Text>
    </View>
  );
}

function FlowPath({
  childFrame,
  focusAmount,
  highlighted,
  node,
  rootFrame,
}: {
  childFrame: NodeFrame;
  focusAmount: number;
  highlighted: boolean;
  node: IncomeFlowNode;
  rootFrame: NodeFrame;
}) {
  const palette = nodePalette[node.kind];
  const x1 = rootFrame.x + rootFrame.width;
  const y1 = rootFrame.y + rootFrame.height / 2;
  const x2 = childFrame.x;
  const y2 = childFrame.y + childFrame.height / 2;
  const curve = Math.max(28, (x2 - x1) * 0.44);
  const strokeWidth = Math.max(5, Math.min(28, (node.amount / Math.max(1, focusAmount)) * 24));

  return (
    <Path
      d={`M ${x1} ${y1} C ${x1 + curve} ${y1}, ${x2 - curve} ${y2}, ${x2} ${y2}`}
      fill="none"
      opacity={highlighted ? 0.95 : 0.46}
      stroke={palette.link}
      strokeLinecap="round"
      strokeWidth={strokeWidth}
    />
  );
}

function SummaryPanel({ node, title }: { node: IncomeFlowNode; title: string }) {
  const rows =
    node.summary ??
    [
      { label: "金额", value: formatIncomeFlowCurrency(node.amount) },
      {
        label: "占比",
        value: typeof node.percentage === "number" ? `${node.percentage.toFixed(1)}%` : "--",
      },
      { label: "说明", value: node.description ?? "暂无更多说明" },
    ];

  return (
    <View style={styles.summaryPanel}>
      <Text maxFontSizeMultiplier={1} style={styles.summaryTitle}>
        {title}
      </Text>
      <View style={styles.summaryRows}>
        {rows.map((row, index) => (
          <View key={`${row.label}-${index}`} style={[styles.summaryRow, index < rows.length - 1 && styles.summaryDivider]}>
            <Text maxFontSizeMultiplier={1} style={styles.summaryLabel}>
              {row.label}
            </Text>
            <Text
              maxFontSizeMultiplier={1}
              numberOfLines={2}
              style={[
                styles.summaryValue,
                row.tone === "good" && styles.summaryValueGood,
                row.tone === "warning" && styles.summaryValueWarning,
              ]}
            >
              {row.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function createFrames(chartWidth: number, chartHeight: number, childCount: number) {
  const rootWidth = 118;
  const rootHeight = 112;
  const childWidth = Math.min(178, Math.max(150, chartWidth - 178));
  const childHeight = 56;
  const rootFrame: NodeFrame = {
    height: rootHeight,
    width: rootWidth,
    x: 10,
    y: (chartHeight - rootHeight) / 2,
  };
  const childX = chartWidth - childWidth - 8;
  const totalChildrenHeight = childCount * childHeight + Math.max(0, childCount - 1) * 10;
  const startY = Math.max(14, (chartHeight - totalChildrenHeight) / 2);

  return {
    children: Array.from({ length: childCount }).map<NodeFrame>((_, index) => ({
      height: childHeight,
      width: childWidth,
      x: childX,
      y: startY + index * (childHeight + 10),
    })),
    root: rootFrame,
  };
}

const styles = StyleSheet.create({
  backPill: {
    alignItems: "center",
    borderColor: theme.colors.divider,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 3,
    minHeight: 30,
    paddingHorizontal: 9,
  },
  backText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "800",
  },
  blockTitle: {
    color: theme.colors.textPrimary,
    fontSize: 19,
    fontWeight: "900",
  },
  breadcrumbRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
  },
  chartCanvas: {
    position: "relative",
  },
  chartShell: {
    backgroundColor: "#FFFFFF",
    borderColor: theme.colors.divider,
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  childAccent: {
    alignSelf: "stretch",
    borderBottomLeftRadius: 8,
    borderTopLeftRadius: 8,
    width: 5,
  },
  childAmount: {
    flex: 1,
    fontSize: 13,
    fontWeight: "900",
  },
  childCopy: {
    flex: 1,
    gap: 5,
    justifyContent: "center",
    minWidth: 0,
    paddingHorizontal: 9,
  },
  childNode: {
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    overflow: "hidden",
    position: "absolute",
    shadowColor: theme.colors.shadowSoft,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  childPercent: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "900",
    textAlign: "right",
    width: 46,
  },
  childTitle: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: 13,
    fontWeight: "900",
  },
  childTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  childValueRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  copyBlock: {
    flex: 1,
  },
  crumbDivider: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
  },
  crumbPressable: {
    minHeight: 26,
    justifyContent: "center",
  },
  crumbText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
  },
  crumbTextActive: {
    color: theme.colors.textPrimary,
    fontWeight: "900",
  },
  crumbWrap: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  emptyBox: {
    alignItems: "center",
    minHeight: 180,
    justifyContent: "center",
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  helperText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
    textAlign: "center",
  },
  nodeSelected: {
    shadowRadius: 16,
    transform: [{ scale: 1.01 }],
  },
  pressFeedback: {
    opacity: 0.64,
  },
  root: {
    gap: 10,
  },
  rootIcon: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.28)",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  rootNode: {
    alignItems: "center",
    backgroundColor: "#D6A23A",
    borderRadius: 10,
    justifyContent: "center",
    paddingHorizontal: 10,
    position: "absolute",
    shadowColor: theme.colors.shadowSoft,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 1,
    shadowRadius: 14,
  },
  rootNodeAmount: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    marginTop: 5,
  },
  rootNodeTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    lineHeight: 18,
    marginTop: 8,
    textAlign: "center",
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  summaryDivider: {
    borderBottomColor: theme.colors.divider,
    borderBottomWidth: 1,
  },
  summaryLabel: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  summaryPanel: {
    borderColor: theme.colors.divider,
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  summaryRow: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    minHeight: 38,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  summaryRows: {
    backgroundColor: "#FFFFFF",
  },
  summaryTitle: {
    backgroundColor: theme.colors.surfaceSoft,
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "900",
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  summaryValue: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: 13,
    fontWeight: "900",
    textAlign: "right",
  },
  summaryValueGood: {
    color: theme.colors.success,
  },
  summaryValueWarning: {
    color: theme.colors.primaryDeep,
  },
  topRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
  },
});
