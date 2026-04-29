import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
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

type AccountRoute =
  | { name: "overview" }
  | { name: "categoryDetail"; type: AccountType }
  | { name: "form"; type?: AccountType; returnTo?: AccountType };

interface AccountCategoryMeta {
  type: AccountType;
  label: string;
  detailTitle: string;
  countUnit: string;
}

const accountCategories: AccountCategoryMeta[] = [
  { type: "bank", label: "银行卡", detailTitle: "银行卡账户", countUnit: "张卡" },
  { type: "wechat", label: "微信钱包", detailTitle: "微信钱包", countUnit: "个账户" },
  { type: "alipay", label: "支付宝", detailTitle: "支付宝", countUnit: "个账户" },
  { type: "securities", label: "证券账户", detailTitle: "证券账户", countUnit: "个账户" },
  { type: "fund", label: "基金账户", detailTitle: "基金账户", countUnit: "个账户" },
  { type: "creditCard", label: "信用卡", detailTitle: "信用卡", countUnit: "张卡" },
  { type: "other", label: "其他账户", detailTitle: "其他账户", countUnit: "个账户" },
];

const emptyForm = (type: AccountType = "bank"): AccountFormState => ({
  name: "",
  type,
  balance: "",
  isEnabled: true,
  note: "",
  creditLimit: "",
  currentDebt: "",
  billDay: "",
  repaymentDay: "",
});

const getCategoryMeta = (type: AccountType): AccountCategoryMeta =>
  accountCategories.find((category) => category.type === type) ?? accountCategories[accountCategories.length - 1];

const normalizeAccountType = (type: Account["type"] | string): AccountType => {
  if (type === "investment") return "fund";
  if (type === "cash") return "other";
  return accountCategories.some((category) => category.type === type) ? (type as AccountType) : "other";
};

const isAccountEnabled = (account: Account): boolean => account.isEnabled ?? account.isActive ?? true;

const getCreditCardDebt = (account: Account): number => account.currentDebt ?? Math.max(0, -account.balance);

const getCategoryAmount = (accounts: Account[], type: AccountType): number => {
  const categoryAccounts = accounts.filter((account) => normalizeAccountType(account.type) === type);

  if (type === "creditCard") {
    return categoryAccounts.reduce((sum, account) => sum + getCreditCardDebt(account), 0);
  }

  return categoryAccounts.reduce((sum, account) => sum + account.balance, 0);
};

const getEnabledAssetBalance = (accounts: Account[]): number =>
  accounts
    .filter((account) => isAccountEnabled(account) && normalizeAccountType(account.type) !== "creditCard")
    .reduce((sum, account) => sum + account.balance, 0);

const getEnabledCreditCardDebt = (accounts: Account[]): number =>
  accounts
    .filter((account) => isAccountEnabled(account) && normalizeAccountType(account.type) === "creditCard")
    .reduce((sum, account) => sum + getCreditCardDebt(account), 0);

const formatCategoryAmount = (type: AccountType, value: number): string =>
  type === "creditCard" ? `欠款 ${formatCurrency(value)}` : formatCurrency(value);

const formatAccountBalance = (account: Account): string => {
  const type = normalizeAccountType(account.type);
  return type === "creditCard" ? `当前欠款 ${formatCurrency(getCreditCardDebt(account))}` : formatCurrency(account.balance);
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

const buildFormFromAccount = (account: Account): AccountFormState => {
  const type = normalizeAccountType(account.type);
  const currentDebt = getCreditCardDebt(account);

  return {
    id: account.id,
    name: account.name,
    type,
    balance: String(type === "creditCard" ? currentDebt : account.balance),
    isEnabled: isAccountEnabled(account),
    note: account.note ?? "",
    creditLimit: account.creditLimit === undefined ? "" : String(account.creditLimit),
    currentDebt: account.currentDebt === undefined ? String(currentDebt) : String(account.currentDebt),
    billDay: account.billDay === undefined ? "" : String(account.billDay),
    repaymentDay: account.repaymentDay === undefined ? "" : String(account.repaymentDay),
  };
};

export default function AccountManagementScreen({
  accounts,
  transactions,
  onBack,
  onDeleteAccount,
  onDisableAccount,
  onSaveAccount,
}: AccountManagementScreenProps) {
  const [route, setRoute] = useState<AccountRoute>({ name: "overview" });
  const [form, setForm] = useState<AccountFormState>(emptyForm());
  const [isSaving, setIsSaving] = useState(false);

  const enabledAccounts = useMemo(() => accounts.filter(isAccountEnabled), [accounts]);
  const enabledAssetBalance = getEnabledAssetBalance(accounts);
  const enabledCreditCardDebt = getEnabledCreditCardDebt(accounts);

  const openCategoryDetail = (type: AccountType) => {
    setForm(emptyForm(type));
    setRoute({ name: "categoryDetail", type });
  };

  const openCreateForm = (type?: AccountType, returnTo?: AccountType) => {
    setForm(emptyForm(type));
    setRoute({ name: "form", returnTo, type });
  };

  const openEditForm = (account: Account, returnTo: AccountType) => {
    setForm(buildFormFromAccount(account));
    setRoute({ name: "form", returnTo, type: normalizeAccountType(account.type) });
  };

  const updateForm = (patch: Partial<AccountFormState>) => {
    setForm((current) => ({ ...current, ...patch }));
  };

  const handleBack = () => {
    if (route.name === "overview") {
      onBack();
      return;
    }

    if (route.name === "categoryDetail") {
      setRoute({ name: "overview" });
      return;
    }

    if (route.returnTo) {
      openCategoryDetail(route.returnTo);
      return;
    }

    setRoute({ name: "overview" });
  };

  const validateAndBuildInput = (): AccountInput | null => {
    const name = form.name.trim();
    const balance = Number(form.balance.replace(",", "."));
    const creditLimit = parseOptionalNumber(form.creditLimit);
    const currentDebt = parseOptionalNumber(form.currentDebt || form.balance);
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
      Alert.alert(input.id ? "账户已更新" : "账户已新增", "账户管理和记一笔账户选择已同步刷新。");
      openCategoryDetail(input.type);
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

  if (route.name === "form") {
    return (
      <AccountFormPage
        form={form}
        isSaving={isSaving}
        onBack={handleBack}
        onSave={handleSave}
        updateForm={updateForm}
      />
    );
  }

  if (route.name === "categoryDetail") {
    const meta = getCategoryMeta(route.type);
    const categoryAccounts = accounts.filter((account) => normalizeAccountType(account.type) === route.type);

    return (
      <View style={styles.stack}>
        <TopBar onBack={handleBack} onAdd={() => openCreateForm(route.type, route.type)} title={meta.detailTitle} />
        <CategorySummaryCard accounts={categoryAccounts} meta={meta} />
        <View style={[sharedStyles.card, styles.listCard]}>
          <Text style={sharedStyles.sectionTitle}>具体账户</Text>
          {categoryAccounts.length > 0 ? (
            categoryAccounts.map((account) => (
              <AccountDetailRow
                account={account}
                key={account.id}
                onDelete={() => handleDelete(account)}
                onDisable={() => handleDisable(account)}
                onEdit={() => openEditForm(account, route.type)}
              />
            ))
          ) : (
            <View style={styles.emptyStateBox}>
              <Text style={styles.emptyStateTitle}>暂无账户</Text>
              <Text style={styles.emptyStateDescription}>
                你可以新增一个{meta.label}账户，用于后续记账和资产统计。
              </Text>
              <Pressable onPress={() => openCreateForm(route.type, route.type)} style={sharedStyles.primaryButton}>
                <Text style={sharedStyles.primaryButtonText}>新增账户</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.stack}>
      <TopBar onBack={handleBack} onAdd={() => openCreateForm()} title="账户管理" />
      <View style={[sharedStyles.card, styles.overviewCard]}>
        <View>
          <Text style={styles.overviewLabel}>账户余额合计</Text>
          <Text style={styles.overviewValue}>{formatCurrency(enabledAssetBalance)}</Text>
          <Text style={styles.overviewHint}>不含信用卡欠款</Text>
        </View>
        <View style={styles.overviewRight}>
          <Text style={styles.enabledBadgeText}>启用账户 {enabledAccounts.length} 个</Text>
          <Text style={styles.creditDebtText}>信用卡欠款 {formatCurrency(enabledCreditCardDebt)}</Text>
        </View>
      </View>

      <View style={[sharedStyles.card, styles.listCard]}>
        <Text style={sharedStyles.sectionTitle}>账户大类总览</Text>
        {accountCategories.map((category) => {
          const categoryAccounts = accounts.filter((account) => normalizeAccountType(account.type) === category.type);
          const categoryAmount = getCategoryAmount(accounts, category.type);

          return (
            <Pressable
              key={category.type}
              onPress={() => openCategoryDetail(category.type)}
              style={styles.categoryRow}
            >
              <View style={styles.categoryMain}>
                <Text style={styles.categoryTitle}>{category.label}</Text>
                <Text style={styles.categorySubtitle}>
                  {categoryAccounts.length} {category.countUnit}
                </Text>
              </View>
              <View style={styles.categoryRight}>
                <Text style={styles.categoryAmount}>{formatCategoryAmount(category.type, categoryAmount)}</Text>
                <Text style={styles.listArrow}>›</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

interface TopBarProps {
  onBack: () => void;
  onAdd: () => void;
  title: string;
}

function TopBar({ onBack, onAdd, title }: TopBarProps) {
  return (
    <View style={styles.headerRow}>
      <Pressable onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>返回</Text>
      </Pressable>
      <Text style={styles.pageTitle}>{title}</Text>
      <Pressable onPress={onAdd} style={styles.addButton}>
        <Text style={styles.addButtonText}>新增</Text>
      </Pressable>
    </View>
  );
}

interface CategorySummaryCardProps {
  accounts: Account[];
  meta: AccountCategoryMeta;
}

function CategorySummaryCard({ accounts, meta }: CategorySummaryCardProps) {
  const enabledCount = accounts.filter(isAccountEnabled).length;
  const total = getCategoryAmount(accounts, meta.type);
  const creditLimitTotal = accounts.reduce((sum, account) => sum + (account.creditLimit ?? 0), 0);

  return (
    <View style={[sharedStyles.card, styles.summaryCard]}>
      <Text style={styles.summaryLabel}>{meta.type === "creditCard" ? "信用卡合计" : `${meta.label}合计`}</Text>
      <Text style={styles.summaryValue}>{formatCategoryAmount(meta.type, total)}</Text>
      {meta.type === "creditCard" ? (
        <Text style={styles.summaryHint}>信用额度 {formatCurrency(creditLimitTotal)}</Text>
      ) : null}
      <Text style={styles.summaryHint}>启用账户 {enabledCount} 个</Text>
    </View>
  );
}

interface AccountDetailRowProps {
  account: Account;
  onDelete: () => void;
  onDisable: () => void;
  onEdit: () => void;
}

function AccountDetailRow({ account, onDelete, onDisable, onEdit }: AccountDetailRowProps) {
  const enabled = isAccountEnabled(account);
  const isCreditCard = normalizeAccountType(account.type) === "creditCard";

  return (
    <View style={styles.accountRow}>
      <Pressable onPress={onEdit} style={styles.accountMain}>
        <View style={styles.accountTitleRow}>
          <Text style={styles.accountName}>{account.name}</Text>
          <Text style={[styles.statusBadge, !enabled && styles.statusBadgeMuted]}>{enabled ? "启用" : "停用"}</Text>
        </View>
        <Text style={styles.accountBalance}>{formatAccountBalance(account)}</Text>
        {isCreditCard && account.creditLimit ? (
          <Text style={styles.accountMeta}>信用额度 {formatCurrency(account.creditLimit)}</Text>
        ) : null}
        <Text style={styles.accountMeta}>用途：{account.note || "未填写"}</Text>
      </Pressable>
      <View style={styles.rowActionGroup}>
        <Pressable onPress={onDisable} style={styles.smallActionButton}>
          <Text style={styles.smallActionText}>{enabled ? "停用" : "已停用"}</Text>
        </Pressable>
        <Pressable onPress={onDelete} style={styles.smallDangerButton}>
          <Text style={styles.smallDangerText}>删除</Text>
        </Pressable>
      </View>
    </View>
  );
}

interface AccountFormPageProps {
  form: AccountFormState;
  isSaving: boolean;
  onBack: () => void;
  onSave: () => void;
  updateForm: (patch: Partial<AccountFormState>) => void;
}

function AccountFormPage({ form, isSaving, onBack, onSave, updateForm }: AccountFormPageProps) {
  return (
    <View style={styles.stack}>
      <TopBar onBack={onBack} onAdd={onSave} title={form.id ? "编辑账户" : "新增账户"} />
      <View style={[sharedStyles.card, styles.formCard]}>
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
          {accountCategories.map((option) => {
            const active = form.type === option.type;
            return (
              <Pressable
                key={option.type}
                onPress={() => updateForm({ type: option.type })}
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
          onChangeText={(value) =>
            updateForm({ balance: value, currentDebt: form.type === "creditCard" ? value : form.currentDebt })
          }
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

        <Text style={styles.fieldLabel}>备注 / 用途</Text>
        <TextInput
          multiline
          onChangeText={(value) => updateForm({ note: value })}
          placeholder="例如 工资卡 / 日常消费 / 投资账户"
          placeholderTextColor={theme.colors.textMuted}
          style={[sharedStyles.input, sharedStyles.textArea]}
          value={form.note}
        />

        <Pressable
          disabled={isSaving}
          onPress={onSave}
          style={[sharedStyles.primaryButton, isSaving && styles.buttonDisabled]}
        >
          <Text style={sharedStyles.primaryButtonText}>{isSaving ? "保存中..." : "保存账户"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  accountBalance: {
    color: theme.colors.textPrimary,
    fontSize: 17,
    fontWeight: "900",
    marginTop: 8,
  },
  accountMain: {
    gap: 2,
  },
  accountMeta: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 2,
  },
  accountName: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
  },
  accountRow: {
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
  },
  accountTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
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
  categoryAmount: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: "900",
  },
  categoryMain: {
    flex: 1,
  },
  categoryRight: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  categoryRow: {
    alignItems: "center",
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 58,
    paddingVertical: theme.spacing.sm,
  },
  categorySubtitle: {
    color: theme.colors.textMuted,
    fontSize: 13,
    marginTop: 3,
  },
  categoryTitle: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "800",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  creditDebtText: {
    color: theme.colors.warning,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 5,
    textAlign: "right",
  },
  emptyStateBox: {
    backgroundColor: theme.colors.surfaceSoft,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    gap: theme.spacing.sm,
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
  enabledBadgeText: {
    color: theme.colors.success,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "right",
  },
  fieldLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.label,
    fontWeight: "700",
    marginBottom: theme.spacing.xs,
  },
  formCard: {
    gap: theme.spacing.md,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
    justifyContent: "space-between",
  },
  listArrow: {
    color: theme.colors.textMuted,
    fontSize: 24,
    lineHeight: 24,
  },
  listCard: {
    gap: theme.spacing.sm,
  },
  overviewCard: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  overviewHint: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  overviewLabel: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  overviewRight: {
    alignItems: "flex-end",
    backgroundColor: theme.colors.successSoft,
    borderRadius: theme.radius.lg,
    paddingHorizontal: 10,
    paddingVertical: 8,
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
  statusBadge: {
    backgroundColor: theme.colors.successSoft,
    borderRadius: theme.radius.pill,
    color: theme.colors.success,
    fontSize: 12,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusBadgeMuted: {
    backgroundColor: theme.colors.surfaceMuted,
    color: theme.colors.textMuted,
  },
  summaryCard: {
    gap: 4,
  },
  summaryHint: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
  summaryLabel: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  summaryValue: {
    color: theme.colors.textPrimary,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.6,
  },
  twoColumnItem: {
    flex: 1,
  },
  twoColumnRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
});
