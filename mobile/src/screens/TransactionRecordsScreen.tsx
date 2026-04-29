import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import AppIcon from "../components/AppIcon";
import type { Account, Asset, Liability, Transaction, TransactionType } from "../domain/models";
import { sharedStyles, theme } from "../styles/theme";
import { formatCurrency } from "../utils/formatters";

interface TransactionRecordsScreenProps {
  accounts: Account[];
  assets: Asset[];
  liabilities: Liability[];
  transactions: Transaction[];
  onBack: () => void;
}

const UNKNOWN_VALUE = "无";
const RULE_BASED_VALUE = "按当前规则计算";

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
  transfer: "转账 / 内部转换",
};

const getTypeLabel = (type: Transaction["type"]): string => transactionTypeLabels[type] ?? "未知类型";

const getAccountName = (accounts: Account[], accountId?: string): string | undefined =>
  accountId ? accounts.find((account) => account.id === accountId)?.name ?? "未知账户" : undefined;

const getAssetName = (assets: Asset[], assetId?: string): string | undefined =>
  assetId ? assets.find((asset) => asset.id === assetId)?.name ?? "未知资产" : undefined;

const getLiabilityName = (liabilities: Liability[], liabilityId?: string): string | undefined =>
  liabilityId ? liabilities.find((liability) => liability.id === liabilityId)?.name ?? "未知负债" : undefined;

const getTransactionTitle = (transaction: Transaction): string =>
  transaction.note?.trim() || transaction.category || getTypeLabel(transaction.type);

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

const getMonthLabel = (date: string): string => {
  const [year, month] = date.split("-");
  if (!year || !month) return "未分组";
  return `${year}年${Number(month)}月`;
};

const isCashInflow = (transaction: Transaction): boolean => {
  switch (transaction.type) {
    case "assetIncrease":
    case "income":
    case "investmentSell":
    case "liabilityIncrease":
    case "receivableCollect":
      return true;
    default:
      return false;
  }
};

const getAmountTone = (transaction: Transaction): "positive" | "negative" | "neutral" => {
  if (transaction.cashFlowType === "nonCash") return "neutral";
  if (transaction.type === "transfer") return "neutral";
  return isCashInflow(transaction) ? "positive" : "negative";
};

const formatSignedAmount = (transaction: Transaction): string => {
  const tone = getAmountTone(transaction);
  if (tone === "positive") return `+${formatCurrency(transaction.amount)}`;
  if (tone === "negative") return `-${formatCurrency(transaction.amount)}`;
  return formatCurrency(transaction.amount);
};

const formatImpact = (value: number): string => {
  if (Math.abs(value) < 0.01) return formatCurrency(0);
  return `${value > 0 ? "+" : "-"}${formatCurrency(Math.abs(value))}`;
};

const getCashStatusLabel = (transaction: Transaction): string => {
  if (transaction.cashFlowType === "nonCash") return "非现金";
  if (transaction.type === "transfer") return "无";
  return isCashInflow(transaction) ? "现金流入" : "现金流出";
};

const getCashFlowLabel = (transaction: Transaction): string => {
  if (transaction.cashFlowType === "nonCash") return "非现金";
  if (transaction.type === "transfer") return "无";

  const direction = isCashInflow(transaction) ? "流入" : "流出";

  switch (transaction.cashFlowType) {
    case "operating":
      return `经营活动现金${direction}`;
    case "investing":
      return `投资活动现金${direction}`;
    case "financing":
      return `筹资活动现金${direction}`;
    default:
      return "无";
  }
};

const getIncomeExpenseImpact = (transaction: Transaction): string => {
  switch (transaction.type) {
    case "income":
      return formatImpact(transaction.amount);
    case "expense":
    case "creditCardExpense":
      return formatImpact(-transaction.amount);
    case "assetDecrease":
    case "assetIncrease":
    case "creditCardRepayment":
    case "investmentBuy":
    case "investmentSell":
    case "liabilityDecrease":
    case "liabilityIncrease":
    case "payablePay":
    case "payableRecognize":
    case "receivableCollect":
    case "receivableRecognize":
    case "repayment":
    case "transfer":
      return formatCurrency(0);
    default:
      return RULE_BASED_VALUE;
  }
};

const getNetWorthImpact = (transaction: Transaction): string => {
  switch (transaction.type) {
    case "income":
    case "receivableRecognize":
      return formatImpact(transaction.amount);
    case "expense":
    case "creditCardExpense":
    case "payableRecognize":
      return formatImpact(-transaction.amount);
    case "assetIncrease":
      return transaction.cashFlowType === "nonCash" ? formatImpact(transaction.amount) : RULE_BASED_VALUE;
    case "assetDecrease":
      return transaction.cashFlowType === "nonCash" ? formatImpact(-transaction.amount) : RULE_BASED_VALUE;
    case "creditCardRepayment":
    case "investmentBuy":
    case "investmentSell":
    case "liabilityDecrease":
    case "receivableCollect":
    case "repayment":
    case "transfer":
    case "payablePay":
      return formatCurrency(0);
    case "liabilityIncrease":
      return transaction.cashFlowType === "nonCash" ? formatImpact(-transaction.amount) : formatCurrency(0);
    default:
      return RULE_BASED_VALUE;
  }
};

const resolveAccountDisplay = (accounts: Account[], transaction: Transaction): string => {
  const accountName = getAccountName(accounts, transaction.accountId);
  const counterAccountName = getAccountName(accounts, transaction.counterAccountId);
  if (accountName && counterAccountName) return `${accountName} → ${counterAccountName}`;
  return accountName ?? counterAccountName ?? UNKNOWN_VALUE;
};

export default function TransactionRecordsScreen({
  accounts,
  assets,
  liabilities,
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
          getTypeLabel(transaction.type),
          resolveAccountDisplay(accounts, transaction),
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
    return (
      <TransactionDetail
        accounts={accounts}
        assets={assets}
        liabilities={liabilities}
        onBack={() => setSelectedTransaction(null)}
        transaction={selectedTransaction}
      />
    );
  }

  const hasTransactions = transactions.length > 0;
  const hasResult = filteredGroups.length > 0;

  return (
    <View style={styles.stack}>
      <TopBar onBack={onBack} title="交易记录" />

      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <AppIcon color={theme.colors.textMuted} name="search" size={18} />
          <TextInput
            onChangeText={setQuery}
            placeholder="搜索交易、金额、备注"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.searchInput}
            value={query}
          />
        </View>
        <Pressable
          accessibilityLabel="筛选交易"
          onPress={() => Alert.alert("筛选交易", "筛选功能将在后续版本中完善。", [{ text: "知道了" }])}
          style={styles.filterButton}
        >
          <AppIcon color={theme.colors.primaryDeep} name="filter" size={19} />
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
          {group.items.map((transaction) => (
            <TransactionRow
              key={transaction.id}
              onPress={() => setSelectedTransaction(transaction)}
              transaction={transaction}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

function TransactionDetail({
  accounts,
  assets,
  liabilities,
  onBack,
  transaction,
}: {
  accounts: Account[];
  assets: Asset[];
  liabilities: Liability[];
  onBack: () => void;
  transaction: Transaction;
}) {
  const amountTone = getAmountTone(transaction);
  const accountDisplay = resolveAccountDisplay(accounts, transaction);
  const assetName = getAssetName(assets, transaction.relatedAssetId) ?? UNKNOWN_VALUE;
  const liabilityName = getLiabilityName(liabilities, transaction.relatedLiabilityId) ?? UNKNOWN_VALUE;

  return (
    <View style={styles.stack}>
      <TopBar onBack={onBack} title="交易详情" />

      <View style={styles.detailHero}>
        <Text style={styles.detailTitle}>{getTransactionTitle(transaction)}</Text>
        <Text style={[styles.detailAmount, styles[`amount_${amountTone}`]]}>{formatSignedAmount(transaction)}</Text>
        <Text style={styles.detailDate}>{getTransactionDateTime(transaction)}</Text>
      </View>

      <DetailSection title="基础信息">
        <DetailRow label="类型" value={getTypeLabel(transaction.type)} />
        <DetailRow label="分类" value={transaction.category || UNKNOWN_VALUE} />
        <DetailRow label="账户" value={accountDisplay} />
        <DetailRow label="现金状态" value={getCashStatusLabel(transaction)} />
        <DetailRow label="备注" value={transaction.note?.trim() || UNKNOWN_VALUE} />
      </DetailSection>

      <DetailSection title="会计影响">
        <DetailRow label="收入/费用" value={getIncomeExpenseImpact(transaction)} />
        <DetailRow label="净资产" value={getNetWorthImpact(transaction)} />
      </DetailSection>

      <DetailSection title="现金流">
        <DetailRow label="现金流" value={getCashFlowLabel(transaction)} />
      </DetailSection>

      <DetailSection title="关联对象">
        <DetailRow label="关联账户" value={accountDisplay} />
        <DetailRow label="关联资产" value={assetName} />
        <DetailRow label="关联负债" value={liabilityName} />
      </DetailSection>
    </View>
  );
}

function TopBar({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <View style={styles.headerRow}>
      <Pressable onPress={onBack} style={styles.backButton}>
        <AppIcon color={theme.colors.backButtonText} name="back" size={15} strokeWidth={2.2} />
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

function DetailSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <View style={styles.detailSection}>
      <Text style={styles.detailSectionTitle}>{title}</Text>
      <View style={styles.detailRows}>{children}</View>
    </View>
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
  detailAmount: {
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -0.6,
    lineHeight: 38,
    textAlign: "center",
  },
  detailDate: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  detailHero: {
    alignItems: "center",
    gap: 6,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  detailLabel: {
    color: theme.colors.textMuted,
    fontSize: 14,
    width: 86,
  },
  detailRow: {
    borderBottomColor: theme.colors.divider,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.md,
    minHeight: 40,
    paddingVertical: 8,
  },
  detailRows: {
    borderTopColor: theme.colors.divider,
    borderTopWidth: 1,
  },
  detailSection: {
    gap: 8,
  },
  detailSectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  detailTitle: {
    color: theme.colors.textPrimary,
    fontSize: 21,
    fontWeight: "900",
    lineHeight: 28,
    textAlign: "center",
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
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42,
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
  monthGroup: {
    gap: 4,
  },
  monthTitle: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: "900",
    paddingHorizontal: theme.spacing.md,
  },
  pageTitle: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  searchBox: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: theme.spacing.sm,
    minHeight: 44,
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.sm,
  },
  searchInput: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: 15,
    minHeight: 38,
    paddingHorizontal: theme.spacing.sm,
  },
  stack: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  toolbar: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
    minHeight: 48,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "900",
    minWidth: 92,
    textAlign: "right",
  },
  transactionCard: {
    alignItems: "center",
    borderBottomColor: theme.colors.divider,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "space-between",
    minHeight: 58,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 9,
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
