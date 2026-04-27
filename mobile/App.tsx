import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { buildDashboardSummary } from "./src/domain/accounting/calculations";
import {
  applyTransactionToFinancialState,
  createTransactionFromInput,
  type AssetInput,
  type LiabilityInput,
  type TransactionInput,
} from "./src/domain/accounting/transactionRules";
import AssetsLiabilitiesScreen from "./src/screens/AssetsLiabilitiesScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import RecordScreen from "./src/screens/RecordScreen";
import ReportsScreen from "./src/screens/ReportsScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import { asyncStorageAdapter } from "./src/storage/asyncStorageAdapter";
import type { AppData } from "./src/storage/seedData";

type ScreenKey = "dashboard" | "record" | "assets" | "reports" | "settings";

const tabs: Array<{ key: ScreenKey; label: string }> = [
  { key: "dashboard", label: "首页" },
  { key: "record", label: "记一笔" },
  { key: "assets", label: "资产负债" },
  { key: "reports", label: "报表" },
  { key: "settings", label: "设置" },
];

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenKey>("dashboard");
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    asyncStorageAdapter
      .loadData()
      .then(setData)
      .catch(() => Alert.alert("加载失败", "无法读取本地示例数据。"));
  }, []);

  const summary = useMemo(() => {
    if (!data) return null;
    return buildDashboardSummary(data.currentPeriod, data.assets, data.liabilities, data.transactions);
  }, [data]);

  const handleExport = async () => {
    const exportedData = await asyncStorageAdapter.exportData();
    Alert.alert("导出数据", `当前导出 JSON 长度：${exportedData.length} 字符。`);
  };

  const handleReset = async () => {
    const freshData = await asyncStorageAdapter.resetData();
    setData(freshData);
  };

  const handleSaveTransaction = async (input: TransactionInput) => {
    if (!data) return;

    const transaction = createTransactionFromInput(input);
    const nextData = applyTransactionToFinancialState(data, transaction);
    await asyncStorageAdapter.saveData(nextData);
    setData(nextData);
    setActiveScreen("dashboard");
    Alert.alert("保存成功", "这笔记录已写入本地数据，首页和报表已刷新。");
  };

  const handleSaveAsset = async (_input: AssetInput) => {
    Alert.alert("暂未开放", "资产负债 CRUD 将在独立功能分支中实现。");
  };

  const handleDeleteAsset = async (_assetId: string) => {
    Alert.alert("暂未开放", "资产负债 CRUD 将在独立功能分支中实现。");
  };

  const handleSaveLiability = async (_input: LiabilityInput) => {
    Alert.alert("暂未开放", "资产负债 CRUD 将在独立功能分支中实现。");
  };

  const handleDeleteLiability = async (_liabilityId: string) => {
    Alert.alert("暂未开放", "资产负债 CRUD 将在独立功能分支中实现。");
  };

  const renderScreen = () => {
    if (!data || !summary) {
      return (
        <View style={styles.loading}>
          <ActivityIndicator color="#17251b" />
          <Text style={styles.loadingText}>正在加载本地数据</Text>
        </View>
      );
    }

    switch (activeScreen) {
      case "dashboard":
        return <DashboardScreen summary={summary} />;
      case "record":
        return <RecordScreen accounts={data.accounts} onSave={handleSaveTransaction} />;
      case "assets":
        return (
          <AssetsLiabilitiesScreen
            accounts={data.accounts}
            assets={data.assets}
            liabilities={data.liabilities}
            summary={summary}
            onSaveAsset={handleSaveAsset}
            onDeleteAsset={handleDeleteAsset}
            onSaveLiability={handleSaveLiability}
            onDeleteLiability={handleDeleteLiability}
          />
        );
      case "reports":
        return (
          <ReportsScreen
            assets={data.assets}
            liabilities={data.liabilities}
            period={data.currentPeriod}
            transactions={data.transactions}
          />
        );
      case "settings":
        return <SettingsScreen onExport={handleExport} onReset={handleReset} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.eyebrow}>个人经营系统</Text>
        <Text style={styles.appTitle}>我为 CFO</Text>
        <Text style={styles.subtitle}>像经营公司一样经营自己</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>{renderScreen()}</ScrollView>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = activeScreen === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveScreen(tab.key)}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appTitle: {
    color: "#18201a",
    fontSize: 30,
    fontWeight: "900",
  },
  content: {
    padding: 20,
    paddingBottom: 110,
  },
  eyebrow: {
    color: "#7f8c54",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
  },
  header: {
    backgroundColor: "#eef2e8",
    borderBottomColor: "#d5dcc7",
    borderBottomWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  loading: {
    alignItems: "center",
    gap: 10,
    justifyContent: "center",
    minHeight: 360,
  },
  loadingText: {
    color: "#50604d",
  },
  safeArea: {
    backgroundColor: "#eef2e8",
    flex: 1,
  },
  subtitle: {
    color: "#50604d",
    fontSize: 14,
    marginTop: 4,
  },
  tabBar: {
    backgroundColor: "#17251b",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    bottom: 0,
    flexDirection: "row",
    gap: 6,
    left: 0,
    padding: 10,
    paddingBottom: 16,
    position: "absolute",
    right: 0,
  },
  tabButton: {
    alignItems: "center",
    borderRadius: 10,
    flex: 1,
    paddingHorizontal: 4,
    paddingVertical: 10,
  },
  tabButtonActive: {
    backgroundColor: "#d7f171",
  },
  tabText: {
    color: "#f8f4e7",
    fontSize: 12,
    fontWeight: "700",
  },
  tabTextActive: {
    color: "#17251b",
  },
});
