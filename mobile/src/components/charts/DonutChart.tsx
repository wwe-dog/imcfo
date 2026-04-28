import { useEffect, useMemo, useRef, useState } from "react";
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
  emptyText: string;
  onChartPress?: () => void;
  size?: number;
  strokeWidth?: number;
}

interface VisibleDonutItem extends DonutChartItem {
  endRatio: number;
  midRatio: number;
  startRatio: number;
}

const MAX_VISIBLE_ITEMS = 3;
const CALLOUT_WIDTH = 180;
const CALLOUT_HEIGHT = 132;

const normalizeData = (data: DonutChartItem[]): DonutChartItem[] => {
  const positiveItems = data
    .filter((item) => item.value > 0)
    .sort((left, right) => right.value - left.value);

  if (positiveItems.length <= MAX_VISIBLE_ITEMS) return positiveItems;

  const visibleItems = positiveItems.slice(0, MAX_VISIBLE_ITEMS - 1);
  const otherValue = positiveItems
    .slice(MAX_VISIBLE_ITEMS - 1)
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

const polarPoint = (centerX: number, centerY: number, radius: number, ratio: number) => {
  const angle = ratio * Math.PI * 2 - Math.PI / 2;
  return {
    x: centerX + Math.cos(angle) * radius,
    y: centerY + Math.sin(angle) * radius,
  };
};

const getCallout = (item: VisibleDonutItem, centerX: number, centerY: number, radius: number) => {
  const arcPoint = polarPoint(centerX, centerY, radius + 6, item.midRatio);
  const outerPoint = polarPoint(centerX, centerY, radius + 20, item.midRatio);
  const isRightSide = Math.cos(item.midRatio * Math.PI * 2 - Math.PI / 2) >= 0;
  const labelX = isRightSide ? CALLOUT_WIDTH - 10 : 10;
  const labelY = Math.max(14, Math.min(CALLOUT_HEIGHT - 10, outerPoint.y));
  const elbowX = isRightSide ? Math.min(labelX - 18, outerPoint.x + 10) : Math.max(labelX + 18, outerPoint.x - 10);

  return {
    isRightSide,
    labelX,
    labelY,
    points: `${arcPoint.x},${arcPoint.y} ${elbowX},${labelY} ${isRightSide ? labelX - 4 : labelX + 4},${labelY}`,
  };
};

export default function DonutChart({
  data,
  emptyText,
  onChartPress,
  size = 112,
  strokeWidth = 18,
}: DonutChartProps) {
  const rotateValue = useRef(new Animated.Value(-90)).current;
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const items = useMemo(() => normalizeData(data), [data]);
  const totalValue = items.reduce((sum, item) => sum + item.value, 0);
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const calloutCenterX = CALLOUT_WIDTH / 2;
  const calloutCenterY = 58;
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
      <View style={[styles.chartStage, { height: CALLOUT_HEIGHT }]}>
        <Svg height={CALLOUT_HEIGHT} viewBox={`0 0 ${CALLOUT_WIDTH} ${CALLOUT_HEIGHT}`} width="100%">
          {visibleItems.map((item) => {
            const callout = getCallout(item, calloutCenterX, calloutCenterY, radius);
            const isSelected = selectedLabel === item.label;

            return (
              <G key={`${item.label}-callout`}>
                <Polyline
                  fill="none"
                  points={callout.points}
                  stroke={isSelected ? theme.colors.textPrimary : item.color}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={isSelected ? 1.8 : 1.2}
                />
                <SvgText
                  fill={isSelected ? theme.colors.textPrimary : theme.colors.textSecondary}
                  fontSize={isSelected ? "10.5" : "10"}
                  fontWeight={isSelected ? "800" : "700"}
                  textAnchor={callout.isRightSide ? "end" : "start"}
                  x={callout.labelX}
                  y={callout.labelY - 2}
                >
                  {item.label}
                </SvgText>
                <SvgText
                  fill={isSelected ? theme.colors.primaryDeep : theme.colors.textMuted}
                  fontSize="9"
                  fontWeight="700"
                  textAnchor={callout.isRightSide ? "end" : "start"}
                  x={callout.labelX}
                  y={callout.labelY + 10}
                >
                  {Math.round((item.value / totalValue) * 100)}%
                </SvgText>
              </G>
            );
          })}
        </Svg>

        <Animated.View
          style={[
            styles.donutLayer,
            {
              height: size,
              top: calloutCenterY - size / 2,
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
                const isSelected = selectedLabel === item.label;
                const dashLength = (item.endRatio - item.startRatio) * circumference;
                const dashOffset = -item.startRatio * circumference;

                return (
                  <Circle
                    key={item.label}
                    cx={center}
                    cy={center}
                    fill="transparent"
                    onPress={() => {
                      setSelectedLabel((current) => (current === item.label ? null : item.label));
                      onChartPress?.();
                    }}
                    r={radius}
                    stroke={item.color}
                    strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    strokeOpacity={selectedLabel && !isSelected ? 0.54 : 1}
                    strokeWidth={isSelected ? strokeWidth + 4 : strokeWidth}
                  />
                );
              })}
            </G>
          </Svg>
        </Animated.View>
      </View>

      <View style={styles.tapHint}>
        <Text style={styles.tapHintText}>点按扇区高亮</Text>
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
  },
  tapHint: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tapHintText: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: "600",
  },
});
