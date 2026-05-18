import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, TextInput, View, type ViewStyle } from "react-native";
import AppIcon, { type AppIconName } from "./AppIcon";
import { theme } from "../styles/theme";

type Accent = "blue" | "green" | "orange" | "purple" | "red";

const accentColors: Record<Accent, { bg: string; fg: string }> = {
  blue: { bg: theme.colors.blueSoft, fg: theme.colors.blueText },
  green: { bg: theme.colors.greenSoft, fg: theme.colors.greenText },
  orange: { bg: theme.colors.warningSoft, fg: theme.colors.warning },
  purple: { bg: theme.colors.purpleSoft, fg: theme.colors.purpleText },
  red: { bg: theme.colors.dangerSoft, fg: theme.colors.danger },
};

export function IconTile({
  accent = "orange",
  icon,
  size = 40,
}: {
  accent?: Accent;
  icon: AppIconName;
  size?: number;
}) {
  const colors = accentColors[accent];
  return (
    <View style={[styles.iconTile, { backgroundColor: colors.bg, height: size, width: size }]}>
      <AppIcon color={colors.fg} name={icon} size={Math.round(size * 0.52)} strokeWidth={2.1} />
    </View>
  );
}

export const IconBadge = IconTile;

export function TopBar({
  onBack,
  onRightPress,
  rightIcon = "add",
  rightLabel,
  title,
}: {
  onBack?: () => void;
  onRightPress?: () => void;
  rightIcon?: AppIconName;
  rightLabel?: string;
  title: string;
}) {
  return (
    <View style={styles.topBar}>
      {onBack ? (
        <Pressable onPress={onBack} style={styles.topBarButton}>
          <AppIcon color={theme.colors.textPrimary} name="back" size={22} strokeWidth={2.3} />
        </Pressable>
      ) : (
        <View style={styles.topBarButton} />
      )}
      <Text numberOfLines={1} style={styles.topBarTitle}>
        {title}
      </Text>
      {onRightPress ? (
        <Pressable onPress={onRightPress} style={[styles.topBarButton, styles.topBarRightButton]}>
          {rightLabel ? <Text style={styles.topBarRightText}>{rightLabel}</Text> : <AppIcon color={theme.colors.textInverse} name={rightIcon} size={20} strokeWidth={2.4} />}
        </Pressable>
      ) : (
        <View style={styles.topBarButton} />
      )}
    </View>
  );
}

export function ScreenShell({
  children,
  compact = false,
}: {
  children: ReactNode;
  compact?: boolean;
}) {
  return <View style={[styles.screenShell, compact && styles.screenShellCompact]}>{children}</View>;
}

export function AppHeader({
  action,
  eyebrow,
  subtitle,
  title,
}: {
  action?: ReactNode;
  eyebrow?: string;
  subtitle?: string;
  title: string;
}) {
  return (
    <View style={styles.appHeader}>
      <View style={styles.appHeaderCopy}>
        {eyebrow ? <Text style={styles.appHeaderEyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.appHeaderTitle}>{title}</Text>
        {subtitle ? <Text style={styles.appHeaderSubtitle}>{subtitle}</Text> : null}
      </View>
      {action ? <View style={styles.appHeaderAction}>{action}</View> : null}
    </View>
  );
}

export function SummaryHeroCard({
  children,
  style,
}: {
  children: ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.summaryHero, style]}>{children}</View>;
}

export function StatBlock({
  icon,
  label,
  value,
  accent = "orange",
  helper,
}: {
  accent?: Accent;
  helper?: string;
  icon?: AppIconName;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.statBlock}>
      {icon ? <IconTile accent={accent} icon={icon} size={42} /> : null}
      <View style={styles.statCopy}>
        <Text style={styles.statLabel}>{label}</Text>
        <AmountText size="large">{value}</AmountText>
        {helper ? <Text style={styles.statHelper}>{helper}</Text> : null}
      </View>
    </View>
  );
}

export function AmountText({
  children,
  tone = "default",
  size = "normal",
}: {
  children: ReactNode;
  tone?: "default" | "negative" | "positive";
  size?: "hero" | "large" | "normal";
}) {
  return <Text style={[styles.amount, styles[`amount_${tone}`], styles[`amountSize_${size}`]]}>{children}</Text>;
}

export function SectionCard({
  children,
  right,
  title,
}: {
  children: ReactNode;
  right?: ReactNode;
  title?: string;
}) {
  return (
    <View style={styles.sectionCard}>
      {title ? (
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleMark} />
          <Text style={styles.sectionTitle}>{title}</Text>
          <View style={styles.sectionRight}>{right}</View>
        </View>
      ) : null}
      {children}
    </View>
  );
}

export function SectionHeader({ right, title }: { right?: ReactNode; title: string }) {
  return (
    <View style={styles.standaloneSectionHeader}>
      <View style={styles.sectionTitleMark} />
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionRight}>{right}</View>
    </View>
  );
}

export function LineListCard({ children }: { children: ReactNode }) {
  return <View style={styles.lineListCard}>{children}</View>;
}

export function SearchFilterBar({
  filterActive,
  onChangeText,
  onFilterPress,
  placeholder,
  value,
}: {
  filterActive?: boolean;
  onChangeText: (value: string) => void;
  onFilterPress: () => void;
  placeholder: string;
  value: string;
}) {
  return (
    <View style={styles.searchFilterRow}>
      <View style={styles.searchBox}>
        <AppIcon color={theme.colors.textMuted} name="search" size={21} strokeWidth={2.1} />
        <TextInput
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          style={styles.searchInput}
          value={value}
        />
      </View>
      <Pressable onPress={onFilterPress} style={styles.filterButton}>
        <AppIcon color={theme.colors.primary} name="calendar" size={21} strokeWidth={2.1} />
        {filterActive ? <View style={styles.filterDot} /> : null}
      </Pressable>
    </View>
  );
}

export function MetaStrip({
  items,
}: {
  items: Array<{ label: string; value: string }>;
}) {
  return (
    <View style={styles.metaStrip}>
      {items.map((item, index) => (
        <View
          key={`${item.label}-${index}`}
          style={[styles.metaItem, index < items.length - 1 && styles.metaItemWithDivider]}
        >
          <Text style={styles.metaLabel}>{item.label}</Text>
          <Text style={styles.metaValue}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

export function LineListRow({
  accent = "orange",
  amount,
  icon,
  onPress,
  right,
  subtitle,
  title,
}: {
  accent?: Accent;
  amount?: string;
  icon?: AppIconName;
  onPress?: () => void;
  right?: ReactNode;
  subtitle?: string;
  title: string;
}) {
  const Container = onPress ? Pressable : View;
  return (
    <Container onPress={onPress} style={styles.lineRow}>
      {icon ? <IconTile accent={accent} icon={icon} /> : null}
      <View style={styles.lineMain}>
        <Text numberOfLines={1} style={styles.lineTitle}>
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} style={styles.lineSubtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {amount ? <Text style={styles.lineAmount}>{amount}</Text> : right}
      {onPress ? <AppIcon color={theme.colors.textMuted} name="chevronRight" size={16} /> : null}
    </Container>
  );
}

export function InfoLineRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <View style={styles.infoLineRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      {typeof value === "string" ? <Text style={styles.infoValue}>{value}</Text> : <View style={styles.infoValueNode}>{value}</View>}
    </View>
  );
}

export function StatusTag({
  tone = "green",
  text,
}: {
  text: string;
  tone?: "green" | "orange" | "red";
}) {
  const toneStyle = tone === "red" ? styles.statusRed : tone === "orange" ? styles.statusOrange : styles.statusGreen;
  return <Text style={[styles.statusTag, toneStyle]}>{text}</Text>;
}

export function BottomSheetFrame({
  children,
  onClose,
  onSave,
  saveDisabled,
  saveLabel = "保存",
  title,
}: {
  children: ReactNode;
  onClose: () => void;
  onSave?: () => void;
  saveDisabled?: boolean;
  saveLabel?: string;
  title: string;
}) {
  return (
    <Pressable onPress={onClose} style={styles.sheetBackdrop}>
      <Pressable onPress={(event) => event.stopPropagation()} style={styles.sheetPanel}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetHeader}>
          <Pressable onPress={onClose} style={styles.sheetHeaderButton}>
            <Text style={styles.sheetCancelText}>取消</Text>
          </Pressable>
          <Text numberOfLines={1} style={styles.sheetTitle}>
            {title}
          </Text>
          {onSave ? (
            <Pressable disabled={saveDisabled} onPress={onSave} style={styles.sheetHeaderButton}>
              <Text style={[styles.sheetSaveText, saveDisabled && styles.sheetSaveTextDisabled]}>{saveLabel}</Text>
            </Pressable>
          ) : (
            <View style={styles.sheetHeaderButton} />
          )}
        </View>
        {children}
      </Pressable>
    </Pressable>
  );
}

export function SegmentedControl<T extends string>({
  onChange,
  options,
  value,
}: {
  onChange: (value: T) => void;
  options: Array<{ label: string; value: T }>;
  value: T;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.segment, active && styles.segmentActive]}
          >
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const SegmentedSwitch = SegmentedControl;

export const BottomSheetForm = BottomSheetFrame;

export function ActionTile({
  accent = "orange",
  icon,
  onPress,
  subtitle,
  title,
}: {
  accent?: Accent;
  icon: AppIconName;
  onPress?: () => void;
  subtitle: string;
  title: string;
}) {
  return (
    <Pressable onPress={onPress} style={styles.actionTile}>
      <IconTile accent={accent} icon={icon} size={34} />
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionSubtitle}>{subtitle}</Text>
    </Pressable>
  );
}

export function FloatingAddButton({
  label,
  onPress,
}: {
  label?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.floatingAddButton}>
      <AppIcon color={theme.colors.textInverse} name="add" size={20} strokeWidth={2.4} />
      {label ? <Text style={styles.floatingAddText}>{label}</Text> : null}
    </Pressable>
  );
}

export function ReportPreviewCard({
  footerLabel = "查看完整报表",
  rows,
  title,
}: {
  footerLabel?: string;
  rows: Array<{ emphasis?: boolean; label: string; value: string }>;
  title: string;
}) {
  return (
    <View style={styles.reportPreviewCard}>
      <View style={styles.reportPreviewHeader}>
        <Text style={styles.reportPreviewTitle}>{title}</Text>
        <Text style={styles.reportPreviewStatus}>预览</Text>
      </View>
      <View style={styles.reportPreviewTable}>
        {rows.map((row, index) => (
          <View
            key={`${row.label}-${index}`}
            style={[
              styles.reportPreviewRow,
              index < rows.length - 1 && styles.reportPreviewRowDivider,
              row.emphasis && styles.reportPreviewRowEmphasis,
            ]}
          >
            <Text style={[styles.reportPreviewLabel, row.emphasis && styles.reportPreviewLabelEmphasis]}>
              {row.label}
            </Text>
            <Text style={[styles.reportPreviewValue, row.emphasis && styles.reportPreviewValueEmphasis]}>
              {row.value}
            </Text>
          </View>
        ))}
      </View>
      <Text style={styles.reportPreviewFooter}>{footerLabel}</Text>
    </View>
  );
}

export function DangerActionButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.dangerAction}>
      <AppIcon color={theme.colors.danger} name="disabled" size={18} strokeWidth={2.2} />
      <Text style={styles.dangerActionText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screenShell: {
    gap: theme.spacing.md,
  },
  screenShellCompact: {
    gap: 12,
  },
  appHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "space-between",
  },
  appHeaderAction: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  appHeaderCopy: {
    flex: 1,
    gap: 4,
  },
  appHeaderEyebrow: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  appHeaderSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  appHeaderTitle: {
    color: theme.colors.textPrimary,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  actionSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  actionTile: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flex: 1,
    gap: 5,
    minHeight: 116,
    padding: 12,
  },
  actionTitle: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: "900",
  },
  amount: {
    fontWeight: "900",
    letterSpacing: -0.6,
  },
  amount_default: {
    color: theme.colors.textPrimary,
  },
  amount_negative: {
    color: theme.colors.danger,
  },
  amount_positive: {
    color: theme.colors.success,
  },
  amountSize_hero: {
    fontSize: 40,
    lineHeight: 48,
  },
  amountSize_large: {
    fontSize: 28,
    lineHeight: 36,
  },
  amountSize_normal: {
    fontSize: 17,
    lineHeight: 23,
  },
  iconTile: {
    alignItems: "center",
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
  },
  dangerAction: {
    alignItems: "center",
    backgroundColor: theme.colors.dangerSoft,
    borderColor: "#FFC7C1",
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: theme.spacing.md,
  },
  dangerActionText: {
    color: theme.colors.danger,
    fontSize: 16,
    fontWeight: "900",
  },
  floatingAddButton: {
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.pill,
    bottom: 8,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: 18,
    position: "absolute",
    right: 0,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 4,
  },
  floatingAddText: {
    color: theme.colors.textInverse,
    fontSize: 15,
    fontWeight: "900",
  },
  filterButton: {
    alignItems: "center",
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    height: 54,
    justifyContent: "center",
    width: 54,
  },
  filterDot: {
    backgroundColor: theme.colors.danger,
    borderColor: theme.colors.background,
    borderRadius: 4,
    borderWidth: 1,
    height: 8,
    position: "absolute",
    right: 11,
    top: 11,
    width: 8,
  },
  lineAmount: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "900",
    maxWidth: 128,
    textAlign: "right",
  },
  lineListCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    overflow: "hidden",
    paddingHorizontal: 18,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 3,
  },
  lineMain: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  lineRow: {
    alignItems: "center",
    borderBottomColor: theme.colors.divider,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.sm,
    minHeight: 76,
    paddingVertical: 13,
  },
  lineSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  lineTitle: {
    color: theme.colors.textPrimary,
    fontSize: 17,
    fontWeight: "900",
  },
  metaItem: {
    flex: 1,
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  metaItemWithDivider: {
    borderRightColor: theme.colors.divider,
    borderRightWidth: 1,
  },
  metaLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
  },
  metaStrip: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 3,
  },
  metaValue: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "900",
  },
  reportPreviewCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    gap: 12,
    padding: theme.spacing.md,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 3,
  },
  reportPreviewFooter: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: "900",
  },
  reportPreviewHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  reportPreviewLabel: {
    color: theme.colors.textSecondary,
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
  },
  reportPreviewLabelEmphasis: {
    color: theme.colors.textPrimary,
    fontWeight: "900",
  },
  reportPreviewRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
    minHeight: 42,
    paddingVertical: 6,
  },
  reportPreviewRowDivider: {
    borderBottomColor: theme.colors.divider,
    borderBottomWidth: 1,
  },
  reportPreviewRowEmphasis: {
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radius.md,
    marginHorizontal: -4,
    paddingHorizontal: 4,
  },
  reportPreviewStatus: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  reportPreviewTable: {
    borderColor: theme.colors.divider,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  reportPreviewTitle: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: "900",
  },
  reportPreviewValue: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "900",
    textAlign: "right",
  },
  reportPreviewValueEmphasis: {
    color: theme.colors.primary,
  },
  infoLabel: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    fontWeight: "700",
    minWidth: 92,
  },
  infoLineRow: {
    alignItems: "center",
    borderBottomColor: theme.colors.divider,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.md,
    minHeight: 52,
    paddingVertical: 12,
  },
  infoValue: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 22,
    textAlign: "right",
  },
  infoValueNode: {
    alignItems: "flex-end",
    flex: 1,
  },
  sectionCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    padding: 18,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 3,
  },
  searchBox: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: theme.spacing.sm,
    minHeight: 54,
    paddingHorizontal: theme.spacing.md,
  },
  searchFilterRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  searchInput: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: 16,
    minHeight: 48,
    padding: 0,
  },
  sheetBackdrop: {
    backgroundColor: "rgba(2, 5, 15, 0.68)",
    flex: 1,
    justifyContent: "flex-end",
    paddingTop: theme.spacing.xl,
  },
  sheetCancelText: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    fontWeight: "800",
  },
  sheetHandle: {
    alignSelf: "center",
    backgroundColor: theme.colors.borderStrong,
    borderRadius: theme.radius.pill,
    height: 6,
    marginTop: 12,
    width: 54,
  },
  sheetHeader: {
    alignItems: "center",
    borderBottomColor: theme.colors.divider,
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: 64,
    paddingHorizontal: theme.spacing.lg,
  },
  sheetHeaderButton: {
    minWidth: 62,
    paddingVertical: 10,
  },
  sheetPanel: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    maxHeight: "88%",
    overflow: "hidden",
  },
  sheetSaveText: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: "900",
    textAlign: "right",
  },
  sheetSaveTextDisabled: {
    color: theme.colors.textMuted,
  },
  sheetTitle: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  standaloneSectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  sectionRight: {
    alignItems: "flex-end",
    flex: 1,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: "900",
  },
  sectionTitleMark: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.pill,
    height: 24,
    width: 4,
  },
  segment: {
    alignItems: "center",
    borderRadius: theme.radius.md,
    flex: 1,
    justifyContent: "center",
    minHeight: 42,
  },
  segmentActive: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primary,
    borderWidth: 1,
  },
  segmentText: {
    color: theme.colors.textMuted,
    fontSize: 15,
    fontWeight: "800",
  },
  segmentTextActive: {
    color: theme.colors.primary,
  },
  segmented: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    padding: 3,
  },
  statBlock: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  statCopy: {
    flex: 1,
    gap: 3,
  },
  statHelper: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: "800",
  },
  statusGreen: {
    backgroundColor: theme.colors.successSoft,
    borderColor: "#BFE8CE",
    color: theme.colors.success,
  },
  statusOrange: {
    backgroundColor: theme.colors.warningSoft,
    borderColor: "rgba(251, 191, 36, 0.24)",
    color: theme.colors.warning,
  },
  statusRed: {
    backgroundColor: theme.colors.dangerSoft,
    borderColor: "#FFC7C1",
    color: theme.colors.danger,
  },
  statusTag: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    fontSize: 13,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  summaryHero: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    padding: theme.spacing.md,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 3,
  },
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
    minHeight: 62,
  },
  topBarButton: {
    alignItems: "center",
    borderRadius: theme.radius.pill,
    height: 48,
    justifyContent: "center",
    minWidth: 48,
  },
  topBarRightButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
  },
  topBarRightText: {
    color: theme.colors.textInverse,
    fontSize: 15,
    fontWeight: "900",
  },
  topBarTitle: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.4,
    textAlign: "center",
  },
});
