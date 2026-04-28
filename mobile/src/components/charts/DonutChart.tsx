import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { theme } from "../../styles/theme";

export interface DonutChartItem {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutChartItem[];
  emptyText: string;
  size?: number;
  strokeWidth?: number;
}

const MAX_LEGEND_ITEMS = 3;

const normalizeData = (data: DonutChartItem[]): DonutChartItem[] => {
  const positiveItems = data
    .filter((item) => item.value > 0)
    .sort((left, right) => right.value - left.value);

  if (positiveItems.length <= MAX_LEGEND_ITEMS) return positiveItems;

  const visibleItems = positiveItems.slice(0, MAX_LEGEND_ITEMS - 1);
  const otherValue = positiveItems
    .slice(MAX_LEGEND_ITEMS - 1)
    .reduce((sum, item) => sum + item.value, 0);

  return [
    ...visibleItems,
    {
      color: theme.colors.borderStrong,
      label: "其他",
      value: otherValue,
    },
  ];
};

export default function DonutChart({
  data,
  emptyText,
  size = 112,
  strokeWidth = 18,
}: DonutChartProps) {
  const items = normalizeData(data);
  const totalValue = items.reduce((sum, item) => sum + item.value, 0);
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  let accumulatedRatio = 0;

  if (totalValue <= 0 || items.length === 0) {
    return (
      <View style={styles.root}>
        <Svg height={size} width={size}>
          <Circle
            cx={center}
            cy={center}
            fill="transparent"
            r={radius}
            stroke={theme.colors.border}
            strokeWidth={strokeWidth}
          />
        </Svg>
        <Text style={styles.emptyText}>{emptyText}</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Svg height={size} width={size}>
        <G rotation="-90" origin={`${center}, ${center}`}>
          <Circle
            cx={center}
            cy={center}
            fill="transparent"
            r={radius}
            stroke={theme.colors.surface}
            strokeWidth={strokeWidth}
          />
          {items.map((item) => {
            const ratio = item.value / totalValue;
            const dashLength = ratio * circumference;
            const dashOffset = -accumulatedRatio * circumference;
            accumulatedRatio += ratio;

            return (
              <Circle
                key={item.label}
                cx={center}
                cy={center}
                fill="transparent"
                r={radius}
                stroke={item.color}
                strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                strokeWidth={strokeWidth}
              />
            );
          })}
        </G>
      </Svg>

      <View style={styles.legend}>
        {items.map((item) => (
          <View key={item.label} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={styles.legendText} numberOfLines={1}>
              {item.label} {Math.round((item.value / totalValue) * 100)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  legend: {
    gap: 6,
    width: "100%",
  },
  legendDot: {
    borderRadius: theme.radius.pill,
    height: 8,
    width: 8,
  },
  legendRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  legendText: {
    color: theme.colors.textSecondary,
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  root: {
    alignItems: "center",
    gap: theme.spacing.sm,
  },
});
