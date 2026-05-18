import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";

import AppIcon, { type AppIconName } from "./AppIcon";

export type BottomNavTab = {
  key: string;
  label: string;
  icon: AppIconName;
};

type BottomNavBarProps = {
  activeKey: string;
  bottomInset: number;
  tabs: BottomNavTab[];
  onTabPress: (key: string) => void;
  onRecordPress: () => void;
  onRecordLongPress: () => void;
};

const recordButtonSize = 52;
const recordRingSize = 58;

export function BottomNavBar({
  activeKey,
  bottomInset,
  tabs,
  onTabPress,
  onRecordPress,
  onRecordLongPress,
}: BottomNavBarProps) {
  const leftTabs = tabs.slice(0, 2);
  const rightTabs = tabs.slice(2);

  const renderTab = (tab: BottomNavTab) => {
    const isActive = activeKey === tab.key;

    return (
      <Pressable
        key={tab.key}
        accessibilityRole="button"
        accessibilityState={{ selected: isActive }}
        onPress={() => onTabPress(tab.key)}
        style={styles.tabButton}
      >
        <AppIcon
          name={tab.icon}
          size={18}
          color={isActive ? "#FFFFFF" : "rgba(255,255,255,0.62)"}
        />
        <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
          {tab.label}
        </Text>
        {isActive ? <View style={styles.activePill} /> : null}
      </Pressable>
    );
  };

  return (
    <View pointerEvents="box-none" style={styles.wrapper}>
      <View style={[styles.navBar, { paddingBottom: Math.max(bottomInset, 8) }]}>
        <View style={styles.sideTabs}>{leftTabs.map(renderTab)}</View>

        <Pressable
          accessibilityLabel="记一笔"
          accessibilityRole="button"
          delayLongPress={400}
          onLongPress={onRecordLongPress}
          onPress={onRecordPress}
          style={styles.recordSlot}
        >
          <View style={styles.recordGlow} />
          <View style={styles.recordRing}>
            <View style={styles.recordButton}>
              <Svg
                height={recordButtonSize}
                pointerEvents="none"
                width={recordButtonSize}
              >
                <Defs>
                  <RadialGradient
                    cx="32%"
                    cy="24%"
                    fx="28%"
                    fy="18%"
                    id="recordButtonGradient"
                    r="78%"
                  >
                    <Stop offset="0%" stopColor="#FF5DBB" />
                    <Stop offset="36%" stopColor="#8A5CFF" />
                    <Stop offset="68%" stopColor="#3B8BFF" />
                    <Stop offset="100%" stopColor="#00D2D9" />
                  </RadialGradient>
                </Defs>
                <Circle
                  cx={recordButtonSize / 2}
                  cy={recordButtonSize / 2}
                  fill="url(#recordButtonGradient)"
                  r={recordButtonSize / 2}
                />
              </Svg>
              <View style={styles.recordIcon}>
                <AppIcon name="mic" size={20} color="#FFFFFF" />
              </View>
            </View>
          </View>
        </Pressable>

        <View style={styles.sideTabs}>{rightTabs.map(renderTab)}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    left: 0,
    right: 0,
  },
  navBar: {
    alignItems: "center",
    backgroundColor: "rgba(5, 8, 20, 0.92)",
    borderColor: "rgba(255,255,255,0.12)",
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    minHeight: 76,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sideTabs: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  tabButton: {
    alignItems: "center",
    gap: 4,
    justifyContent: "center",
    minWidth: 48,
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  tabText: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 11,
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  activePill: {
    backgroundColor: "#FF5DBB",
    borderRadius: 999,
    height: 3,
    marginTop: 1,
    width: 18,
  },
  recordSlot: {
    alignItems: "center",
    height: 58,
    justifyContent: "center",
    marginHorizontal: 10,
    marginTop: -12,
    width: 58,
  },
  recordGlow: {
    backgroundColor: "rgba(138,92,255,0.3)",
    borderRadius: 24,
    bottom: 1,
    height: 18,
    position: "absolute",
    width: 46,
  },
  recordRing: {
    alignItems: "center",
    backgroundColor: "transparent",
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: recordRingSize / 2,
    borderWidth: 1,
    height: recordRingSize,
    justifyContent: "center",
    width: recordRingSize,
  },
  recordButton: {
    borderRadius: recordButtonSize / 2,
    height: recordButtonSize,
    overflow: "hidden",
    width: recordButtonSize,
  },
  recordIcon: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
});
