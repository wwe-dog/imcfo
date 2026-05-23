import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from "react-native";
import AppIcon, { type AppIconName } from "../components/AppIcon";
import {
  LedgerFullBleedList,
  LedgerGlassHero,
  LedgerPageHeader,
  LedgerSectionHeader,
  LedgerValueRow,
  getLedgerScreenPadding,
  type LedgerRowTone,
} from "../components/LedgerUI";
import type { AppSettings, ReportSummary } from "../domain/models";
import { theme } from "../styles/theme";
import { formatCurrency } from "../utils/formatters";

interface SettingsScreenProps {
  accountCount: number;
  appVersion: string;
  receivableAmount: number;
  settings: AppSettings;
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
  onSaveSettings: (settings: Partial<AppSettings>) => Promise<void>;
}

type SettingsRoute =
  | { name: "root" }
  | { name: "data" }
  | { name: "reportSettings" }
  | { name: "preferences" }
  | { name: "help" }
  | { name: "about" }
  | { name: "storageInfo" };

type DetailRow = {
  icon?: AppIconName;
  label: string;
  tone?: LedgerRowTone;
  value: string;
};

const formatHeroCurrency = (value: number): string => {
  const sign = value < 0 ? "-" : "";
  const absoluteValue = Math.abs(value);

  if (absoluteValue >= 100000000) {
    const digits = absoluteValue >= 1000000000 ? 1 : 2;
    return `${sign}¥${(absoluteValue / 100000000).toFixed(digits)}亿`;
  }

  if (absoluteValue >= 10000) {
    const digits = absoluteValue >= 100000 ? 1 : 2;
    return `${sign}¥${(absoluteValue / 10000).toFixed(digits)}万`;
  }

  return `${sign}¥${absoluteValue.toLocaleString("zh-CN", { maximumFractionDigits: 0 })}`;
};

export default function SettingsScreen({
  accountCount,
  appVersion,
  receivableAmount,
  settings,
  summary,
  storageMode,
  transactionCount,
  onExport,
  onImport,
  onOpenAccounts,
  onOpenAssets,
  onOpenTransactions,
  onReset,
  onClear,
  onSaveSettings,
}: SettingsScreenProps) {
  const { width } = useWindowDimensions();
  const horizontalPadding = getLedgerScreenPadding(width);
  const [route, setRoute] = useState<SettingsRoute>({ name: "root" });
  const [exportedJson, setExportedJson] = useState("");
  const [importJson, setImportJson] = useState("");
  const [importErrorMessage, setImportErrorMessage] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const goRoot = () => setRoute({ name: "root" });

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
    setImportErrorMessage("");
    try {
      await onImport(importJson);
      setExportedJson(importJson);
      setImportJson("");
      setImportErrorMessage("");
      Alert.alert("导入成功", "本地数据已刷新。");
    } catch {
      setImportErrorMessage("请检查 JSON 格式是否正确。");
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

  const screenStyle = [styles.screen, { marginHorizontal: -horizontalPadding, paddingHorizontal: horizontalPadding }];

  if (route.name === "data") {
    return (
      <View style={screenStyle}>
        <View style={styles.stack}>
          <LedgerPageHeader onBack={goRoot} title="数据管理" />
          <LedgerGlassHero
            badge="本地优先"
            badgeTone="blue"
            eyebrow="本地数据状态"
            metrics={[
              { label: "交易", value: String(transactionCount), unit: "笔" },
              { label: "账户", value: String(accountCount), unit: "个" },
              { label: "存储", tone: "blue", value: "设备" },
            ]}
            title={"数据只保存在当前设备，\n导出 JSON 可作为临时备份。"}
          />

          <LedgerSectionHeader title="常用操作" />
          <LedgerFullBleedList horizontalPadding={horizontalPadding}>
            <LedgerValueRow
              icon="data"
              onPress={() => void handleExport()}
              subtitle="生成完整本地 JSON，方便临时备份或迁移"
              title={isExporting ? "正在导出..." : "导出数据"}
              tone="blue"
              value={exportedJson ? "已生成" : "JSON"}
            />
            <LedgerValueRow
              icon="reconcile"
              onPress={confirmReset}
              subtitle="清空当前数据并恢复系统示例"
              title="恢复示例数据"
              tone="amber"
              value="覆盖"
            />
            <LedgerValueRow
              icon="report"
              last
              onPress={() => setRoute({ name: "storageInfo" })}
              subtitle="查看本地优先、无云同步和备份边界"
              title="存储说明"
              value={storageMode}
            />
          </LedgerFullBleedList>

          <LedgerSectionHeader title="导入备份" />
          <View style={styles.formCard}>
            <TextInput
              multiline
              onChangeText={(text) => {
                setImportJson(text);
                setImportErrorMessage("");
              }}
              placeholder="把完整 JSON 粘贴到这里"
              placeholderTextColor={theme.colors.textMuted}
              style={[styles.textArea, importErrorMessage ? styles.textAreaError : null]}
              textAlignVertical="top"
              value={importJson}
            />
            {importErrorMessage ? <Text style={styles.errorText}>{importErrorMessage}</Text> : null}
            <Pressable
              accessibilityRole="button"
              disabled={isImporting}
              onPress={() => void handleImport()}
              style={[styles.primaryButton, isImporting && styles.buttonDisabled]}
            >
              <Text style={styles.primaryButtonText}>{isImporting ? "正在导入..." : "开始导入"}</Text>
            </Pressable>
          </View>

          {exportedJson ? (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>导出结果</Text>
              <TextInput
                editable={false}
                multiline
                placeholder="导出结果会显示在这里"
                placeholderTextColor={theme.colors.textMuted}
                style={[styles.textArea, styles.readOnlyArea]}
                textAlignVertical="top"
                value={exportedJson}
              />
            </View>
          ) : null}

          <LedgerSectionHeader title="安全与清理" />
          <LedgerFullBleedList horizontalPadding={horizontalPadding}>
            <LedgerValueRow
              icon="reconcile"
              onPress={() => Alert.alert("清理缓存", "当前版本没有云端缓存，本地账本数据不会被清理。")}
              subtitle="清理临时状态，不删除本地账本数据"
              title="清理缓存"
              value="安全"
            />
            <LedgerValueRow
              icon="filter"
              onPress={() => Alert.alert("筛选已重置", "筛选条件会在各页面返回默认状态。")}
              subtitle="恢复筛选和排序的默认状态"
              title="重置筛选条件"
              value="默认"
            />
            <LedgerValueRow
              icon="disabled"
              last
              onPress={confirmClear}
              subtitle="永久删除所有本地数据，无法恢复"
              title="清空本地数据"
              tone="danger"
              value="危险"
            />
          </LedgerFullBleedList>
        </View>
      </View>
    );
  }

  if (route.name !== "root") {
    return (
      <StaticDetailView
        appVersion={appVersion}
        horizontalPadding={horizontalPadding}
        onBack={goRoot}
        onSaveSettings={onSaveSettings}
        route={route}
        settings={settings}
        storageMode={storageMode}
      />
    );
  }

  return (
    <View style={screenStyle}>
      <View style={styles.stack}>
        <LedgerPageHeader title="我的" />
        <LedgerGlassHero
          badge={`V${appVersion}`}
          badgeTone="blue"
          eyebrow="IMCFO 本地账户"
          metrics={[
            { label: "净资产", tone: "green", value: formatHeroCurrency(summary.ownerEquity) },
            { label: "待还", tone: "amber", value: formatHeroCurrency(summary.totalLiabilities) },
            { label: "待收", tone: "blue", value: formatHeroCurrency(receivableAmount) },
          ]}
          title={"财务自由计划中，\n继续以公司视角经营自己。"}
        />

        <LedgerSectionHeader title="常用工具" />
        <View style={styles.toolGrid}>
          <ToolTile icon="data" onPress={() => setRoute({ name: "data" })} subtitle="备份、导入和清理" title="数据管理" tone="blue" />
          <ToolTile icon="reconcile" onPress={confirmReset} subtitle="恢复系统演示账本" title="恢复示例" tone="amber" />
          <ToolTile icon="reports" onPress={() => setRoute({ name: "reportSettings" })} subtitle="报表模式与口径" title="报表设置" tone="green" />
          <ToolTile icon="settings" onPress={() => setRoute({ name: "preferences" })} subtitle="本地偏好说明" title="记录偏好" tone="default" />
        </View>

        <LedgerSectionHeader title="设置与管理" />
        <LedgerFullBleedList horizontalPadding={horizontalPadding}>
          <LedgerValueRow
            icon="account"
            onPress={onOpenAccounts}
            subtitle="现金、银行卡、微信、支付宝和信用卡"
            title="我的账户"
            value={`${accountCount} 个`}
          />
          <LedgerValueRow
            icon="asset"
            onPress={onOpenAssets}
            subtitle="资产、负债与净资产结构"
            title="资产负债管理"
            tone="green"
            value={formatCurrency(summary.ownerEquity)}
          />
          <LedgerValueRow
            icon="transaction"
            onPress={onOpenTransactions}
            subtitle="查看、筛选和核对已确认交易"
            title="交易记录"
            tone="blue"
            value={`${transactionCount} 笔`}
          />
          <LedgerValueRow
            icon="reports"
            onPress={() => setRoute({ name: "reportSettings" })}
            subtitle="个人财务三大报表、简明版和专业版"
            title="报表设置"
            value="本地"
          />
          <LedgerValueRow
            icon="report"
            onPress={() => setRoute({ name: "help" })}
            subtitle="本地优先、报表口径与版本说明"
            title="帮助与说明"
            value="查看"
          />
          <LedgerValueRow
            icon="warning"
            last
            onPress={() => setRoute({ name: "about" })}
            subtitle="当前仍为本地 MVP"
            title="关于我为 CFO"
            tone="amber"
            value={`V${appVersion}`}
          />
        </LedgerFullBleedList>

        <LedgerSectionHeader title="本月回顾" />
        <LedgerFullBleedList horizontalPadding={horizontalPadding}>
          <LedgerValueRow
            icon="chart"
            subtitle="收入覆盖支出，继续关注结余率和现金质量"
            title="收入持续增长"
            tone="green"
            value={formatCurrency(summary.totalIncome)}
          />
          <LedgerValueRow
            icon="manage"
            subtitle="日常支出不是风险，红色只保留给需要行动的状态"
            title="支出节奏改善"
            value={formatCurrency(summary.totalExpenses)}
          />
          <LedgerValueRow
            icon="success"
            last
            subtitle="负债结构仍处于可控区间"
            title="负债结构稳定"
            tone="blue"
            value={formatCurrency(summary.totalLiabilities)}
          />
        </LedgerFullBleedList>
      </View>
    </View>
  );
}

function ToolTile({
  icon,
  onPress,
  subtitle,
  title,
  tone,
}: {
  icon: AppIconName;
  onPress: () => void;
  subtitle: string;
  title: string;
  tone: LedgerRowTone;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.toolTile}>
      <View style={[styles.toolIcon, tone === "green" && styles.toolIconGreen, tone === "amber" && styles.toolIconAmber, tone === "blue" && styles.toolIconBlue]}>
        <AppIcon color={getToneColor(tone, true)} name={icon} size={18} strokeWidth={1.9} />
      </View>
      <Text numberOfLines={1} style={styles.toolTitle}>
        {title}
      </Text>
      <Text numberOfLines={2} style={styles.toolSubtitle}>
        {subtitle}
      </Text>
    </Pressable>
  );
}

function StaticDetailView({
  appVersion,
  horizontalPadding,
  onBack,
  onSaveSettings,
  route,
  settings,
  storageMode,
}: {
  appVersion: string;
  horizontalPadding: number;
  onBack: () => void;
  onSaveSettings: (settings: Partial<AppSettings>) => Promise<void>;
  route: Exclude<SettingsRoute, { name: "root" | "data" }>;
  settings: AppSettings;
  storageMode: string;
}) {
  const detail = getStaticDetail(route, appVersion, storageMode);

  return (
    <View style={[styles.screen, { marginHorizontal: -horizontalPadding, paddingHorizontal: horizontalPadding }]}>
      <View style={styles.stack}>
        <LedgerPageHeader onBack={onBack} title={detail.title} />
        <LedgerGlassHero
          badge={detail.badge}
          badgeTone={detail.badgeTone}
          eyebrow={detail.eyebrow}
          title={detail.hero}
        />
        <LedgerSectionHeader title={detail.sectionTitle} />
        <LedgerFullBleedList horizontalPadding={horizontalPadding}>
          {detail.rows.map((row, index) => (
            <LedgerValueRow
              icon={row.icon}
              key={row.label}
              last={index === detail.rows.length - 1}
              title={row.label}
              tone={row.tone}
              value={row.value}
            />
          ))}
        </LedgerFullBleedList>
        {route.name === "reportSettings" ? (
          <>
            <LedgerSectionHeader title="可修改项" />
            <LedgerFullBleedList horizontalPadding={horizontalPadding}>
              <LedgerValueRow
                icon="reports"
                onPress={() => void onSaveSettings({ defaultReportMode: settings.defaultReportMode === "simple" ? "professional" : "simple" })}
                title="默认报表模式"
                value={settings.defaultReportMode === "simple" ? "简明版" : "专业版"}
              />
              <LedgerValueRow
                icon="filter"
                onPress={() => void onSaveSettings({ includeVoidedTransactionsInReports: !settings.includeVoidedTransactionsInReports })}
                title="报表包含作废记录"
                value={settings.includeVoidedTransactionsInReports ? "包含" : "默认排除"}
              />
              <LedgerValueRow
                icon="chart"
                last
                onPress={() => void onSaveSettings({ dashboardLookbackMonths: settings.dashboardLookbackMonths === 12 ? 6 : 12 })}
                title="首页回看月份"
                value={`${settings.dashboardLookbackMonths ?? 6} 个月`}
              />
            </LedgerFullBleedList>
          </>
        ) : null}
      </View>
    </View>
  );
}

function getStaticDetail(
  route: Exclude<SettingsRoute, { name: "root" | "data" }>,
  appVersion: string,
  storageMode: string,
): {
  badge: string;
  badgeTone: Extract<LedgerRowTone, "amber" | "blue" | "green">;
  eyebrow: string;
  hero: string;
  rows: DetailRow[];
  sectionTitle: string;
  title: string;
} {
  if (route.name === "reportSettings") {
    return {
      badge: "只读",
      badgeTone: "blue",
      eyebrow: "报表口径",
      hero: "报表由本地账本和报表引擎生成，\n页面不发明会计公式。",
      rows: [
        { icon: "reports", label: "简明版", value: "保留核心结论", tone: "green" },
        { icon: "report", label: "专业版", value: "展示完整表行", tone: "blue" },
        { icon: "reconcile", label: "数据来源", value: "本地账本" },
      ],
      sectionTitle: "当前设置",
      title: "报表设置",
    };
  }

  if (route.name === "preferences") {
    return {
      badge: "本轮不持久化",
      badgeTone: "amber",
      eyebrow: "记录偏好",
      hero: "当前版本保持低风险本地配置，\n不新增偏好 schema。",
      rows: [
        { icon: "mic", label: "语音入口", value: "底部中心按钮" },
        { icon: "transaction", label: "手动记录", value: "管理页弹层" },
        { icon: "filter", label: "筛选偏好", value: "页面内临时状态" },
      ],
      sectionTitle: "说明",
      title: "记录偏好",
    };
  }

  if (route.name === "storageInfo") {
    return {
      badge: "Local-first",
      badgeTone: "green",
      eyebrow: "存储说明",
      hero: "当前数据保存在本机 AsyncStorage，\n暂不连接云端账本。",
      rows: [
        { icon: "data", label: "存储方式", value: storageMode, tone: "blue" },
        { icon: "warning", label: "云同步", value: "未启用", tone: "amber" },
        { icon: "report", label: "备份建议", value: "定期导出 JSON" },
      ],
      sectionTitle: "边界",
      title: "存储说明",
    };
  }

  if (route.name === "about") {
    return {
      badge: `V${appVersion}`,
      badgeTone: "blue",
      eyebrow: "关于",
      hero: "我为 CFO 是个人本地财务经营系统，\n把生活事件翻译成公司式财务语言。",
      rows: [
        { icon: "profile", label: "产品阶段", value: "本地 MVP" },
        { icon: "data", label: "数据边界", value: "不上传云端", tone: "green" },
        { icon: "warning", label: "集成边界", value: "无登录/支付/税务", tone: "amber" },
      ],
      sectionTitle: "版本信息",
      title: "关于我为 CFO",
    };
  }

  return {
    badge: "帮助",
    badgeTone: "green",
    eyebrow: "帮助与说明",
    hero: "先保证账本事实清楚，\n再用报表和分析做决策。",
    rows: [
      { icon: "account", label: "账户", value: "管理资金入口" },
      { icon: "asset", label: "资产负债", value: "维护财务结构" },
      { icon: "reports", label: "报表", value: "查看三大报表" },
      { icon: "warning", label: "AI 边界", value: "候选解释，不直接入账", tone: "amber" },
    ],
    sectionTitle: "使用重点",
    title: "帮助与说明",
  };
}

function getToneColor(tone: LedgerRowTone, icon = false): string {
  if (tone === "green") return theme.colors.success;
  if (tone === "amber") return theme.colors.warning;
  if (tone === "blue") return theme.colors.blueText;
  if (tone === "danger") return theme.colors.danger;
  return icon ? theme.colors.textSecondary : theme.colors.textPrimary;
}

const styles = StyleSheet.create({
  buttonDisabled: {
    opacity: 0.65,
  },
  errorText: {
    backgroundColor: "rgba(248,113,113,0.08)",
    borderColor: "rgba(248,113,113,0.18)",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    color: theme.colors.danger,
    fontSize: 11,
    fontWeight: "800",
    lineHeight: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  formCard: {
    backgroundColor: "rgba(17,21,39,0.82)",
    borderColor: "rgba(255,255,255,0.105)",
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 10,
    padding: 13,
  },
  formTitle: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "900",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    borderRadius: 14,
    justifyContent: "center",
    minHeight: 42,
    paddingHorizontal: 14,
  },
  primaryButtonText: {
    color: theme.colors.textInverse,
    fontSize: 13,
    fontWeight: "900",
  },
  readOnlyArea: {
    color: theme.colors.textMuted,
    maxHeight: 180,
  },
  screen: {
    backgroundColor: theme.colors.background,
  },
  stack: {
    gap: 14,
    paddingBottom: 176,
    paddingTop: 18,
  },
  textArea: {
    backgroundColor: "rgba(255,255,255,0.045)",
    borderColor: "rgba(255,255,255,0.09)",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
    minHeight: 112,
    paddingHorizontal: 11,
    paddingVertical: 10,
  },
  textAreaError: {
    backgroundColor: "rgba(248,113,113,0.065)",
    borderColor: "rgba(248,113,113,0.38)",
  },
  toolGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  toolIcon: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.035)",
    borderColor: "rgba(255,255,255,0.09)",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  toolIconAmber: {
    backgroundColor: "rgba(251,191,36,0.08)",
    borderColor: "rgba(251,191,36,0.18)",
  },
  toolIconBlue: {
    backgroundColor: "rgba(96,165,250,0.08)",
    borderColor: "rgba(96,165,250,0.18)",
  },
  toolIconGreen: {
    backgroundColor: "rgba(74,222,128,0.08)",
    borderColor: "rgba(74,222,128,0.18)",
  },
  toolSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  toolTile: {
    backgroundColor: "rgba(255,255,255,0.045)",
    borderColor: "rgba(255,255,255,0.085)",
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    flexBasis: "48.8%",
    flexGrow: 1,
    gap: 7,
    minHeight: 106,
    padding: 12,
  },
  toolTitle: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
});
