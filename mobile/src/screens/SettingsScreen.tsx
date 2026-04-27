import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useState } from "react";

interface SettingsScreenProps {
  appVersion: string;
  storageMode: string;
  onExport: () => Promise<string>;
  onImport: (serializedData: string) => Promise<void>;
  onReset: () => Promise<void>;
  onClear: () => Promise<void>;
}

export default function SettingsScreen({
  appVersion,
  storageMode,
  onExport,
  onImport,
  onReset,
  onClear,
}: SettingsScreenProps) {
  const [exportedJson, setExportedJson] = useState("");
  const [importJson, setImportJson] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const serializedData = await onExport();
      setExportedJson(serializedData);
      Alert.alert("导出成功", "完整数据 JSON 已生成，并显示在下方导出区域。");
    } catch {
      Alert.alert("导出失败", "无法导出本地数据。");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    if (!importJson.trim()) {
      Alert.alert("缺少导入内容", "请先粘贴完整的 JSON 数据。");
      return;
    }

    setIsImporting(true);
    try {
      await onImport(importJson);
      setExportedJson(importJson);
      setImportJson("");
      Alert.alert("导入成功", "本地数据已被新 JSON 替换，首页和报表会按新数据刷新。");
    } catch {
      Alert.alert("导入失败", "JSON 格式或数据结构校验失败，未完成导入。");
    } finally {
      setIsImporting(false);
    }
  };

  const confirmReset = () => {
    Alert.alert("确认恢复示例数据", "这会覆盖当前本地数据，并恢复为示例数据。", [
      { text: "取消", style: "cancel" },
      { text: "确认恢复", style: "destructive", onPress: () => void onReset() },
    ]);
  };

  const confirmClear = () => {
    Alert.alert("确认清空本地数据", "这会删除当前本地数据，并保留空白数据结构。", [
      { text: "取消", style: "cancel" },
      { text: "确认清空", style: "destructive", onPress: () => void onClear() },
    ]);
  };

  return (
    <View style={styles.stack}>
      <View>
        <Text style={styles.eyebrow}>Settings</Text>
        <Text style={styles.title}>设置</Text>
        <Text style={styles.copy}>V0.1 只管理本地数据，不接入云端、账号或外部同步。</Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>当前数据状态</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>数据版本</Text>
          <Text style={styles.metaValue}>{appVersion}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>存储方式</Text>
          <Text style={styles.metaValue}>{storageMode}</Text>
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>导出本地数据</Text>
        <Text style={styles.copy}>导出会生成完整的应用数据 JSON，便于手动备份或复制留存。</Text>
        <Pressable onPress={() => void handleExport()} style={styles.button} disabled={isExporting}>
          <Text style={styles.buttonText}>{isExporting ? "正在导出..." : "导出本地数据"}</Text>
        </Pressable>
        <TextInput
          multiline
          editable={false}
          placeholder="导出的完整 JSON 会显示在这里"
          placeholderTextColor="#8a9380"
          style={[styles.input, styles.textArea, styles.readOnlyInput]}
          value={exportedJson}
        />
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>导入本地数据</Text>
        <Text style={styles.copy}>请粘贴完整 JSON。导入后会替换当前本地数据，请先确认内容来源可靠。</Text>
        <TextInput
          multiline
          placeholder="把完整 JSON 粘贴到这里"
          placeholderTextColor="#8a9380"
          style={[styles.input, styles.textArea]}
          value={importJson}
          onChangeText={setImportJson}
          textAlignVertical="top"
        />
        <Pressable onPress={() => void handleImport()} style={styles.button} disabled={isImporting}>
          <Text style={styles.buttonText}>{isImporting ? "正在导入..." : "导入本地数据"}</Text>
        </Pressable>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>重置与清空</Text>
        <Text style={styles.copy}>恢复示例数据会覆盖当前数据；清空数据会保留空白数据结构，适合重新开始。</Text>
        <Pressable onPress={confirmReset} style={styles.button}>
          <Text style={styles.buttonText}>恢复示例数据</Text>
        </Pressable>
        <Pressable onPress={confirmClear} style={[styles.button, styles.dangerButton]}>
          <Text style={[styles.buttonText, styles.dangerText]}>清空所有本地数据</Text>
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
  input: {
    backgroundColor: "#fffef8",
    borderColor: "#cbd5bf",
    borderRadius: 10,
    borderWidth: 1,
    color: "#18201a",
    padding: 12,
  },
  metaLabel: {
    color: "#50604d",
    fontSize: 14,
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaValue: {
    color: "#18201a",
    fontSize: 14,
    fontWeight: "700",
    maxWidth: "58%",
    textAlign: "right",
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
  readOnlyInput: {
    color: "#65715f",
  },
  stack: {
    gap: 20,
  },
  textArea: {
    minHeight: 160,
  },
  title: {
    color: "#18201a",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },
});
