import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppData } from "./src/app/useAppData";
import { useTransactionRecordsIndex } from "./src/hooks/useTransactionRecordsIndex";
import AppLoadingScreen from "./src/components/AppLoadingScreen";
import FullScreenError from "./src/components/FullScreenError";
import type {
  AccountInput,
  AssetInput,
  LiabilityInput,
  TransactionInput,
} from "./src/domain/accounting/transactionRules";
import type { ReconciliationInput } from "./src/domain/accounting/reconciliationRules";
import { filterTransactionsByReportPeriod } from "./src/domain/accounting/periodFilters";
import { getEffectiveTransactions } from "./src/domain/accounting/transactionAuditRules";
import AccountManagementScreen from "./src/screens/AccountManagementScreen";
import AssetsLiabilitiesScreen from "./src/screens/AssetsLiabilitiesScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import LedgerModuleScreen from "./src/screens/LedgerModuleScreen";
import RecordScreen from "./src/screens/RecordScreen";
import ReportsScreen from "./src/screens/ReportsScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import TransactionRecordsScreen from "./src/screens/TransactionRecordsScreen";
import ScreenTransition from "./src/components/ScreenTransition";
import { BottomNavBar, type BottomNavTab } from "./src/components/BottomNavBar";
import { RecordFanMenu, type RecordFanAction } from "./src/components/RecordFanMenu";
import { RecordingScreen } from "./src/components/RecordingScreen";
import type { CandidateTransactionDraft } from "./src/services/recordRecognitionService";
import { theme } from "./src/styles/theme";

type ScreenKey = "dashboard" | "record" | "assets" | "accounts" | "transactions" | "reports" | "settings";
type BottomTabScreenKey = "dashboard" | "reports" | "record" | "settings";
type PendingRecordDraft = {
  draft: CandidateTransactionDraft;
  nonce: number;
  transcriptionText: string;
};

const bottomNavTabs: BottomNavTab[] = [
  { key: "dashboard", label: "经营", icon: "home" },
  { key: "reports", label: "报告", icon: "reports" },
  { key: "record", label: "管理", icon: "manage" },
  { key: "settings", label: "我的", icon: "profile" },
];

const isBottomTabScreen = (screen: ScreenKey): boolean =>
  screen === "dashboard" || screen === "record" || screen === "reports" || screen === "settings";

export default function App() {
  return (
    <SafeAreaProvider>
      <AppShell />
    </SafeAreaProvider>
  );
}

function AppShell() {
  const [activeScreen, setActiveScreen] = useState<ScreenKey>("dashboard");
  const [isDashboardScrollEnabled, setIsDashboardScrollEnabled] = useState(false);
  const [isRecordFanOpen, setIsRecordFanOpen] = useState(false);
  const [isRecordingScreenOpen, setIsRecordingScreenOpen] = useState(false);
  const [isRecordWorkflowOpen, setIsRecordWorkflowOpen] = useState(false);
  const [pendingRecordDraft, setPendingRecordDraft] = useState<PendingRecordDraft | null>(null);
  const [manualEntryNonce, setManualEntryNonce] = useState<number | null>(null);
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const {
    data,
    summary,
    errorMessage,
    status,
    isLoading,
    reloadData,
    saveTransaction,
    replaceTransaction,
    voidTransactionById,
    saveBudget,
    deleteBudget,
    saveSettings,
    saveReconciliation,
    saveAccount,
    disableAccount,
    deleteAccount,
    saveAsset,
    deleteAsset,
    saveLiability,
    deleteLiability,
    resetDemoData,
    clearAllData,
    exportData,
    importData,
  } = useAppData();
  const transactionRecordsIndex = useTransactionRecordsIndex({
    accounts: data?.accounts,
    transactions: data?.transactions,
  });
  const bottomContentPadding = 128 + insets.bottom;
  const adaptiveHorizontalPadding = windowWidth <= 340 ? 12 : 16;
  const isFuturisticHome = activeScreen === "dashboard";
  const usesDarkChrome = true;
  const fanCenterX = windowWidth / 2;
  const fanCenterY = windowHeight - Math.max(insets.bottom, 8) - 48;
  const activeBottomTab: BottomTabScreenKey =
    activeScreen === "accounts" || activeScreen === "assets" || activeScreen === "transactions"
      ? "record"
      : activeScreen === "dashboard" || activeScreen === "reports" || activeScreen === "settings"
        ? activeScreen
        : "record";
  const mainScrollEnabled =
    activeScreen === "dashboard"
      ? isDashboardScrollEnabled
      : true;

  const handleExport = async () => exportData();

  const handleImport = async (serializedData: string) => {
    await importData(serializedData);
  };

  const handleOpenSupport = () => {
    void Linking.openURL("mailto:support@imcfo.local?subject=IMCFO%20support").catch(() => undefined);
  };

  const handleBottomTabPress = (key: string) => {
    setIsRecordFanOpen(false);
    setActiveScreen(key as BottomTabScreenKey);
  };

  const handleRecordFanSelect = (action: RecordFanAction) => {
    setIsRecordFanOpen(false);
    if (action === "voice") {
      setIsRecordingScreenOpen(true);
      return;
    }

    if (action === "manual") {
      setManualEntryNonce(Date.now());
    }

    setIsRecordWorkflowOpen(true);
  };

  const handleRecordingDraftReady = (
    draft: CandidateTransactionDraft,
    transcriptionText: string,
  ) => {
    setPendingRecordDraft({
      draft,
      nonce: Date.now(),
      transcriptionText,
    });
    setIsRecordingScreenOpen(false);
    setIsRecordWorkflowOpen(true);
  };

  const handleReset = async () => {
    try {
      await resetDemoData();
      Alert.alert("恢复成功", "已恢复为本地示例数据，首页和报表已同步刷新。");
    } catch {
      Alert.alert("恢复失败", "无法恢复示例数据。");
    }
  };

  const handleClear = async () => {
    try {
      await clearAllData();
      Alert.alert("清空成功", "本地数据已清空，首页和报表已按空数据刷新。");
    } catch {
      Alert.alert("清空失败", "无法清空本地数据。");
    }
  };

  const handleSaveTransaction = async (input: TransactionInput) => {
    try {
      await saveTransaction(input);
    } catch {
      throw new Error("无法保存这笔记录。");
    }
  };

  const handleSaveReconciliation = async (input: ReconciliationInput) => {
    try {
      await saveReconciliation(input);
    } catch {
      throw new Error("无法保存这笔对账调整。");
    }
  };

  const handleSaveAccount = async (input: AccountInput) => {
    try {
      await saveAccount(input);
    } catch {
      throw new Error("无法保存这个账户。");
    }
  };

  const handleDisableAccount = async (accountId: string) => {
    try {
      await disableAccount(accountId);
      Alert.alert("账户已停用", "该账户不会再出现在日常记账账户选择中。");
    } catch {
      Alert.alert("停用失败", "无法停用这个账户。");
      throw new Error("无法停用这个账户。");
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    try {
      await deleteAccount(accountId);
      Alert.alert("账户已删除", "账户列表已更新。");
    } catch {
      Alert.alert("删除失败", "无法删除这个账户。");
      throw new Error("无法删除这个账户。");
    }
  };

  const handleSaveAsset = async (input: AssetInput) => {
    try {
      await saveAsset(input);
      Alert.alert(
        input.id ? "资产已更新" : "资产已添加",
        "首页、报表和资产负债页已按最新资产数据刷新。",
      );
    } catch {
      Alert.alert("保存失败", "无法保存这项资产。");
      throw new Error("无法保存这项资产。");
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    try {
      await deleteAsset(assetId);
      Alert.alert("资产已删除", "首页、报表和资产负债页已按最新资产数据刷新。");
    } catch {
      Alert.alert("删除失败", "无法删除这项资产。");
      throw new Error("无法删除这项资产。");
    }
  };

  const handleSaveLiability = async (input: LiabilityInput) => {
    try {
      await saveLiability(input);
      Alert.alert(
        input.id ? "负债已更新" : "负债已添加",
        "首页、报表和资产负债页已按最新负债数据刷新。",
      );
    } catch {
      Alert.alert("保存失败", "无法保存这项负债。");
      throw new Error("无法保存这项负债。");
    }
  };

  const handleDeleteLiability = async (liabilityId: string) => {
    try {
      await deleteLiability(liabilityId);
      Alert.alert("负债已删除", "首页、报表和资产负债页已按最新负债数据刷新。");
    } catch {
      Alert.alert("删除失败", "无法删除这项负债。");
      throw new Error("无法删除这项负债。");
    }
  };

  const renderScreen = () => {
    if (!data || !summary) {
      return <AppLoadingScreen />;
    }

    const showScreenSkeleton = isLoading;
    const receivableAmount = data.assets
      .filter((asset) => asset.category === "receivable" || asset.category === "应收款")
      .reduce((total, asset) => total + asset.currentValue, 0);

    switch (activeScreen) {
      case "dashboard":
        return (
          <DashboardScreen
            assets={data.assets}
            isLoading={showScreenSkeleton}
            liabilities={data.liabilities}
            onOpenAccounts={() => setActiveScreen("accounts")}
            onOpenAssets={() => setActiveScreen("assets")}
            onOpenRecord={() => setActiveScreen("record")}
            onOpenReports={() => setActiveScreen("reports")}
            onOpenSettings={() => setActiveScreen("settings")}
            onOpenTransactions={() => setActiveScreen("transactions")}
            onScrollEnabledChange={setIsDashboardScrollEnabled}
            summary={summary}
            transactions={data.transactions}
          />
        );
      case "record":
        return (
          <LedgerModuleScreen
            budgets={data.budgets}
            currentPeriod={data.currentPeriod}
            onDeleteBudget={async (budgetId) => {
              await deleteBudget(budgetId);
            }}
            onOpenAssets={() => setActiveScreen("assets")}
            onOpenTransactions={() => setActiveScreen("transactions")}
            onSaveBudget={async (budget) => {
              await saveBudget(budget);
            }}
            transactions={data.transactions}
          />
        );
      case "transactions":
        return (
          <TransactionRecordsScreen
            assets={data.assets}
            isPreparingRecordsIndex={showScreenSkeleton || transactionRecordsIndex.isPreparing}
            liabilities={data.liabilities}
            onBack={() => setActiveScreen("record")}
            onOpenRecord={() => setActiveScreen("record")}
            onReplaceTransaction={async (transactionId, input, reason) => {
              await replaceTransaction(transactionId, input, reason);
            }}
            onVoidTransaction={async (transactionId, reason) => {
              await voidTransactionById(transactionId, reason);
            }}
            recordsIndex={transactionRecordsIndex.index}
          />
        );
      case "accounts":
        return (
          <AccountManagementScreen
            accounts={data.accounts}
            isLoading={showScreenSkeleton}
            transactions={data.transactions}
            onBack={() => setActiveScreen("record")}
            onDeleteAccount={handleDeleteAccount}
            onDisableAccount={handleDisableAccount}
            onSaveReconciliation={handleSaveReconciliation}
            onSaveAccount={handleSaveAccount}
          />
        );
      case "assets":
        return (
          <AssetsLiabilitiesScreen
            accounts={data.accounts}
            assets={data.assets}
            isLoading={showScreenSkeleton}
            liabilities={data.liabilities}
            onBack={() => setActiveScreen("record")}
            onDeleteAsset={handleDeleteAsset}
            onDeleteLiability={handleDeleteLiability}
            onOpenAccounts={() => setActiveScreen("accounts")}
            onSaveReconciliation={handleSaveReconciliation}
            onSaveAsset={handleSaveAsset}
            onSaveLiability={handleSaveLiability}
          />
        );
      case "reports":
        const reportTransactions = getEffectiveTransactions(data.transactions, {
          includeVoided: data.settings.includeVoidedTransactionsInReports,
        });
        const periodTransactions = filterTransactionsByReportPeriod(reportTransactions, data.currentPeriod);
        return (
          <ReportsScreen
            assets={data.assets}
            isLoading={showScreenSkeleton}
            liabilities={data.liabilities}
            onBack={() => setActiveScreen("dashboard")}
            onOpenRecord={() => setActiveScreen("record")}
            period={data.currentPeriod}
            transactions={periodTransactions}
          />
        );
      case "settings":
        return (
          <SettingsScreen
            accountCount={data.accounts.length}
            appVersion={data.version}
            receivableAmount={receivableAmount}
            summary={summary}
            transactionCount={data.transactions.length}
            onOpenAccounts={() => setActiveScreen("accounts")}
            onOpenAssets={() => setActiveScreen("assets")}
            onOpenTransactions={() => setActiveScreen("transactions")}
            onClear={handleClear}
            onExport={handleExport}
            onImport={handleImport}
            onReset={handleReset}
            onSaveSettings={async (settings) => {
              await saveSettings(settings);
            }}
            settings={data.settings}
            storageMode="本地移动存储"
          />
        );
    }
  };

  if (status === "error" && !data) {
    return (
      <FullScreenError
        description="IMCFO 暂时无法读取你的财务数据。这不会影响你的数据安全。"
        primaryAction={{ label: "重新加载", onPress: () => void reloadData() }}
        secondaryAction={{ label: "联系支持", onPress: handleOpenSupport }}
        title="数据加载出了问题"
      />
    );
  }

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={[styles.safeArea, usesDarkChrome && styles.safeAreaDark]}>
      <StatusBar style={usesDarkChrome ? "light" : "dark"} />
      {activeScreen === "transactions" ? (
        <View
          style={[
            styles.content,
            styles.virtualizedContent,
            { paddingBottom: bottomContentPadding, paddingHorizontal: adaptiveHorizontalPadding },
          ]}
        >
          <ScreenTransition
            animateOnMount
            style={styles.virtualizedContent}
            transitionKey={activeScreen}
            variant={isBottomTabScreen(activeScreen) ? "tab" : "drilldown"}
          >
            {renderScreen()}
          </ScreenTransition>
        </View>
      ) : (
        <ScrollView
          alwaysBounceVertical={mainScrollEnabled}
          contentContainerStyle={[
            styles.content,
            isFuturisticHome && styles.futuristicContent,
            { paddingBottom: bottomContentPadding, paddingHorizontal: adaptiveHorizontalPadding },
          ]}
          bounces={mainScrollEnabled}
          overScrollMode={mainScrollEnabled ? "auto" : "never"}
          scrollEnabled={mainScrollEnabled}
          showsVerticalScrollIndicator={false}
        >
          <ScreenTransition
            animateOnMount
            transitionKey={activeScreen}
            variant={isBottomTabScreen(activeScreen) ? "tab" : "drilldown"}
          >
            {renderScreen()}
          </ScreenTransition>
        </ScrollView>
      )}
      <View style={styles.tabBarShell}>
        <BottomNavBar
          activeKey={activeBottomTab}
          bottomInset={insets.bottom}
          onRecordLongPress={() => {
            setIsRecordFanOpen(false);
            setIsRecordingScreenOpen(true);
          }}
          onRecordPress={() => setIsRecordFanOpen(true)}
          onTabPress={handleBottomTabPress}
          tabs={bottomNavTabs}
        />
      </View>
      {isRecordWorkflowOpen && data ? (
        <View style={styles.recordWorkflowOverlay}>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setIsRecordWorkflowOpen(false);
              setPendingRecordDraft(null);
              setManualEntryNonce(null);
            }}
            style={[styles.recordWorkflowClose, { top: Math.max(insets.top, 12) + 8 }]}
          >
            <Text style={styles.recordWorkflowCloseText}>关闭</Text>
          </Pressable>
          <RecordScreen
            accounts={data.accounts}
            externalDraftPayload={pendingRecordDraft}
            externalManualEntryNonce={manualEntryNonce}
            liabilities={data.liabilities}
            onExternalDraftConsumed={() => setPendingRecordDraft(null)}
            onExternalManualEntryConsumed={() => setManualEntryNonce(null)}
            onOpenAccounts={() => {
              setIsRecordWorkflowOpen(false);
              setActiveScreen("accounts");
            }}
            onOpenAssets={() => {
              setIsRecordWorkflowOpen(false);
              setActiveScreen("assets");
            }}
            onOpenReports={() => {
              setIsRecordWorkflowOpen(false);
              setActiveScreen("reports");
            }}
            onOpenTransactions={() => {
              setIsRecordWorkflowOpen(false);
              setActiveScreen("transactions");
            }}
            onSave={async (input) => {
              await handleSaveTransaction(input);
              setIsRecordWorkflowOpen(false);
            }}
          />
        </View>
      ) : null}
      <RecordFanMenu
        centerX={fanCenterX}
        centerY={fanCenterY}
        onDismiss={() => setIsRecordFanOpen(false)}
        onSelect={handleRecordFanSelect}
        visible={isRecordFanOpen}
      />
      {isRecordingScreenOpen ? (
        <RecordingScreen
          onCancel={() => setIsRecordingScreenOpen(false)}
          onDraftReady={handleRecordingDraftReady}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 120,
  },
  futuristicContent: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  virtualizedContent: {
    flex: 1,
  },
  loading: {
    alignItems: "center",
    gap: theme.spacing.sm,
    justifyContent: "center",
    minHeight: 360,
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: 15,
  },
  safeArea: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  safeAreaDark: {
    backgroundColor: theme.colors.background,
  },
  recordWorkflowClose: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    marginRight: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    position: "absolute",
    zIndex: 2,
  },
  recordWorkflowCloseText: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 12,
    fontWeight: "700",
  },
  recordWorkflowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.background,
    zIndex: 90,
  },
  tabBar: {
    backgroundColor: theme.colors.surface,
    borderTopColor: theme.colors.divider,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 6,
    paddingTop: 8,
    shadowColor: theme.colors.shadowSoft,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 2,
  },
  tabBarDark: {
    backgroundColor: "rgba(9, 12, 29, 0.86)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 32,
    borderTopWidth: 0,
    borderWidth: 1,
    overflow: "hidden",
    paddingBottom: 6,
    paddingTop: 8,
    shadowColor: "#000000",
    shadowOpacity: 0.44,
    shadowRadius: 24,
  },
  tabBarShell: {
    bottom: 0,
    left: 0,
    paddingHorizontal: 0,
    position: "absolute",
    right: 0,
  },
  tabBarShellDark: {
    paddingHorizontal: 24,
  },
  tabButton: {
    alignItems: "center",
    borderRadius: theme.radius.lg,
    gap: 3,
    justifyContent: "center",
    minHeight: 50,
    minWidth: 64,
    paddingHorizontal: 10,
  },
  tabButtonActive: {
    backgroundColor: "transparent",
  },
  tabButtonDark: {
    borderRadius: 24,
    minHeight: 58,
    position: "relative",
  },
  tabActiveUnderline: {
    backgroundColor: theme.colors.primary,
    borderRadius: 999,
    bottom: 0,
    height: 3,
    position: "absolute",
    width: 28,
  },
  tabText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  tabTextActive: {
    color: theme.colors.primaryDeep,
    fontWeight: "700",
  },
  tabTextDark: {
    color: "rgba(255,255,255,0.52)",
  },
  tabTextDarkActive: {
    color: theme.colors.textPrimary,
  },
});
