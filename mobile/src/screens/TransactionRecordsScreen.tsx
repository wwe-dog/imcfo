import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { Account, Transaction, TransactionType } from "../domain/models";
import { sharedStyles, theme } from "../styles/theme";
import { formatCurrency } from "../utils/formatters";

type TransactionFilter =
  | "all"
  | "income"
  | "expense"
  | "asset"
  | "liability"
  | "investment"
  | "creditCard"
  | "reconciliation"
  | "nonCash";

interface TransactionRecordsScreenProps {
  accounts: Account[];
  transactions: Transaction[];
  onBack: () => void;
}

interface FilterOption {
  key: TransactionFilter;
  label: string;
}

const filterOptions: FilterOption[] = [
  { key: "all", label: "全部" },
  { key: "income", label: "收入" },
  { key: "expense", label: "支出" },
  { key: "asset", label: "资产" },
  { key: "liability", label: "负债" },
  { key: "investment", label: "投资" },
  { key: "creditCard", label: "信用卡" },
  { key: "reconciliation", label: "对账调整" },
  { key: "nonCash", label: "非现金" },
];

const transactionTypeLabels: Record<TransactionType, string> = {
  assetDecrease: "资产减少",
  assetIncrease: "资产增加",
  creditCardExpense: "信用卡消费",
  creditCardRepayment: "信用卡还款",
  expense: "支出",
  income: "收入",
  investmentBuy: "投资买入",
  investmentSell: "投资卖出",
  liabilityDecrease: "负债减少",
  liabilityIncrease: "负债增加",
  payablePay: "应付支付",
  payableRecognize: "应付确认",
  receivableCollect: "应收收回",
  receivableRecognize: "应收确认",
  repayment: "还款",
  transfer: "转账 / 内部调整",
};

const cashFlowLabels = {
  financing: "筹资活动现金流",
  investing: "投资活动现金流",
  nonCash: "非现金",
  operating: "经营活动现金流",
} as const;

const getAccountName = (accounts: Account[], accountId?: string): string =>
  accounts.find((account) => account.id === accountId)?.name ?? "未关联账户";

const getTransactionTitle = (transaction: Transaction): string =>
  transaction.note?.trim() || transaction.category || transactionTypeLabels[transaction.type];

const isReconciliationTransaction = (transaction: Transaction): boolean =>
  transaction.id.startsWith("tx-reconcile") ||
  (transaction.note?.includes("对账") ?? false) ||
  (transaction.note?.includes("调整") ?? false);

const matchesFilter = (transaction: Transaction, filter: TransactionFilter): boolean => {
  switch (filter) {
    case "all":
      return true;
    case "income":
      return transaction.type === "income";
    case "expense":
      return transaction.type === "expense" || transaction.type === "creditCardExpense";
    case "asset":
      return transaction.type === "assetIncrease" || transaction.type === "assetDecrease";
    case "liability":
      return (
        transaction.type === "liabilityIncrease" ||
        transaction.type === "liabilityDecrease" ||
        transaction.type === "repayment" ||
        transaction.type === "payableRecognize" ||
        transaction.type === "payablePay"
      );
    case "investment":
      return (
        transaction.type === "investmentBuy" ||
        transaction.type === "investmentSell" ||
        transaction.category.includes("投资") ||
        transaction.category.includes("基金") ||
        transaction.category.includes("ETF") ||
        transaction.category.includes("股票")
      );
    case "creditCard":
      return transaction.type === "creditCardExpense" || transaction.type === "creditCardRepayment";
    case "reconciliation":
      return isReconciliationTransaction(transaction);
    case "nonCash":
      return transaction.cashFlowType === "nonCash";
  }
};

const getAmountTone = (transaction: Transaction): "positive" | "negative" | "neutral" => {
  if (transaction.cashFlowType === "nonCash") return "neutral";

  if (
    transaction.type === "income" ||
    transaction.type === "investmentSell" ||
    transaction.type === "assetIncrease" ||
    transaction.type === "liabilityIncrease" ||
    transaction.type === "receivableCollect"
  ) {
    return "positive";
  }

  return "negative";
};

const formatSignedAmount = (transaction: Transaction): string => {
  const tone = getAmountTone(transaction);
  if (tone === "positive") return `+${formatCurrency(transaction.amount)}`;
  if (tone === "negative") return `-${formatCurrency(transaction.amount)}`;
  return formatCurrency(transaction.amount);
};

const getMonthLabel = (date: string): string => {
  const [year, month] = date.split("-");
  if (!year || !month) return "未分组";
  return `${year}年${Number(month)}月`;
};

export default function TransactionRecordsScreen({
  accounts,
  transactions,
  onBack,
}: TransactionRecordsScreenProps) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<TransactionFilter>("all");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const filteredGroups = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = transactions
      .filter((transaction) => matchesFilter(transaction, activeFilter))
      .filter((transaction) => {
        if (!normalizedQuery) return true;

        const haystack = [
          getTransactionTitle(transaction),
          transaction.category,
          transaction.note ?? "",
          transactionTypeLabels[transaction.type],
          getAccountName(accounts, transaction.accountId),
          getAccountName(accounts, transaction.counterAccountId),
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedQuery);
      })
      .sort((first, second) => {
        if (first.date !== second.date) return second.date.localeCompare(first.date);
        return second.createdAt.localeCompare(first.createdAt);
      });

    return filtered.reduce<Array<{ month: string; items: Transaction[] }>>((groups, transaction) => {
      const month = getMonthLabel(transaction.date);
      const existingGroup = groups.find((group) => group.month === month);
      if (existingGroup) {
        existingGroup.items.push(transaction);
      } else {
        groups.push({ month, items: [transaction] });
      }
      return groups;
    }, []);
  }, [accounts, activeFilter, query, transactions]);

  if (selectedTransaction) {
    const accountName = getAccountName(accounts, selectedTransaction.accountId);
    const counterAccountName = selectedTransaction.counterAccountId
      ? getAccountName(accounts, selectedTransaction.counterAccountId)
      : "";

    return (
      <View style={styles.stack}>
        <TopBar onBack={() => setSelectedTransaction(null)} title="交易详情" />
        <View style={[sharedStyles.card, styles.detailCard]}>
          <Text style={styles.detailTitle}>{getTransactionTitle(selectedTransaction)}</Text>
          <Text style={[styles.detailAmount, styles[`amount_${getAmountTone(selectedTransaction)}`]]}>
            {formatSignedAmount(selectedTransaction)}
          </Text>
          <DetailRow label="类型" value={transactionTypeLabels[selectedTransaction.type]} />
          <DetailRow label="日期" value={selectedTransaction.date} />
          <DetailRow label="分类" value={selectedTransaction.category} />
          <DetailRow label="账户" value={accountName} />
          {counterAccountName ? <DetailRow label="关联账户" value={counterAccountName} /> : null}
          <DetailRow label="现金流" value={cashFlowLabels[selectedTransaction.cashFlowType]} />
          <DetailRow label="备注" value={selectedTransaction.note || "无"} />
        </View>
      </View>
    );
  }

  const hasTransactions = transactions.length > 0;
  const hasResult = filteredGroups.length > 0;

  return (
    <View style={styles.stack}>
      <TopBar onBack={onBack} title="交易记录" />

      <View style={[sharedStyles.card, styles.searchCard]}>
        <TextInput
          onChangeText={setQuery}
          placeholder="搜索交易、分类、账户、备注"
          placeholderTextColor={theme.colors.textMuted}
          style={sharedStyles.input}
          value={query}
        />
        <View style={styles.filterWrap}>
          {filterOptions.map((option) => {
            const active = activeFilter === option.key;
            return (
              <Pressable
                key={option.key}
                onPress={() => setActiveFilter(option.key)}
                style={[sharedStyles.chip, active && sharedStyles.chipActiveDark]}
              >
                <Text style={[sharedStyles.chipText, active && sharedStyles.chipTextInverse]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {!hasTransactions ? (
        <EmptyState
          description="你可以先在管理页记一笔，系统会在这里显示记录。"
          title="暂无交易记录"
        />
      ) : null}

      {hasTransactions && !hasResult ? (
        <EmptyState
          description="试试调整关键词或筛选条件。"
          title="没有找到符合条件的交易"
        />
      ) : null}

      {filteredGroups.map((group) => (
        <View key={group.month} style={styles.monthGroup}>
          <Text style={styles.monthTitle}>{group.month}</Text>
          <View style={styles.listStack}>
            {group.items.map((transaction) => (
              <TransactionRow
                accountName={getAccountName(accounts, transaction.accountId)}
                key={transaction.id}
                onPress={() => setSelectedTransaction(transaction)}
                transaction={transaction}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

function TopBar({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <View style={styles.headerRow}>
      <Pressable onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>返回</Text>
      </Pressable>
      <Text style={styles.pageTitle}>{title}</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}

function TransactionRow({
  accountName,
  transaction,
  onPress,
}: {
  accountName: string;
  transaction: Transaction;
  onPress: () => void;
}) {
  const tone = getAmountTone(transaction);

  return (
    <Pressable onPress={onPress} style={styles.transactionCard}>
      <View style={styles.transactionMain}>
        <Text numberOfLines={1} style={styles.transactionTitle}>
          {getTransactionTitle(transaction)}
        </Text>
        <Text numberOfLines={2} style={styles.transactionMeta}>
          {transactionTypeLabels[transaction.type]} · {transaction.category} · {accountName}
        </Text>
        <View style={styles.tagRow}>
          <Text style={styles.dateText}>{transaction.date}</Text>
          <Text style={[styles.cashFlowBadge, transaction.cashFlowType === "nonCash" && styles.nonCashBadge]}>
            {cashFlowLabels[transaction.cashFlowType]}
          </Text>
        </View>
      </View>
      <Text style={[styles.transactionAmount, styles[`amount_${tone}`]]}>{formatSignedAmount(transaction)}</Text>
    </Pressable>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function EmptyState({ description, title }: { description: string; title: string }) {
  return (
    <View style={[sharedStyles.card, styles.emptyCard]}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={sharedStyles.emptyText}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  amount_negative: {
    color: theme.colors.danger,
  },
  amount_neutral: {
    color: theme.colors.textPrimary,
  },
  amount_positive: {
    color: theme.colors.success,
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
  cashFlowBadge: {
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radius.pill,
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  dateText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  detailAmount: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  detailCard: {
    gap: theme.spacing.md,
  },
  detailLabel: {
    color: theme.colors.textMuted,
    fontSize: 14,
    width: 78,
  },
  detailRow: {
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  detailTitle: {
    color: theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 28,
  },
  detailValue: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 22,
    textAlign: "right",
  },
  emptyCard: {
    gap: theme.spacing.sm,
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontSize: 17,
    fontWeight: "900",
  },
  filterWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
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
  listStack: {
    gap: theme.spacing.sm,
  },
  monthGroup: {
    gap: theme.spacing.sm,
  },
  monthTitle: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    fontWeight: "900",
    paddingHorizontal: 2,
  },
  nonCashBadge: {
    backgroundColor: theme.colors.warningSoft,
    color: theme.colors.warning,
  },
  pageTitle: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  searchCard: {
    gap: theme.spacing.md,
  },
  stack: {
    gap: theme.spacing.lg,
  },
  tagRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "900",
    minWidth: 92,
    textAlign: "right",
  },
  transactionCard: {
    alignItems: "flex-start",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "space-between",
    padding: theme.spacing.md,
  },
  transactionMain: {
    flex: 1,
    gap: 4,
  },
  transactionMeta: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  transactionTitle: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "900",
  },
});
