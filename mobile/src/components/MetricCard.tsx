import { StyleSheet, Text, View } from "react-native";
import { theme } from "../styles/theme";

interface MetricCardProps {
  label: string;
  value: string;
  hint?: string;
}

export default function MetricCard({ label, value, hint }: MetricCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    minHeight: 132,
    padding: theme.spacing.lg,
    width: "48%",
  },
  hint: {
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: theme.spacing.sm,
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: 13,
    marginBottom: theme.spacing.sm,
  },
  value: {
    color: theme.colors.textPrimary,
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 30,
  },
});
