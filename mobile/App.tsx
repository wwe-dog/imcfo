import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppData } from "./src/app/useAppData";
import { useTransactionRecordsIndex } from "./src/hooks/useTransactionRecordsIndex";
import type {
  AccountInput,
  AssetInput,
  LiabilityInput,
  TransactionInput,
} from "./src/domain/accounting/transactionRules";
import type { ReconciliationInput } from "./src/domain/accounting/reconciliationRules";
import { filterTransactionsByReportPeriod } from "./src/domain/accounting/periodFilters";
import AppIcon, { type AppIconName } from "./src/components/AppIcon";
import AccountManagementScreen from "./src/screens/AccountManagementScreen";
import AssetsLiabilitiesScreen from "./src/screens/AssetsLiabilitiesScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import RecordScreen from "./src/screens/RecordScreen";
import ReportsScreen from "./src/screens/ReportsScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import TransactionRecordsScreen from "./src/screens/TransactionRecordsScreen";
import { theme } from "./src/styles/theme";

type ScreenKey = "dashboard" | "record" | "assets" | "accounts" | "transactions" | "reports" | "settings";

const tabs: Array<{ key: Exclude<ScreenKey, "assets" | "accounts" | "transactions">; label: string }> = [
  { key: "dashboard", label: "首页" },
  { key: "record", label: "管理" },
  { key: "reports", label: "报表" },
  { key: "settings", label: "我的" },
];

const getTabIcon = (key: Exclude<ScreenKey, "assets" | "accounts" | "transactions">): AppIconName => {
  switch (key) {
    case "dashboard":
      return "home";
    case "record":
      return "manage";
    case "reports":
      return "reports";
    case "settings":
      return "profile";
  }
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AppShell />
    </SafeAreaProvider>
  );
}

function AppShell() {
  const [activeScreen, setActiveScreen] = useState<ScreenKey>("dashboard");
  const insets = useSafeAreaInsets();
  const {
    data,
    summary,
    errorMessage,
    isLoading,
    saveTransaction,
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

  const handleExport = async () => exportData();

  const handleImport = async (serializedData: string) => {
    await importData(serializedData);
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
    if (isLoading || !data || !summary) {
      return (
        <View style={styles.loading}>
          <ActivityIndicator color={theme.colors.primaryDeep} />
          <Text style={styles.loadingText}>{errorMessage ?? "正在加载本地数据..."}</Text>
        </View>
      );
    }

    switch (activeScreen) {
      case "dashboard":
        return (
          <DashboardScreen
            assets={data.assets}
            liabilities={data.liabilities}
            summary={summary}
            transactions={data.transactions}
          />
        );
      case "record":
        return (
          <RecordScreen
            accounts={data.accounts}
            assets={data.assets}
            liabilities={data.liabilities}
            onOpenAccounts={() => setActiveScreen("accounts")}
            onOpenAssets={() => setActiveScreen("assets")}
            onOpenTransactions={() => setActiveScreen("transactions")}
            onOpenReports={() => setActiveScreen("reports")}
            onSave={handleSaveTransaction}
          />
        );
      case "transactions":
        return (
          <TransactionRecordsScreen
            assets={data.assets}
            isPreparingRecordsIndex={transactionRecordsIndex.isPreparing}
            liabilities={data.liabilities}
            onBack={() => setActiveScreen("record")}
            recordsIndex={transactionRecordsIndex.index}
          />
        );
      case "accounts":
        return (
          <AccountManagementScreen
            accounts={data.accounts}
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
            liabilities={data.liabilities}
            summary={summary}
            onDeleteAsset={handleDeleteAsset}
            onDeleteLiability={handleDeleteLiability}
            onSaveReconciliation={handleSaveReconciliation}
            onSaveAsset={handleSaveAsset}
            onSaveLiability={handleSaveLiability}
          />
        );
      case "reports":
        const periodTransactions = filterTransactionsByReportPeriod(data.transactions, data.currentPeriod);
        return (
          <ReportsScreen
            assets={data.assets}
            liabilities={data.liabilities}
            period={data.currentPeriod}
            transactions={periodTransactions}
          />
        );
      case "settings":
        return (
          <SettingsScreen
            appVersion={data.version}
            onOpenAccounts={() => setActiveScreen("accounts")}
            onOpenTransactions={() => setActiveScreen("transactions")}
            onClear={handleClear}
            onExport={handleExport}
            onImport={handleImport}
            onReset={handleReset}
            storageMode="本地移动存储"
          />
        );
    }
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <StatusBar style="dark" />
      {activeScreen !== "dashboard" ? (
        <View style={styles.header}>
          <Text style={styles.brand}>我为 CFO</Text>
          <Text style={styles.subtitle}>像经营公司一样经营自己</Text>
        </View>
      ) : null}
      {activeScreen === "transactions" ? (
        <View style={[styles.content, styles.virtualizedContent, { paddingBottom: 120 + insets.bottom }]}>
          {renderScreen()}
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: 120 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
        >
          {renderScreen()}
        </ScrollView>
      )}
      <View style={[styles.tabBarShell, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <View style={styles.tabBar}>
          {tabs.map((tab) => {
            const isActive = activeScreen === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveScreen(tab.key)}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
              >
                <AppIcon
                  color={isActive ? theme.colors.primaryDeep : theme.colors.textMuted}
                  name={getTabIcon(tab.key)}
                  size={19}
                  strokeWidth={1.9}
                />
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  brand: {
    color: theme.colors.textPrimary,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 120,
  },
  virtualizedContent: {
    flex: 1,
  },
  header: {
    backgroundColor: "rgba(255,254,252,0.92)",
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    paddingHorizontal: theme.spacing.container,
    paddingVertical: 13,
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
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 14,
    marginTop: 2,
  },
  tabBar: {
    backgroundColor: "rgba(255,254,252,0.96)",
    borderColor: theme.colors.border,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    paddingVertical: 8,
    shadowColor: theme.colors.shadowSoft,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 2,
  },
  tabBarShell: {
    bottom: 0,
    left: 0,
    paddingBottom: 14,
    paddingHorizontal: theme.spacing.container,
    position: "absolute",
    right: 0,
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
    backgroundColor: "#ECE8FF",
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
});
