import type { ReactNode } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import AppIcon, { type AppIconName } from "./AppIcon";
import { theme } from "../styles/theme";

export type LedgerRowTone = "amber" | "blue" | "danger" | "default" | "green";

export interface LedgerMetric {
  label: string;
  tone?: Extract<LedgerRowTone, "amber" | "blue" | "green">;
  unit?: string;
  value: string;
}

export function getLedgerScreenPadding(width: number): number {
  if (width <= 340) return 12;
  return 16;
}

export function LedgerPageHeader({ onBack, title }: { onBack?: () => void; title: string }) {
  return (
    <View style={styles.pageHeader}>
      {onBack ? (
        <Pressable accessibilityRole="button" hitSlop={12} onPress={onBack} style={styles.backButton}>
          <AppIcon color={theme.colors.textPrimary} name="back" size={31} strokeWidth={2.35} />
        </Pressable>
      ) : null}
      <Text numberOfLines={1} style={styles.pageTitle}>
        {title}
      </Text>
    </View>
  );
}

export function LedgerSectionHeader({
  action,
  onAction,
  title,
}: {
  action?: string;
  onAction?: () => void;
  title: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? (
        <Pressable hitSlop={8} onPress={onAction}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function LedgerGlassHero({
  badge,
  badgeTone = "green",
  badgeVariant = "pill",
  children,
  eyebrow,
  metrics,
  title,
}: {
  badge?: string;
  badgeTone?: Extract<LedgerRowTone, "amber" | "blue" | "green">;
  badgeVariant?: "circle" | "pill";
  children?: ReactNode;
  eyebrow: string;
  metrics?: LedgerMetric[];
  title: string;
}) {
  return (
    <View style={styles.hero}>
      <LinearGradient
        colors={["rgba(255,255,255,0.055)", "rgba(255,255,255,0.026)", "rgba(7,10,25,0.10)"]}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.52, 1]}
        pointerEvents="none"
        start={{ x: 0, y: 0 }}
        style={styles.fill}
      />
      <LinearGradient
        colors={["rgba(255,255,255,0.12)", "rgba(255,255,255,0.025)", "rgba(255,255,255,0)"]}
        end={{ x: 1, y: 0 }}
        pointerEvents="none"
        start={{ x: 0, y: 0 }}
        style={styles.heroHighlight}
      />
      <View style={styles.heroTop}>
        <View style={styles.heroCopy}>
          <Text style={styles.heroEyebrow}>{eyebrow}</Text>
          <Text style={styles.heroTitle}>{title}</Text>
        </View>
        {badge && badgeVariant === "circle" ? (
          <LedgerProgressBadge label={badge} tone={badgeTone} />
        ) : badge ? (
          <View
            style={[
              styles.heroPillBadge,
              badgeTone === "amber" && styles.badgeAmber,
              badgeTone === "blue" && styles.badgeBlue,
            ]}
          >
            <Text
              style={[
                styles.heroBadgeText,
                badgeTone === "amber" && styles.amberText,
                badgeTone === "blue" && styles.blueText,
              ]}
            >
              {badge}
            </Text>
          </View>
        ) : null}
      </View>
      {children}
      {metrics ? (
        <View style={styles.metricGrid}>
          {metrics.map((metric) => (
            <View key={metric.label} style={styles.metric}>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <Text
                adjustsFontSizeToFit
                minimumFontScale={0.62}
                numberOfLines={1}
                style={[
                  styles.metricValue,
                  metric.tone === "green" && styles.greenText,
                  metric.tone === "amber" && styles.amberText,
                  metric.tone === "blue" && styles.blueText,
                ]}
              >
                {metric.value}
                {metric.unit ? <Text style={styles.metricUnit}>{metric.unit}</Text> : null}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function LedgerFullBleedList({
  children,
  horizontalPadding,
}: {
  children: ReactNode;
  horizontalPadding: number;
}) {
  return (
    <LinearGradient
      colors={["rgba(255,255,255,0.040)", "rgba(255,255,255,0.030)", "rgba(255,255,255,0.036)"]}
      end={{ x: 1, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={[
        styles.fullBleedList,
        {
          marginLeft: -horizontalPadding,
          marginRight: -horizontalPadding,
          paddingHorizontal: horizontalPadding,
        },
      ]}
    >
      {children}
    </LinearGradient>
  );
}

export function LedgerValueRow({
  icon,
  last,
  onPress,
  subtitle,
  title,
  tone = "default",
  value,
  valueDetail,
}: {
  icon?: AppIconName;
  last?: boolean;
  onPress?: () => void;
  subtitle?: string;
  title: string;
  tone?: LedgerRowTone;
  value?: string;
  valueDetail?: string;
}) {
  const content = (
    <>
      {icon ? (
        <View style={styles.rowIcon}>
          <AppIcon color={getToneColor(tone, true)} name={icon} size={18} strokeWidth={1.85} />
        </View>
      ) : null}
      <View style={styles.rowMain}>
        <Text numberOfLines={1} style={styles.rowTitle}>
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} style={styles.rowSubtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {value ? (
        <View style={styles.valueBox}>
          <Text style={[styles.rowValue, { color: getToneColor(tone) }]}>{value}</Text>
          {valueDetail ? <Text style={styles.rowValueDetail}>{valueDetail}</Text> : null}
        </View>
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={[styles.row, !last && styles.rowDivider]}>
        {content}
      </Pressable>
    );
  }

  return <View style={[styles.row, !last && styles.rowDivider]}>{content}</View>;
}

export function TransactionListRow({
  amount,
  horizontalPadding,
  last,
  onPress,
  time,
  title,
  tone = "default",
}: {
  amount: string;
  horizontalPadding: number;
  last?: boolean;
  onPress?: () => void;
  time?: string;
  title: string;
  tone?: LedgerRowTone;
}) {
  const content = (
    <>
      <Text numberOfLines={1} style={styles.transactionTitle}>
        {title}
        {time ? <Text style={styles.transactionTime}> {time}</Text> : null}
      </Text>
      <Text style={[styles.transactionAmount, { color: getToneColor(tone) }]}>{amount}</Text>
    </>
  );

  const rowStyle = [
    styles.transactionRow,
    {
      paddingHorizontal: horizontalPadding,
    },
    !last && styles.rowDivider,
  ];

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={rowStyle}>
        {content}
      </Pressable>
    );
  }

  return <View style={rowStyle}>{content}</View>;
}

export function TransactionSearchCard<T extends string>({
  activeFilter,
  filterActive,
  filters,
  onChangeText,
  onFilterPress,
  onQuickFilterChange,
  placeholder,
  value,
}: {
  activeFilter: T;
  filterActive?: boolean;
  filters: Array<{ label: string; value: T }>;
  onChangeText: (value: string) => void;
  onFilterPress: () => void;
  onQuickFilterChange: (value: T) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <View style={styles.searchCard}>
      <LinearGradient
        colors={["rgba(255,255,255,0.055)", "rgba(255,255,255,0.030)", "rgba(7,10,25,0.08)"]}
        end={{ x: 1, y: 1 }}
        pointerEvents="none"
        start={{ x: 0, y: 0 }}
        style={styles.fill}
      />
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <AppIcon color={theme.colors.textMuted} name="search" size={18} />
          <TextInput
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.textMuted}
            style={styles.searchInput}
            value={value}
          />
        </View>
        <Pressable accessibilityRole="button" onPress={onFilterPress} style={styles.calendarButton}>
          <AppIcon color={theme.colors.textPrimary} name="calendar" size={20} strokeWidth={2} />
          {filterActive ? <View style={styles.filterDot} /> : null}
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filterRow}>
          {filters.map((filter) => {
            const active = filter.value === activeFilter;
            return (
              <Pressable
                key={filter.value}
                onPress={() => onQuickFilterChange(filter.value)}
                style={[styles.filterChip, active && styles.filterChipActive]}
              >
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

function LedgerProgressBadge({
  label,
  tone,
}: {
  label: string;
  tone: Extract<LedgerRowTone, "amber" | "blue" | "green">;
}) {
  const size = 60;
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = parseProgressValue(label);
  const strokeDashoffset = circumference * (1 - progress / 100);
  const color = getToneColor(tone);

  return (
    <View style={styles.progressBadge}>
      <View style={styles.progressBadgeCore} />
      <Svg height={size} style={styles.progressRing} width={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          fill="transparent"
          r={radius}
          stroke="rgba(255,255,255,0.09)"
          strokeWidth={strokeWidth}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          fill="transparent"
          r={radius}
          stroke={color}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="butt"
          strokeWidth={strokeWidth}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text
        style={[
          styles.progressBadgeText,
          tone === "amber" && styles.amberText,
          tone === "blue" && styles.blueText,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function parseProgressValue(label: string): number {
  const value = Number.parseFloat(label.replace("%", ""));
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

function getToneColor(tone: LedgerRowTone, icon = false): string {
  if (tone === "green") return theme.colors.success;
  if (tone === "amber") return theme.colors.warning;
  if (tone === "blue") return theme.colors.blueText;
  if (tone === "danger") return theme.colors.danger;
  return icon ? theme.colors.textSecondary : theme.colors.textPrimary;
}

function getToneFillColor(tone: Extract<LedgerRowTone, "amber" | "blue" | "green">): string {
  if (tone === "amber") return "rgba(251,191,36,0.075)";
  if (tone === "blue") return "rgba(96,165,250,0.075)";
  return "rgba(74,222,128,0.075)";
}

function getToneBorderColor(tone: Extract<LedgerRowTone, "amber" | "blue" | "green">): string {
  if (tone === "amber") return "rgba(251,191,36,0.20)";
  if (tone === "blue") return "rgba(96,165,250,0.20)";
  return "rgba(74,222,128,0.20)";
}

const styles = StyleSheet.create({
  amberText: {
    color: theme.colors.warning,
  },
  backButton: {
    alignItems: "center",
    height: 38,
    justifyContent: "center",
    marginLeft: -8,
    width: 34,
  },
  badgeAmber: {
    backgroundColor: "rgba(251,191,36,0.12)",
    borderColor: "rgba(251,191,36,0.24)",
  },
  badgeBlue: {
    backgroundColor: "rgba(59,139,255,0.12)",
    borderColor: "rgba(59,139,255,0.24)",
  },
  blueText: {
    color: theme.colors.blueText,
  },
  calendarButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  filterChip: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.09)",
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
    minHeight: 32,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  filterChipActive: {
    backgroundColor: "rgba(255,93,187,0.13)",
    borderColor: "rgba(255,93,187,0.42)",
  },
  filterChipText: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
  },
  filterChipTextActive: {
    color: theme.colors.textPrimary,
  },
  filterDot: {
    backgroundColor: theme.colors.warning,
    borderColor: theme.colors.background,
    borderRadius: 4,
    borderWidth: 1,
    height: 8,
    position: "absolute",
    right: 6,
    top: 6,
    width: 8,
  },
  filterRow: {
    flexDirection: "row",
    gap: 5,
    paddingRight: 6,
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
  },
  fullBleedList: {
    backgroundColor: "rgba(255,255,255,0.035)",
    borderBottomColor: "rgba(255,255,255,0.08)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.08)",
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  greenText: {
    color: theme.colors.success,
  },
  hero: {
    backgroundColor: "rgba(17,21,39,0.82)",
    borderColor: "rgba(255,255,255,0.105)",
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    padding: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 2,
  },
  heroBadgeText: {
    color: theme.colors.success,
    fontSize: 13,
    fontVariant: ["tabular-nums"],
    fontWeight: "900",
  },
  heroCopy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  heroEyebrow: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
  },
  heroHighlight: {
    height: 1,
    left: 14,
    position: "absolute",
    right: 14,
    top: 0,
  },
  heroPillBadge: {
    alignItems: "center",
    backgroundColor: "rgba(74,222,128,0.12)",
    borderColor: "rgba(74,222,128,0.22)",
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 30,
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  heroTitle: {
    color: theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 27,
  },
  heroTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
  },
  metric: {
    backgroundColor: "rgba(255,255,255,0.045)",
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 13,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    gap: 5,
    minHeight: 60,
    minWidth: 0,
    paddingHorizontal: 8,
    paddingVertical: 9,
  },
  metricGrid: {
    flexDirection: "row",
    gap: 7,
    marginTop: 14,
  },
  metricLabel: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
  },
  metricUnit: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: "500",
  },
  metricValue: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontVariant: ["tabular-nums"],
    fontWeight: "900",
  },
  pageHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
    minHeight: 52,
  },
  pageTitle: {
    color: theme.colors.textPrimary,
    flexShrink: 1,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 40,
  },
  progressBadge: {
    alignItems: "center",
    height: 60,
    justifyContent: "center",
    width: 60,
  },
  progressBadgeCore: {
    backgroundColor: "#090c1d",
    borderRadius: 999,
    height: 45,
    position: "absolute",
    width: 45,
  },
  progressBadgeText: {
    color: theme.colors.textPrimary,
    fontSize: 17,
    fontVariant: ["tabular-nums"],
    fontWeight: "800",
  },
  progressRing: {
    left: 0,
    position: "absolute",
    top: 0,
  },
  row: {
    alignItems: "center",
    backgroundColor: "transparent",
    flexDirection: "row",
    gap: 10,
    minHeight: 56,
    paddingVertical: 11,
  },
  rowDivider: {
    borderBottomColor: "rgba(255,255,255,0.08)",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowIcon: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.024)",
    borderColor: "rgba(255,255,255,0.07)",
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  rowMain: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  rowSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  rowTitle: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
  rowValue: {
    fontSize: 14,
    fontVariant: ["tabular-nums"],
    fontWeight: "900",
    textAlign: "right",
  },
  rowValueDetail: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: "700",
    marginTop: 3,
    textAlign: "right",
  },
  searchBox: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.052)",
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    flexDirection: "row",
    gap: 8,
    minHeight: 40,
    paddingLeft: 12,
  },
  searchCard: {
    backgroundColor: "rgba(16,20,38,0.84)",
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 8,
    padding: 13,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 2,
  },
  searchInput: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: 13,
    minHeight: 38,
    paddingHorizontal: 0,
    paddingRight: 10,
  },
  searchRow: {
    flexDirection: "row",
    gap: 8,
  },
  sectionAction: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "800",
  },
  valueBox: {
    alignItems: "flex-end",
    minWidth: 72,
  },
  transactionAmount: {
    fontSize: 15,
    fontVariant: ["tabular-nums"],
    fontWeight: "900",
    marginLeft: 10,
    minWidth: 94,
    textAlign: "right",
  },
  transactionRow: {
    alignItems: "center",
    backgroundColor: "transparent",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 52,
    paddingVertical: 12,
  },
  transactionTime: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  transactionTitle: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
    minWidth: 0,
  },
});
