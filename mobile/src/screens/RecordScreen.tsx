import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import {
  parseNaturalLanguageTransaction,
  transactionTypeMeta,
  type NaturalLanguageTransactionType,
  type ParsedTransactionDraft,
} from "../domain/accounting/naturalLanguageParser";
import type { TransactionInput } from "../domain/accounting/transactionRules";
import type { Account } from "../domain/models";

interface RecordScreenProps {
  accounts: Account[];
  onSave: (input: TransactionInput) => Promise<void>;
}

interface TransactionTypeOption {
  type: NaturalLanguageTransactionType;
  label: string;
  defaultCategory: string;
  requiresAccount: boolean;
}

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

const examples = ["今天中午吃饭花了15", "工资到账3200", "买基金1000", "还信用卡500", "朋友还我200"];

const findOption = (type: NaturalLanguageTransactionType): TransactionTypeOption =>
  transactionTypeOptions.find((option) => option.type === type) ?? transactionTypeOptions[0];

const normalizeAmount = (value: string): number => Number(value.replace(",", "."));

const formatAmount = (value: string): string => {
  const amount = normalizeAmount(value);
  if (!Number.isFinite(amount)) return "未填写";
  return `${amount} 元`;
};

export default function RecordScreen({ accounts, onSave }: RecordScreenProps) {
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
      Alert.alert("请填写分类", "分类是必填项，例如工资薪金、餐饮、基金买入。");
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
      setAmount("");
      setNote("");
      setDraft(null);
      setNaturalText("");
      setSuccessMessage("保存成功，金额和备注已清空，可以继续记录下一笔。");
    } catch {
      Alert.alert("保存失败", "这笔记录没有保存成功，请稍后重试。");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.stack}>
      <View>
        <Text style={styles.eyebrow}>Record</Text>
        <Text style={styles.title}>记一笔</Text>
        <Text style={styles.copy}>直接描述发生了什么，先识别成草稿，确认后再入账。</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>一句话记账</Text>
        <TextInput
          multiline
          onChangeText={(value) => {
            setNaturalText(value);
            setSuccessMessage("");
          }}
          placeholder={examples.join("\n")}
          placeholderTextColor="#8a9380"
          style={[styles.input, styles.naturalInput]}
          value={naturalText}
        />
        <Pressable onPress={handleRecognize} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>智能识别</Text>
        </Pressable>
      </View>

      {draft ? (
        <View style={styles.draftCard}>
          <Text style={styles.sectionTitle}>识别结果</Text>
          {draft.warning ? <Text style={styles.warningText}>{draft.warning}</Text> : null}
          <View style={styles.draftRow}>
            <Text style={styles.draftLabel}>类型</Text>
            <Text style={styles.draftValue}>{selectedOption.label}</Text>
          </View>
          <View style={styles.draftRow}>
            <Text style={styles.draftLabel}>金额</Text>
            <Text style={styles.draftValue}>{formatAmount(amount)}</Text>
          </View>
          <View style={styles.draftRow}>
            <Text style={styles.draftLabel}>分类</Text>
            <Text style={styles.draftValue}>{category || "未填写"}</Text>
          </View>
          <View style={styles.draftRow}>
            <Text style={styles.draftLabel}>日期</Text>
            <Text style={styles.draftValue}>{date || "未填写"}</Text>
          </View>
          <View style={styles.draftRow}>
            <Text style={styles.draftLabel}>账户</Text>
            <Text style={styles.draftValue}>{selectedAccount?.name ?? "未选择"}</Text>
          </View>
          <View style={styles.draftRow}>
            <Text style={styles.draftLabel}>现金流</Text>
            <Text style={styles.draftValue}>{selectedMeta.cashFlowLabel}</Text>
          </View>
          <View style={styles.impactBox}>
            <Text style={styles.ruleTitle}>会计影响说明</Text>
            <Text style={styles.copy}>{draft.warning ? "这句话可能有多种会计含义，请确认后再入账。" : selectedMeta.impactText}</Text>
          </View>
          <Pressable disabled={isSaving} onPress={() => void handleSubmit()} style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}>
            <Text style={styles.saveButtonText}>{isSaving ? "入账中..." : "确认入账"}</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>手动修改 / 高级填写</Text>
        <Text style={styles.label}>交易类型</Text>
        <View style={styles.chipWrap}>
          {transactionTypeOptions.map((option) => (
            <Pressable
              key={option.type}
              onPress={() => handleTypeChange(option.type)}
              style={[styles.chip, type === option.type && styles.chipActive]}
            >
              <Text style={[styles.chipText, type === option.type && styles.chipTextActive]}>{option.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.ruleBox}>
          <Text style={styles.ruleTitle}>影响说明</Text>
          <Text style={styles.copy}>{selectedMeta.impactText}</Text>
        </View>

        <Text style={styles.label}>金额</Text>
        <TextInput
          keyboardType="decimal-pad"
          onChangeText={(value) => {
            setAmount(value);
            setSuccessMessage("");
          }}
          placeholder="例如 1000"
          placeholderTextColor="#8a9380"
          style={styles.input}
          value={amount}
        />

        <Text style={styles.label}>分类</Text>
        <TextInput
          onChangeText={(value) => {
            setCategory(value);
            setSuccessMessage("");
          }}
          placeholder="例如 工资薪金 / 餐饮 / 基金买入"
          placeholderTextColor="#8a9380"
          style={styles.input}
          value={category}
        />

        <Text style={styles.label}>账户</Text>
        {activeAccounts.length > 0 ? (
          <View style={styles.chipWrap}>
            {activeAccounts.map((account) => (
              <Pressable
                key={account.id}
                onPress={() => {
                  setAccountId(account.id);
                  setSuccessMessage("");
                }}
                style={[styles.chip, accountId === account.id && styles.chipActive]}
              >
                <Text style={[styles.chipText, accountId === account.id && styles.chipTextActive]}>
                  {account.name}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <Text style={styles.warningText}>当前没有可用账户，请先恢复示例数据或后续添加账户管理能力。</Text>
        )}

        <Text style={styles.label}>日期</Text>
        <TextInput
          onChangeText={(value) => {
            setDate(value);
            setSuccessMessage("");
          }}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#8a9380"
          style={styles.input}
          value={date}
        />

        <Text style={styles.label}>备注</Text>
        <TextInput
          multiline
          onChangeText={setNote}
          placeholder="记录这笔事项的原因，可选"
          placeholderTextColor="#8a9380"
          style={[styles.input, styles.textarea]}
          value={note}
        />

        {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

        <Pressable disabled={isSaving} onPress={() => void handleSubmit()} style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}>
          <Text style={styles.saveButtonText}>{isSaving ? "保存中..." : "保存手动记录"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: "#fffef8",
    borderColor: "#cbd5bf",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  chipActive: {
    backgroundColor: "#17251b",
    borderColor: "#17251b",
  },
  chipText: {
    color: "#18201a",
    fontSize: 13,
    fontWeight: "700",
  },
  chipTextActive: {
    color: "#f8f4e7",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  copy: {
    color: "#50604d",
    fontSize: 14,
    lineHeight: 22,
  },
  draftCard: {
    backgroundColor: "#fffef8",
    borderColor: "#b9caa5",
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  draftLabel: {
    color: "#50604d",
    flex: 1,
    fontSize: 14,
  },
  draftRow: {
    alignItems: "center",
    borderBottomColor: "#e3e8d7",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    paddingBottom: 8,
  },
  draftValue: {
    color: "#18201a",
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "right",
  },
  eyebrow: {
    color: "#7f8c54",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
  },
  form: {
    backgroundColor: "#fbfaf3",
    borderColor: "#d5dcc7",
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  impactBox: {
    backgroundColor: "#eef2e8",
    borderRadius: 10,
    padding: 12,
  },
  input: {
    backgroundColor: "#fffef8",
    borderColor: "#cbd5bf",
    borderRadius: 10,
    borderWidth: 1,
    color: "#18201a",
    marginBottom: 14,
    padding: 12,
  },
  label: {
    color: "#50604d",
    fontWeight: "700",
    marginBottom: 8,
  },
  naturalInput: {
    minHeight: 112,
    textAlignVertical: "top",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#d7f171",
    borderRadius: 10,
    padding: 14,
  },
  primaryButtonText: {
    color: "#17251b",
    fontWeight: "800",
  },
  ruleBox: {
    backgroundColor: "#eef2e8",
    borderRadius: 10,
    marginBottom: 16,
    padding: 12,
  },
  ruleTitle: {
    color: "#18201a",
    fontWeight: "700",
    marginBottom: 4,
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: "#17251b",
    borderRadius: 10,
    padding: 14,
  },
  saveButtonDisabled: {
    opacity: 0.65,
  },
  saveButtonText: {
    color: "#f8f4e7",
    fontWeight: "700",
  },
  sectionTitle: {
    color: "#18201a",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },
  stack: {
    gap: 20,
  },
  successText: {
    color: "#2d6b3f",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  textarea: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  title: {
    color: "#18201a",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },
  warningText: {
    color: "#8a5a22",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
});
