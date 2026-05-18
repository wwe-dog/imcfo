import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import AppIcon from "./AppIcon";

interface ErrorAction {
  label: string;
  onPress: () => void;
}

interface InlineErrorProps {
  message: string;
  subMessage?: string;
  primaryAction?: ErrorAction;
  secondaryAction?: ErrorAction;
  style?: ViewStyle;
}

const AMBER = "#fbbf24";

export default function InlineError({
  message,
  primaryAction,
  secondaryAction,
  style,
  subMessage,
}: InlineErrorProps) {
  const actions = [primaryAction, secondaryAction].filter(Boolean) as ErrorAction[];

  return (
    <View style={[styles.container, style]}>
      <View style={styles.topRow}>
        <View style={styles.iconCircle}>
          <AppIcon color={AMBER} name="warning" size={18} strokeWidth={2.1} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.message}>{message}</Text>
          {subMessage ? <Text style={styles.subMessage}>{subMessage}</Text> : null}
          {actions.length ? (
            <View style={styles.actionRow}>
              {actions.map((action) => (
                <Pressable accessibilityRole="button" key={action.label} onPress={action.onPress} style={styles.actionButton}>
                  <Text style={styles.actionText}>{action.label}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 9999,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  actionText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontWeight: "600",
  },
  container: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(251,191,36,0.45)",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: "100%",
  },
  copy: {
    flex: 1,
  },
  iconCircle: {
    alignItems: "center",
    backgroundColor: "rgba(251,191,36,0.15)",
    borderRadius: 9999,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  message: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 17,
  },
  subMessage: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
  },
  topRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10,
  },
});
