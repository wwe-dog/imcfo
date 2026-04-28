import { StyleSheet, Text, View } from "react-native";
import { sharedStyles, theme } from "../styles/theme";

interface MetricCardProps {
  label: string;
  value: string;
  hint?: string;
  accentColor?: string;
}

export default function MetricCard({
  label,
  value,
  hint,
  accentColor = theme.colors.primary,
}: MetricCardProps) {
  return (
    <View style={[sharedStyles.card, styles.card, { borderColor: accentColor }]}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.accentBadge, { borderColor: accentColor }]}>
          <View style={[styles.accentDot, { backgroundColor: accentColor }]} />
        </View>
      </View>
      <Text style={styles.value}>{value}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  accentBadge: {
    alignItems: "center",
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  accentDot: {
    borderRadius: theme.radius.pill,
    height: 8,
    width: 8,
  },
  card: {
    gap: theme.spacing.sm,
    minHeight: 160,
    width: "48%",
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  hint: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  label: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: "500",
  },
  value: {
    color: theme.colors.textPrimary,
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -1,
    lineHeight: 40,
  },
});
