import { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
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
  {
    type: "creditCardRepayment",
    label: "信用卡还款",
    defaultCategory: "信用卡",
    requiresAccount: true,
  },
];

const examples = [
  "今天中午吃饭花了15",
  "工资到账3200",
  "买基金1000",
  "还信用卡500",
  "朋友还我200",
];

const findOption = (type: NaturalLanguageTransactionType): TransactionTypeOption =>
  transactionTypeOptions.find((option) => option.type === type) ?? transactionTypeOptions[0];

const normalizeAmount = (value: string): number => Number(value.replace(",", "."));

const formatAmount = (value: string): string => {
  const amount = normalizeAmount(value);
  if (!Number.isFinite(amount)) return "未填写";
  return `${amount} 元`;
};

export default function RecordScreen({
  accounts,
  onSave,
  onOpenReports,
  onOpenAssets,
}: RecordScreenProps) {
  const [naturalText, setNaturalText] = useState("");
  const [draft, setDraft] = useState<ParsedTransactionDraft | null>(null);
  const [type, setType] = useState<NaturalLanguageTransactionType>("income");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(findOption("income").defaultCategory);
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [date, setDate] = useState(today());
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalState, setModalState] = useState<ModalState>("draft");

  const selectedOption = findOption(type);
  const selectedMeta = transactionTypeMeta[type];
  const activeAccounts = useMemo(() => accounts.filter((account) => account.isActive), [accounts]);
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

  const clearEntryFields = () => {
    setAmount("");
    setNote("");
    setDraft(null);
    setNaturalText("");
    setSuccessMessage("");
  };

  const openMoreMenu = () => {
    Alert.alert("更多", "请选择要进入的管理项。", [
      { text: "账户管理", onPress: () => Alert.alert("提示", "该功能将在后续版本中完善。") },
      { text: "资产负债管理", onPress: onOpenAssets },
      { text: "交易记录", onPress: () => Alert.alert("提示", "该功能将在后续版本中完善。") },
      { text: "取消", style: "cancel" },
    ]);
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
    Alert.alert("提示", "账户管理功能将在后续版本中完善。你也可以先使用资产负债管理。");
  };

  return (
    <View style={styles.stack}>
      <View style={sharedStyles.pageHeader}>
        <View style={styles.headerRow}>
          <View style={styles.headerCopy}>
            <Text style={sharedStyles.eyebrow}>Manage</Text>
            <Text style={sharedStyles.pageTitle}>管理</Text>
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
        <TextInput
          multiline
          onChangeText={(value) => {
            setNaturalText(value);
            setSuccessMessage("");
          }}
          placeholder={examples.join("\n")}
          placeholderTextColor="#8a9380"
          style={[sharedStyles.input, sharedStyles.textArea, styles.naturalInput]}
          value={naturalText}
        />
        <Pressable onPress={handleRecognize} style={styles.accentButton}>
          <Text style={styles.accentButtonText}>智能识别</Text>
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
                style={[sharedStyles.chip, styles.chip, isActive && sharedStyles.chipActiveDark]}
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

        <Text style={styles.fieldLabel}>金额</Text>
        <TextInput
          keyboardType="decimal-pad"
          onChangeText={(value) => {
            setAmount(value);
            setSuccessMessage("");
          }}
          placeholder="例如 1000"
          placeholderTextColor="#8a9380"
          style={sharedStyles.input}
          value={amount}
        />

        <Text style={styles.fieldLabel}>分类</Text>
        <TextInput
          onChangeText={(value) => {
            setCategory(value);
            setSuccessMessage("");
          }}
          placeholder="例如 工资薪金 / 餐饮 / 投资资产"
          placeholderTextColor="#8a9380"
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
                  style={[sharedStyles.chip, styles.chip, isActive && sharedStyles.chipActiveDark]}
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
              当前没有可用账户，请先在设置中恢复示例数据；后续版本会提供账户管理能力。
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
          placeholderTextColor="#8a9380"
          style={sharedStyles.input}
          value={date}
        />

        <Text style={styles.fieldLabel}>备注</Text>
        <TextInput
          multiline
          onChangeText={setNote}
          placeholder="记录这笔事项的原因，可选"
          placeholderTextColor="#8a9380"
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
          style={[sharedStyles.primaryButton, isSaving && styles.buttonDisabled]}
        >
          <Text style={sharedStyles.primaryButtonText}>
            {isSaving ? "保存中..." : "保存手动记录"}
          </Text>
        </Pressable>
      </View>

      <Modal
        animationType="fade"
        onRequestClose={handleCloseModal}
        transparent
        visible={isModalVisible}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
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
                    style={[sharedStyles.secondaryButton, isSaving && styles.buttonDisabled]}
                  >
                    <Text style={sharedStyles.secondaryButtonText}>手动修改</Text>
                  </Pressable>
                  <Pressable
                    disabled={isSaving}
                    onPress={() => void handleSubmit()}
                    style={[sharedStyles.primaryButton, isSaving && styles.buttonDisabled]}
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
    </View>
  );
}

const styles = StyleSheet.create({
  accentButton: {
    alignItems: "center",
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.md,
    justifyContent: "center",
    minHeight: theme.touch.minHeight,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  accentButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: "800",
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  chip: {
    alignItems: "center",
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
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
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
  modalActionRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  modalButtonStack: {
    gap: theme.spacing.sm,
  },
  modalCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  modalLabel: {
    color: theme.colors.textSecondary,
    flex: 1,
    fontSize: theme.typography.body,
  },
  modalOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.36)",
    flex: 1,
    justifyContent: "center",
    padding: theme.spacing.xl,
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
    fontSize: theme.typography.body,
    fontWeight: "700",
    textAlign: "right",
  },
  moreButton: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 40,
    minWidth: 64,
    paddingHorizontal: theme.spacing.md,
  },
  moreButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.label,
    fontWeight: "700",
  },
  naturalInput: {
    minHeight: 116,
  },
  stack: {
    gap: theme.spacing.xl,
  },
  successBox: {
    backgroundColor: theme.colors.successSoft,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
});
