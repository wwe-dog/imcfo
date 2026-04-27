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
    backgroundColor: "#fbfaf3",
    borderColor: "#d5dcc7",
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
    padding: 16,
  },
  footer: {
    color: "#5e6b5a",
    fontSize: 13,
    lineHeight: 20,
  },
  footerBox: {
    backgroundColor: "#f3f6ec",
    borderRadius: 12,
    gap: 4,
    padding: 12,
  },
  footerLabel: {
    color: "#7f8c54",
    fontSize: 12,
    fontWeight: "700",
  },
  header: {
    gap: 4,
  },
  label: {
    color: "#50604d",
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    paddingRight: 12,
  },
  row: {
    alignItems: "flex-start",
    borderBottomColor: "#e3e8d7",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    paddingBottom: 12,
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
    color: "#65715f",
    fontSize: 13,
    lineHeight: 18,
  },
  title: {
    color: "#18201a",
    fontSize: 18,
    fontWeight: "700",
  },
  value: {
    color: "#18201a",
    flexShrink: 0,
    fontSize: 14,
    fontWeight: "700",
    maxWidth: "46%",
    textAlign: "right",
  },
});
