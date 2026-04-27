import { StyleSheet, Text, View } from "react-native";
import { theme } from "../styles/theme";

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
    <View style={styles.block}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.rows}>
        {rows.map((row, index) => (
          <View
            key={`${title}-${row.label}`}
            style={[styles.row, index === rows.length - 1 && styles.rowLast]}
          >
            <Text style={styles.label}>{row.label}</Text>
            <Text style={styles.value}>{row.value}</Text>
          </View>
        ))}
      </View>
      {footer ? (
        <View style={styles.footerBox}>
          <Text style={styles.footerLabel}>说明</Text>
          <Text style={styles.footer}>{footer}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  footer: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  footerBox: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.md,
    gap: 4,
    padding: theme.spacing.md,
  },
  footerLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  header: {
    gap: 4,
  },
  label: {
    color: theme.colors.textSecondary,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    paddingRight: theme.spacing.md,
  },
  row: {
    alignItems: "flex-start",
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "space-between",
    paddingBottom: theme.spacing.md,
    paddingTop: 2,
  },
  rowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  rows: {
    gap: 10,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  value: {
    color: theme.colors.textPrimary,
    flexShrink: 0,
    fontSize: 14,
    fontWeight: "700",
    maxWidth: "46%",
    textAlign: "right",
  },
});
