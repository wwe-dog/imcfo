import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { AssetInput, LiabilityInput } from "../domain/accounting/transactionRules";
import type { Account, Asset, Liability, ReportSummary } from "../domain/models";
import { sharedStyles, theme } from "../styles/theme";
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
  amount: "",
  accountId: undefined,
  category: "bankDeposit",
  name: "",
  note: "",
});

const createEmptyLiabilityForm = (): LiabilityFormState => ({
  amount: "",
  category: "creditCard",
  dueDate: "",
  name: "",
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
      accountId: asset.accountId,
      amount: String(asset.currentValue),
      category: asset.category,
      id: asset.id,
      name: asset.name,
      note: asset.note ?? "",
    });
  };

  const handleEditLiability = (liability: Liability) => {
    setLiabilityForm({
      amount: String(liability.amount),
      category: liability.category,
      dueDate: liability.dueDate ?? "",
      id: liability.id,
      name: liability.name,
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
        accountId: assetForm.accountId,
        amount,
        category: assetForm.category,
        id: assetForm.id,
        name,
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
        amount,
        category: liabilityForm.category,
        dueDate: liabilityForm.dueDate,
        id: liabilityForm.id,
        name,
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
        onPress: () => {
          void onDeleteAsset(asset.id);
          if (assetForm.id === asset.id) {
            resetAssetForm();
          }
        },
        style: "destructive",
        text: "删除",
      },
    ]);
  };

  const confirmDeleteLiability = (liability: Liability) => {
    Alert.alert("删除负债", `确认删除“${liability.name}”吗？`, [
      { text: "取消", style: "cancel" },
      {
        onPress: () => {
          void onDeleteLiability(liability.id);
          if (liabilityForm.id === liability.id) {
            resetLiabilityForm();
          }
        },
        style: "destructive",
        text: "删除",
      },
    ]);
  };

  return (
    <View style={styles.stack}>
      <View style={sharedStyles.pageHeader}>
        <Text style={sharedStyles.eyebrow}>Assets & Liabilities</Text>
        <Text style={sharedStyles.pageTitle}>资产负债</Text>
        <Text style={sharedStyles.pageCopy}>
          先录入你拥有什么、欠了什么，用于生成个人资产负债表。
        </Text>
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
          <Text style={styles.summaryLabel}>所有者权益（个人净资产）</Text>
          <Text style={styles.summaryValue}>{formatCurrency(summary.ownerEquity)}</Text>
        </View>
      </View>

      <View style={[sharedStyles.card, styles.panel]}>
        <Text style={sharedStyles.sectionTitle}>{assetForm.id ? "编辑资产" : "新增资产"}</Text>
        <TextInput
          onChangeText={(value) => setAssetForm((current) => ({ ...current, name: value }))}
          placeholder="资产名称，例如：工资卡余额"
          placeholderTextColor="#8a9380"
          style={sharedStyles.input}
          value={assetForm.name}
        />
        <View style={styles.chipGroup}>
          {assetCategoryOptions.map((option) => {
            const isActive = assetForm.category === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => setAssetForm((current) => ({ ...current, category: option.value }))}
                style={[
                  sharedStyles.chip,
                  styles.chip,
                  isActive && sharedStyles.chipActiveLight,
                ]}
              >
                <Text style={sharedStyles.chipText}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <TextInput
          keyboardType="decimal-pad"
          onChangeText={(value) => setAssetForm((current) => ({ ...current, amount: value }))}
          placeholder="当前金额或当前价值"
          placeholderTextColor="#8a9380"
          style={sharedStyles.input}
          value={assetForm.amount}
        />
        <Text style={styles.fieldLabel}>关联账户（可选）</Text>
        <View style={styles.chipGroup}>
          <Pressable
            onPress={() => setAssetForm((current) => ({ ...current, accountId: undefined }))}
            style={[
              sharedStyles.chip,
              styles.chip,
              !assetForm.accountId && sharedStyles.chipActiveLight,
            ]}
          >
            <Text style={sharedStyles.chipText}>不关联</Text>
          </Pressable>
          {activeAccounts.map((account) => {
            const isActive = assetForm.accountId === account.id;
            return (
              <Pressable
                key={account.id}
                onPress={() => setAssetForm((current) => ({ ...current, accountId: account.id }))}
                style={[
                  sharedStyles.chip,
                  styles.chip,
                  isActive && sharedStyles.chipActiveLight,
                ]}
              >
                <Text style={sharedStyles.chipText}>{account.name}</Text>
              </Pressable>
            );
          })}
        </View>
        <TextInput
          multiline
          onChangeText={(value) => setAssetForm((current) => ({ ...current, note: value }))}
          placeholder="备注（可选）"
          placeholderTextColor="#8a9380"
          style={[sharedStyles.input, sharedStyles.textArea]}
          value={assetForm.note}
        />
        <View style={styles.actionRow}>
          <Pressable
            disabled={isSavingAsset}
            onPress={() => void handleSubmitAsset()}
            style={[sharedStyles.primaryButton, styles.primaryAction, isSavingAsset && styles.buttonDisabled]}
          >
            <Text style={sharedStyles.primaryButtonText}>
              {assetForm.id ? "保存资产修改" : "添加资产"}
            </Text>
          </Pressable>
          {assetForm.id ? (
            <Pressable onPress={resetAssetForm} style={sharedStyles.secondaryButton}>
              <Text style={sharedStyles.secondaryButtonText}>取消编辑</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={[sharedStyles.card, styles.panel]}>
        <Text style={sharedStyles.sectionTitle}>资产列表</Text>
        {assets.length === 0 ? <Text style={sharedStyles.emptyText}>还没有资产，先添加第一项。</Text> : null}
        {assets.map((asset) => (
          <View key={asset.id} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <View style={styles.itemText}>
                <Text style={styles.itemTitle}>{asset.name}</Text>
                <Text style={styles.itemMeta}>
                  {assetCategoryOptions.find((option) => option.value === asset.category)?.label ??
                    asset.category}
                </Text>
              </View>
              <Text style={styles.value}>{formatCurrency(asset.currentValue)}</Text>
            </View>
            {asset.note ? <Text style={styles.itemNote}>{asset.note}</Text> : null}
            {asset.accountId ? (
              <Text style={styles.itemMeta}>
                关联账户：
                {activeAccounts.find((account) => account.id === asset.accountId)?.name ?? "已删除账户"}
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

      <View style={[sharedStyles.card, styles.panel]}>
        <Text style={sharedStyles.sectionTitle}>{liabilityForm.id ? "编辑负债" : "新增负债"}</Text>
        <TextInput
          onChangeText={(value) => setLiabilityForm((current) => ({ ...current, name: value }))}
          placeholder="负债名称，例如：信用卡应还款"
          placeholderTextColor="#8a9380"
          style={sharedStyles.input}
          value={liabilityForm.name}
        />
        <View style={styles.chipGroup}>
          {liabilityCategoryOptions.map((option) => {
            const isActive = liabilityForm.category === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => setLiabilityForm((current) => ({ ...current, category: option.value }))}
                style={[
                  sharedStyles.chip,
                  styles.chip,
                  isActive && sharedStyles.chipActiveLight,
                ]}
              >
                <Text style={sharedStyles.chipText}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <TextInput
          keyboardType="decimal-pad"
          onChangeText={(value) => setLiabilityForm((current) => ({ ...current, amount: value }))}
          placeholder="负债金额"
          placeholderTextColor="#8a9380"
          style={sharedStyles.input}
          value={liabilityForm.amount}
        />
        <TextInput
          onChangeText={(value) => setLiabilityForm((current) => ({ ...current, dueDate: value }))}
          placeholder="到期日（可选，YYYY-MM-DD）"
          placeholderTextColor="#8a9380"
          style={sharedStyles.input}
          value={liabilityForm.dueDate}
        />
        <TextInput
          multiline
          onChangeText={(value) => setLiabilityForm((current) => ({ ...current, note: value }))}
          placeholder="备注（可选）"
          placeholderTextColor="#8a9380"
          style={[sharedStyles.input, sharedStyles.textArea]}
          value={liabilityForm.note}
        />
        <View style={styles.actionRow}>
          <Pressable
            disabled={isSavingLiability}
            onPress={() => void handleSubmitLiability()}
            style={[
              sharedStyles.primaryButton,
              styles.primaryAction,
              isSavingLiability && styles.buttonDisabled,
            ]}
          >
            <Text style={sharedStyles.primaryButtonText}>
              {liabilityForm.id ? "保存负债修改" : "添加负债"}
            </Text>
          </Pressable>
          {liabilityForm.id ? (
            <Pressable onPress={resetLiabilityForm} style={sharedStyles.secondaryButton}>
              <Text style={sharedStyles.secondaryButtonText}>取消编辑</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={[sharedStyles.card, styles.panel]}>
        <Text style={sharedStyles.sectionTitle}>负债列表</Text>
        {liabilities.length === 0 ? (
          <Text style={sharedStyles.emptyText}>还没有负债，可以按实际情况录入。</Text>
        ) : null}
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
            {liability.dueDate ? (
              <Text style={styles.itemMeta}>到期日：{liability.dueDate}</Text>
            ) : null}
            {liability.note ? <Text style={styles.itemNote}>{liability.note}</Text> : null}
            <View style={styles.inlineActions}>
              <Pressable onPress={() => handleEditLiability(liability)} style={styles.inlineButton}>
                <Text style={styles.inlineButtonText}>编辑</Text>
              </Pressable>
              <Pressable
                onPress={() => confirmDeleteLiability(liability)}
                style={styles.inlineDangerButton}
              >
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
    gap: theme.spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  chip: {
    alignItems: "center",
  },
  chipGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  fieldLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.label,
    fontWeight: "700",
    marginBottom: theme.spacing.sm,
  },
  inlineActions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  inlineButton: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 9,
  },
  inlineButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.label,
    fontWeight: "700",
  },
  inlineDangerButton: {
    alignItems: "center",
    backgroundColor: theme.colors.dangerSoft,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 9,
  },
  inlineDangerButtonText: {
    color: theme.colors.danger,
    fontSize: theme.typography.label,
    fontWeight: "700",
  },
  itemCard: {
    backgroundColor: theme.colors.inputBackground,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    padding: theme.spacing.md,
  },
  itemHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "space-between",
  },
  itemMeta: {
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  itemNote: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.label,
    lineHeight: 20,
    marginTop: theme.spacing.sm,
  },
  itemText: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  panel: {
    gap: theme.spacing.md,
  },
  primaryAction: {
    flex: 1,
  },
  stack: {
    gap: theme.spacing.xl,
  },
  summaryLabel: {
    color: theme.colors.textInverse,
    flex: 1,
    fontSize: theme.typography.label,
    fontWeight: "700",
    paddingRight: theme.spacing.md,
  },
  summaryPanel: {
    backgroundColor: theme.colors.surfaceStrong,
    borderRadius: theme.radius.lg,
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  summaryRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryValue: {
    color: theme.colors.textInverse,
    fontSize: 15,
    fontWeight: "800",
    textAlign: "right",
  },
  value: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: "700",
  },
});
