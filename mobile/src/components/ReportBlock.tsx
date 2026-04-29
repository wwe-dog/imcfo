import { StyleSheet, Text, View } from "react-native";
import { sharedStyles, theme } from "../styles/theme";

interface ReportBlockProps {
  title: string;
  subtitle?: string;
  rows: Array<{
    label: string;
    value: string;
  }>;
  footer?: string;
}

export default function ReportBlock({ title, subtitle, rows, footer }: ReportBlockProps) {
  return (
    <View style={[sharedStyles.card, styles.block]}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <View style={styles.sparkline}>
          <View style={styles.sparklineLine} />
          <View style={styles.sparklineDot} />
        </View>
      </View>

      <View style={styles.rows}>
        {rows.map((row, index) => (
          <View key={`${title}-${row.label}`} style={[styles.row, index === rows.length - 1 && styles.rowLast]}>
            <Text style={styles.label}>{row.label}</Text>
            <Text style={styles.value}>{row.value}</Text>
          </View>
        ))}
      </View>

      {footer ? (
        <View style={sharedStyles.helperBox}>
          <Text style={sharedStyles.helperTitle}>说明</Text>
          <Text style={sharedStyles.helperText}>{footer}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: 14,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerCopy: {
    flex: 1,
    paddingRight: theme.spacing.md,
  },
  label: {
    color: theme.colors.textSecondary,
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    paddingRight: theme.spacing.md,
  },
  row: {
    alignItems: "center",
    borderBottomColor: theme.colors.divider,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "space-between",
    minHeight: 42,
    paddingVertical: 8,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rows: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    overflow: "hidden",
    paddingHorizontal: 12,
  },
  sparkline: {
    alignItems: "flex-end",
    justifyContent: "center",
    minHeight: 28,
    width: 76,
  },
  sparklineDot: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.pill,
    height: 8,
    marginTop: -3,
    width: 8,
  },
  sparklineLine: {
    alignSelf: "stretch",
    borderTopColor: theme.colors.primaryDeep,
    borderTopWidth: 2,
    borderTopLeftRadius: theme.radius.pill,
    borderTopRightRadius: theme.radius.pill,
    opacity: 0.32,
    transform: [{ rotate: "-8deg" }],
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: theme.spacing.xs,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  value: {
    color: theme.colors.textPrimary,
    flexShrink: 0,
    fontSize: 14,
    fontWeight: "900",
    maxWidth: "48%",
    textAlign: "right",
  },
});
