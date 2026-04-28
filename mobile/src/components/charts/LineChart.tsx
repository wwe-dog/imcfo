import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Polyline, Text as SvgText } from "react-native-svg";
import { theme } from "../../styles/theme";

export interface LineChartPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  points: LineChartPoint[];
  emptyText: string;
  height?: number;
}

const CHART_WIDTH = 280;
const PADDING_X = 18;
const PADDING_TOP = 14;
const PADDING_BOTTOM = 26;

export default function LineChart({ emptyText, height = 128, points }: LineChartProps) {
  const validPoints = points.filter((point) => Number.isFinite(point.value));

  if (validPoints.length === 0) {
    return (
      <View style={[styles.emptyContainer, { height }]}>
        <Text style={styles.emptyText}>{emptyText}</Text>
      </View>
    );
  }

  const values = validPoints.map((point) => point.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = Math.max(maxValue - minValue, 1);
  const chartHeight = height - PADDING_TOP - PADDING_BOTTOM;
  const stepX =
    validPoints.length > 1
      ? (CHART_WIDTH - PADDING_X * 2) / (validPoints.length - 1)
      : 0;

  const chartPoints = validPoints.map((point, index) => {
    const x =
      validPoints.length > 1
        ? PADDING_X + index * stepX
        : CHART_WIDTH / 2;
    const y = PADDING_TOP + (1 - (point.value - minValue) / range) * chartHeight;

    return {
      ...point,
      x,
      y,
    };
  });

  const polylinePoints = chartPoints.map((point) => `${point.x},${point.y}`).join(" ");
  const baselineY = PADDING_TOP + chartHeight;

  return (
    <View style={styles.root}>
      <Svg height={height} viewBox={`0 0 ${CHART_WIDTH} ${height}`} width="100%">
        <Line
          stroke={theme.colors.border}
          strokeDasharray="5 6"
          strokeWidth={1}
          x1={PADDING_X}
          x2={CHART_WIDTH - PADDING_X}
          y1={baselineY}
          y2={baselineY}
        />
        {validPoints.length === 1 ? (
          <Line
            stroke={theme.colors.primary}
            strokeLinecap="round"
            strokeWidth={3}
            x1={PADDING_X}
            x2={CHART_WIDTH - PADDING_X}
            y1={chartPoints[0].y}
            y2={chartPoints[0].y}
          />
        ) : (
          <Polyline
            fill="none"
            points={polylinePoints}
            stroke={theme.colors.primary}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
          />
        )}
        {chartPoints.map((point) => (
          <Circle
            key={`${point.label}-${point.x}`}
            cx={point.x}
            cy={point.y}
            fill={theme.colors.surface}
            r={4}
            stroke={theme.colors.primaryDeep}
            strokeWidth={2}
          />
        ))}
        {chartPoints.map((point, index) => {
          const shouldShowLabel =
            validPoints.length <= 4 || index === 0 || index === validPoints.length - 1 || index % 2 === 1;

          if (!shouldShowLabel) return null;

          return (
            <SvgText
              key={`${point.label}-label`}
              fill={theme.colors.textMuted}
              fontSize="10"
              fontWeight="600"
              textAnchor="middle"
              x={point.x}
              y={height - 8}
            >
              {point.label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceSoft,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    justifyContent: "center",
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  root: {
    backgroundColor: theme.colors.surfaceSoft,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
});
