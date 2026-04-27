import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { sharedStyles, theme } from "../styles/theme";

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
      <View style={sharedStyles.pageHeader}>
        <Text style={sharedStyles.eyebrow}>Settings</Text>
        <Text style={sharedStyles.pageTitle}>设置</Text>
        <Text style={sharedStyles.pageCopy}>
          V0.1 只管理本地数据，不接入云端、账号或外部同步。
        </Text>
      </View>

      <View style={[sharedStyles.card, styles.panel]}>
        <Text style={sharedStyles.sectionTitle}>当前数据状态</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>数据版本</Text>
          <Text style={styles.metaValue}>{appVersion}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>存储方式</Text>
          <Text style={styles.metaValue}>{storageMode}</Text>
        </View>
      </View>

      <View style={[sharedStyles.card, styles.panel]}>
        <Text style={sharedStyles.sectionTitle}>导出本地数据</Text>
        <Text style={sharedStyles.pageCopy}>
          导出会生成完整的应用数据 JSON，便于手动备份或复制留存。
        </Text>
        <Pressable
          disabled={isExporting}
          onPress={() => void handleExport()}
          style={[sharedStyles.primaryButton, isExporting && styles.buttonDisabled]}
        >
          <Text style={sharedStyles.primaryButtonText}>
            {isExporting ? "正在导出..." : "导出本地数据"}
          </Text>
        </Pressable>
        <TextInput
          editable={false}
          multiline
          placeholder="导出的完整 JSON 会显示在这里"
          placeholderTextColor="#8a9380"
          style={[sharedStyles.input, sharedStyles.textArea, styles.readOnlyInput, styles.largeTextArea]}
          value={exportedJson}
        />
      </View>

      <View style={[sharedStyles.card, styles.panel]}>
        <Text style={sharedStyles.sectionTitle}>导入本地数据</Text>
        <Text style={sharedStyles.pageCopy}>
          请粘贴完整 JSON。导入后会替换当前本地数据，请先确认内容来源可靠。
        </Text>
        <TextInput
          multiline
          onChangeText={setImportJson}
          placeholder="把完整 JSON 粘贴到这里"
          placeholderTextColor="#8a9380"
          style={[sharedStyles.input, sharedStyles.textArea, styles.largeTextArea]}
          textAlignVertical="top"
          value={importJson}
        />
        <Pressable
          disabled={isImporting}
          onPress={() => void handleImport()}
          style={[sharedStyles.primaryButton, isImporting && styles.buttonDisabled]}
        >
          <Text style={sharedStyles.primaryButtonText}>
            {isImporting ? "正在导入..." : "导入本地数据"}
          </Text>
        </Pressable>
      </View>

      <View style={[sharedStyles.card, styles.panel]}>
        <Text style={sharedStyles.sectionTitle}>重置与清空</Text>
        <Text style={sharedStyles.pageCopy}>
          恢复示例数据会覆盖当前数据；清空数据会保留空白数据结构，适合重新开始。
        </Text>
        <Pressable onPress={confirmReset} style={sharedStyles.primaryButton}>
          <Text style={sharedStyles.primaryButtonText}>恢复示例数据</Text>
        </Pressable>
        <Pressable onPress={confirmClear} style={styles.dangerButton}>
          <Text style={styles.dangerButtonText}>清空所有本地数据</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonDisabled: {
    opacity: 0.65,
  },
  dangerButton: {
    alignItems: "center",
    backgroundColor: theme.colors.dangerSoft,
    borderColor: theme.colors.dangerSoft,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: theme.touch.minHeight,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  dangerButtonText: {
    color: theme.colors.danger,
    fontSize: theme.typography.body,
    fontWeight: "700",
  },
  largeTextArea: {
    minHeight: 164,
  },
  metaLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaValue: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: "700",
    maxWidth: "58%",
    textAlign: "right",
  },
  panel: {
    gap: theme.spacing.md,
  },
  readOnlyInput: {
    color: theme.colors.textMuted,
  },
  stack: {
    gap: theme.spacing.xl,
  },
});
