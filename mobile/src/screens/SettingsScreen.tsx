import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import AppIcon, { type AppIconName } from "../components/AppIcon";
import {
  ActionTile,
  AmountText,
  AppHeader,
  LineListCard,
  LineListRow,
  SectionCard,
  TopBar,
} from "../components/financeUI";
import type { ReportSummary } from "../domain/models";
import { sharedStyles, theme } from "../styles/theme";
import { formatCurrency } from "../utils/formatters";

interface SettingsScreenProps {
  accountCount: number;
  appVersion: string;
  receivableAmount: number;
  summary: ReportSummary;
  storageMode: string;
  transactionCount: number;
  onExport: () => Promise<string>;
  onImport: (serializedData: string) => Promise<void>;
  onOpenAccounts: () => void;
  onOpenAssets: () => void;
  onOpenTransactions: () => void;
  onReset: () => Promise<void>;
  onClear: () => Promise<void>;
}

type SettingsRoute = "root" | "data";

export default function SettingsScreen({
  accountCount,
  appVersion,
  receivableAmount,
  summary,
  storageMode,
  transactionCount,
  onExport,
  onImport,
  onOpenAccounts,
  onOpenAssets,
  onReset,
  onClear,
}: SettingsScreenProps) {
  const [route, setRoute] = useState<SettingsRoute>("root");
  const [exportedJson, setExportedJson] = useState("");
  const [importJson, setImportJson] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const serializedData = await onExport();
      setExportedJson(serializedData);
      Alert.alert("导出成功", "本地数据 JSON 已生成。");
    } catch {
      Alert.alert("导出失败", "无法导出本地数据。");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    if (!importJson.trim()) {
      Alert.alert("缺少导入内容", "请先粘贴完整 JSON。");
      return;
    }

    setIsImporting(true);
    try {
      await onImport(importJson);
      setExportedJson(importJson);
      setImportJson("");
      Alert.alert("导入成功", "本地数据已刷新。");
    } catch {
      Alert.alert("导入失败", "JSON 格式或结构校验失败。");
    } finally {
      setIsImporting(false);
    }
  };

  const confirmReset = () => {
    Alert.alert("确认恢复示例数据", "这会覆盖当前本地数据。", [
      { text: "取消", style: "cancel" },
      { text: "确认恢复", style: "destructive", onPress: () => void onReset() },
    ]);
  };

  const confirmClear = () => {
    Alert.alert("确认清空本地数据", "删除后不可恢复，请确认是否继续。", [
      { text: "取消", style: "cancel" },
      { text: "确认清空", style: "destructive", onPress: () => void onClear() },
    ]);
  };

  if (route === "data") {
    return (
      <View style={styles.stack}>
        <TopBar onBack={() => setRoute("root")} title="数据管理" />

        <SectionCard title="本地数据状态">
          <View style={styles.dataStatusGrid}>
            <StatusStat accent="green" icon="data" label="数据存储方式" value={storageMode} />
            <StatusStat accent="orange" icon="warning" label="最近备份" value="未连接云端" />
            <StatusStat accent="blue" icon="reports" label="交易记录数" value={`${transactionCount} 笔`} />
            <StatusStat accent="purple" icon="profile" label="账户数量" value={`${accountCount} 个`} />
          </View>
        </SectionCard>

        <SectionCard title="常用操作">
          <LineListCard>
            <LineListRow
              accent="blue"
              icon="data"
              onPress={() => void handleExport()}
              subtitle="将本地数据导出为 JSON，方便备份或迁移"
              title={isExporting ? "正在导出..." : "导出数据"}
            />
            <LineListRow
              accent="orange"
              icon="reconcile"
              onPress={confirmReset}
              subtitle="清空当前数据并恢复为系统示例数据"
              title="恢复示例数据"
            />
            <LineListRow
              accent="green"
              icon="data"
              subtitle="从备份 JSON 导入数据，本地覆盖更新"
              title="导入备份"
            />
            <View style={styles.inlineImport}>
              <TextInput
                multiline
                onChangeText={setImportJson}
                placeholder="把完整 JSON 粘贴到这里"
                placeholderTextColor={theme.colors.textMuted}
                style={[sharedStyles.input, sharedStyles.textArea, styles.importArea]}
                textAlignVertical="top"
                value={importJson}
              />
              <Pressable
                accessibilityRole="button"
                disabled={isImporting}
                onPress={() => void handleImport()}
                style={[sharedStyles.primaryButton, isImporting && styles.buttonDisabled]}
              >
                <Text style={sharedStyles.primaryButtonText}>{isImporting ? "正在导入..." : "开始导入"}</Text>
              </Pressable>
            </View>
            <LineListRow
              accent="purple"
              icon="report"
              subtitle="当前数据保存在本机 AsyncStorage 中"
              title="查看存储说明"
            />
          </LineListCard>
          {exportedJson ? (
            <TextInput
              editable={false}
              multiline
              placeholder="导出结果会显示在这里"
              placeholderTextColor={theme.colors.textMuted}
              style={[sharedStyles.input, sharedStyles.textArea, styles.importArea, styles.readOnlyInput]}
              value={exportedJson}
            />
          ) : null}
        </SectionCard>

        <SectionCard title="安全与清理">
          <LineListCard>
            <LineListRow
              accent="blue"
              icon="reconcile"
              subtitle="清理临时状态，保留本地账务数据"
              title="清理缓存"
            />
            <LineListRow
              accent="green"
              icon="filter"
              subtitle="清除筛选与排序设置，恢复默认"
              title="重置筛选条件"
            />
            <LineListRow
              accent="red"
              icon="disabled"
              onPress={confirmClear}
              subtitle="永久删除所有本地数据，无法恢复"
              title="清空本地数据"
            />
          </LineListCard>
        </SectionCard>

        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <AppIcon color={theme.colors.primaryDeep} name="warning" size={28} strokeWidth={2.1} />
          </View>
          <View style={styles.tipCopy}>
            <Text style={styles.tipTitle}>温馨提示</Text>
            <Text style={styles.tipText}>
              IMCFO V{appVersion} 采用本地优先模式，所有数据仅存储在当前设备中，暂无云端同步功能。请定期导出数据以备份，避免设备意外丢失导致数据无法恢复。
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.stack}>
      <AppHeader
        action={
          <Pressable accessibilityRole="button" onPress={() => setRoute("data")} style={styles.headerIconButton}>
            <AppIcon color={theme.colors.primaryDeep} name="settings" size={28} strokeWidth={2.2} />
          </Pressable>
        }
        eyebrow="V0.1"
        subtitle="把自己当成一家公司经营自己"
        title="我为 CFO"
      />

      <View style={styles.profileCard}>
        <View style={styles.profileTopRow}>
          <View style={styles.avatar}>
            <AppIcon color={theme.colors.textMuted} name="profile" size={58} strokeWidth={1.7} />
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.profileName}>财务自由计划中</Text>
            <Text style={styles.profileSubtitle}>长期主义者 · 持续精进</Text>
            <View style={styles.badgeRow}>
              <Text style={styles.greenBadge}>本月已记账 26 笔</Text>
              <Text style={styles.orangeBadge}>连续记账 12 天</Text>
            </View>
          </View>
        </View>

        <View style={styles.profileMetrics}>
          <MetricItem helper="较上月 +2.63%" label="净资产（RMB）" value={formatCurrency(summary.ownerEquity)} />
          <MetricItem helper="较上月 -3.47%" label="待还（RMB）" value={formatCurrency(summary.totalLiabilities)} />
          <MetricItem helper="来自应收款资产" label="待收款（RMB）" value={formatCurrency(receivableAmount)} />
        </View>
      </View>

      <SectionCard title="常用工具">
        <View style={styles.toolGrid}>
          <ActionTile accent="green" icon="data" onPress={() => setRoute("data")} subtitle="查看与管理数据" title="数据管理" />
          <ActionTile accent="orange" icon="reconcile" onPress={confirmReset} subtitle="一键恢复示例" title="恢复示例数据" />
          <ActionTile accent="blue" icon="data" onPress={() => void handleExport()} subtitle="导出记账数据" title="导出数据" />
          <ActionTile accent="purple" icon="settings" subtitle="设置记账偏好" title="记账偏好" />
        </View>
      </SectionCard>

      <SectionCard title="设置与管理">
        <LineListCard>
          <LineListRow accent="orange" icon="account" onPress={onOpenAccounts} subtitle="现金、银行卡、信用卡" title="我的账户" />
          <LineListRow accent="green" icon="asset" onPress={onOpenAssets} subtitle="资产、负债与净资产" title="资产负债管理" />
          <LineListRow accent="blue" icon="reports" subtitle="个人财务三大报表口径" title="报表设置" />
          <LineListRow accent="purple" icon="report" subtitle="本地优先、报表模式与版本说明" title="帮助与说明" />
          <LineListRow
            accent="red"
            icon="warning"
            right={<Text style={styles.versionText}>V{appVersion}</Text>}
            subtitle="当前仍为本地 MVP"
            title="关于我为 CFO"
          />
        </LineListCard>
      </SectionCard>

      <SectionCard title="本月回顾">
        <LineListCard>
          <LineListRow accent="green" icon="chart" subtitle="本月收入较上月增长 6.21%，主因工资及奖金增加。" title="收入继续增长" />
          <LineListRow accent="orange" icon="manage" subtitle="本月支出较上月下降 3.47%，非必要消费减少。" title="支出节奏改善" />
          <LineListRow accent="blue" icon="success" subtitle="负债率 28.6%，整体处于健康水平，继续保持。" title="负债结构稳定" />
        </LineListCard>
      </SectionCard>
    </View>
  );
}

function MetricItem({ helper, label, value }: { helper: string; label: string; value: string }) {
  return (
    <View style={styles.metricItem}>
      <Text style={styles.metricLabel}>{label}</Text>
      <AmountText size="normal">{value}</AmountText>
      <Text style={styles.metricHelper}>{helper}</Text>
    </View>
  );
}

function StatusStat({
  accent,
  icon,
  label,
  value,
}: {
  accent: "blue" | "green" | "orange" | "purple";
  icon: AppIconName;
  label: string;
  value: string;
}) {
  const color = statusAccentColors[accent];

  return (
    <View style={styles.dataStatusItem}>
      <View style={[styles.dataStatusIcon, { backgroundColor: color.bg }]}>
        <AppIcon color={color.fg} name={icon} size={28} strokeWidth={2.1} />
      </View>
      <Text style={styles.dataStatusLabel}>{label}</Text>
      <Text style={[styles.dataStatusValue, { color: color.fg }]}>{value}</Text>
    </View>
  );
}

const statusAccentColors = {
  blue: { bg: theme.colors.blueSoft, fg: theme.colors.blueText },
  green: { bg: theme.colors.greenSoft, fg: theme.colors.greenText },
  orange: { bg: theme.colors.primarySoft, fg: theme.colors.primaryDeep },
  purple: { bg: theme.colors.purpleSoft, fg: theme.colors.purpleText },
};

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radius.pill,
    height: 92,
    justifyContent: "center",
    width: 92,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  dataStatusGrid: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  dataStatusIcon: {
    alignItems: "center",
    borderRadius: theme.radius.pill,
    height: 62,
    justifyContent: "center",
    width: 62,
  },
  dataStatusItem: {
    alignItems: "center",
    borderRightColor: theme.colors.divider,
    borderRightWidth: 1,
    flex: 1,
    gap: 8,
    paddingHorizontal: 2,
  },
  dataStatusLabel: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  dataStatusValue: {
    fontSize: 15,
    fontWeight: "900",
    textAlign: "center",
  },
  greenBadge: {
    backgroundColor: theme.colors.successSoft,
    borderColor: "#BFE8CE",
    borderRadius: theme.radius.md,
    borderWidth: 1,
    color: theme.colors.success,
    fontSize: 13,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  headerIconButton: {
    alignItems: "center",
    borderRadius: theme.radius.pill,
    height: 50,
    justifyContent: "center",
    width: 50,
  },
  importArea: {
    minHeight: 112,
  },
  inlineImport: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
    paddingTop: 2,
  },
  metricHelper: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
  },
  metricItem: {
    borderRightColor: theme.colors.divider,
    borderRightWidth: 1,
    flex: 1,
    gap: 6,
    paddingRight: theme.spacing.sm,
  },
  metricLabel: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  orangeBadge: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.borderStrong,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    color: theme.colors.primaryDeep,
    fontSize: 13,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  profileCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    gap: theme.spacing.lg,
    padding: theme.spacing.lg,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 3,
  },
  profileCopy: {
    flex: 1,
    gap: 5,
  },
  profileMetrics: {
    borderTopColor: theme.colors.divider,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.md,
  },
  profileName: {
    color: theme.colors.textPrimary,
    fontSize: 25,
    fontWeight: "900",
  },
  profileSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  profileTopRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.lg,
  },
  readOnlyInput: {
    color: theme.colors.textMuted,
    marginTop: theme.spacing.md,
  },
  stack: {
    gap: theme.spacing.md,
  },
  tipCard: {
    alignItems: "flex-start",
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.borderStrong,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  tipCopy: {
    flex: 1,
    gap: 6,
  },
  tipIcon: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.pill,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  tipText: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    lineHeight: 23,
  },
  tipTitle: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: "900",
  },
  toolGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  versionText: {
    color: theme.colors.textMuted,
    fontSize: 16,
    fontWeight: "800",
  },
});
