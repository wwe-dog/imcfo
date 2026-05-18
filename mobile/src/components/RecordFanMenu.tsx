import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import AppIcon from "./AppIcon";

export type RecordFanAction = "voice" | "text" | "manual";

type Sector = {
  action: RecordFanAction;
  color: string;
  hint: string;
  label: string;
  midAngle: number;
  startAngle: number;
  endAngle: number;
};

type RecordFanMenuProps = {
  centerX: number;
  centerY: number;
  visible: boolean;
  onDismiss: () => void;
  onSelect: (action: RecordFanAction) => void;
};

const sectors: Sector[] = [
  {
    action: "voice",
    color: "#00D2D9",
    label: "语音",
    hint: "长按可直接录音",
    startAngle: 186,
    endAngle: 239,
    midAngle: 212.5,
  },
  {
    action: "text",
    color: "#8A5CFF",
    label: "文字",
    hint: "AI 自然语言识别",
    startAngle: 242,
    endAngle: 298,
    midAngle: 270,
  },
  {
    action: "manual",
    color: "#3B8BFF",
    label: "精确",
    hint: "手动选科目",
    startAngle: 301,
    endAngle: 354,
    midAngle: 327.5,
  },
];

const innerRadius = 30;
const outerRadius = 130;
const iconRadius = 70;
const labelRadius = 105;

const colorWithAlpha = (hex: string, alpha: number) => {
  const clean = hex.replace("#", "");
  const value = parseInt(clean.slice(0, 6), 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const polar = (cx: number, cy: number, radius: number, angle: number) => {
  const radians = (angle * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
};

const sectorPath = (
  cx: number,
  cy: number,
  startAngle: number,
  endAngle: number,
) => {
  const outerStart = polar(cx, cy, outerRadius, startAngle);
  const outerEnd = polar(cx, cy, outerRadius, endAngle);
  const innerEnd = polar(cx, cy, innerRadius, endAngle);
  const innerStart = polar(cx, cy, innerRadius, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
};

export function RecordFanMenu({
  centerX,
  centerY,
  visible,
  onDismiss,
  onSelect,
}: RecordFanMenuProps) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!visible) return;

    scale.setValue(0);
    opacity.setValue(0);
    Animated.parallel([
      Animated.spring(scale, {
        damping: 15,
        stiffness: 200,
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        duration: 160,
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale, visible]);

  const close = () => {
    Animated.parallel([
      Animated.spring(scale, {
        damping: 15,
        stiffness: 200,
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        duration: 180,
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) onDismiss();
    });
  };

  const animatedStyle = useMemo(
    () => ({
      opacity,
      transform: [
        { translateX: centerX },
        { translateY: centerY },
        { scale },
        { translateX: -centerX },
        { translateY: -centerY },
      ],
    }),
    [centerX, centerY, opacity, scale],
  );

  if (!visible) return null;

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setScreenSize({ width, height });
  };

  return (
    <View onLayout={handleLayout} pointerEvents="box-none" style={styles.root}>
      <Animated.View style={[styles.overlay, { opacity }]}>
        <Pressable onPress={close} style={StyleSheet.absoluteFillObject} />
      </Animated.View>

      <Animated.View pointerEvents="box-none" style={[styles.fan, animatedStyle]}>
        <Svg
          height={screenSize.height || 1}
          pointerEvents="none"
          width={screenSize.width || 1}
        >
          {sectors.map((sector) => (
            <Path
              d={sectorPath(
                centerX,
                centerY,
                sector.startAngle,
                sector.endAngle,
              )}
              fill={colorWithAlpha(sector.color, 0.15)}
              key={sector.action}
              stroke={colorWithAlpha(sector.color, 0.6)}
              strokeWidth={0.5}
            />
          ))}
        </Svg>

        {sectors.map((sector) => {
          const iconPoint = polar(centerX, centerY, iconRadius, sector.midAngle);
          const labelPoint = polar(centerX, centerY, labelRadius, sector.midAngle);

          return (
            <Pressable
              hitSlop={14}
              key={sector.action}
              onPress={() => onSelect(sector.action)}
              style={[
                styles.sectorTouch,
                {
                  left: labelPoint.x - 42,
                  top: labelPoint.y - 50,
                },
              ]}
            >
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: colorWithAlpha(sector.color, 0.2),
                    left: iconPoint.x - labelPoint.x + 26,
                    top: iconPoint.y - labelPoint.y + 18,
                  },
                ]}
              >
                {sector.action === "text" ? (
                  <View style={styles.textIcon}>
                    <View
                      style={[
                        styles.textIconLine,
                        { backgroundColor: sector.color, width: 15 },
                      ]}
                    />
                    <View
                      style={[
                        styles.textIconLine,
                        { backgroundColor: sector.color, width: 12 },
                      ]}
                    />
                    <View
                      style={[
                        styles.textIconLine,
                        { backgroundColor: sector.color, width: 8 },
                      ]}
                    />
                  </View>
                ) : sector.action === "manual" ? (
                  <View style={styles.gridIcon}>
                    {[0, 1, 2, 3].map((index) => (
                      <CircleDot color={sector.color} key={index} />
                    ))}
                  </View>
                ) : (
                  <AppIcon name="mic" size={16} color={sector.color} />
                )}
              </View>
              <Text style={[styles.label, { color: sector.color }]}>
                {sector.label}
              </Text>
              <Text style={styles.hint}>{sector.hint}</Text>
            </Pressable>
          );
        })}
      </Animated.View>
    </View>
  );
}

function CircleDot({ color }: { color: string }) {
  return <View style={[styles.gridDot, { backgroundColor: color }]} />;
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 80,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(9,12,29,0.4)",
  },
  fan: {
    ...StyleSheet.absoluteFillObject,
  },
  sectorTouch: {
    alignItems: "center",
    height: 70,
    position: "absolute",
    width: 84,
  },
  iconCircle: {
    alignItems: "center",
    borderRadius: 16,
    height: 32,
    justifyContent: "center",
    position: "absolute",
    width: 32,
  },
  textIcon: {
    gap: 3,
  },
  textIconLine: {
    borderRadius: 999,
    height: 2,
  },
  gridIcon: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    height: 14,
    width: 14,
  },
  gridDot: {
    borderRadius: 2,
    height: 5,
    width: 5,
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 40,
    textAlign: "center",
  },
  hint: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 8,
    marginTop: 3,
    textAlign: "center",
  },
});
