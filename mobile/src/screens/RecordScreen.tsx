import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { TransactionInput } from "../domain/accounting/transactionRules";
import type { Account, TransactionType } from "../domain/models";

interface RecordScreenProps {
  accounts: Account[];
  onSave: (input: TransactionInput) => Promise<void>;
}

type RecordTransactionType = Extract<
  TransactionType,
  | "income"
  | "expense"
  | "assetIncrease"
  | "assetDecrease"
  | "liabilityIncrease"
  | "liabilityDecrease"
  | "investmentBuy"
  | "investmentSell"
  | "creditCardExpense"
  | "creditCardRepayment"
>;

interface TransactionTypeOption {
  type: RecordTransactionType;
  label: string;
  defaultCategory: string;
  helperText: string;
  requiresAccount: boolean;
}

const today = () => new Date().toISOString().slice(0, 10);

const transactionTypeOptions: TransactionTypeOption[] = [
  {
    type: "income",
    label: "收入",
    defaultCategory: "工资薪金",
    helperText: "收入增加，现金增加，计入经营活动现金流入。",
    requiresAccount: true,
  },
  {
    type: "expense",
    label: "支出",
    defaultCategory: "餐饮",
    helperText: "费用增加，现金减少，计入经营活动现金流出。",
    requiresAccount: true,
  },
  {
    type: "assetIncrease",
    label: "资产增加",
    defaultCategory: "资产增加",
    helperText: "资产增加，暂不自动确认为收入，适合手动补录资产变化。",
    requiresAccount: true,
  },
  {
    type: "assetDecrease",
    label: "资产减少",
    defaultCategory: "资产减少",
    helperText: "资产减少，暂不自动确认为费用，适合手动修正资产变化。",
    requiresAccount: true,
  },
  {
    type: "liabilityIncrease",
    label: "负债增加",
    defaultCategory: "借款",
    helperText: "负债增加，通常对应现金或可用资金增加，计入筹资活动现金流。",
    requiresAccount: true,
  },
  {
    type: "liabilityDecrease",
    label: "负债减少",
    defaultCategory: "还款",
    helperText: "负债减少，现金减少，计入债务偿还现金流出。",
    requiresAccount: true,
  },
  {
    type: "investmentBuy",
    label: "投资买入",
    defaultCategory: "基金买入",
    helperText: "投资资产增加，现金减少，计入投资活动现金流出，不直接影响利润。",
    requiresAccount: true,
  },
  {
    type: "investmentSell",
    label: "投资卖出",
    defaultCategory: "基金卖出",
    helperText: "投资资产减少，现金增加，V0.1 暂不自动计算投资收益。",
    requiresAccount: true,
  },
  {
    type: "creditCardExpense",
    label: "信用卡消费",
    defaultCategory: "信用卡消费",
    helperText: "费用增加，负债增加，不产生现金流。",
    requiresAccount: true,
  },
  {
    type: "creditCardRepayment",
    label: "信用卡还款",
    defaultCategory: "信用卡还款",
    helperText: "负债减少，现金减少，计入债务偿还现金流出。",
    requiresAccount: true,
  },
];

const findOption = (type: RecordTransactionType): TransactionTypeOption =>
  transactionTypeOptions.find((option) => option.type === type) ?? transactionTypeOptions[0];

const normalizeAmount = (value: string): number => Number(value.replace(",", "."));

export default function RecordScreen({ accounts, onSave }: RecordScreenProps) {
  const [type, setType] = useState<RecordTransactionType>("income");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(findOption("income").defaultCategory);
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [date, setDate] = useState(today());
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const selectedOption = findOption(type);
  const activeAccounts = useMemo(() => accounts.filter((account) => account.isActive), [accounts]);

  const handleTypeChange = (nextType: RecordTransactionType) => {
    const nextOption = findOption(nextType);
    setType(nextType);
    setCategory(nextOption.defaultCategory);
    setSuccessMessage("");
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
        note,
      });
      setAmount("");
      setNote("");
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
        <Text style={styles.copy}>记录会写入本地数据，并通过统一状态流刷新首页和报表。</Text>
      </View>

      <View style={styles.form}>
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
          <Text style={styles.copy}>{selectedOption.helperText}</Text>
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
          <Text style={styles.saveButtonText}>{isSaving ? "保存中..." : "保存记录"}</Text>
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
    marginBottom: 16,
  },
});
