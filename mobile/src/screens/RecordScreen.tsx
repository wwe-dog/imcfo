import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { transactionRules, type TransactionInput } from "../domain/accounting/transactionRules";
import type { Account, TransactionType } from "../domain/models";

interface RecordScreenProps {
  accounts: Account[];
  onSave: (input: TransactionInput) => Promise<void>;
}

const today = () => new Date().toISOString().slice(0, 10);

const defaultCategoryByType: Record<TransactionType, string> = {
  income: "工资薪金",
  expense: "餐饮",
  assetIncrease: "资产增加",
  assetDecrease: "资产减少",
  liabilityIncrease: "借款",
  liabilityDecrease: "还款",
  transfer: "转账",
  investmentBuy: "基金买入",
  investmentSell: "基金卖出",
  repayment: "还款",
  creditCardExpense: "信用卡消费",
  creditCardRepayment: "信用卡还款",
};

export default function RecordScreen({ accounts, onSave }: RecordScreenProps) {
  const [type, setType] = useState<TransactionType>("income");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(defaultCategoryByType.income);
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [date, setDate] = useState(today());
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const selectedRule = transactionRules.find((rule) => rule.type === type);

  const handleTypeChange = (nextType: TransactionType) => {
    setType(nextType);
    setCategory(defaultCategoryByType[nextType]);
  };

  const handleSubmit = async () => {
    const numericAmount = Number(amount);

    if (!type || !accountId || !date || !category.trim()) {
      Alert.alert("请补全信息", "类型、账户、日期和分类都必须填写。");
      return;
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      Alert.alert("金额不正确", "请输入大于 0 的金额。");
      return;
    }

    setIsSaving(true);
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
        <Text style={styles.copy}>保存后会刷新首页和报表，屏幕不会直接访问 AsyncStorage。</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>类型</Text>
        <View style={styles.chipWrap}>
          {transactionRules.map((rule) => (
            <Pressable
              key={rule.type}
              onPress={() => handleTypeChange(rule.type)}
              style={[styles.chip, type === rule.type && styles.chipActive]}
            >
              <Text style={[styles.chipText, type === rule.type && styles.chipTextActive]}>{rule.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.ruleBox}>
          <Text style={styles.ruleTitle}>映射规则</Text>
          <Text style={styles.copy}>{selectedRule?.accountingEffect}</Text>
          {selectedRule?.limitation ? <Text style={styles.limitation}>{selectedRule.limitation}</Text> : null}
        </View>

        <Text style={styles.label}>金额</Text>
        <TextInput
          keyboardType="decimal-pad"
          onChangeText={setAmount}
          placeholder="例如 1000"
          style={styles.input}
          value={amount}
        />

        <Text style={styles.label}>分类</Text>
        <TextInput onChangeText={setCategory} placeholder="例如 工资薪金 / 餐饮" style={styles.input} value={category} />

        <Text style={styles.label}>账户</Text>
        <View style={styles.chipWrap}>
          {accounts.map((account) => (
            <Pressable
              key={account.id}
              onPress={() => setAccountId(account.id)}
              style={[styles.chip, accountId === account.id && styles.chipActive]}
            >
              <Text style={[styles.chipText, accountId === account.id && styles.chipTextActive]}>{account.name}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>日期</Text>
        <TextInput onChangeText={setDate} placeholder="YYYY-MM-DD" style={styles.input} value={date} />

        <Text style={styles.label}>备注</Text>
        <TextInput
          multiline
          onChangeText={setNote}
          placeholder="记录这笔事项的原因"
          style={[styles.input, styles.textarea]}
          value={note}
        />

        <Pressable disabled={isSaving} onPress={() => void handleSubmit()} style={styles.saveButton}>
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
  limitation: {
    color: "#8a5a22",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
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
  saveButtonText: {
    color: "#f8f4e7",
    fontWeight: "700",
  },
  stack: {
    gap: 20,
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
});
