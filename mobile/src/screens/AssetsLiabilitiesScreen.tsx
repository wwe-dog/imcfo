import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { AssetInput, LiabilityInput } from "../domain/accounting/transactionRules";
import type { Account, Asset, Liability, ReportSummary } from "../domain/models";
import { formatCurrency } from "../utils/formatters";

interface AssetsLiabilitiesScreenProps {
  accounts: Account[];
  assets: Asset[];
  liabilities: Liability[];
  summary: ReportSummary;
  onSaveAsset: (input: AssetInput) => Promise<void>;
  onDeleteAsset: (assetId: string) => Promise<void>;
  onSaveLiability: (input: LiabilityInput) => Promise<void>;
  onDeleteLiability: (liabilityId: string) => Promise<void>;
}

const assetCategoryOptions: Array<{ value: Asset["category"]; label: string }> = [
  { value: "cash", label: "现金" },
  { value: "bankDeposit", label: "银行存款" },
  { value: "paymentAccount", label: "支付账户" },
  { value: "investment", label: "投资资产" },
  { value: "receivable", label: "应收款" },
  { value: "fixedAsset", label: "固定资产" },
  { value: "other", label: "其他资产" },
];

const liabilityCategoryOptions: Array<{ value: Liability["category"]; label: string }> = [
  { value: "creditCard", label: "信用卡" },
  { value: "huabei", label: "花呗白条" },
  { value: "loan", label: "贷款" },
  { value: "borrowing", label: "借款" },
  { value: "payable", label: "应付款" },
  { value: "other", label: "其他负债" },
];

interface AssetFormState {
  id?: string;
  name: string;
  category: Asset["category"];
  amount: string;
  accountId?: string;
  note: string;
}

interface LiabilityFormState {
  id?: string;
  name: string;
  category: Liability["category"];
  amount: string;
  dueDate: string;
  note: string;
}

const createEmptyAssetForm = (): AssetFormState => ({
  name: "",
  category: "bankDeposit",
  amount: "",
  accountId: undefined,
  note: "",
});

const createEmptyLiabilityForm = (): LiabilityFormState => ({
  name: "",
  category: "creditCard",
  amount: "",
  dueDate: "",
  note: "",
});

export default function AssetsLiabilitiesScreen({
  accounts,
  assets,
  liabilities,
  summary,
  onSaveAsset,
  onDeleteAsset,
  onSaveLiability,
  onDeleteLiability,
}: AssetsLiabilitiesScreenProps) {
  const [assetForm, setAssetForm] = useState<AssetFormState>(createEmptyAssetForm);
  const [liabilityForm, setLiabilityForm] = useState<LiabilityFormState>(createEmptyLiabilityForm);
  const [isSavingAsset, setIsSavingAsset] = useState(false);
  const [isSavingLiability, setIsSavingLiability] = useState(false);

  const activeAccounts = useMemo(() => accounts.filter((account) => account.isActive), [accounts]);

  const resetAssetForm = () => setAssetForm(createEmptyAssetForm());
  const resetLiabilityForm = () => setLiabilityForm(createEmptyLiabilityForm());

  const handleEditAsset = (asset: Asset) => {
    setAssetForm({
      id: asset.id,
      name: asset.name,
      category: asset.category,
      amount: String(asset.currentValue),
      accountId: asset.accountId,
      note: asset.note ?? "",
    });
  };

  const handleEditLiability = (liability: Liability) => {
    setLiabilityForm({
      id: liability.id,
      name: liability.name,
      category: liability.category,
      amount: String(liability.amount),
      dueDate: liability.dueDate ?? "",
      note: liability.note ?? "",
    });
  };

  const handleSubmitAsset = async () => {
    const name = assetForm.name.trim();
    const amount = Number(assetForm.amount);

    if (!name || !assetForm.amount.trim()) {
      Alert.alert("信息不完整", "请填写资产名称和金额。");
      return;
    }

    if (!Number.isFinite(amount) || amount < 0) {
      Alert.alert("金额无效", "请输入大于或等于 0 的资产金额。");
      return;
    }

    setIsSavingAsset(true);
    try {
      await onSaveAsset({
        id: assetForm.id,
        name,
        category: assetForm.category,
        amount,
        accountId: assetForm.accountId,
        note: assetForm.note,
      });
      resetAssetForm();
    } finally {
      setIsSavingAsset(false);
    }
  };

  const handleSubmitLiability = async () => {
    const name = liabilityForm.name.trim();
    const amount = Number(liabilityForm.amount);

    if (!name || !liabilityForm.amount.trim()) {
      Alert.alert("信息不完整", "请填写负债名称和金额。");
      return;
    }

    if (!Number.isFinite(amount) || amount < 0) {
      Alert.alert("金额无效", "请输入大于或等于 0 的负债金额。");
      return;
    }

    setIsSavingLiability(true);
    try {
      await onSaveLiability({
        id: liabilityForm.id,
        name,
        category: liabilityForm.category,
        amount,
        dueDate: liabilityForm.dueDate,
        note: liabilityForm.note,
      });
      resetLiabilityForm();
    } finally {
      setIsSavingLiability(false);
    }
  };

  const confirmDeleteAsset = (asset: Asset) => {
    Alert.alert("删除资产", `确认删除“${asset.name}”吗？`, [
      { text: "取消", style: "cancel" },
      {
        text: "删除",
        style: "destructive",
        onPress: () => {
          void onDeleteAsset(asset.id);
          if (assetForm.id === asset.id) {
            resetAssetForm();
          }
        },
      },
    ]);
  };

  const confirmDeleteLiability = (liability: Liability) => {
    Alert.alert("删除负债", `确认删除“${liability.name}”吗？`, [
      { text: "取消", style: "cancel" },
      {
        text: "删除",
        style: "destructive",
        onPress: () => {
          void onDeleteLiability(liability.id);
          if (liabilityForm.id === liability.id) {
            resetLiabilityForm();
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.stack}>
      <View>
        <Text style={styles.eyebrow}>Assets & Liabilities</Text>
        <Text style={styles.title}>资产负债</Text>
        <Text style={styles.copy}>先把你拥有什么、欠了什么录进去，作为个人资产负债表底稿。</Text>
      </View>

      <View style={styles.summaryPanel}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>总资产</Text>
          <Text style={styles.summaryValue}>{formatCurrency(summary.totalAssets)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>总负债</Text>
          <Text style={styles.summaryValue}>{formatCurrency(summary.totalLiabilities)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>所有者权益</Text>
          <Text style={styles.summaryValue}>{formatCurrency(summary.ownerEquity)}</Text>
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>{assetForm.id ? "编辑资产" : "新增资产"}</Text>
        <TextInput
          placeholder="资产名称，例如：工资卡余额"
          placeholderTextColor="#8a9380"
          style={styles.input}
          value={assetForm.name}
          onChangeText={(value) => setAssetForm((current) => ({ ...current, name: value }))}
        />
        <View style={styles.chipGroup}>
          {assetCategoryOptions.map((option) => {
            const isActive = assetForm.category === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => setAssetForm((current) => ({ ...current, category: option.value }))}
                style={[styles.chip, isActive && styles.chipActive]}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <TextInput
          keyboardType="decimal-pad"
          placeholder="当前金额或当前价值"
          placeholderTextColor="#8a9380"
          style={styles.input}
          value={assetForm.amount}
          onChangeText={(value) => setAssetForm((current) => ({ ...current, amount: value }))}
        />
        <Text style={styles.fieldLabel}>关联账户（可选）</Text>
        <View style={styles.chipGroup}>
          <Pressable
            onPress={() => setAssetForm((current) => ({ ...current, accountId: undefined }))}
            style={[styles.chip, !assetForm.accountId && styles.chipActive]}
          >
            <Text style={[styles.chipText, !assetForm.accountId && styles.chipTextActive]}>不关联</Text>
          </Pressable>
          {activeAccounts.map((account) => {
            const isActive = assetForm.accountId === account.id;
            return (
              <Pressable
                key={account.id}
                onPress={() => setAssetForm((current) => ({ ...current, accountId: account.id }))}
                style={[styles.chip, isActive && styles.chipActive]}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{account.name}</Text>
              </Pressable>
            );
          })}
        </View>
        <TextInput
          multiline
          placeholder="备注（可选）"
          placeholderTextColor="#8a9380"
          style={[styles.input, styles.textArea]}
          value={assetForm.note}
          onChangeText={(value) => setAssetForm((current) => ({ ...current, note: value }))}
        />
        <View style={styles.actionRow}>
          <Pressable
            onPress={handleSubmitAsset}
            style={[styles.primaryButton, isSavingAsset && styles.buttonDisabled]}
            disabled={isSavingAsset}
          >
            <Text style={styles.primaryButtonText}>{assetForm.id ? "保存资产修改" : "添加资产"}</Text>
          </Pressable>
          {assetForm.id ? (
            <Pressable onPress={resetAssetForm} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>取消编辑</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>资产列表</Text>
        {assets.length === 0 ? <Text style={styles.emptyText}>还没有资产，先添加第一项。</Text> : null}
        {assets.map((asset) => (
          <View key={asset.id} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <View style={styles.itemText}>
                <Text style={styles.itemTitle}>{asset.name}</Text>
                <Text style={styles.itemMeta}>
                  {assetCategoryOptions.find((option) => option.value === asset.category)?.label ?? asset.category}
                </Text>
              </View>
              <Text style={styles.value}>{formatCurrency(asset.currentValue)}</Text>
            </View>
            {asset.note ? <Text style={styles.itemNote}>{asset.note}</Text> : null}
            {asset.accountId ? (
              <Text style={styles.itemMeta}>
                关联账户：{activeAccounts.find((account) => account.id === asset.accountId)?.name ?? "已删除账户"}
              </Text>
            ) : null}
            <View style={styles.inlineActions}>
              <Pressable onPress={() => handleEditAsset(asset)} style={styles.inlineButton}>
                <Text style={styles.inlineButtonText}>编辑</Text>
              </Pressable>
              <Pressable onPress={() => confirmDeleteAsset(asset)} style={styles.inlineDangerButton}>
                <Text style={styles.inlineDangerButtonText}>删除</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>{liabilityForm.id ? "编辑负债" : "新增负债"}</Text>
        <TextInput
          placeholder="负债名称，例如：信用卡应还款"
          placeholderTextColor="#8a9380"
          style={styles.input}
          value={liabilityForm.name}
          onChangeText={(value) => setLiabilityForm((current) => ({ ...current, name: value }))}
        />
        <View style={styles.chipGroup}>
          {liabilityCategoryOptions.map((option) => {
            const isActive = liabilityForm.category === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => setLiabilityForm((current) => ({ ...current, category: option.value }))}
                style={[styles.chip, isActive && styles.chipActive]}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <TextInput
          keyboardType="decimal-pad"
          placeholder="负债金额"
          placeholderTextColor="#8a9380"
          style={styles.input}
          value={liabilityForm.amount}
          onChangeText={(value) => setLiabilityForm((current) => ({ ...current, amount: value }))}
        />
        <TextInput
          placeholder="到期日（可选，YYYY-MM-DD）"
          placeholderTextColor="#8a9380"
          style={styles.input}
          value={liabilityForm.dueDate}
          onChangeText={(value) => setLiabilityForm((current) => ({ ...current, dueDate: value }))}
        />
        <TextInput
          multiline
          placeholder="备注（可选）"
          placeholderTextColor="#8a9380"
          style={[styles.input, styles.textArea]}
          value={liabilityForm.note}
          onChangeText={(value) => setLiabilityForm((current) => ({ ...current, note: value }))}
        />
        <View style={styles.actionRow}>
          <Pressable
            onPress={handleSubmitLiability}
            style={[styles.primaryButton, isSavingLiability && styles.buttonDisabled]}
            disabled={isSavingLiability}
          >
            <Text style={styles.primaryButtonText}>{liabilityForm.id ? "保存负债修改" : "添加负债"}</Text>
          </Pressable>
          {liabilityForm.id ? (
            <Pressable onPress={resetLiabilityForm} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>取消编辑</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>负债列表</Text>
        {liabilities.length === 0 ? <Text style={styles.emptyText}>还没有负债，可以按实际情况录入。</Text> : null}
        {liabilities.map((liability) => (
          <View key={liability.id} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <View style={styles.itemText}>
                <Text style={styles.itemTitle}>{liability.name}</Text>
                <Text style={styles.itemMeta}>
                  {liabilityCategoryOptions.find((option) => option.value === liability.category)?.label ??
                    liability.category}
                </Text>
              </View>
              <Text style={styles.value}>{formatCurrency(liability.amount)}</Text>
            </View>
            {liability.dueDate ? <Text style={styles.itemMeta}>到期日：{liability.dueDate}</Text> : null}
            {liability.note ? <Text style={styles.itemNote}>{liability.note}</Text> : null}
            <View style={styles.inlineActions}>
              <Pressable onPress={() => handleEditLiability(liability)} style={styles.inlineButton}>
                <Text style={styles.inlineButtonText}>编辑</Text>
              </Pressable>
              <Pressable onPress={() => confirmDeleteLiability(liability)} style={styles.inlineDangerButton}>
                <Text style={styles.inlineDangerButtonText}>删除</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  chip: {
    borderColor: "#d5dcc7",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: "#d7f171",
    borderColor: "#d7f171",
  },
  chipGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chipText: {
    color: "#50604d",
    fontSize: 13,
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#17251b",
  },
  copy: {
    color: "#50604d",
    fontSize: 14,
    lineHeight: 22,
  },
  emptyText: {
    color: "#7b8672",
    fontSize: 14,
  },
  eyebrow: {
    color: "#7f8c54",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
  },
  fieldLabel: {
    color: "#50604d",
    fontSize: 13,
    fontWeight: "700",
  },
  inlineActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  inlineButton: {
    backgroundColor: "#eef2e8",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inlineButtonText: {
    color: "#18201a",
    fontSize: 13,
    fontWeight: "700",
  },
  inlineDangerButton: {
    backgroundColor: "#fff0ec",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inlineDangerButtonText: {
    color: "#a23a21",
    fontSize: 13,
    fontWeight: "700",
  },
  input: {
    backgroundColor: "#ffffff",
    borderColor: "#d5dcc7",
    borderRadius: 12,
    borderWidth: 1,
    color: "#18201a",
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  itemCard: {
    backgroundColor: "#f8f8f1",
    borderColor: "#e3e8d7",
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  itemHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  itemMeta: {
    color: "#6a7664",
    fontSize: 12,
    lineHeight: 18,
  },
  itemNote: {
    color: "#50604d",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  itemText: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    color: "#18201a",
    fontSize: 15,
    fontWeight: "700",
  },
  panel: {
    backgroundColor: "#fbfaf3",
    borderColor: "#d5dcc7",
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  panelTitle: {
    color: "#18201a",
    fontSize: 17,
    fontWeight: "700",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#17251b",
    borderRadius: 12,
    flex: 1,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 14,
  },
  primaryButtonText: {
    color: "#f8f4e7",
    fontSize: 14,
    fontWeight: "700",
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#eef2e8",
    borderRadius: 12,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 14,
  },
  secondaryButtonText: {
    color: "#18201a",
    fontSize: 14,
    fontWeight: "700",
  },
  stack: {
    gap: 18,
  },
  summaryLabel: {
    color: "#50604d",
    fontSize: 13,
    fontWeight: "700",
  },
  summaryPanel: {
    backgroundColor: "#17251b",
    borderRadius: 16,
    gap: 10,
    padding: 16,
  },
  summaryRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryValue: {
    color: "#f8f4e7",
    fontSize: 15,
    fontWeight: "800",
  },
  textArea: {
    minHeight: 84,
    textAlignVertical: "top",
  },
  title: {
    color: "#18201a",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },
  value: {
    color: "#18201a",
    fontSize: 14,
    fontWeight: "700",
  },
});
