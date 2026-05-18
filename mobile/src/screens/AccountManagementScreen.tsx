import { useEffect, useMemo, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from "react-native";
import {
  calculateReconciliationDiff,
  getReconciliationReasonOptions,
  type ReconciliationInput,
  type ReconciliationReason,
} from "../domain/accounting/reconciliationRules";
import type { AccountInput } from "../domain/accounting/transactionRules";
import type { Account, AccountType, Transaction } from "../domain/models";
import type { AppIconName } from "../components/AppIcon";
import { EmptyStateScreen } from "../components/EmptyState";
import Skeleton from "../components/Skeleton";
import SkeletonCard, { SkeletonScreenShell } from "../components/SkeletonCard";
import {
  AmountText,
  BottomSheetFrame,
  DangerActionButton,
  InfoLineRow,
  SummaryHeroCard,
  TopBar as FinanceTopBar,
} from "../components/financeUI";
import {
  LedgerFullBleedList,
  LedgerSectionHeader,
  LedgerValueRow,
  getLedgerScreenPadding,
} from "../components/LedgerUI";
import ScreenTransition from "../components/ScreenTransition";
import { sharedStyles, theme } from "../styles/theme";
import { formatCurrency } from "../utils/formatters";

interface AccountManagementScreenProps {
  accounts: Account[];
  isLoading?: boolean;
  transactions: Transaction[];
  onBack: () => void;
  onDeleteAccount: (accountId: string) => Promise<void>;
  onDisableAccount: (accountId: string) => Promise<void>;
  onSaveAccount: (input: AccountInput) => Promise<void>;
  onSaveReconciliation: (input: ReconciliationInput) => Promise<void>;
}

interface AccountFormState {
  id?: string;
  name: string;
  type: AccountType;
  balance: string;
  originalAmount?: number;
  isEnabled: boolean;
  note: string;
  creditLimit: string;
  currentDebt: string;
  billDay: string;
  repaymentDay: string;
}

interface AccountReconciliationState {
  account?: Account;
  actualValue: string;
  reason?: ReconciliationReason;
  note: string;
  payingAccountId?: string;
  isConfirming: boolean;
  isSaving: boolean;
}

type AccountRoute =
  | { name: "overview" }
  | { name: "categoryDetail"; type: AccountType };

interface AccountFormSheetState {
  returnTo?: AccountType;
  type?: AccountType;
}

interface AccountCategoryMeta {
  type: AccountType;
  label: string;
  detailTitle: string;
  countUnit: string;
}

type AccountAccent = "blue" | "green" | "orange" | "purple" | "red";

interface AccountGroupMeta {
  title: string;
  subtitle: string;
  types: AccountType[];
  accent: AccountAccent;
}

const accountCategories: AccountCategoryMeta[] = [
  { type: "cash", label: "现金账户", detailTitle: "现金账户", countUnit: "个账户" },
  { type: "bank", label: "银行卡", detailTitle: "银行卡账户", countUnit: "张卡" },
  { type: "wechat", label: "微信钱包", detailTitle: "微信钱包", countUnit: "个账户" },
  { type: "alipay", label: "支付宝", detailTitle: "支付宝", countUnit: "个账户" },
  { type: "securities", label: "证券账户", detailTitle: "证券账户", countUnit: "个账户" },
  { type: "fund", label: "基金账户", detailTitle: "基金账户", countUnit: "个账户" },
  { type: "creditCard", label: "信用卡", detailTitle: "信用卡", countUnit: "张卡" },
  { type: "other", label: "其他账户", detailTitle: "其他账户", countUnit: "个账户" },
];

const accountGroups: AccountGroupMeta[] = [
  { title: "现金与活期", subtitle: "现金、微信、支付宝", types: ["cash", "wechat", "alipay"], accent: "orange" },
  { title: "信用与借记", subtitle: "银行卡、信用卡", types: ["bank", "creditCard"], accent: "blue" },
  { title: "投资账户", subtitle: "证券、基金", types: ["securities", "fund"], accent: "purple" },
  { title: "其他", subtitle: "其他自定义账户", types: ["other"], accent: "green" },
];

const emptyAccountsIllustration = require("../assets/empty/empty-accounts.png");

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

const getAccountTypeLabel = (type: AccountType): string => getCategoryMeta(type).label;

const getAccountTypeIcon = (type: AccountType): AppIconName => {
  switch (type) {
    case "cash":
      return "wallet";
    case "bank":
      return "bank";
    case "wechat":
    case "alipay":
      return "wallet";
    case "securities":
      return "securities";
    case "fund":
      return "fund";
    case "creditCard":
      return "card";
    case "other":
      return "account";
  }
};

const normalizeAccountType = (type: Account["type"] | string): AccountType => {
  if (type === "investment") return "fund";
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
  const type = account.type;
  const currentDebt = getCreditCardDebt(account);
  const editableAmount = type === "creditCard" ? currentDebt : account.balance;

  return {
    id: account.id,
    name: account.name,
    type,
    balance: String(editableAmount),
    originalAmount: editableAmount,
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
  isLoading = false,
  transactions,
  onBack,
  onDeleteAccount,
  onDisableAccount,
  onSaveAccount,
  onSaveReconciliation,
}: AccountManagementScreenProps) {
  const { width } = useWindowDimensions();
  const horizontalPadding = getLedgerScreenPadding(width);
  const [route, setRoute] = useState<AccountRoute>({ name: "overview" });
  const [form, setForm] = useState<AccountFormState>(emptyForm());
  const [formSheet, setFormSheet] = useState<AccountFormSheetState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [reconciliation, setReconciliation] = useState<AccountReconciliationState>({
    actualValue: "",
    isConfirming: false,
    isSaving: false,
    note: "",
  });

  const enabledAccounts = useMemo(() => accounts.filter(isAccountEnabled), [accounts]);
  const enabledAssetAccounts = useMemo(
    () => accounts.filter((account) => isAccountEnabled(account) && normalizeAccountType(account.type) !== "creditCard"),
    [accounts],
  );
  const enabledAssetBalance = getEnabledAssetBalance(accounts);
  const enabledCreditCardDebt = getEnabledCreditCardDebt(accounts);

  const openCategoryDetail = (type: AccountType) => {
    setForm(emptyForm(type));
    setRoute({ name: "categoryDetail", type });
  };

  const openCreateForm = (type?: AccountType, returnTo?: AccountType) => {
    setForm(emptyForm(type));
    setFormSheet({ returnTo, type });
  };

  const openEditForm = (account: Account, returnTo: AccountType) => {
    setForm(buildFormFromAccount(account));
    setFormSheet({ returnTo, type: normalizeAccountType(account.type) });
  };

  const closeFormSheet = () => {
    if (isSaving) return;
    setFormSheet(null);
  };

  const updateForm = (patch: Partial<AccountFormState>) => {
    setForm((current) => ({ ...current, ...patch }));
  };

  const getAccountBookValue = (account: Account): number =>
    normalizeAccountType(account.type) === "creditCard" ? getCreditCardDebt(account) : account.balance;

  const openAccountReconciliation = (account: Account) => {
    setReconciliation({
      account,
      actualValue: String(getAccountBookValue(account)),
      isConfirming: false,
      isSaving: false,
      note: "",
      payingAccountId: undefined,
      reason: undefined,
    });
  };

  const closeReconciliation = () => {
    setReconciliation({
      actualValue: "",
      isConfirming: false,
      isSaving: false,
      note: "",
    });
  };

  const handleReconciliationSubmit = async () => {
    const account = reconciliation.account;
    if (!account) return;

    const actualValue = Number(reconciliation.actualValue.replace(",", "."));
    const bookValue = getAccountBookValue(account);
    const diff = calculateReconciliationDiff(bookValue, actualValue);
    const isCreditCard = normalizeAccountType(account.type) === "creditCard";

    if (!Number.isFinite(actualValue) || actualValue < 0) {
      Alert.alert("请输入实际金额", "实际金额必须大于等于 0。");
      return;
    }

    if (Math.abs(diff) < 0.01) {
      Alert.alert("无需调整", "差额为 0，无需生成对账调整。");
      return;
    }

    if (!reconciliation.reason) {
      Alert.alert("请选择差额原因", "请选择这次差额产生的原因。");
      return;
    }

    if (reconciliation.reason === "creditCardMissingRepayment" && !reconciliation.payingAccountId) {
      Alert.alert("请选择付款账户", "漏记还款需要选择实际付款账户。");
      return;
    }

    if (!reconciliation.isConfirming) {
      setReconciliation((current) => ({ ...current, isConfirming: true }));
      return;
    }

    setReconciliation((current) => ({ ...current, isSaving: true }));
    try {
      await onSaveReconciliation({
        actualValue,
        note: reconciliation.note,
        payingAccountId: reconciliation.payingAccountId,
        reason: reconciliation.reason,
        targetId: account.id,
        targetType: "account",
      });
      Alert.alert("对账完成", isCreditCard ? "信用卡欠款和相关负债已按本次对账更新。" : "账户余额已按本次对账更新。");
      closeReconciliation();
    } catch {
      Alert.alert("对账失败", "无法保存这次对账调整。");
      setReconciliation((current) => ({ ...current, isSaving: false }));
    }
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

  const saveValidatedInput = async (input: AccountInput) => {
    setIsSaving(true);
    try {
      await onSaveAccount(input);
      Alert.alert(input.id ? "账户已更新" : "账户已新增", "账户管理和记一笔账户选择已同步刷新。");
      setFormSheet(null);
    } catch {
      Alert.alert("保存失败", "无法保存这个账户。");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = () => {
    const input = validateAndBuildInput();
    if (!input) return;

    const nextAmount =
      input.type === "creditCard" ? input.currentDebt ?? Math.max(0, input.balance) : input.balance;
    const hasAmountChanged =
      form.id !== undefined &&
      form.originalAmount !== undefined &&
      Math.abs(nextAmount - form.originalAmount) > 0.01;

    if (!hasAmountChanged) {
      void saveValidatedInput(input);
      return;
    }

    const isCreditCard = input.type === "creditCard";
    Alert.alert(
      isCreditCard ? "确认修改欠款" : "确认修改余额",
      isCreditCard ? "您是否确定更改此欠款？这会影响到总负债。" : "您是否确定更改此余额？这会影响到总资产。",
      [
        { text: "取消", style: "cancel" },
        {
          text: "确认修改",
          style: "destructive",
          onPress: () => void saveValidatedInput(input),
        },
      ],
    );
  };

  const handleDisable = (account: Account) => {
    Alert.alert("停用账户", `停用后，“${account.name}”不会出现在日常记账账户选择中。`, [
      { text: "取消", style: "cancel" },
      {
        text: "确认停用",
        style: "destructive",
        onPress: () => {
          setFormSheet(null);
          void onDisableAccount(account.id);
        },
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
          onPress: () => {
            setFormSheet(null);
            void onDisableAccount(account.id);
          },
        },
      ]);
      return;
    }

    Alert.alert("删除账户", `确认删除“${account.name}”？删除后无法恢复。`, [
      { text: "取消", style: "cancel" },
      {
        text: "确认删除",
        style: "destructive",
        onPress: () => {
          setFormSheet(null);
          void onDeleteAccount(account.id);
        },
      },
    ]);
  };

  const selectedAccount = form.id ? accounts.find((account) => account.id === form.id) : undefined;

  useEffect(() => {
    if (formSheet && form.id && !selectedAccount) {
      setFormSheet(null);
      setForm(emptyForm(formSheet.type));
    }
  }, [form.id, formSheet, selectedAccount]);

  useEffect(() => {
    setReconciliation((current) => {
      if (!current.account) return current;
      return accounts.some((account) => account.id === current.account?.id)
        ? current
        : {
            actualValue: "",
            isConfirming: false,
            isSaving: false,
            note: "",
          };
    });
  }, [accounts]);

  const renderAccountFormSheet = () => (
    <AccountFormSheet
      form={form}
      isSaving={isSaving}
      onDelete={selectedAccount ? () => handleDelete(selectedAccount) : undefined}
      onDisable={selectedAccount ? () => handleDisable(selectedAccount) : undefined}
      onClose={closeFormSheet}
      onOpenReconciliation={selectedAccount ? () => openAccountReconciliation(selectedAccount) : undefined}
      onSave={handleSave}
      updateForm={updateForm}
      visible={formSheet !== null}
    />
  );

  const renderReconciliationModal = () => (
    <AccountReconciliationModal
      accounts={enabledAssetAccounts}
      bookValue={selectedAccount ? getAccountBookValue(selectedAccount) : 0}
      reconciliation={reconciliation}
      onClose={closeReconciliation}
      onSubmit={() => void handleReconciliationSubmit()}
      updateReconciliation={(patch) => setReconciliation((current) => ({ ...current, ...patch }))}
    />
  );

  if (isLoading) {
    return <AccountManagementSkeleton />;
  }

  if (route.name === "overview" && accounts.length === 0) {
    return (
      <View style={styles.stack}>
        <EmptyStateScreen
          description={"添加现金、银行卡、支付宝等账户后，\n你的资金去向会更清晰。"}
          illustration={emptyAccountsIllustration}
          onBack={handleBack}
          onPrimary={() => openCreateForm()}
          onSecondary={() => Alert.alert("账户类型", "账户用于承载现金、银行卡、支付钱包、信用卡和投资账户等资金位置。")}
          primaryLabel="添加账户"
          screenTitle="账户管理"
          secondaryLabel="了解账户类型 ›"
          title="还没有账户"
        />
        {renderAccountFormSheet()}
        {renderReconciliationModal()}
      </View>
    );
  }

  if (route.name === "categoryDetail") {
    const meta = getCategoryMeta(route.type);
    const categoryAccounts = accounts.filter((account) => normalizeAccountType(account.type) === route.type);
    const categoryAccountIds = new Set(categoryAccounts.map((account) => account.id));
    const recentCategoryTransactions = transactions
      .filter(
        (transaction) =>
          categoryAccountIds.has(transaction.accountId) ||
          (transaction.counterAccountId ? categoryAccountIds.has(transaction.counterAccountId) : false),
      )
      .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
      .slice(0, 3);

    return (
      <ScreenTransition animateOnMount transitionKey={`account-category-${route.type}`} variant="drilldown">
        <View style={styles.stack}>
          <FinanceTopBar
            onBack={handleBack}
            onRightPress={() => openCreateForm(route.type, route.type)}
            title={meta.detailTitle}
          />
          <CategorySummaryCard accounts={categoryAccounts} meta={meta} />
          <LedgerSectionHeader title="账户列表" />
          {categoryAccounts.length > 0 ? (
            <LedgerFullBleedList horizontalPadding={horizontalPadding}>
              {categoryAccounts.map((account, index) => (
                <AccountDetailRow
                  account={account}
                  key={account.id}
                  last={index === categoryAccounts.length - 1}
                  onEdit={() => openEditForm(account, route.type)}
                />
              ))}
            </LedgerFullBleedList>
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

          <LedgerSectionHeader action="最近 3 笔" title="近期变动" />
          {recentCategoryTransactions.length > 0 ? (
            <LedgerFullBleedList horizontalPadding={horizontalPadding}>
              {recentCategoryTransactions.map((transaction, index) => (
                <LedgerValueRow
                  icon="transaction"
                  key={transaction.id}
                  subtitle={`${transaction.date.slice(5, 10)} · ${transaction.category}`}
                  last={index === recentCategoryTransactions.length - 1}
                  title={transaction.note || transaction.category}
                  tone={transaction.amount >= 0 ? "green" : "default"}
                  value={formatCurrency(transaction.amount)}
                />
              ))}
            </LedgerFullBleedList>
          ) : (
            <View style={styles.emptyStateBox}>
              <Text style={styles.emptyStateTitle}>暂无近期变动</Text>
              <Text style={styles.emptyStateDescription}>这个分类下暂时没有可展示的交易记录。</Text>
            </View>
          )}
        </View>
        {renderAccountFormSheet()}
        {renderReconciliationModal()}
      </ScreenTransition>
    );
  }

  return (
    <View style={styles.stack}>
      <FinanceTopBar onBack={handleBack} onRightPress={() => openCreateForm()} title="账户管理" />
      <SummaryHeroCard>
        <View style={styles.overviewSummaryGrid}>
          <View style={styles.overviewSummaryItem}>
            <Text style={styles.overviewLabel}>账户总数</Text>
            <AmountText size="large">{`${accounts.length} 个`}</AmountText>
            <Text style={styles.overviewHint}>已纳入总资产 {enabledAccounts.length} 个</Text>
          </View>
          <View style={styles.overviewSummaryItem}>
            <Text style={styles.overviewLabel}>可用资金</Text>
            <AmountText size="large">{formatCurrency(enabledAssetBalance)}</AmountText>
            <Text style={styles.overviewHint}>不含信用卡欠款 {formatCurrency(enabledCreditCardDebt)}</Text>
          </View>
        </View>
      </SummaryHeroCard>

      {accountGroups.map((group) => (
        <View key={group.title} style={styles.listSection}>
          <LedgerSectionHeader action={group.subtitle} title={group.title} />
          <LedgerFullBleedList horizontalPadding={horizontalPadding}>
            {group.types.map((type, index) => {
              const category = getCategoryMeta(type);
              const categoryAccounts = accounts.filter((account) => normalizeAccountType(account.type) === type);
              const categoryAmount = getCategoryAmount(accounts, type);

              return (
                <LedgerValueRow
                  icon={getAccountTypeIcon(type)}
                  key={type}
                  last={index === group.types.length - 1}
                  onPress={() => openCategoryDetail(type)}
                  subtitle={`${categoryAccounts.length} ${category.countUnit}`}
                  title={category.label}
                  value={formatCategoryAmount(type, categoryAmount)}
                />
              );
            })}
          </LedgerFullBleedList>
        </View>
      ))}
      {renderAccountFormSheet()}
      {renderReconciliationModal()}
    </View>
  );
}

function AccountManagementSkeleton() {
  return (
    <SkeletonScreenShell>
      <Skeleton delay={0} height={9} width={60} />
      {[0, 1].map((item) => (
        <SkeletonCard
          key={item}
          rows={[
            { delay: item * 150, height: 9, width: 80 },
            { delay: item * 150 + 90, height: 18, style: { marginTop: 9 }, width: "64%" },
          ]}
          style={styles.accountSkeletonCard}
        />
      ))}
    </SkeletonScreenShell>
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
    <SummaryHeroCard style={styles.categorySummaryStrip}>
      <View style={styles.summaryStripItem}>
        <Text style={styles.summaryLabel}>账户数</Text>
        <AmountText size="normal">{`${enabledCount} 个`}</AmountText>
      </View>
      <View style={styles.summaryStripDivider} />
      <View style={styles.summaryStripItem}>
        <Text style={styles.summaryLabel}>合计金额</Text>
        <AmountText tone={meta.type === "creditCard" ? "negative" : "default"} size="normal">
          {formatCategoryAmount(meta.type, total)}
        </AmountText>
        {meta.type === "creditCard" ? <Text style={styles.summaryHint}>信用额度 {formatCurrency(creditLimitTotal)}</Text> : null}
      </View>
    </SummaryHeroCard>
  );
}

interface AccountDetailRowProps {
  account: Account;
  last?: boolean;
  onEdit: () => void;
}

function AccountDetailRow({ account, last, onEdit }: AccountDetailRowProps) {
  const enabled = isAccountEnabled(account);
  const isCreditCard = normalizeAccountType(account.type) === "creditCard";
  const noteText = account.note ? ` · ${account.note}` : "";
  const creditLimitText = isCreditCard && account.creditLimit ? ` · 额度 ${formatCurrency(account.creditLimit)}` : "";

  return (
    <LedgerValueRow
      icon={getAccountTypeIcon(account.type)}
      last={last}
      onPress={onEdit}
      subtitle={`${getAccountTypeLabel(account.type)}${creditLimitText}${noteText || " · 未填写备注"}`}
      title={account.name}
      tone={enabled ? "default" : "amber"}
      value={formatAccountBalance(account)}
      valueDetail={enabled ? "纳入" : "未纳入"}
    />
  );
}

interface AccountFormSheetProps {
  form: AccountFormState;
  isSaving: boolean;
  onClose: () => void;
  onDelete?: () => void;
  onDisable?: () => void;
  onOpenReconciliation?: () => void;
  onSave: () => void;
  updateForm: (patch: Partial<AccountFormState>) => void;
  visible: boolean;
}

function AccountFormSheet({
  form,
  isSaving,
  onClose,
  onDelete,
  onDisable,
  onOpenReconciliation,
  onSave,
  updateForm,
  visible,
}: AccountFormSheetProps) {
  const isAccountDetail = form.id !== undefined;
  const accountTypeLabel = getAccountTypeLabel(form.type);

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <BottomSheetFrame
        onClose={onClose}
        onSave={onSave}
        saveDisabled={isSaving}
        saveLabel={isSaving ? "保存中" : "保存"}
        title={isAccountDetail ? "账户详情" : "新增账户"}
      >
        <ScrollView
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <InfoLineRow
            label="账户名称"
            value={
              <TextInput
                onChangeText={(value) => updateForm({ name: value })}
                placeholder="例如 招商银行卡"
                placeholderTextColor={theme.colors.textMuted}
                style={styles.lineInput}
                value={form.name}
              />
            }
          />

          <InfoLineRow
            label="账户类型"
            value={
              isAccountDetail ? (
                <View style={styles.readonlyTypePill}>
                  <Text style={styles.readonlyTypeText}>{accountTypeLabel}</Text>
                </View>
              ) : (
                <View style={styles.chipWrap}>
                  {accountCategories.map((option) => {
                    const active = form.type === option.type;
                    return (
                      <Pressable
                        key={option.type}
                        onPress={() => updateForm({ type: option.type })}
                        style={[sharedStyles.chip, active && sharedStyles.chipActiveDark]}
                      >
                        <Text style={[sharedStyles.chipText, active && sharedStyles.chipTextInverse]}>
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )
            }
          />

          <InfoLineRow
            label="当前余额"
            value={
              <TextInput
                keyboardType="decimal-pad"
                onChangeText={(value) =>
                  updateForm({ balance: value, currentDebt: form.type === "creditCard" ? value : form.currentDebt })
                }
                placeholder="0"
                placeholderTextColor={theme.colors.textMuted}
                style={styles.lineInput}
                value={form.balance}
              />
            }
          />

          {form.type === "creditCard" ? (
            <>
              <InfoLineRow
                label="信用额度"
                value={
                  <TextInput
                    keyboardType="decimal-pad"
                    onChangeText={(value) => updateForm({ creditLimit: value })}
                    placeholder="可选"
                    placeholderTextColor={theme.colors.textMuted}
                    style={styles.lineInput}
                    value={form.creditLimit}
                  />
                }
              />
              <InfoLineRow
                label="账单日期"
                value={
                  <View style={styles.twoColumnRow}>
                    <View style={styles.twoColumnItem}>
                      <TextInput
                        keyboardType="number-pad"
                        onChangeText={(value) => updateForm({ billDay: value })}
                        placeholder="账单日"
                        placeholderTextColor={theme.colors.textMuted}
                        style={styles.lineInput}
                        value={form.billDay}
                      />
                    </View>
                    <View style={styles.twoColumnItem}>
                      <TextInput
                        keyboardType="number-pad"
                        onChangeText={(value) => updateForm({ repaymentDay: value })}
                        placeholder="还款日"
                        placeholderTextColor={theme.colors.textMuted}
                        style={styles.lineInput}
                        value={form.repaymentDay}
                      />
                    </View>
                  </View>
                }
              />
            </>
          ) : null}

          <InfoLineRow label="币种" value="人民币 CNY" />

          <InfoLineRow
            label="是否纳入总资产"
            value={
              <View style={styles.chipWrap}>
                <Pressable
                  onPress={() => updateForm({ isEnabled: true })}
                  style={[sharedStyles.chip, form.isEnabled && sharedStyles.chipActiveDark]}
                >
                  <Text style={[sharedStyles.chipText, form.isEnabled && sharedStyles.chipTextInverse]}>纳入</Text>
                </Pressable>
                <Pressable
                  onPress={() => updateForm({ isEnabled: false })}
                  style={[sharedStyles.chip, !form.isEnabled && sharedStyles.chipActiveDark]}
                >
                  <Text style={[sharedStyles.chipText, !form.isEnabled && sharedStyles.chipTextInverse]}>不纳入</Text>
                </Pressable>
              </View>
            }
          />

          <InfoLineRow
            label="备注"
            value={
              <TextInput
                multiline
                onChangeText={(value) => updateForm({ note: value })}
                placeholder="例如 工资卡 / 日常消费 / 投资账户"
                placeholderTextColor={theme.colors.textMuted}
                style={[styles.lineInput, styles.lineTextArea]}
                value={form.note}
              />
            }
          />

          {isAccountDetail && onOpenReconciliation ? (
            <View style={styles.sheetActionBlock}>
                <Pressable onPress={onOpenReconciliation} style={sharedStyles.secondaryButton}>
                  <Text style={sharedStyles.secondaryButtonText}>对账 / 更新余额</Text>
                </Pressable>
                {form.isEnabled && onDisable ? (
                  <Pressable onPress={onDisable} style={sharedStyles.secondaryButton}>
                    <Text style={sharedStyles.secondaryButtonText}>停用账户</Text>
                  </Pressable>
                ) : null}
            </View>
          ) : null}

          {isAccountDetail && onDelete ? (
            <View style={styles.sheetDangerBlock}>
              <DangerActionButton label="删除账户" onPress={onDelete} />
            </View>
          ) : null}
        </ScrollView>
      </BottomSheetFrame>
    </Modal>
  );
}

interface AccountReconciliationModalProps {
  accounts: Account[];
  bookValue: number;
  reconciliation: AccountReconciliationState;
  onClose: () => void;
  onSubmit: () => void;
  updateReconciliation: (patch: Partial<AccountReconciliationState>) => void;
}

function AccountReconciliationModal({
  accounts,
  bookValue,
  reconciliation,
  onClose,
  onSubmit,
  updateReconciliation,
}: AccountReconciliationModalProps) {
  const account = reconciliation.account;
  const actualValue = Number(reconciliation.actualValue.replace(",", "."));
  const displayActual = Number.isFinite(actualValue) ? actualValue : bookValue;
  const diff = calculateReconciliationDiff(bookValue, displayActual);
  const isCreditCard = account ? normalizeAccountType(account.type) === "creditCard" : false;
  const reasonOptions =
    account && Math.abs(diff) >= 0.01 ? getReconciliationReasonOptions("account", diff, isCreditCard) : [];
  const requiresPayingAccount = reconciliation.reason === "creditCardMissingRepayment";

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={account !== undefined}
    >
      <Pressable onPress={onClose} style={styles.modalBackdrop}>
        <Pressable onPress={(event) => event.stopPropagation()} style={styles.modalPanel}>
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
              <Text style={styles.modalTitle}>对账 / 更新余额</Text>
              <Text style={styles.modalDescription}>
                输入实际余额，系统会计算差额并生成安全的对账调整。
              </Text>

              <View style={styles.diffBox}>
                <View>
                  <Text style={styles.diffLabel}>{isCreditCard ? "当前账面欠款" : "当前账面值"}</Text>
                  <Text style={styles.diffBookValue}>{formatCurrency(bookValue)}</Text>
                </View>
                <View style={styles.diffRight}>
                  <Text style={styles.diffLabel}>差额</Text>
                  <Text style={[styles.diffValue, diff >= 0 ? styles.diffPositive : styles.diffNegative]}>
                    {Math.abs(diff) < 0.01 ? "" : diff > 0 ? "+" : "-"}
                    {formatCurrency(Math.abs(diff))}
                  </Text>
                </View>
              </View>

              <Text style={styles.fieldLabel}>{isCreditCard ? "实际欠款" : "实际余额"}</Text>
              <TextInput
                keyboardType="decimal-pad"
                onChangeText={(value) => updateReconciliation({ actualValue: value, isConfirming: false, reason: undefined })}
                placeholder="请输入实际金额"
                placeholderTextColor={theme.colors.textMuted}
                style={sharedStyles.input}
                value={reconciliation.actualValue}
              />

              <Text style={styles.fieldLabel}>差额原因</Text>
              <View style={styles.chipWrap}>
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

              {requiresPayingAccount ? (
                <>
                  <Text style={styles.fieldLabel}>付款账户</Text>
                  <View style={styles.chipWrap}>
                    {accounts.map((paymentAccount) => {
                      const active = reconciliation.payingAccountId === paymentAccount.id;
                      return (
                        <Pressable
                          key={paymentAccount.id}
                          onPress={() => updateReconciliation({ payingAccountId: paymentAccount.id })}
                          style={[sharedStyles.chip, active && sharedStyles.chipActiveDark]}
                        >
                          <Text style={[sharedStyles.chipText, active && sharedStyles.chipTextInverse]}>
                            {paymentAccount.name}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              ) : null}

              <Text style={styles.fieldLabel}>备注</Text>
              <TextInput
                multiline
                onChangeText={(value) => updateReconciliation({ note: value })}
                placeholder="可补充这次对账的来源或说明"
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
    borderBottomColor: theme.colors.divider,
    borderBottomWidth: 1,
    gap: theme.spacing.sm,
    paddingVertical: 12,
  },
  accountSheet: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    borderWidth: 1,
    maxHeight: "86%",
    overflow: "hidden",
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
    flexDirection: "row",
    gap: 4,
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
  categoryAmount: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: "900",
  },
  categoryMain: {
    flex: 1,
  },
  categoryIcon: {
    alignItems: "center",
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    height: 38,
    justifyContent: "center",
    marginRight: theme.spacing.sm,
    width: 38,
  },
  categoryRight: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  categoryRow: {
    alignItems: "center",
    borderBottomColor: theme.colors.divider,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 56,
    paddingVertical: 9,
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
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
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
  accountRowAmount: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: "900",
    textAlign: "right",
  },
  accountRowRight: {
    alignItems: "flex-end",
    gap: 5,
  },
  accountSkeletonCard: {
    marginBottom: 10,
    minHeight: 68,
  },
  fieldLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.label,
    fontWeight: "700",
    marginBottom: 6,
  },
  formContent: {
    gap: 14,
    paddingBottom: 28,
    paddingHorizontal: theme.spacing.container,
    paddingTop: theme.spacing.md,
  },
  formLineRow: {
    borderBottomColor: theme.colors.divider,
    borderBottomWidth: 1,
    paddingBottom: 14,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
    justifyContent: "space-between",
  },
  groupSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  listSection: {
    gap: 8,
  },
  modalActions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    justifyContent: "flex-end",
    marginTop: theme.spacing.sm,
  },
  modalBackdrop: {
    backgroundColor: "rgba(24, 16, 44, 0.30)",
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
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  modalPrimaryButton: {
    flex: 1,
  },
  modalTitle: {
    color: theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: "900",
  },
  overviewSummaryGrid: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  overviewSummaryItem: {
    flex: 1,
    gap: 4,
  },
  overviewCard: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 14,
    shadowColor: theme.colors.shadowSoft,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 2,
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
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  overviewValue: {
    color: theme.colors.textPrimary,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.6,
    marginTop: 3,
  },
  pageTitle: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  readonlyTypePill: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  readonlyTypeText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: "800",
  },
  rowActionGroup: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  sheetActionBlock: {
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.md,
  },
  sheetBackdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.28)",
    flex: 1,
    justifyContent: "flex-end",
    paddingTop: theme.spacing.xl,
  },
  sheetCancelText: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    fontWeight: "800",
  },
  sheetHeader: {
    alignItems: "center",
    borderBottomColor: theme.colors.divider,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 54,
    paddingHorizontal: theme.spacing.container,
  },
  sheetHeaderButton: {
    minWidth: 56,
    paddingVertical: 10,
  },
  sheetSaveText: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: "900",
    textAlign: "right",
  },
  sheetSaveTextDisabled: {
    color: theme.colors.textMuted,
  },
  sheetDangerBlock: {
    paddingTop: theme.spacing.sm,
  },
  sheetTitle: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center",
  },
  smallActionButton: {
    backgroundColor: theme.colors.surfaceElevated,
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
    gap: theme.spacing.md,
  },
  statusBadge: {
    color: theme.colors.success,
    fontSize: 12,
    fontWeight: "800",
  },
  statusBadgeMuted: {
    color: theme.colors.textMuted,
  },
  statusPill: {
    alignItems: "center",
    backgroundColor: theme.colors.successSoft,
    borderRadius: theme.radius.pill,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusPillMuted: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  summaryCard: {
    borderBottomColor: theme.colors.divider,
    borderBottomWidth: 1,
    borderTopColor: theme.colors.divider,
    borderTopWidth: 1,
    gap: 4,
    paddingVertical: 14,
  },
  summaryHint: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
  summaryStripDivider: {
    backgroundColor: theme.colors.divider,
    width: 1,
  },
  summaryStripItem: {
    flex: 1,
    gap: 3,
  },
  categorySummaryStrip: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  summaryLabel: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  summaryValue: {
    color: theme.colors.textPrimary,
    fontSize: 22,
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
  lineInput: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
    minHeight: 40,
    padding: 0,
    textAlign: "right",
  },
  lineTextArea: {
    lineHeight: 21,
    minHeight: 72,
    paddingTop: 8,
    textAlignVertical: "top",
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
});
