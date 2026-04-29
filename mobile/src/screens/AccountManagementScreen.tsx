import { useMemo, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { AccountInput } from "../domain/accounting/transactionRules";
import type { Account, AccountType, Transaction } from "../domain/models";
import { sharedStyles, theme } from "../styles/theme";
import { formatCurrency } from "../utils/formatters";

interface AccountManagementScreenProps {
  accounts: Account[];
  transactions: Transaction[];
  onBack: () => void;
  onDeleteAccount: (accountId: string) => Promise<void>;
  onDisableAccount: (accountId: string) => Promise<void>;
  onSaveAccount: (input: AccountInput) => Promise<void>;
}

interface AccountFormState {
  id?: string;
  name: string;
  type: AccountType;
  balance: string;
  isEnabled: boolean;
  note: string;
  creditLimit: string;
  currentDebt: string;
  billDay: string;
  repaymentDay: string;
}

const accountTypeOptions: Array<{ label: string; value: AccountType }> = [
  { label: "现金", value: "cash" },
  { label: "银行卡", value: "bank" },
  { label: "微信", value: "wechat" },
  { label: "支付宝", value: "alipay" },
  { label: "信用卡", value: "creditCard" },
  { label: "投资账户", value: "investment" },
  { label: "其他账户", value: "other" },
];

const emptyForm: AccountFormState = {
  name: "",
  type: "bank",
  balance: "",
  isEnabled: true,
  note: "",
  creditLimit: "",
  currentDebt: "",
  billDay: "",
  repaymentDay: "",
};

const getAccountTypeLabel = (type: AccountType): string =>
  accountTypeOptions.find((option) => option.value === type)?.label ?? "其他账户";

const normalizeAccountType = (type: AccountType): AccountType =>
  accountTypeOptions.some((option) => option.value === type) ? type : "other";

const isAccountEnabled = (account: Account): boolean => account.isEnabled ?? account.isActive ?? true;

const formatAccountBalance = (account: Account): string => {
  if (account.type === "creditCard") {
    const debt = account.currentDebt ?? Math.max(0, -account.balance);
    return `欠款 ${formatCurrency(debt)}`;
  }

  return formatCurrency(account.balance);
};

const parseOptionalNumber = (value: string): number | undefined => {
  if (!value.trim()) return undefined;
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

const parseOptionalDay = (value: string): number | undefined => {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 31 ? parsed : Number.NaN;
};

const buildFormFromAccount = (account: Account): AccountFormState => ({
  id: account.id,
  name: account.name,
  type: normalizeAccountType(account.type),
  balance: String(account.type === "creditCard" ? Math.max(0, -account.balance) : account.balance),
  isEnabled: isAccountEnabled(account),
  note: account.note ?? "",
  creditLimit: account.creditLimit === undefined ? "" : String(account.creditLimit),
  currentDebt: account.currentDebt === undefined ? String(Math.max(0, -account.balance)) : String(account.currentDebt),
  billDay: account.billDay === undefined ? "" : String(account.billDay),
  repaymentDay: account.repaymentDay === undefined ? "" : String(account.repaymentDay),
});

export default function AccountManagementScreen({
  accounts,
  transactions,
  onBack,
  onDeleteAccount,
  onDisableAccount,
  onSaveAccount,
}: AccountManagementScreenProps) {
  const [form, setForm] = useState<AccountFormState>(emptyForm);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const enabledAccounts = useMemo(() => accounts.filter(isAccountEnabled), [accounts]);
  const totalBalance = enabledAccounts.reduce((sum, account) => sum + account.balance, 0);

  const openCreateForm = () => {
    setForm(emptyForm);
    setIsFormVisible(true);
  };

  const openEditForm = (account: Account) => {
    setForm(buildFormFromAccount(account));
    setIsFormVisible(true);
  };

  const closeForm = () => {
    if (isSaving) return;
    setIsFormVisible(false);
  };

  const updateForm = (patch: Partial<AccountFormState>) => {
    setForm((current) => ({ ...current, ...patch }));
  };

  const validateAndBuildInput = (): AccountInput | null => {
    const name = form.name.trim();
    const balance = Number(form.balance.replace(",", "."));
    const creditLimit = parseOptionalNumber(form.creditLimit);
    const currentDebt = parseOptionalNumber(form.currentDebt);
    const billDay = parseOptionalDay(form.billDay);
    const repaymentDay = parseOptionalDay(form.repaymentDay);

    if (!name) {
      Alert.alert("请填写账户名称", "账户名称是必填项。");
      return null;
    }

    if (!form.type) {
      Alert.alert("请选择账户类型", "账户类型是必填项。");
      return null;
    }

    if (!Number.isFinite(balance)) {
      Alert.alert("余额不正确", "请输入有效的数字。");
      return null;
    }

    if (form.type === "creditCard") {
      if (creditLimit !== undefined && !Number.isFinite(creditLimit)) {
        Alert.alert("信用额度不正确", "请输入有效的信用额度。");
        return null;
      }

      if (currentDebt !== undefined && !Number.isFinite(currentDebt)) {
        Alert.alert("当前欠款不正确", "请输入有效的当前欠款。");
        return null;
      }

      if (billDay !== undefined && !Number.isFinite(billDay)) {
        Alert.alert("账单日不正确", "账单日应为 1-31 的整数。");
        return null;
      }

      if (repaymentDay !== undefined && !Number.isFinite(repaymentDay)) {
        Alert.alert("还款日不正确", "还款日应为 1-31 的整数。");
        return null;
      }
    }

    return {
      id: form.id,
      name,
      type: form.type,
      balance,
      isEnabled: form.isEnabled,
      note: form.note,
      creditLimit,
      currentDebt: form.type === "creditCard" ? currentDebt ?? Math.max(0, balance) : undefined,
      billDay,
      repaymentDay,
    };
  };

  const handleSave = async () => {
    const input = validateAndBuildInput();
    if (!input) return;

    setIsSaving(true);
    try {
      await onSaveAccount(input);
      setIsFormVisible(false);
      Alert.alert(input.id ? "账户已更新" : "账户已新增", "账户列表和记一笔账户选择已同步刷新。");
    } catch {
      Alert.alert("保存失败", "无法保存这个账户。");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisable = (account: Account) => {
    Alert.alert("停用账户", `停用后，“${account.name}”不会出现在日常记账账户选择中。`, [
      { text: "取消", style: "cancel" },
      {
        text: "确认停用",
        style: "destructive",
        onPress: () => void onDisableAccount(account.id),
      },
    ]);
  };

  const handleDelete = (account: Account) => {
    const hasTransactionReference = transactions.some((transaction) => transaction.accountId === account.id);

    if (hasTransactionReference) {
      Alert.alert("建议停用账户", "这个账户已有交易记录。为了保护历史数据，不能直接删除，建议停用。", [
        { text: "取消", style: "cancel" },
        {
          text: "停用账户",
          style: "destructive",
          onPress: () => void onDisableAccount(account.id),
        },
      ]);
      return;
    }

    Alert.alert("删除账户", `确认删除“${account.name}”？删除后无法恢复。`, [
      { text: "取消", style: "cancel" },
      {
        text: "确认删除",
        style: "destructive",
        onPress: () => void onDeleteAccount(account.id),
      },
    ]);
  };

  return (
    <View style={styles.stack}>
      <View style={styles.headerRow}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>返回</Text>
        </Pressable>
        <Text style={styles.pageTitle}>账户管理</Text>
        <Pressable onPress={openCreateForm} style={styles.addButton}>
          <Text style={styles.addButtonText}>新增</Text>
        </Pressable>
      </View>

      <View style={[sharedStyles.card, styles.overviewCard]}>
        <View>
          <Text style={styles.overviewLabel}>账户余额合计</Text>
          <Text style={styles.overviewValue}>{formatCurrency(totalBalance)}</Text>
        </View>
        <View style={styles.enabledBadge}>
          <Text style={styles.enabledBadgeText}>启用 {enabledAccounts.length} 个</Text>
        </View>
      </View>

      <View style={[sharedStyles.card, styles.listCard]}>
        <Text style={sharedStyles.sectionTitle}>账户列表</Text>
        {accounts.length > 0 ? (
          accounts.map((account) => {
            const enabled = isAccountEnabled(account);
            return (
              <View key={account.id} style={styles.accountRow}>
                <Pressable onPress={() => openEditForm(account)} style={styles.accountMain}>
                  <View>
                    <Text style={styles.accountName}>{account.name}</Text>
                    <Text style={styles.accountMeta}>
                      {getAccountTypeLabel(account.type)} · {enabled ? "已启用" : "已停用"}
                    </Text>
                  </View>
                  <Text style={styles.accountBalance}>{formatAccountBalance(account)}</Text>
                </Pressable>
                <View style={styles.rowActionGroup}>
                  <Pressable onPress={() => handleDisable(account)} style={styles.smallActionButton}>
                    <Text style={styles.smallActionText}>{enabled ? "停用" : "已停用"}</Text>
                  </Pressable>
                  <Pressable onPress={() => handleDelete(account)} style={styles.smallDangerButton}>
                    <Text style={styles.smallDangerText}>删除</Text>
                  </Pressable>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyStateBox}>
            <Text style={styles.emptyStateTitle}>暂无账户</Text>
            <Text style={styles.emptyStateDescription}>先新增一个现金、银行卡或支付账户，再开始记一笔。</Text>
          </View>
        )}
      </View>

      <Modal animationType="fade" onRequestClose={closeForm} transparent visible={isFormVisible}>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
          <View style={[sharedStyles.card, styles.modalCard]}>
            <Text style={sharedStyles.sectionTitle}>{form.id ? "编辑账户" : "新增账户"}</Text>

            <Text style={styles.fieldLabel}>账户名称</Text>
            <TextInput
              onChangeText={(value) => updateForm({ name: value })}
              placeholder="例如 招商银行卡"
              placeholderTextColor={theme.colors.textMuted}
              style={sharedStyles.input}
              value={form.name}
            />

            <Text style={styles.fieldLabel}>账户类型</Text>
            <View style={styles.chipWrap}>
              {accountTypeOptions.map((option) => {
                const active = form.type === option.value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => updateForm({ type: option.value })}
                    style={[sharedStyles.chip, active && sharedStyles.chipActiveDark]}
                  >
                    <Text style={[sharedStyles.chipText, active && sharedStyles.chipTextInverse]}>{option.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.fieldLabel}>{form.type === "creditCard" ? "当前欠款" : "当前余额"}</Text>
            <TextInput
              keyboardType="decimal-pad"
              onChangeText={(value) => updateForm({ balance: value, currentDebt: form.type === "creditCard" ? value : form.currentDebt })}
              placeholder="0"
              placeholderTextColor={theme.colors.textMuted}
              style={sharedStyles.input}
              value={form.balance}
            />

            {form.type === "creditCard" ? (
              <>
                <Text style={styles.fieldLabel}>信用额度</Text>
                <TextInput
                  keyboardType="decimal-pad"
                  onChangeText={(value) => updateForm({ creditLimit: value })}
                  placeholder="可选"
                  placeholderTextColor={theme.colors.textMuted}
                  style={sharedStyles.input}
                  value={form.creditLimit}
                />
                <View style={styles.twoColumnRow}>
                  <View style={styles.twoColumnItem}>
                    <Text style={styles.fieldLabel}>账单日</Text>
                    <TextInput
                      keyboardType="number-pad"
                      onChangeText={(value) => updateForm({ billDay: value })}
                      placeholder="1-31"
                      placeholderTextColor={theme.colors.textMuted}
                      style={sharedStyles.input}
                      value={form.billDay}
                    />
                  </View>
                  <View style={styles.twoColumnItem}>
                    <Text style={styles.fieldLabel}>还款日</Text>
                    <TextInput
                      keyboardType="number-pad"
                      onChangeText={(value) => updateForm({ repaymentDay: value })}
                      placeholder="1-31"
                      placeholderTextColor={theme.colors.textMuted}
                      style={sharedStyles.input}
                      value={form.repaymentDay}
                    />
                  </View>
                </View>
              </>
            ) : null}

            <Text style={styles.fieldLabel}>是否启用</Text>
            <View style={styles.chipWrap}>
              <Pressable
                onPress={() => updateForm({ isEnabled: true })}
                style={[sharedStyles.chip, form.isEnabled && sharedStyles.chipActiveDark]}
              >
                <Text style={[sharedStyles.chipText, form.isEnabled && sharedStyles.chipTextInverse]}>启用</Text>
              </Pressable>
              <Pressable
                onPress={() => updateForm({ isEnabled: false })}
                style={[sharedStyles.chip, !form.isEnabled && sharedStyles.chipActiveDark]}
              >
                <Text style={[sharedStyles.chipText, !form.isEnabled && sharedStyles.chipTextInverse]}>停用</Text>
              </Pressable>
            </View>

            <Text style={styles.fieldLabel}>备注</Text>
            <TextInput
              multiline
              onChangeText={(value) => updateForm({ note: value })}
              placeholder="可选"
              placeholderTextColor={theme.colors.textMuted}
              style={[sharedStyles.input, sharedStyles.textArea]}
              value={form.note}
            />

            <View style={styles.modalActionRow}>
              <Pressable disabled={isSaving} onPress={closeForm} style={[sharedStyles.secondaryButton, styles.modalAction]}>
                <Text style={sharedStyles.secondaryButtonText}>取消</Text>
              </Pressable>
              <Pressable
                disabled={isSaving}
                onPress={() => void handleSave()}
                style={[sharedStyles.primaryButton, styles.modalAction, isSaving && styles.buttonDisabled]}
              >
                <Text style={sharedStyles.primaryButtonText}>{isSaving ? "保存中..." : "保存账户"}</Text>
              </Pressable>
            </View>
          </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  accountBalance: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: "900",
  },
  accountMain: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  accountMeta: {
    color: theme.colors.textMuted,
    fontSize: 13,
    marginTop: 3,
  },
  accountName: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "800",
  },
  accountRow: {
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
  },
  addButton: {
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.pill,
    justifyContent: "center",
    minHeight: 38,
    minWidth: 64,
    paddingHorizontal: 14,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  backButton: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backButtonText: {
    color: theme.colors.primaryDeep,
    fontSize: 13,
    fontWeight: "800",
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  emptyStateBox: {
    backgroundColor: theme.colors.surfaceSoft,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    gap: 4,
    padding: theme.spacing.md,
  },
  emptyStateDescription: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  emptyStateTitle: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
  enabledBadge: {
    backgroundColor: theme.colors.successSoft,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  enabledBadgeText: {
    color: theme.colors.success,
    fontSize: 12,
    fontWeight: "800",
  },
  fieldLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.label,
    fontWeight: "700",
    marginBottom: theme.spacing.xs,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
    justifyContent: "space-between",
  },
  listCard: {
    gap: theme.spacing.sm,
  },
  modalAction: {
    flex: 1,
  },
  modalActionRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  modalCard: {
    gap: theme.spacing.md,
    maxHeight: "92%",
  },
  modalOverlay: {
    backgroundColor: "rgba(24, 16, 44, 0.18)",
    flex: 1,
    justifyContent: "center",
    padding: theme.spacing.container,
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  overviewCard: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  overviewLabel: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  overviewValue: {
    color: theme.colors.textPrimary,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.6,
    marginTop: 3,
  },
  pageTitle: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  rowActionGroup: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  smallActionButton: {
    backgroundColor: theme.colors.surfaceSoft,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  smallActionText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "800",
  },
  smallDangerButton: {
    backgroundColor: theme.colors.dangerSoft,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  smallDangerText: {
    color: theme.colors.danger,
    fontSize: 12,
    fontWeight: "800",
  },
  stack: {
    gap: theme.spacing.lg,
  },
  twoColumnItem: {
    flex: 1,
  },
  twoColumnRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
});
