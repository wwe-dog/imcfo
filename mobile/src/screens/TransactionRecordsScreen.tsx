import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { Account, Transaction, TransactionType } from "../domain/models";
import { sharedStyles, theme } from "../styles/theme";
import { formatCurrency } from "../utils/formatters";

interface TransactionRecordsScreenProps {
  accounts: Account[];
  transactions: Transaction[];
  onBack: () => void;
}

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

const getCashStatusLabel = (transaction: Transaction): string => {
  if (transaction.cashFlowType === "nonCash") return "非现金";
  return getAmountTone(transaction) === "positive" ? "现金流入" : "现金流出";
};

const getTransactionDateTime = (transaction: Transaction): string => {
  const createdAt = new Date(transaction.createdAt);
  if (!Number.isNaN(createdAt.getTime())) {
    const hours = String(createdAt.getHours()).padStart(2, "0");
    const minutes = String(createdAt.getMinutes()).padStart(2, "0");
    if (hours !== "00" || minutes !== "00") {
      return `${transaction.date} ${hours}:${minutes}`;
    }
  }

  return transaction.date;
};

export default function TransactionRecordsScreen({
  accounts,
  transactions,
  onBack,
}: TransactionRecordsScreenProps) {
  const [query, setQuery] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const filteredGroups = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = transactions
      .filter((transaction) => {
        if (!normalizedQuery) return true;

        const amountText = [
          String(transaction.amount),
          formatCurrency(transaction.amount),
          formatSignedAmount(transaction),
        ].join(" ");
        const haystack = [
          getTransactionTitle(transaction),
          amountText,
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
  }, [accounts, query, transactions]);

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

      <View style={styles.toolbar}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          onChangeText={setQuery}
          placeholder="搜索交易、金额、备注"
          placeholderTextColor={theme.colors.textMuted}
          style={styles.searchInput}
          value={query}
        />
        <Pressable
          accessibilityLabel="筛选交易"
          onPress={() => Alert.alert("筛选交易", "筛选功能将在后续版本中完善。", [{ text: "知道了" }])}
          style={styles.filterButton}
        >
          <Text style={styles.filterIcon}>筛</Text>
        </Pressable>
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
  transaction,
  onPress,
}: {
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
        <Text numberOfLines={1} style={styles.transactionMeta}>
          {getTransactionDateTime(transaction)} · {getCashStatusLabel(transaction)}
        </Text>
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
  filterButton: {
    alignItems: "center",
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radius.pill,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  filterIcon: {
    color: theme.colors.primaryDeep,
    fontSize: 14,
    fontWeight: "900",
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
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    overflow: "hidden",
  },
  monthGroup: {
    gap: 6,
  },
  monthTitle: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: "900",
    paddingHorizontal: 2,
  },
  pageTitle: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  searchIcon: {
    color: theme.colors.textMuted,
    fontSize: 20,
    fontWeight: "800",
  },
  searchInput: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: 15,
    minHeight: 40,
    paddingHorizontal: theme.spacing.sm,
  },
  stack: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  toolbar: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.sm,
    minHeight: 48,
    paddingLeft: theme.spacing.md,
    paddingRight: 6,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "900",
    minWidth: 92,
    textAlign: "right",
  },
  transactionCard: {
    alignItems: "center",
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "space-between",
    minHeight: 62,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
  },
  transactionMain: {
    flex: 1,
    gap: 4,
  },
  transactionMeta: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  transactionTitle: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "900",
  },
});
