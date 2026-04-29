import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import AppIcon, { type AppIconName } from "../components/AppIcon";
import { sharedStyles, theme } from "../styles/theme";

interface SettingsScreenProps {
  appVersion: string;
  storageMode: string;
  onExport: () => Promise<string>;
  onImport: (serializedData: string) => Promise<void>;
  onOpenAccounts: () => void;
  onOpenTransactions: () => void;
  onReset: () => Promise<void>;
  onClear: () => Promise<void>;
}

export default function SettingsScreen({
  appVersion,
  storageMode,
  onExport,
  onImport,
  onOpenAccounts,
  onOpenTransactions,
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
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>我</Text>
        </View>
        <Text style={styles.profileName}>我的</Text>
        <Text style={styles.profileSubtitle}>个人经营资料与本地数据管理</Text>
      </View>

      <View style={[sharedStyles.card, styles.listCard]}>
        <Pressable onPress={onOpenAccounts} style={styles.listRow}>
          <SettingsIcon name="account" />
          <View style={styles.listCopy}>
            <Text style={styles.listTitle}>账户管理</Text>
            <Text style={styles.listSubtitle}>现金、银行卡、支付账户和信用卡</Text>
          </View>
          <AppIcon color={theme.colors.textMuted} name="chevronRight" size={17} />
        </Pressable>
        <Pressable onPress={onOpenTransactions} style={[styles.listRow, styles.listRowBorder]}>
          <SettingsIcon name="transaction" />
          <View style={styles.listCopy}>
            <Text style={styles.listTitle}>交易记录</Text>
            <Text style={styles.listSubtitle}>查看、搜索和筛选历史财务事件</Text>
          </View>
          <AppIcon color={theme.colors.textMuted} name="chevronRight" size={17} />
        </Pressable>
        <Pressable style={[styles.listRow, styles.listRowBorder]}>
          <SettingsIcon name="data" />
          <View style={styles.listCopy}>
            <Text style={styles.listTitle}>数据管理</Text>
            <Text style={styles.listSubtitle}>导入 / 导出 / 清理</Text>
          </View>
          <AppIcon color={theme.colors.textMuted} name="chevronRight" size={17} />
        </Pressable>
        <Pressable style={[styles.listRow, styles.listRowBorder]}>
          <SettingsIcon name="settings" />
          <View style={styles.listCopy}>
            <Text style={styles.listTitle}>通用设置</Text>
            <Text style={styles.listSubtitle}>{storageMode} · 数据版本 {appVersion}</Text>
          </View>
          <AppIcon color={theme.colors.textMuted} name="chevronRight" size={17} />
        </Pressable>
      </View>

      <View style={[sharedStyles.card, styles.panel]}>
        <Text style={sharedStyles.sectionTitle}>导出本地数据</Text>
        <Text style={sharedStyles.pageCopy}>导出会生成完整 JSON，便于你手动备份或迁移。</Text>
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
          placeholderTextColor={theme.colors.textMuted}
          style={[sharedStyles.input, sharedStyles.textArea, styles.readOnlyInput, styles.largeTextArea]}
          value={exportedJson}
        />
      </View>

      <View style={[sharedStyles.card, styles.panel]}>
        <Text style={sharedStyles.sectionTitle}>导入本地数据</Text>
        <Text style={sharedStyles.pageCopy}>请粘贴完整 JSON。导入后会替换当前本地数据。</Text>
        <TextInput
          multiline
          onChangeText={setImportJson}
          placeholder="把完整 JSON 粘贴到这里"
          placeholderTextColor={theme.colors.textMuted}
          style={[sharedStyles.input, sharedStyles.textArea, styles.largeTextArea]}
          textAlignVertical="top"
          value={importJson}
        />
        <Pressable
          disabled={isImporting}
          onPress={() => void handleImport()}
          style={[sharedStyles.secondaryButton, isImporting && styles.buttonDisabled]}
        >
          <Text style={sharedStyles.secondaryButtonText}>
            {isImporting ? "正在导入..." : "导入本地数据"}
          </Text>
        </Pressable>
      </View>

      <View style={[sharedStyles.card, styles.panel]}>
        <Text style={sharedStyles.sectionTitle}>重置与清空</Text>
        <Text style={sharedStyles.pageCopy}>恢复示例数据会覆盖当前数据；清空会保留空白数据结构。</Text>
        <Pressable onPress={confirmReset} style={sharedStyles.secondaryButton}>
          <Text style={sharedStyles.secondaryButtonText}>恢复示例数据</Text>
        </Pressable>
        <Pressable onPress={confirmClear} style={styles.dangerButton}>
          <Text style={styles.dangerButtonText}>清空所有本地数据</Text>
        </Pressable>
      </View>
    </View>
  );
}

function SettingsIcon({ name }: { name: AppIconName }) {
  return (
    <View style={styles.listIcon}>
      <AppIcon color={theme.colors.primaryDeep} name={name} size={20} />
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    height: 84,
    justifyContent: "center",
    width: 84,
  },
  avatarText: {
    color: theme.colors.primaryDeep,
    fontSize: 30,
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  dangerButton: {
    alignItems: "center",
    backgroundColor: theme.colors.dangerSoft,
    borderRadius: theme.radius.md,
    justifyContent: "center",
    minHeight: theme.touch.minHeight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
  },
  dangerButtonText: {
    color: theme.colors.danger,
    fontSize: theme.typography.body,
    fontWeight: "700",
  },
  largeTextArea: {
    minHeight: 164,
  },
  listCard: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  listCopy: {
    flex: 1,
  },
  listIcon: {
    alignItems: "center",
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    marginRight: theme.spacing.sm,
    width: 40,
  },
  listRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 14,
  },
  listRowBorder: {
    borderTopColor: theme.colors.divider,
    borderTopWidth: 1,
  },
  listSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  listTitle: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "800",
  },
  panel: {
    gap: 14,
  },
  profileName: {
    color: theme.colors.textPrimary,
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.6,
  },
  profileSection: {
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
  },
  profileSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  readOnlyInput: {
    color: theme.colors.textMuted,
  },
  stack: {
    gap: theme.spacing.md,
  },
});
