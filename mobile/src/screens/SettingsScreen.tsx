import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

interface SettingsScreenProps {
  onExport: () => Promise<void>;
  onReset: () => Promise<void>;
}

export default function SettingsScreen({ onExport, onReset }: SettingsScreenProps) {
  const confirmReset = () => {
    Alert.alert("确认清空数据", "这会恢复为本地示例数据。", [
      { text: "取消", style: "cancel" },
      { text: "确认", style: "destructive", onPress: () => void onReset() },
    ]);
  };

  return (
    <View style={styles.stack}>
      <View>
        <Text style={styles.eyebrow}>Settings</Text>
        <Text style={styles.title}>设置</Text>
        <Text style={styles.copy}>V0.1 只处理基础配置和本地数据管理。</Text>
      </View>
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>本地数据</Text>
        <Text style={styles.copy}>当前数据保存在本机 AsyncStorage 中，屏幕不会直接访问存储。</Text>
        <Pressable onPress={() => void onExport()} style={styles.button}>
          <Text style={styles.buttonText}>导出数据</Text>
        </Pressable>
        <Pressable onPress={confirmReset} style={[styles.button, styles.dangerButton]}>
          <Text style={[styles.buttonText, styles.dangerText]}>清空并恢复示例数据</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: "#17251b",
    borderRadius: 10,
    padding: 14,
  },
  buttonText: {
    color: "#f8f4e7",
    fontWeight: "700",
  },
  copy: {
    color: "#50604d",
    fontSize: 14,
    lineHeight: 22,
  },
  dangerButton: {
    backgroundColor: "#f5ded8",
  },
  dangerText: {
    color: "#9b2f20",
  },
  eyebrow: {
    color: "#7f8c54",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
  },
  panel: {
    backgroundColor: "#fbfaf3",
    borderColor: "#d5dcc7",
    borderRadius: 12,
    borderWidth: 1,
    gap: 14,
    padding: 16,
  },
  panelTitle: {
    color: "#18201a",
    fontSize: 17,
    fontWeight: "700",
  },
  stack: {
    gap: 20,
  },
  title: {
    color: "#18201a",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },
});
