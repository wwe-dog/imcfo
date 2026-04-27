import { StatusBar } from "expo-status-bar";
import { useState } from "react";
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
import { useAppData } from "./src/app/useAppData";
import type { AssetInput, LiabilityInput, TransactionInput } from "./src/domain/accounting/transactionRules";
import AssetsLiabilitiesScreen from "./src/screens/AssetsLiabilitiesScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import RecordScreen from "./src/screens/RecordScreen";
import ReportsScreen from "./src/screens/ReportsScreen";
import SettingsScreen from "./src/screens/SettingsScreen";

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
  const {
    data,
    summary,
    errorMessage,
    isLoading,
    saveTransaction,
    saveAsset,
    deleteAsset,
    saveLiability,
    deleteLiability,
    resetDemoData,
    clearAllData,
    exportData,
    importData,
  } = useAppData();

  const handleExport = async () => exportData();

  const handleImport = async (serializedData: string) => {
    await importData(serializedData);
  };

  const handleReset = async () => {
    try {
      await resetDemoData();
      Alert.alert("恢复成功", "已恢复为本地示例数据，首页和报表已刷新。");
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
      setActiveScreen("dashboard");
      Alert.alert("保存成功", "这笔记录已写入本地数据，首页和报表已刷新。");
    } catch {
      Alert.alert("保存失败", "无法保存这笔记录。");
      throw new Error("无法保存这笔记录。");
    }
  };

  const handleSaveAsset = async (input: AssetInput) => {
    try {
      await saveAsset(input);
      Alert.alert(input.id ? "资产已更新" : "资产已添加", "首页、报表和资产负债表已按最新资产数据刷新。");
    } catch {
      Alert.alert("保存失败", "无法保存这项资产。");
      throw new Error("无法保存这项资产。");
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    try {
      await deleteAsset(assetId);
      Alert.alert("资产已删除", "首页、报表和资产负债表已按最新资产数据刷新。");
    } catch {
      Alert.alert("删除失败", "无法删除这项资产。");
      throw new Error("无法删除这项资产。");
    }
  };

  const handleSaveLiability = async (input: LiabilityInput) => {
    try {
      await saveLiability(input);
      Alert.alert(input.id ? "负债已更新" : "负债已添加", "首页、报表和资产负债表已按最新负债数据刷新。");
    } catch {
      Alert.alert("保存失败", "无法保存这项负债。");
      throw new Error("无法保存这项负债。");
    }
  };

  const handleDeleteLiability = async (liabilityId: string) => {
    try {
      await deleteLiability(liabilityId);
      Alert.alert("负债已删除", "首页、报表和资产负债表已按最新负债数据刷新。");
    } catch {
      Alert.alert("删除失败", "无法删除这项负债。");
      throw new Error("无法删除这项负债。");
    }
  };

  const renderScreen = () => {
    if (isLoading || !data || !summary) {
      return (
        <View style={styles.loading}>
          <ActivityIndicator color="#17251b" />
          <Text style={styles.loadingText}>{errorMessage ?? "正在加载本地数据"}</Text>
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
        return (
          <SettingsScreen
            appVersion={data.version}
            storageMode="本地移动存储（AsyncStorage）"
            onExport={handleExport}
            onImport={handleImport}
            onReset={handleReset}
            onClear={handleClear}
          />
        );
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
