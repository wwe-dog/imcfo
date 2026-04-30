import { useMemo, useState } from "react";
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import AppIcon from "../components/AppIcon";
import {
  calculateReconciliationDiff,
  getReconciliationReasonOptions,
  type ReconciliationInput,
  type ReconciliationReason,
} from "../domain/accounting/reconciliationRules";
import type { AssetInput, LiabilityInput } from "../domain/accounting/transactionRules";
import type { Account, Asset, Liability, ReportSummary } from "../domain/models";
import { sharedStyles, theme } from "../styles/theme";
import { formatCurrency } from "../utils/formatters";

interface AssetsLiabilitiesScreenProps {
  accounts: Account[];
  assets: Asset[];
  liabilities: Liability[];
  summary: ReportSummary;
  onBack: () => void;
  onSaveAsset: (input: AssetInput) => Promise<void>;
  onDeleteAsset: (assetId: string) => Promise<void>;
  onSaveReconciliation: (input: ReconciliationInput) => Promise<void>;
  onSaveLiability: (input: LiabilityInput) => Promise<void>;
  onDeleteLiability: (liabilityId: string) => Promise<void>;
}

const assetCategoryOptions: Array<{ value: Asset["category"]; label: string }> = [
  { value: "cash", label: "现金" },
  { value: "bankDeposit", label: "银行卡" },
  { value: "paymentAccount", label: "支付账户" },
  { value: "investment", label: "投资资产" },
  { value: "receivable", label: "应收款" },
  { value: "fixedAsset", label: "固定资产" },
  { value: "other", label: "其他资产" },
];

const liabilityCategoryOptions: Array<{ value: Liability["category"]; label: string }> = [
  { value: "creditCard", label: "信用卡" },
  { value: "huabei", label: "花呗 / 白条" },
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

interface AssetReconciliationState {
  asset?: Asset;
  actualValue: string;
  reason?: ReconciliationReason;
  note: string;
  isConfirming: boolean;
  isSaving: boolean;
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

const isAccountEnabled = (account: Account): boolean => account.isEnabled ?? account.isActive ?? true;

export default function AssetsLiabilitiesScreen({
  accounts,
  assets,
  liabilities,
  summary,
  onBack,
  onSaveAsset,
  onDeleteAsset,
  onSaveReconciliation,
  onSaveLiability,
  onDeleteLiability,
}: AssetsLiabilitiesScreenProps) {
  const [assetForm, setAssetForm] = useState<AssetFormState>(createEmptyAssetForm);
  const [liabilityForm, setLiabilityForm] = useState<LiabilityFormState>(createEmptyLiabilityForm);
  const [isSavingAsset, setIsSavingAsset] = useState(false);
  const [isSavingLiability, setIsSavingLiability] = useState(false);
  const [assetReconciliation, setAssetReconciliation] = useState<AssetReconciliationState>({
    actualValue: "",
    isConfirming: false,
    isSaving: false,
    note: "",
  });

  const activeAccounts = useMemo(() => accounts.filter(isAccountEnabled), [accounts]);

  const resetAssetForm = () => setAssetForm(createEmptyAssetForm());
  const resetLiabilityForm = () => setLiabilityForm(createEmptyLiabilityForm());

  const openAssetReconciliation = (asset: Asset) => {
    setAssetReconciliation({
      actualValue: String(asset.currentValue),
      asset,
      isConfirming: false,
      isSaving: false,
      note: "",
      reason: undefined,
    });
  };

  const closeAssetReconciliation = () => {
    setAssetReconciliation({
      actualValue: "",
      isConfirming: false,
      isSaving: false,
      note: "",
    });
  };

  const handleAssetReconciliationSubmit = async () => {
    const asset = assetReconciliation.asset;
    if (!asset) return;

    const actualValue = Number(assetReconciliation.actualValue.replace(",", "."));
    const diff = calculateReconciliationDiff(asset.currentValue, actualValue);

    if (!Number.isFinite(actualValue) || actualValue < 0) {
      Alert.alert("请输入实际金额", "实际金额必须大于等于 0。");
      return;
    }

    if (Math.abs(diff) < 0.01) {
      Alert.alert("无需调整", "差额为 0，无需生成对账调整。");
      return;
    }

    if (!assetReconciliation.reason) {
      Alert.alert("请选择差额原因", "请选择这次估值差额产生的原因。");
      return;
    }

    if (!assetReconciliation.isConfirming) {
      setAssetReconciliation((current) => ({ ...current, isConfirming: true }));
      return;
    }

    setAssetReconciliation((current) => ({ ...current, isSaving: true }));
    try {
      await onSaveReconciliation({
        actualValue,
        note: assetReconciliation.note,
        reason: assetReconciliation.reason,
        targetId: asset.id,
        targetType: "asset",
      });
      Alert.alert("更新完成", "资产当前价值已更新，首页和报表已同步刷新。");
      closeAssetReconciliation();
    } catch {
      Alert.alert("更新失败", "无法保存这次资产估值调整。");
      setAssetReconciliation((current) => ({ ...current, isSaving: false }));
    }
  };

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
      <TopBar onBack={onBack} title="资产负债管理" />

      <View style={sharedStyles.pageHeader}>
        <Text style={sharedStyles.eyebrow}>Assets & Liabilities</Text>
        <Text style={styles.title}>维护底稿与当前价值</Text>
        <Text style={sharedStyles.pageCopy}>
          在这里维护资产、负债和估值调整，用于生成个人资产负债表。
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
          placeholderTextColor={theme.colors.textMuted}
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
                style={[sharedStyles.chip, isActive && sharedStyles.chipActiveLight]}
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
          placeholderTextColor={theme.colors.textMuted}
          style={sharedStyles.input}
          value={assetForm.amount}
        />
        <Text style={styles.fieldLabel}>关联账户（可选）</Text>
        <View style={styles.chipGroup}>
          <Pressable
            onPress={() => setAssetForm((current) => ({ ...current, accountId: undefined }))}
            style={[sharedStyles.chip, !assetForm.accountId && sharedStyles.chipActiveLight]}
          >
            <Text style={sharedStyles.chipText}>不关联</Text>
          </Pressable>
          {activeAccounts.map((account) => {
            const isActive = assetForm.accountId === account.id;
            return (
              <Pressable
                key={account.id}
                onPress={() => setAssetForm((current) => ({ ...current, accountId: account.id }))}
                style={[sharedStyles.chip, isActive && sharedStyles.chipActiveLight]}
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
          placeholderTextColor={theme.colors.textMuted}
          style={[sharedStyles.input, sharedStyles.textArea]}
          value={assetForm.note}
        />
        <View style={styles.actionRow}>
          <Pressable
            disabled={isSavingAsset}
            onPress={() => void handleSubmitAsset()}
            style={[sharedStyles.primaryButton, styles.actionMain, isSavingAsset && styles.buttonDisabled]}
          >
            <Text style={sharedStyles.primaryButtonText}>{assetForm.id ? "保存资产修改" : "添加资产"}</Text>
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
                  {assetCategoryOptions.find((option) => option.value === asset.category)?.label ?? asset.category}
                </Text>
              </View>
              <Text style={styles.itemValue}>{formatCurrency(asset.currentValue)}</Text>
            </View>
            {asset.note ? <Text style={styles.itemNote}>{asset.note}</Text> : null}
            {asset.accountId ? (
              <Text style={styles.itemMeta}>
                关联账户：{activeAccounts.find((account) => account.id === asset.accountId)?.name ?? "已删除账户"}
              </Text>
            ) : null}
            <View style={styles.inlineActions}>
              <Pressable onPress={() => openAssetReconciliation(asset)} style={styles.inlineButton}>
                <Text style={styles.inlineButtonText}>更新当前价值</Text>
              </Pressable>
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
          placeholderTextColor={theme.colors.textMuted}
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
                style={[sharedStyles.chip, isActive && sharedStyles.chipActiveLight]}
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
          placeholderTextColor={theme.colors.textMuted}
          style={sharedStyles.input}
          value={liabilityForm.amount}
        />
        <TextInput
          onChangeText={(value) => setLiabilityForm((current) => ({ ...current, dueDate: value }))}
          placeholder="到期日（可选，YYYY-MM-DD）"
          placeholderTextColor={theme.colors.textMuted}
          style={sharedStyles.input}
          value={liabilityForm.dueDate}
        />
        <TextInput
          multiline
          onChangeText={(value) => setLiabilityForm((current) => ({ ...current, note: value }))}
          placeholder="备注（可选）"
          placeholderTextColor={theme.colors.textMuted}
          style={[sharedStyles.input, sharedStyles.textArea]}
          value={liabilityForm.note}
        />
        <View style={styles.actionRow}>
          <Pressable
            disabled={isSavingLiability}
            onPress={() => void handleSubmitLiability()}
            style={[sharedStyles.primaryButton, styles.actionMain, isSavingLiability && styles.buttonDisabled]}
          >
            <Text style={sharedStyles.primaryButtonText}>{liabilityForm.id ? "保存负债修改" : "添加负债"}</Text>
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
              <Text style={styles.itemValue}>{formatCurrency(liability.amount)}</Text>
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

      <AssetReconciliationModal
        reconciliation={assetReconciliation}
        onClose={closeAssetReconciliation}
        onSubmit={() => void handleAssetReconciliationSubmit()}
        updateReconciliation={(patch) => setAssetReconciliation((current) => ({ ...current, ...patch }))}
      />
    </View>
  );
}

function TopBar({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <View style={styles.headerRow}>
      <Pressable onPress={onBack} style={styles.backButton}>
        <AppIcon color={theme.colors.backButtonText} name="back" size={15} strokeWidth={2.2} />
        <Text style={styles.backButtonText}>返回</Text>
      </Pressable>
      <Text style={styles.pageTitle}>{title}</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}

interface AssetReconciliationModalProps {
  reconciliation: AssetReconciliationState;
  onClose: () => void;
  onSubmit: () => void;
  updateReconciliation: (patch: Partial<AssetReconciliationState>) => void;
}

function AssetReconciliationModal({
  reconciliation,
  onClose,
  onSubmit,
  updateReconciliation,
}: AssetReconciliationModalProps) {
  const asset = reconciliation.asset;
  const actualValue = Number(reconciliation.actualValue.replace(",", "."));
  const displayActual = Number.isFinite(actualValue) ? actualValue : asset?.currentValue ?? 0;
  const diff = asset ? calculateReconciliationDiff(asset.currentValue, displayActual) : 0;
  const reasonOptions = asset && Math.abs(diff) >= 0.01 ? getReconciliationReasonOptions("asset", diff) : [];

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={asset !== undefined}>
      <Pressable onPress={onClose} style={styles.modalBackdrop}>
        <Pressable style={styles.modalPanel}>
          {reconciliation.isConfirming ? (
            <>
              <Text style={styles.modalTitle}>确认对账调整</Text>
              <Text style={styles.modalDescription}>
                系统将根据你选择的原因生成一笔调整记录，并更新相关账户或资产。请确认这不是重复记录。
              </Text>
              <View style={styles.diffBox}>
                <Text style={styles.diffLabel}>本次差额</Text>
                <Text style={[styles.diffValue, diff >= 0 ? styles.diffPositive : styles.diffNegative]}>
                  {diff >= 0 ? "+" : "-"}
                  {formatCurrency(Math.abs(diff))}
                </Text>
              </View>
              <View style={styles.modalActions}>
                <Pressable
                  disabled={reconciliation.isSaving}
                  onPress={() => updateReconciliation({ isConfirming: false })}
                  style={sharedStyles.secondaryButton}
                >
                  <Text style={sharedStyles.secondaryButtonText}>取消</Text>
                </Pressable>
                <Pressable
                  disabled={reconciliation.isSaving}
                  onPress={onSubmit}
                  style={[sharedStyles.primaryButton, styles.modalPrimaryButton]}
                >
                  <Text style={sharedStyles.primaryButtonText}>
                    {reconciliation.isSaving ? "保存中..." : "确认调整"}
                  </Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.modalTitle}>更新当前价值</Text>
              <Text style={styles.modalDescription}>
                输入资产的实际市值，系统会生成非现金估值调整，不计入收入、费用或现金流。
              </Text>
              <View style={styles.diffBox}>
                <View>
                  <Text style={styles.diffLabel}>当前账面价值</Text>
                  <Text style={styles.diffBookValue}>{formatCurrency(asset?.currentValue ?? 0)}</Text>
                </View>
                <View style={styles.diffRight}>
                  <Text style={styles.diffLabel}>差额</Text>
                  <Text style={[styles.diffValue, diff >= 0 ? styles.diffPositive : styles.diffNegative]}>
                    {Math.abs(diff) < 0.01 ? "" : diff > 0 ? "+" : "-"}
                    {formatCurrency(Math.abs(diff))}
                  </Text>
                </View>
              </View>

              <Text style={styles.fieldLabel}>实际市值</Text>
              <TextInput
                keyboardType="decimal-pad"
                onChangeText={(value) =>
                  updateReconciliation({ actualValue: value, isConfirming: false, reason: undefined })
                }
                placeholder="请输入实际金额"
                placeholderTextColor={theme.colors.textMuted}
                style={sharedStyles.input}
                value={reconciliation.actualValue}
              />

              <Text style={styles.fieldLabel}>差额原因</Text>
              <View style={styles.chipGroup}>
                {reasonOptions.map((option) => {
                  const active = reconciliation.reason === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => updateReconciliation({ reason: option.value, isConfirming: false })}
                      style={[sharedStyles.chip, active && sharedStyles.chipActiveDark]}
                    >
                      <Text style={[sharedStyles.chipText, active && sharedStyles.chipTextInverse]}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.fieldLabel}>备注</Text>
              <TextInput
                multiline
                onChangeText={(value) => updateReconciliation({ note: value })}
                placeholder="可补充估值来源或说明"
                placeholderTextColor={theme.colors.textMuted}
                style={[sharedStyles.input, sharedStyles.textArea]}
                value={reconciliation.note}
              />

              <View style={styles.modalActions}>
                <Pressable onPress={onClose} style={sharedStyles.secondaryButton}>
                  <Text style={sharedStyles.secondaryButtonText}>取消</Text>
                </Pressable>
                <Pressable onPress={onSubmit} style={[sharedStyles.primaryButton, styles.modalPrimaryButton]}>
                  <Text style={sharedStyles.primaryButtonText}>下一步</Text>
                </Pressable>
              </View>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  actionMain: {
    flex: 1,
  },
  actionRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  backButton: {
    alignItems: "center",
    backgroundColor: theme.colors.backButtonBackground,
    borderColor: theme.colors.backButtonBorder,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backButtonText: {
    color: theme.colors.backButtonText,
    fontSize: 13,
    fontWeight: "800",
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  chipGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  diffBookValue: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: "900",
  },
  diffBox: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceSoft,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: theme.spacing.md,
  },
  diffLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  diffNegative: {
    color: theme.colors.danger,
  },
  diffPositive: {
    color: theme.colors.success,
  },
  diffRight: {
    alignItems: "flex-end",
  },
  diffValue: {
    fontSize: 18,
    fontWeight: "900",
    marginTop: 3,
  },
  fieldLabel: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
    justifyContent: "space-between",
  },
  headerSpacer: {
    width: 58,
  },
  inlineActions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  inlineButton: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceSoft,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 40,
    paddingHorizontal: theme.spacing.md,
  },
  inlineButtonText: {
    color: theme.colors.primaryDeep,
    fontSize: 14,
    fontWeight: "700",
  },
  inlineDangerButton: {
    alignItems: "center",
    backgroundColor: theme.colors.dangerSoft,
    borderRadius: theme.radius.lg,
    justifyContent: "center",
    minHeight: 40,
    paddingHorizontal: theme.spacing.md,
  },
  inlineDangerButtonText: {
    color: theme.colors.danger,
    fontSize: 14,
    fontWeight: "700",
  },
  itemCard: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
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
    fontSize: 13,
    lineHeight: 18,
  },
  itemNote: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginTop: theme.spacing.sm,
  },
  itemText: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "800",
  },
  itemValue: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "800",
  },
  modalActions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    justifyContent: "flex-end",
    marginTop: theme.spacing.sm,
  },
  modalBackdrop: {
    backgroundColor: "rgba(13, 25, 18, 0.42)",
    flex: 1,
    justifyContent: "flex-end",
    padding: theme.spacing.container,
  },
  modalDescription: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  modalPanel: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  modalPrimaryButton: {
    flex: 1,
  },
  modalTitle: {
    color: theme.colors.textPrimary,
    fontSize: 22,
    fontWeight: "900",
  },
  pageTitle: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  panel: {
    gap: 14,
  },
  stack: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  summaryLabel: {
    color: theme.colors.textInverse,
    fontSize: 14,
    fontWeight: "600",
  },
  summaryPanel: {
    backgroundColor: theme.colors.surfaceStrong,
    borderRadius: theme.radius.xl,
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
  },
  summaryRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
});
