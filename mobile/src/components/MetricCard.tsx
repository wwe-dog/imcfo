import { StyleSheet, Text, View } from "react-native";

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
    backgroundColor: "#fbfaf3",
    borderColor: "#d5dcc7",
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    width: "48%",
  },
  hint: {
    color: "#65715f",
    fontSize: 12,
    marginTop: 6,
  },
  label: {
    color: "#65715f",
    fontSize: 13,
    marginBottom: 8,
  },
  value: {
    color: "#18201a",
    fontSize: 22,
    fontWeight: "700",
  },
});
