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
        <View>
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
    gap: theme.spacing.md,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    color: theme.colors.textSecondary,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    paddingRight: theme.spacing.md,
  },
  row: {
    alignItems: "center",
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "space-between",
    paddingBottom: theme.spacing.sm,
  },
  rowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  rows: {
    gap: theme.spacing.sm,
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
    opacity: 0.45,
    transform: [{ rotate: "-8deg" }],
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: theme.spacing.xs,
    maxWidth: 220,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  value: {
    color: theme.colors.textPrimary,
    flexShrink: 0,
    fontSize: 14,
    fontWeight: "700",
    maxWidth: "48%",
    textAlign: "right",
  },
});
