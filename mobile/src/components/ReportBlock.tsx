import { StyleSheet, Text, View } from "react-native";

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
      {rows.map((row) => (
        <View key={row.label} style={styles.row}>
          <Text style={styles.label}>{row.label}</Text>
          <Text style={styles.value}>{row.value}</Text>
        </View>
      ))}
      {footer ? <Text style={styles.footer}>{footer}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: "#fbfaf3",
    borderColor: "#d5dcc7",
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  footer: {
    color: "#65715f",
    fontSize: 13,
    lineHeight: 20,
  },
  header: {
    gap: 4,
  },
  label: {
    color: "#50604d",
    flex: 1,
    fontSize: 14,
  },
  row: {
    alignItems: "center",
    borderBottomColor: "#e3e8d7",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    paddingBottom: 10,
  },
  title: {
    color: "#18201a",
    fontSize: 18,
    fontWeight: "700",
  },
  subtitle: {
    color: "#65715f",
    fontSize: 13,
    lineHeight: 18,
  },
  value: {
    color: "#18201a",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "right",
  },
});
