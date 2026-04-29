import { useEffect, useMemo, useState } from "react";
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import {
  parseNaturalLanguageTransaction,
  transactionTypeMeta,
  type NaturalLanguageTransactionType,
  type ParsedTransactionDraft,
} from "../domain/accounting/naturalLanguageParser";
import type { TransactionInput } from "../domain/accounting/transactionRules";
import type { Account } from "../domain/models";
import { sharedStyles, theme } from "../styles/theme";

interface RecordScreenProps {
  accounts: Account[];
  onSave: (input: TransactionInput) => Promise<void>;
  onOpenAccounts: () => void;
  onOpenReports: () => void;
  onOpenAssets: () => void;
}

interface TransactionTypeOption {
  type: NaturalLanguageTransactionType;
  label: string;
  defaultCategory: string;
  requiresAccount: boolean;
}

type ModalState = "draft" | "success";

const today = () => new Date().toISOString().slice(0, 10);

const transactionTypeOptions: TransactionTypeOption[] = [
  { type: "income", label: "收入", defaultCategory: "工资薪金", requiresAccount: true },
  { type: "expense", label: "支出", defaultCategory: "餐饮", requiresAccount: true },
  { type: "assetIncrease", label: "资产增加", defaultCategory: "资产增加", requiresAccount: true },
  { type: "assetDecrease", label: "资产减少", defaultCategory: "资产减少", requiresAccount: true },
  { type: "liabilityIncrease", label: "负债增加", defaultCategory: "借款", requiresAccount: true },
  { type: "liabilityDecrease", label: "负债减少", defaultCategory: "还款", requiresAccount: true },
  { type: "investmentBuy", label: "投资买入", defaultCategory: "投资资产", requiresAccount: true },
  { type: "investmentSell", label: "投资卖出", defaultCategory: "投资资产", requiresAccount: true },
  { type: "creditCardExpense", label: "信用卡消费", defaultCategory: "信用卡", requiresAccount: true },
  { type: "creditCardRepayment", label: "信用卡还款", defaultCategory: "信用卡", requiresAccount: true },
];

const examples = [
  "今天中午吃饭花了15",
  "工资到账3200",
  "买基金1000",
  "还信用卡500",
  "朋友还我200",
];

const quickCategories = ["餐饮", "购物", "交通", "娱乐", "其他"];

const findOption = (type: NaturalLanguageTransactionType): TransactionTypeOption =>
  transactionTypeOptions.find((option) => option.type === type) ?? transactionTypeOptions[0];

const normalizeAmount = (value: string): number => Number(value.replace(",", "."));

const formatAmount = (value: string): string => {
  const amount = normalizeAmount(value);
  if (!Number.isFinite(amount)) return "未填写";
  return `${amount} 元`;
};

const isAccountEnabled = (account: Account): boolean => account.isEnabled ?? account.isActive ?? true;

export default function RecordScreen({
  accounts,
  onSave,
  onOpenAccounts,
  onOpenReports,
  onOpenAssets,
}: RecordScreenProps) {
  const [naturalText, setNaturalText] = useState("");
  const [draft, setDraft] = useState<ParsedTransactionDraft | null>(null);
  const [type, setType] = useState<NaturalLanguageTransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(findOption("expense").defaultCategory);
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [date, setDate] = useState(today());
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalState, setModalState] = useState<ModalState>("draft");
  const [isMoreMenuVisible, setIsMoreMenuVisible] = useState(false);

  const selectedOption = findOption(type);
  const selectedMeta = transactionTypeMeta[type];
  const activeAccounts = useMemo(() => accounts.filter(isAccountEnabled), [accounts]);
  const selectedAccount = activeAccounts.find((account) => account.id === accountId);

  const pickAccountId = (nextType: NaturalLanguageTransactionType): string => {
    const currentAccount = activeAccounts.find((account) => account.id === accountId);
    const creditCardAccount = activeAccounts.find((account) => account.type === "creditCard");
    const cashAccount = activeAccounts.find((account) => account.type !== "creditCard");

    if (nextType === "creditCardExpense") {
      return creditCardAccount?.id ?? currentAccount?.id ?? activeAccounts[0]?.id ?? "";
    }

    return cashAccount?.id ?? currentAccount?.id ?? activeAccounts[0]?.id ?? "";
  };

  useEffect(() => {
    if (activeAccounts.length === 0) {
      setAccountId("");
      return;
    }

    if (!activeAccounts.some((account) => account.id === accountId)) {
      setAccountId(pickAccountId(type));
    }
  }, [accountId, activeAccounts, type]);

  const clearEntryFields = () => {
    setAmount("");
    setNote("");
    setDraft(null);
    setNaturalText("");
    setSuccessMessage("");
  };

  const openMoreMenu = () => {
    setIsMoreMenuVisible(true);
  };

  const closeMoreMenu = () => {
    setIsMoreMenuVisible(false);
  };

  const handleOpenAccounts = () => {
    closeMoreMenu();
    onOpenAccounts();
  };

  const handleOpenAssets = () => {
    closeMoreMenu();
    onOpenAssets();
  };

  const handleOpenTransactions = () => {
    closeMoreMenu();
    Alert.alert("交易记录", "该功能将在后续版本中完善。");
  };

  const handleTypeChange = (nextType: NaturalLanguageTransactionType) => {
    const nextOption = findOption(nextType);
    setType(nextType);
    setCategory(nextOption.defaultCategory);
    setAccountId(pickAccountId(nextType));
    setSuccessMessage("");
  };

  const applyDraftToForm = (parsedDraft: ParsedTransactionDraft) => {
    setType(parsedDraft.type);
    setAmount(parsedDraft.amount === null ? "" : String(parsedDraft.amount));
    setCategory(parsedDraft.category);
    setDate(parsedDraft.date);
    setAccountId(pickAccountId(parsedDraft.type));
    setNote(parsedDraft.rawText.trim());
    setDraft(parsedDraft);
    setSuccessMessage("");
  };

  const handleRecognize = () => {
    const text = naturalText.trim();

    if (!text) {
      Alert.alert("请先输入一句话", "例如：今天中午吃饭花了15。");
      return;
    }

    const parsedDraft = parseNaturalLanguageTransaction(text);

    if (parsedDraft.amount === null || parsedDraft.amount <= 0) {
      Alert.alert("没有识别到金额，请补充金额", "例如：今天中午吃饭花了15。");
      return;
    }

    applyDraftToForm(parsedDraft);
    setModalState("draft");
    setIsModalVisible(true);
  };

  const validateForm = (): number | null => {
    const trimmedAmount = amount.trim();
    const numericAmount = normalizeAmount(trimmedAmount);

    if (!trimmedAmount) {
      Alert.alert("请填写金额", "金额是必填项。");
      return null;
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      Alert.alert("金额不正确", "请输入大于 0 的金额。");
      return null;
    }

    if (!category.trim()) {
      Alert.alert("请填写分类", "分类是必填项，例如工资薪金、餐饮、投资资产。");
      return null;
    }

    if (selectedOption.requiresAccount && !accountId) {
      Alert.alert("请选择账户", "当前记录类型需要选择一个账户。");
      return null;
    }

    if (!date.trim()) {
      Alert.alert("请填写日期", "日期是必填项，格式建议为 YYYY-MM-DD。");
      return null;
    }

    return numericAmount;
  };

  const handleSubmit = async () => {
    const numericAmount = validateForm();
    if (numericAmount === null) return;

    setIsSaving(true);
    setSuccessMessage("");

    try {
      await onSave({
        type,
        amount: numericAmount,
        category,
        accountId,
        date,
        note: note.trim() || selectedMeta.impactText,
      });
      setModalState("success");
      setSuccessMessage("已保存，金额和备注已清空，可以继续记录下一笔。");
    } catch {
      Alert.alert("保存失败", "这笔记录没有保存成功，请稍后重试。");
    } finally {
      setIsSaving(false);
    }
  };

  const handleContinue = () => {
    clearEntryFields();
    setIsModalVisible(false);
  };

  const handleCloseModal = () => {
    if (isSaving) return;
    setIsModalVisible(false);
    if (modalState === "success") {
      clearEntryFields();
    }
  };

  const handleGoReports = () => {
    setIsModalVisible(false);
    clearEntryFields();
    onOpenReports();
  };

  const handleManageAssets = () => {
    setIsModalVisible(false);
    clearEntryFields();
    onOpenAccounts();
  };

  return (
    <View style={styles.stack}>
      <View style={sharedStyles.pageHeader}>
        <View style={styles.headerRow}>
          <View style={styles.headerCopy}>
            <Text style={sharedStyles.eyebrow}>Manage</Text>
            <Text style={styles.pageTitle}>管理</Text>
            <Text style={sharedStyles.pageCopy}>
              用一句话描述这笔钱发生了什么，系统识别后再确认入账。
            </Text>
          </View>
          <Pressable onPress={openMoreMenu} style={styles.moreButton}>
            <Text style={styles.moreButtonText}>更多</Text>
          </Pressable>
        </View>
      </View>

      <View style={[sharedStyles.card, styles.formCard]}>
        <Text style={sharedStyles.sectionTitle}>一句话记账</Text>

        <Text style={styles.amountLabel}>金额</Text>
        <TextInput
          keyboardType="decimal-pad"
          onChangeText={setAmount}
          placeholder="¥"
          placeholderTextColor={theme.colors.textMuted}
          style={styles.amountInput}
          value={amount}
        />

        <View style={styles.quickCategoryRow}>
          {quickCategories.map((item) => {
            const isActive = category === item;
            return (
              <Pressable
                key={item}
                onPress={() => setCategory(item)}
                style={[sharedStyles.chip, isActive && sharedStyles.chipActiveLight, styles.quickChip]}
              >
                <Text style={sharedStyles.chipText}>{item}</Text>
              </Pressable>
            );
          })}
        </View>

        <TextInput
          multiline
          onChangeText={(value) => {
            setNaturalText(value);
            setSuccessMessage("");
          }}
          placeholder={examples.join("\n")}
          placeholderTextColor={theme.colors.textMuted}
          style={[sharedStyles.input, sharedStyles.textArea, styles.naturalInput]}
          value={naturalText}
        />

        <Pressable onPress={handleRecognize} style={sharedStyles.primaryButton}>
          <Text style={sharedStyles.primaryButtonText}>智能识别</Text>
        </Pressable>
      </View>

      <View style={[sharedStyles.card, styles.formCard]}>
        <Text style={sharedStyles.sectionTitle}>手动修改 / 高级填写</Text>

        <Text style={styles.fieldLabel}>交易类型</Text>
        <View style={styles.chipWrap}>
          {transactionTypeOptions.map((option) => {
            const isActive = type === option.type;
            return (
              <Pressable
                key={option.type}
                onPress={() => handleTypeChange(option.type)}
                style={[sharedStyles.chip, isActive && sharedStyles.chipActiveDark]}
              >
                <Text style={[sharedStyles.chipText, isActive && sharedStyles.chipTextInverse]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={sharedStyles.helperBox}>
          <Text style={sharedStyles.helperTitle}>影响说明</Text>
          <Text style={sharedStyles.helperText}>{selectedMeta.impactText}</Text>
        </View>

        <Text style={styles.fieldLabel}>分类</Text>
        <TextInput
          onChangeText={(value) => {
            setCategory(value);
            setSuccessMessage("");
          }}
          placeholder="例如 工资薪金 / 餐饮 / 投资资产"
          placeholderTextColor={theme.colors.textMuted}
          style={sharedStyles.input}
          value={category}
        />

        <Text style={styles.fieldLabel}>账户</Text>
        {activeAccounts.length > 0 ? (
          <View style={styles.chipWrap}>
            {activeAccounts.map((account) => {
              const isActive = accountId === account.id;
              return (
                <Pressable
                  key={account.id}
                  onPress={() => {
                    setAccountId(account.id);
                    setSuccessMessage("");
                  }}
                  style={[sharedStyles.chip, isActive && sharedStyles.chipActiveDark]}
                >
                  <Text style={[sharedStyles.chipText, isActive && sharedStyles.chipTextInverse]}>
                    {account.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={styles.messageBox}>
            <Text style={sharedStyles.warningText}>
              当前没有可用账户，请先通过“更多 - 账户管理”新增或启用账户。
            </Text>
          </View>
        )}

        <Text style={styles.fieldLabel}>日期</Text>
        <TextInput
          onChangeText={(value) => {
            setDate(value);
            setSuccessMessage("");
          }}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={theme.colors.textMuted}
          style={sharedStyles.input}
          value={date}
        />

        <Text style={styles.fieldLabel}>备注</Text>
        <TextInput
          multiline
          onChangeText={setNote}
          placeholder="记录这笔事项的原因，可选"
          placeholderTextColor={theme.colors.textMuted}
          style={[sharedStyles.input, sharedStyles.textArea]}
          value={note}
        />

        {successMessage ? (
          <View style={styles.successBox}>
            <Text style={sharedStyles.successText}>{successMessage}</Text>
          </View>
        ) : null}

        <Pressable
          disabled={isSaving}
          onPress={() => void handleSubmit()}
          style={[sharedStyles.secondaryButton, isSaving && styles.buttonDisabled]}
        >
          <Text style={sharedStyles.secondaryButtonText}>
            {isSaving ? "保存中..." : "保存手动记录"}
          </Text>
        </Pressable>
      </View>

      <Modal animationType="fade" onRequestClose={handleCloseModal} transparent visible={isModalVisible}>
        <View style={styles.modalOverlay}>
          <View style={[sharedStyles.card, styles.modalCard]}>
            {modalState === "draft" ? (
              <>
                <Text style={sharedStyles.sectionTitle}>识别结果</Text>
                <Text style={sharedStyles.pageCopy}>
                  系统根据你的描述生成了这笔记录，请确认后再入账。
                </Text>
                {draft?.warning ? <Text style={sharedStyles.warningText}>{draft.warning}</Text> : null}

                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>类型</Text>
                  <Text style={styles.modalValue}>{selectedOption.label}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>金额</Text>
                  <Text style={styles.modalValue}>{formatAmount(amount)}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>分类</Text>
                  <Text style={styles.modalValue}>{category || "未填写"}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>日期</Text>
                  <Text style={styles.modalValue}>{date || "未填写"}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>账户</Text>
                  <Text style={styles.modalValue}>{selectedAccount?.name ?? "未选择"}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>现金流</Text>
                  <Text style={styles.modalValue}>{selectedMeta.cashFlowLabel}</Text>
                </View>

                <View style={sharedStyles.helperBox}>
                  <Text style={sharedStyles.helperTitle}>会计影响说明</Text>
                  <Text style={sharedStyles.helperText}>
                    {draft?.warning
                      ? "这句话可能有多种会计含义，请确认或手动修改后再入账。"
                      : selectedMeta.impactText}
                  </Text>
                </View>

                <View style={styles.modalActionRow}>
                  <Pressable
                    disabled={isSaving}
                    onPress={handleCloseModal}
                    style={[sharedStyles.secondaryButton, isSaving && styles.buttonDisabled, styles.modalAction]}
                  >
                    <Text style={sharedStyles.secondaryButtonText}>手动修改</Text>
                  </Pressable>
                  <Pressable
                    disabled={isSaving}
                    onPress={() => void handleSubmit()}
                    style={[sharedStyles.primaryButton, isSaving && styles.buttonDisabled, styles.modalAction]}
                  >
                    <Text style={sharedStyles.primaryButtonText}>
                      {isSaving ? "入账中..." : "确认入账"}
                    </Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <Text style={sharedStyles.sectionTitle}>入账成功</Text>
                <Text style={sharedStyles.pageCopy}>
                  这笔记录已保存，首页和报表数据已同步更新。
                </Text>

                <View style={sharedStyles.helperBox}>
                  <Text style={sharedStyles.helperTitle}>本次影响</Text>
                  <Text style={sharedStyles.helperText}>{selectedMeta.impactText}</Text>
                </View>

                <View style={styles.modalButtonStack}>
                  <Pressable onPress={handleContinue} style={sharedStyles.primaryButton}>
                    <Text style={sharedStyles.primaryButtonText}>继续记一笔</Text>
                  </Pressable>
                  <Pressable onPress={handleGoReports} style={sharedStyles.secondaryButton}>
                    <Text style={sharedStyles.secondaryButtonText}>去报表看看</Text>
                  </Pressable>
                  <Pressable onPress={handleManageAssets} style={sharedStyles.secondaryButton}>
                    <Text style={sharedStyles.secondaryButtonText}>管理账户 / 资产负债</Text>
                  </Pressable>
                  <Pressable onPress={handleCloseModal} style={styles.ghostButton}>
                    <Text style={styles.ghostButtonText}>关闭</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal animationType="fade" onRequestClose={closeMoreMenu} transparent visible={isMoreMenuVisible}>
        <View style={styles.moreModalRoot}>
          <Pressable
            accessibilityLabel="关闭管理中心"
            onPress={closeMoreMenu}
            style={styles.moreModalBackdrop}
          />
          <View style={styles.moreSheet}>
            <View style={styles.moreHandle} />
            <View style={styles.moreHeader}>
              <Text style={styles.moreTitle}>管理中心</Text>
              <Text style={styles.moreSubtitle}>选择你要维护的数据。</Text>
            </View>

            <View style={styles.moreOptionList}>
              <MoreMenuOption
                description="维护银行卡、微信、支付宝、证券账户、基金账户和信用卡。"
                onPress={handleOpenAccounts}
                title="账户管理"
              />
              <MoreMenuOption
                description="维护当前资产、负债和个人净资产基础数据。"
                onPress={handleOpenAssets}
                title="资产负债管理"
              />
              <MoreMenuOption
                description="查看、编辑和追踪历史入账记录。"
                onPress={handleOpenTransactions}
                title="交易记录"
              />
            </View>

            <Pressable onPress={closeMoreMenu} style={styles.moreCloseButton}>
              <Text style={styles.moreCloseText}>关闭</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

interface MoreMenuOptionProps {
  description: string;
  onPress: () => void;
  title: string;
}

function MoreMenuOption({ description, onPress, title }: MoreMenuOptionProps) {
  return (
    <Pressable onPress={onPress} style={styles.moreOptionRow}>
      <View style={styles.moreOptionContent}>
        <Text style={styles.moreOptionTitle}>{title}</Text>
        <Text style={styles.moreOptionDescription}>{description}</Text>
      </View>
      <Text style={styles.moreOptionArrow}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  amountInput: {
    backgroundColor: theme.colors.surface,
    borderBottomColor: theme.colors.primary,
    borderBottomWidth: 2,
    borderColor: theme.colors.primarySoft,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    color: theme.colors.textPrimary,
    fontSize: 36,
    fontWeight: "300",
    minHeight: 76,
    paddingHorizontal: theme.spacing.md,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
  },
  amountLabel: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  chipWrap: {
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
  formCard: {
    gap: theme.spacing.md,
  },
  ghostButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: theme.touch.minHeight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
  },
  ghostButtonText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    fontWeight: "700",
  },
  headerCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  headerRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "space-between",
  },
  messageBox: {
    backgroundColor: theme.colors.warningSoft,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  modalAction: {
    flex: 1,
  },
  modalActionRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  modalButtonStack: {
    gap: theme.spacing.sm,
  },
  modalCard: {
    gap: theme.spacing.md,
  },
  modalLabel: {
    color: theme.colors.textSecondary,
    flex: 1,
    fontSize: 14,
  },
  modalOverlay: {
    backgroundColor: "rgba(24, 16, 44, 0.18)",
    flex: 1,
    justifyContent: "center",
    padding: theme.spacing.container,
  },
  modalRow: {
    alignItems: "center",
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "space-between",
    paddingBottom: theme.spacing.sm,
  },
  modalValue: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "right",
  },
  moreButton: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.borderStrong,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 38,
    minWidth: 64,
    paddingHorizontal: 14,
  },
  moreButtonText: {
    color: theme.colors.primaryDeep,
    fontSize: 14,
    fontWeight: "600",
  },
  moreCloseButton: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceSoft,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: theme.touch.minHeight,
    paddingHorizontal: theme.spacing.md,
  },
  moreCloseText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    fontWeight: "800",
  },
  moreHandle: {
    alignSelf: "center",
    backgroundColor: theme.colors.borderStrong,
    borderRadius: theme.radius.pill,
    height: 4,
    width: 44,
  },
  moreHeader: {
    gap: 5,
  },
  moreModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(24, 16, 44, 0.26)",
  },
  moreModalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  moreOptionArrow: {
    color: theme.colors.primaryDeep,
    fontSize: 28,
    fontWeight: "300",
    lineHeight: 28,
  },
  moreOptionContent: {
    flex: 1,
    gap: 5,
  },
  moreOptionDescription: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  moreOptionList: {
    gap: theme.spacing.sm,
  },
  moreOptionRow: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceSoft,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.md,
    minHeight: 78,
    padding: theme.spacing.md,
  },
  moreOptionTitle: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "900",
  },
  moreSheet: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    borderWidth: 1,
    gap: theme.spacing.md,
    padding: theme.spacing.container,
    paddingBottom: 28,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 1,
    shadowRadius: 28,
    elevation: 8,
  },
  moreSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  moreTitle: {
    color: theme.colors.textPrimary,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  naturalInput: {
    borderColor: theme.colors.primaryDeep,
    minHeight: 150,
  },
  pageTitle: {
    color: theme.colors.textPrimary,
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  quickCategoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    justifyContent: "space-between",
  },
  quickChip: {
    flex: 1,
    minWidth: "18%",
  },
  stack: {
    gap: theme.spacing.lg,
  },
  successBox: {
    backgroundColor: theme.colors.successSoft,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
});
