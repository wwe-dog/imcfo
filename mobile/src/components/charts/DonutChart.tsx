import { useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G, Polyline, Text as SvgText } from "react-native-svg";
import { theme } from "../../styles/theme";

export interface DonutChartItem {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutChartItem[];
  detailMode?: boolean;
  emptyText: string;
  labelMinPercent?: number;
  showCalloutLabels?: boolean;
  showAmountInLabel?: boolean;
  size?: number;
  strokeWidth?: number;
}

interface VisibleDonutItem extends DonutChartItem {
  endRatio: number;
  midRatio: number;
  startRatio: number;
}

interface LabelLayoutItem extends VisibleDonutItem {
  isRightSide: boolean;
  labelX: number;
  labelY: number;
  points: string;
}

const MAX_COMPACT_VISIBLE_ITEMS = 3;

const normalizeData = (data: DonutChartItem[], detailMode: boolean): DonutChartItem[] => {
  const positiveItems = data
    .filter((item) => item.value > 0)
    .sort((left, right) => right.value - left.value);

  if (detailMode || positiveItems.length <= MAX_COMPACT_VISIBLE_ITEMS) return positiveItems;

  const visibleItems = positiveItems.slice(0, MAX_COMPACT_VISIBLE_ITEMS - 1);
  const otherValue = positiveItems
    .slice(MAX_COMPACT_VISIBLE_ITEMS - 1)
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

const formatCompactCurrency = (value: number): string => {
  const sign = value < 0 ? "-" : "";
  const absoluteValue = Math.abs(value);

  if (absoluteValue >= 10000) {
    const displayValue =
      absoluteValue >= 100000 ? (absoluteValue / 10000).toFixed(0) : (absoluteValue / 10000).toFixed(1);
    return `${sign}¥${displayValue}万`;
  }

  return `${sign}¥${Math.round(absoluteValue)}`;
};

const polarPoint = (centerX: number, centerY: number, radius: number, ratio: number) => {
  const angle = ratio * Math.PI * 2 - Math.PI / 2;
  return {
    x: centerX + Math.cos(angle) * radius,
    y: centerY + Math.sin(angle) * radius,
  };
};

const pushApartLabels = (
  labels: Array<VisibleDonutItem & { baseY: number; isRightSide: boolean }>,
  minY: number,
  maxY: number,
  minGap: number,
) => {
  const sortedLabels = [...labels].sort((left, right) => left.baseY - right.baseY);
  let previousY = minY - minGap;

  const adjustedLabels = sortedLabels.map((label) => {
    const labelY = Math.max(minY, Math.min(maxY, Math.max(label.baseY, previousY + minGap)));
    previousY = labelY;
    return {
      ...label,
      labelY,
    };
  });

  const overflow = adjustedLabels.length > 0 ? adjustedLabels[adjustedLabels.length - 1].labelY - maxY : 0;
  if (overflow > 0) {
    return adjustedLabels.map((label) => ({
      ...label,
      labelY: Math.max(minY, label.labelY - overflow),
    }));
  }

  return adjustedLabels;
};

const getLabelLayouts = (
  items: VisibleDonutItem[],
  centerX: number,
  centerY: number,
  radius: number,
  chartWidth: number,
  chartHeight: number,
  minRatio: number,
): LabelLayoutItem[] => {
  const labelCandidates = items
    .filter((item) => item.endRatio - item.startRatio >= minRatio)
    .map((item) => {
      const angle = item.midRatio * Math.PI * 2 - Math.PI / 2;
      const outerPoint = polarPoint(centerX, centerY, radius + 30, item.midRatio);

      return {
        ...item,
        baseY: outerPoint.y,
        isRightSide: Math.cos(angle) >= 0,
      };
    });

  const leftLabels = pushApartLabels(
    labelCandidates.filter((item) => !item.isRightSide),
    18,
    chartHeight - 18,
    24,
  );
  const rightLabels = pushApartLabels(
    labelCandidates.filter((item) => item.isRightSide),
    18,
    chartHeight - 18,
    24,
  );

  return [...leftLabels, ...rightLabels].map((item) => {
    const arcPoint = polarPoint(centerX, centerY, radius + 6, item.midRatio);
    const outerPoint = polarPoint(centerX, centerY, radius + 20, item.midRatio);
    const labelX = item.isRightSide ? chartWidth - 10 : 10;
    const elbowX = item.isRightSide
      ? Math.min(labelX - 18, outerPoint.x + 12)
      : Math.max(labelX + 18, outerPoint.x - 12);

    return {
      ...item,
      labelX,
      points: `${arcPoint.x},${arcPoint.y} ${elbowX},${item.labelY} ${
        item.isRightSide ? labelX - 4 : labelX + 4
      },${item.labelY}`,
    };
  });
};

export default function DonutChart({
  data,
  detailMode = false,
  emptyText,
  labelMinPercent,
  showCalloutLabels = true,
  showAmountInLabel = false,
  size = 112,
  strokeWidth = 18,
}: DonutChartProps) {
  const rotateValue = useRef(new Animated.Value(-90)).current;
  const items = useMemo(() => normalizeData(data, detailMode), [data, detailMode]);
  const totalValue = items.reduce((sum, item) => sum + item.value, 0);
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const chartWidth = detailMode ? 320 : 180;
  const chartHeight = detailMode ? 220 : 132;
  const donutCenterX = chartWidth / 2;
  const donutCenterY = detailMode ? 106 : 58;
  const calloutMinRatio = labelMinPercent ?? (detailMode ? 0.01 : 0);
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    rotateValue.setValue(-90);
    Animated.timing(rotateValue, {
      duration: 520,
      toValue: 0,
      useNativeDriver: true,
    }).start();
  }, [data, rotateValue]);

  const visibleItems = useMemo<VisibleDonutItem[]>(() => {
    let accumulatedRatio = 0;

    return items.map((item) => {
      const ratio = totalValue > 0 ? item.value / totalValue : 0;
      const visibleItem = {
        ...item,
        endRatio: accumulatedRatio + ratio,
        midRatio: accumulatedRatio + ratio / 2,
        startRatio: accumulatedRatio,
      };
      accumulatedRatio += ratio;
      return visibleItem;
    });
  }, [items, totalValue]);

  const labelLayouts = useMemo(
    () =>
      showCalloutLabels
        ? getLabelLayouts(visibleItems, donutCenterX, donutCenterY, radius, chartWidth, chartHeight, calloutMinRatio)
        : [],
    [calloutMinRatio, chartHeight, chartWidth, donutCenterX, donutCenterY, radius, showCalloutLabels, visibleItems],
  );

  const animatedRotation = rotateValue.interpolate({
    inputRange: [-90, 0],
    outputRange: ["-90deg", "0deg"],
  });

  if (totalValue <= 0 || visibleItems.length === 0) {
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
      <View style={[styles.chartStage, { height: chartHeight }]}>
        <Svg height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} width="100%">
          {labelLayouts.map((item) => {
            const percentText = `${Math.round(((item.endRatio - item.startRatio) || 0) * 100)}%`;
            const labelText = `${item.label} ${percentText}`;

            return (
              <G key={`${item.label}-callout`}>
                <Polyline
                  fill="none"
                  points={item.points}
                  stroke={item.color}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.2}
                />
                <SvgText
                  fill={theme.colors.textSecondary}
                  fontSize={detailMode ? "11" : "10"}
                  fontWeight="700"
                  textAnchor={item.isRightSide ? "end" : "start"}
                  x={item.labelX}
                  y={item.labelY - (showAmountInLabel ? 3 : 0)}
                >
                  {labelText}
                </SvgText>
                {showAmountInLabel ? (
                  <SvgText
                    fill={theme.colors.textMuted}
                    fontSize="10"
                    fontWeight="700"
                    textAnchor={item.isRightSide ? "end" : "start"}
                    x={item.labelX}
                    y={item.labelY + 11}
                  >
                    {formatCompactCurrency(item.value)}
                  </SvgText>
                ) : null}
              </G>
            );
          })}
        </Svg>

        <Animated.View
          style={[
            styles.donutLayer,
            {
              height: size,
              top: donutCenterY - size / 2,
              transform: [{ rotate: animatedRotation }],
              width: size,
            },
          ]}
        >
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
              {visibleItems.map((item) => {
                const dashLength = (item.endRatio - item.startRatio) * circumference;
                const dashOffset = -item.startRatio * circumference;

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
        </Animated.View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  chartStage: {
    justifyContent: "center",
    width: "100%",
  },
  donutLayer: {
    alignSelf: "center",
    position: "absolute",
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  root: {
    alignItems: "center",
    gap: theme.spacing.xs,
    width: "100%",
  },
});
