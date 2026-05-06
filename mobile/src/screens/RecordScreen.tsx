import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Animated, Easing, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import {
  parseNaturalLanguageTransaction,
  transactionTypeMeta,
  type NaturalLanguageTransactionType,
  type ParsedTransactionDraft,
} from "../domain/accounting/naturalLanguageParser";
import type { TransactionInput } from "../domain/accounting/transactionRules";
import type { Account, Asset, Liability } from "../domain/models";
import AppIcon, { type AppIconName } from "../components/AppIcon";
import { SectionCard } from "../components/financeUI";
import { sharedStyles, theme } from "../styles/theme";

interface RecordScreenProps {
  accounts: Account[];
  assets: Asset[];
  liabilities: Liability[];
  onSave: (input: TransactionInput) => Promise<void>;
  onOpenAccounts: () => void;
  onOpenReports: () => void;
  onOpenAssets: () => void;
  onOpenTransactions: () => void;
}

interface TransactionTypeOption {
  type: NaturalLanguageTransactionType;
  label: string;
  defaultCategory: string;
  requiresAccount: boolean;
}

type ModalState = "draft" | "success";
type EntryMode = "ai" | "button";

const today = () => new Date().toISOString().slice(0, 10);

const transactionTypeOptions: TransactionTypeOption[] = [
  { type: "income", label: "收入", defaultCategory: "工资薪金", requiresAccount: true },
  { type: "expense", label: "支出", defaultCategory: "餐饮", requiresAccount: true },
  { type: "assetIncrease", label: "资产增加", defaultCategory: "资产增加", requiresAccount: true },
  { type: "assetDecrease", label: "资产减少", defaultCategory: "资产减少", requiresAccount: true },
  { type: "liabilityIncrease", label: "负债增加", defaultCategory: "借款", requiresAccount: true },
  { type: "liabilityDecrease", label: "负债减少", defaultCategory: "还款", requiresAccount: true },
  { type: "receivableRecognize", label: "应收确认", defaultCategory: "应收款", requiresAccount: false },
  { type: "receivableCollect", label: "应收收回", defaultCategory: "应收款", requiresAccount: true },
  { type: "payableRecognize", label: "应付确认", defaultCategory: "应付款", requiresAccount: false },
  { type: "payablePay", label: "应付支付", defaultCategory: "应付款", requiresAccount: true },
  { type: "investmentBuy", label: "投资买入", defaultCategory: "投资资产", requiresAccount: true },
  { type: "investmentSell", label: "投资卖出", defaultCategory: "投资资产", requiresAccount: true },
  { type: "creditCardExpense", label: "信用卡消费", defaultCategory: "信用卡", requiresAccount: true },
  { type: "creditCardRepayment", label: "信用卡还款", defaultCategory: "信用卡", requiresAccount: true },
];

const aiPlaceholder = [
  "试试用自然语言描述一笔收支，",
  "AI 将自动识别金额、方向、分类并记账。",
  "",
  "例如：今天午餐 32 元，用支付宝支付；",
  "下午打车 18 元；工资到账 5800 元",
].join("\n");

const expenseCategories = [
  { label: "餐饮", icon: "wallet" as AppIconName, tone: "#FFC33D", bg: "#FFF8E8" },
  { label: "购物", icon: "card" as AppIconName, tone: "#F45B8D", bg: "#FFF0F4" },
  { label: "交通", icon: "transaction" as AppIconName, tone: "#3298F5", bg: "#EEF7FF" },
  { label: "娱乐", icon: "edit" as AppIconName, tone: "#9867E8", bg: "#F5F0FF" },
  { label: "日用", icon: "asset" as AppIconName, tone: "#31C99A", bg: "#ECFBF5" },
  { label: "居家", icon: "home" as AppIconName, tone: "#FF8B35", bg: "#FFF3E9" },
];

const incomeCategories = [
  { label: "工资薪金", icon: "wallet" as AppIconName, tone: "#31C99A", bg: "#ECFBF5" },
  { label: "副业收入", icon: "manage" as AppIconName, tone: "#3298F5", bg: "#EEF7FF" },
  { label: "投资收益", icon: "chart" as AppIconName, tone: "#9867E8", bg: "#F5F0FF" },
  { label: "红包", icon: "card" as AppIconName, tone: "#F45B8D", bg: "#FFF0F4" },
  { label: "退款", icon: "reconcile" as AppIconName, tone: "#FFC33D", bg: "#FFF8E8" },
  { label: "其他", icon: "data" as AppIconName, tone: "#FF8B35", bg: "#FFF3E9" },
];

const findOption = (type: NaturalLanguageTransactionType): TransactionTypeOption =>
  transactionTypeOptions.find((option) => option.type === type) ?? transactionTypeOptions[0];

const normalizeAmount = (value: string): number => Number(value.replace(",", "."));

const formatAmount = (value: string): string => {
  const amount = normalizeAmount(value);
  if (!Number.isFinite(amount)) return "未填写";
  return `${amount} 元`;
};

const isAccountEnabled = (account: Account): boolean => account.isEnabled ?? account.isActive ?? true;

const requiresRelatedAsset = (type: NaturalLanguageTransactionType): boolean =>
  type === "investmentBuy" ||
  type === "investmentSell" ||
  type === "receivableRecognize" ||
  type === "receivableCollect";

const requiresRelatedLiability = (type: NaturalLanguageTransactionType): boolean =>
  type === "payableRecognize" ||
  type === "payablePay";

export default function RecordScreen({
  accounts,
  assets,
  liabilities,
  onSave,
  onOpenAccounts,
  onOpenReports,
  onOpenAssets,
  onOpenTransactions,
}: RecordScreenProps) {
  const [naturalText, setNaturalText] = useState("");
  const [draft, setDraft] = useState<ParsedTransactionDraft | null>(null);
  const [type, setType] = useState<NaturalLanguageTransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(findOption("expense").defaultCategory);
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [creditCardAccountId, setCreditCardAccountId] = useState(
    accounts.find((account) => account.type === "creditCard")?.id ?? "",
  );
  const [relatedAssetId, setRelatedAssetId] = useState("");
  const [relatedLiabilityId, setRelatedLiabilityId] = useState("");
  const [date, setDate] = useState(today());
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [, setSuccessMessage] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalState, setModalState] = useState<ModalState>("draft");
  const [isMoreMenuVisible, setIsMoreMenuVisible] = useState(false);
  const [entryMode, setEntryMode] = useState<EntryMode>("ai");
  const moreMenuProgress = useRef(new Animated.Value(0)).current;

  const selectedOption = findOption(type);
  const selectedMeta = transactionTypeMeta[type];
  const activeAccounts = useMemo(() => accounts.filter(isAccountEnabled), [accounts]);
  const assetLikeAccounts = useMemo(
    () => activeAccounts.filter((account) => account.type !== "creditCard"),
    [activeAccounts],
  );
  const creditCardAccounts = useMemo(
    () => activeAccounts.filter((account) => account.type === "creditCard"),
    [activeAccounts],
  );
  const receivableAssets = useMemo(
    () =>
      assets.filter(
        (asset) => asset.currentValue > 0 && (asset.category === "receivable" || String(asset.category).includes("应收")),
      ),
    [assets],
  );
  const payableLiabilities = useMemo(
    () =>
      liabilities.filter(
        (liability) =>
          liability.amount > 0 && (liability.category === "payable" || String(liability.category).includes("应付")),
      ),
    [liabilities],
  );
  const investmentAssets = useMemo(() => {
    const linkedAssets = assets.filter((asset) => asset.accountId === accountId);
    if (linkedAssets.length > 0) return linkedAssets;
    return assets.filter((asset) => asset.category === "investment");
  }, [accountId, assets]);
  const relatedAssetOptions = useMemo(() => {
    if (type === "receivableRecognize" || type === "receivableCollect") return receivableAssets;
    if (type === "investmentBuy" || type === "investmentSell") return investmentAssets;
    if (type === "assetIncrease" || type === "assetDecrease") return assets;
    return [];
  }, [assets, investmentAssets, receivableAssets, type]);
  const relatedLiabilityOptions = useMemo(() => {
    if (type === "payableRecognize" || type === "payablePay") return payableLiabilities;
    if (type === "liabilityIncrease" || type === "liabilityDecrease") return liabilities;
    return [];
  }, [liabilities, payableLiabilities, type]);
  const selectedRelatedAsset = relatedAssetOptions.find((asset) => asset.id === relatedAssetId);
  const selectedRelatedLiability = relatedLiabilityOptions.find((liability) => liability.id === relatedLiabilityId);
  const selectedReceivableAsset = selectedRelatedAsset;
  const selectedPayableLiability = selectedRelatedLiability;

  useEffect(() => {
    if (!isMoreMenuVisible) return;
    moreMenuProgress.setValue(0);
    Animated.timing(moreMenuProgress, {
      duration: 190,
      easing: Easing.out(Easing.cubic),
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [isMoreMenuVisible, moreMenuProgress]);

  const pickAccountId = (nextType: NaturalLanguageTransactionType): string => {
    const currentAccount = activeAccounts.find((account) => account.id === accountId);
    const creditCardAccount = activeAccounts.find((account) => account.type === "creditCard");
    const cashAccount = activeAccounts.find((account) => account.type !== "creditCard");

    if (nextType === "creditCardExpense") {
      return creditCardAccount?.id ?? currentAccount?.id ?? activeAccounts[0]?.id ?? "";
    }

    return cashAccount?.id ?? currentAccount?.id ?? activeAccounts[0]?.id ?? "";
  };

  const pickCreditCardAccountId = (): string => {
    const currentCreditCardAccount = creditCardAccounts.find((account) => account.id === creditCardAccountId);
    return currentCreditCardAccount?.id ?? creditCardAccounts[0]?.id ?? "";
  };

  useEffect(() => {
    if (activeAccounts.length === 0) {
      setAccountId("");
      return;
    }

    if (!activeAccounts.some((account) => account.id === accountId)) {
      setAccountId(pickAccountId(type));
    }

    if (type === "creditCardRepayment" && !creditCardAccounts.some((account) => account.id === creditCardAccountId)) {
      setCreditCardAccountId(pickCreditCardAccountId());
    }

  }, [
    accountId,
    activeAccounts,
    creditCardAccountId,
    creditCardAccounts,
    type,
  ]);

  useEffect(() => {
    if (!requiresRelatedAsset(type)) {
      if (relatedAssetId) setRelatedAssetId("");
      return;
    }

    if (!relatedAssetOptions.some((asset) => asset.id === relatedAssetId)) {
      setRelatedAssetId(relatedAssetOptions[0]?.id ?? "");
    }
  }, [relatedAssetId, relatedAssetOptions, type]);

  useEffect(() => {
    if (!requiresRelatedLiability(type)) {
      if (relatedLiabilityId) setRelatedLiabilityId("");
      return;
    }

    if (!relatedLiabilityOptions.some((liability) => liability.id === relatedLiabilityId)) {
      setRelatedLiabilityId(relatedLiabilityOptions[0]?.id ?? "");
    }
  }, [relatedLiabilityId, relatedLiabilityOptions, type]);

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
    onOpenTransactions();
  };

  const handleTypeChange = (nextType: NaturalLanguageTransactionType) => {
    const nextOption = findOption(nextType);
    setType(nextType);
    setCategory(nextOption.defaultCategory);
    setAccountId(pickAccountId(nextType));
    if (nextType === "creditCardRepayment") {
      setCreditCardAccountId(pickCreditCardAccountId());
    }
    setSuccessMessage("");
  };

  const applyDraftToForm = (parsedDraft: ParsedTransactionDraft) => {
    setType(parsedDraft.type);
    setAmount(parsedDraft.amount === null ? "" : String(parsedDraft.amount));
    setCategory(parsedDraft.category);
    setDate(parsedDraft.date);
    setAccountId(pickAccountId(parsedDraft.type));
    if (parsedDraft.type === "creditCardRepayment") {
      setCreditCardAccountId(pickCreditCardAccountId());
    }
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

    if (type === "creditCardRepayment") {
      const payingAccount = assetLikeAccounts.find((account) => account.id === accountId);
      const targetCreditCard = creditCardAccounts.find((account) => account.id === creditCardAccountId);

      if (!payingAccount) {
        Alert.alert("请选择付款账户", "信用卡还款需要选择一个启用的现金、银行卡或支付账户。");
        return null;
      }

      if (!targetCreditCard) {
        Alert.alert("请选择信用卡账户", "信用卡还款需要选择要偿还的信用卡账户。");
        return null;
      }
    }

    if (type === "receivableRecognize" || type === "receivableCollect") {
      if (!selectedReceivableAsset) {
        Alert.alert("请选择应收项目", "请先选择一个已有应收项目，避免系统随机修改资产。");
        return null;
      }

      if (type === "receivableCollect" && numericAmount > selectedReceivableAsset.currentValue) {
        Alert.alert("金额不能超过当前应收余额", "应收收回不能超过当前应收余额。");
        return null;
      }
    }

    if (type === "payableRecognize" || type === "payablePay") {
      if (!selectedPayableLiability) {
        Alert.alert("请选择应付项目", "请先选择一个已有应付项目，避免系统随机修改负债。");
        return null;
      }

      if (type === "payablePay" && numericAmount > selectedPayableLiability.amount) {
        Alert.alert("金额不能超过当前应付余额", "应付支付不能超过当前应付余额。");
        return null;
      }
    }

    if (
      (type === "assetIncrease" || type === "assetDecrease" || type === "investmentBuy" || type === "investmentSell") &&
      !selectedRelatedAsset
    ) {
      Alert.alert("请选择关联资产", "请先选择要影响的资产或投资项，避免记录落到错误台账。");
      return null;
    }

    if ((type === "liabilityIncrease" || type === "liabilityDecrease") && !selectedRelatedLiability) {
      Alert.alert("请选择关联负债", "请先选择要影响的负债项，避免记录落到错误台账。");
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
        counterAccountId: type === "creditCardRepayment" ? creditCardAccountId : undefined,
        relatedAssetId: requiresRelatedAsset(type) ? relatedAssetId : undefined,
        relatedLiabilityId: requiresRelatedLiability(type) ? relatedLiabilityId : undefined,
        date,
        note: note.trim() || selectedMeta.impactText,
      });
      setModalState("success");
      setIsModalVisible(true);
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

  const handleEditDraft = () => {
    if (isSaving) return;
    setEntryMode("button");
    setIsModalVisible(false);
  };

  const handleGoReports = () => {
    setIsModalVisible(false);
    clearEntryFields();
    onOpenReports();
  };

  const handleManageAssets = () => {
    setIsModalVisible(false);
    clearEntryFields();
    onOpenAssets();
  };

  const appendAmountKey = (key: string) => {
    setSuccessMessage("");
    if (key === "today") {
      setDate(today());
      return;
    }
    if (key === "+" || key === "-") return;
    if (key === "del") {
      setAmount((current) => current.slice(0, -1));
      return;
    }
    if (key === "." && amount.includes(".")) return;
    setAmount((current) => `${current}${key}`);
  };

  const visibleCategories = type === "income" ? incomeCategories : expenseCategories;
  const amountDisplay = amount.trim() ? amount : "0.00";

  return (
    <View style={styles.stack}>
      <View style={styles.heroHeader}>
        <View style={styles.brandBlock}>
          <View style={styles.brandRow}>
            <Text style={styles.brandText}>我为 </Text>
            <Text style={styles.brandAccent}>CFO</Text>
            <Text style={styles.versionBadge}>V0.1</Text>
          </View>
          <Text style={styles.brandSubtitle}>把自己当成一家公司经营</Text>
        </View>
        <View style={styles.periodTools}>
          <Pressable style={styles.periodButton}>
            <Text style={styles.periodText}>2026年4月</Text>
            <Text style={styles.periodArrow}>▼</Text>
          </Pressable>
          <Pressable onPress={openMoreMenu} style={styles.calendarButton}>
            <AppIcon color={theme.colors.textPrimary} name="calendar" size={22} strokeWidth={2.4} />
          </Pressable>
        </View>
      </View>

      <View style={[sharedStyles.card, styles.formCard]}>
        <View style={styles.cardTitleRow}>
          <View style={styles.cardTitleLeft}>
            <View style={styles.titleMark} />
            <Text style={styles.cardTitle}>记一笔</Text>
          </View>
          <Pressable
            onPress={() => setEntryMode((current) => (current === "ai" ? "button" : "ai"))}
            style={styles.modeSwitchButton}
          >
            <AppIcon color={theme.colors.textPrimary} name="cashFlow" size={17} strokeWidth={2.1} />
            <Text style={styles.modeSwitchText}>{entryMode === "ai" ? "按钮记账" : "AI记账"}</Text>
          </Pressable>
        </View>

        {entryMode === "ai" ? (
          <>
            <View style={styles.aiPanel}>
              <View style={styles.aiPromptRow}>
                <View style={styles.robotWrap}>
                  <View style={styles.robotAntenna} />
                  <View style={styles.robotHead}>
                    <View style={styles.robotEye} />
                    <View style={styles.robotEye} />
                  </View>
                </View>
                <View style={styles.aiTextBox}>
                  <TextInput
                    multiline
                    onChangeText={(value) => {
                      setNaturalText(value);
                      setSuccessMessage("");
                    }}
                    placeholder={aiPlaceholder}
                    placeholderTextColor={theme.colors.textMuted}
                    style={styles.aiInput}
                    value={naturalText}
                  />
                </View>
              </View>

              <View style={styles.aiHintRow}>
                <AppIcon color={theme.colors.textMuted} name="success" size={18} strokeWidth={1.8} />
                <Text style={styles.aiHintText}>AI 会自动识别金额、收支方向、分类和账户，减少手动判断错误</Text>
              </View>

              <View style={styles.utilityRow}>
                {[
                  ["edit", "语音输入"],
                  ["data", "粘贴文字"],
                  ["eye", "识别截图"],
                ].map(([icon, label]) => (
                  <Pressable key={label} style={styles.utilityButton}>
                    <AppIcon color={theme.colors.textPrimary} name={icon as AppIconName} size={20} strokeWidth={2.1} />
                    <Text style={styles.utilityText}>{label}</Text>
                  </Pressable>
                ))}
              </View>

              <Pressable onPress={handleRecognize} style={styles.recognizeButton}>
                <Text style={styles.recognizeSpark}>✦</Text>
                <Text style={styles.recognizeButtonText}>开始识别记账</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <View style={styles.segmentedShell}>
              {[
                { label: "支出", value: "expense" as const },
                { label: "收入", value: "income" as const },
              ].map((option) => {
                const isActive = (type === "income" ? "income" : "expense") === option.value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => handleTypeChange(option.value)}
                    style={[styles.segmentButton, isActive && styles.segmentButtonActive]}
                  >
                    <Text style={[styles.segmentButtonText, isActive && styles.segmentButtonTextActive]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.amountDisplay}>
              <Text style={styles.amountCurrency}>¥</Text>
              <Text style={[styles.amountValue, !amount.trim() && styles.amountValueMuted]}>{amountDisplay}</Text>
            </View>

            <View style={styles.categoryGrid}>
              {visibleCategories.map((item) => {
                const isActive = category === item.label;
                return (
                  <Pressable
                    key={item.label}
                    onPress={() => {
                      setCategory(item.label);
                      setSuccessMessage("");
                    }}
                    style={[styles.categoryButton, { backgroundColor: item.bg }, isActive && styles.categoryButtonActive]}
                  >
                    <View style={[styles.categoryIcon, { backgroundColor: item.tone }]}>
                      <AppIcon color="#FFFFFF" name={item.icon} size={20} strokeWidth={2.2} />
                    </View>
                    <Text style={styles.categoryText}>{item.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.noteInputShell}>
              <AppIcon color={theme.colors.textMuted} name="edit" size={20} strokeWidth={2.1} />
              <TextInput
                maxLength={60}
                onChangeText={setNote}
                placeholder="点击填写备注"
                placeholderTextColor={theme.colors.textMuted}
                style={styles.noteInput}
                value={note}
              />
              <Text style={styles.noteCount}>{note.length}/60</Text>
            </View>

            <View style={styles.keypad}>
              {["7", "8", "9", "today", "4", "5", "6", "+", "1", "2", "3", "-", ".", "0", "del", "done"].map((key) => (
                <Pressable
                  disabled={key === "done" && isSaving}
                  key={key}
                  onPress={() => (key === "done" ? void handleSubmit() : appendAmountKey(key))}
                  style={[styles.keypadButton, key === "done" && styles.keypadDoneButton, isSaving && key === "done" && styles.buttonDisabled]}
                >
                  {key === "del" ? (
                    <AppIcon color={theme.colors.textPrimary} name="close" size={23} strokeWidth={2.1} />
                  ) : key === "today" ? (
                    <View style={styles.todayKey}>
                      <AppIcon color={theme.colors.textPrimary} name="calendar" size={20} strokeWidth={2.1} />
                      <Text style={styles.keypadTextSmall}>今天</Text>
                    </View>
                  ) : key === "done" ? (
                    <Text style={styles.keypadDoneText}>{isSaving ? "保存中" : "完成"}</Text>
                  ) : (
                    <Text style={styles.keypadText}>{key}</Text>
                  )}
                </Pressable>
              ))}
            </View>
          </>
        )}
      </View>

      <SectionCard title="账务中心">
        <View style={styles.centerGrid}>
          <AccountCenterTile icon="account" onPress={handleOpenAccounts} subtitle="管理账户与余额" title="我的账户" />
          <AccountCenterTile icon="asset" onPress={handleOpenAssets} subtitle="资产负债，一目了然" title="资产负债管理" />
          <AccountCenterTile icon="reconcile" onPress={handleOpenAssets} subtitle="对账核对，盘点管理" title="对账与盘点" />
          <AccountCenterTile icon="report" onPress={handleOpenTransactions} subtitle="收支流水，清晰明了" title="收支明细" />
        </View>
      </SectionCard>

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
                  <Text style={styles.modalLabel}>{type === "creditCardRepayment" ? "付款账户" : "账户"}</Text>
                </View>
                {type === "creditCardRepayment" ? (
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>信用卡账户</Text>
                  </View>
                ) : null}
                {type === "receivableRecognize" || type === "receivableCollect" ? (
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>应收项目</Text>
                  </View>
                ) : null}
                {type === "payableRecognize" || type === "payablePay" ? (
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>应付项目</Text>
                  </View>
                ) : null}
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
                    onPress={handleEditDraft}
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
                    <Text style={sharedStyles.secondaryButtonText}>去资产负债管理</Text>
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
          <Animated.View
            style={[
              styles.moreSheet,
              {
                opacity: moreMenuProgress,
                transform: [
                  {
                    translateY: moreMenuProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [18, 0],
                    }),
                  },
                  {
                    scale: moreMenuProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.98, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.moreHandle} />
            <View style={styles.moreHeader}>
              <Text style={styles.moreTitle}>管理中心</Text>
              <Text style={styles.moreSubtitle}>选择你要维护的数据。</Text>
            </View>

            <View style={styles.moreOptionList}>
              <MoreMenuOption
                description="维护银行卡、微信、支付宝、证券账户、基金账户和信用卡。"
                icon="account"
                onPress={handleOpenAccounts}
                title="账户管理"
              />
              <MoreMenuOption
                description="维护当前资产、负债和个人净资产基础数据。"
                icon="asset"
                onPress={handleOpenAssets}
                title="资产负债管理"
              />
              <MoreMenuOption
                description="更新账户余额和资产市值，处理自动到账、分红和估值变化。"
                icon="reconcile"
                onPress={handleOpenAssets}
                title="对账 / 资产盘点"
              />
              <MoreMenuOption
                description="查看、编辑和追踪历史入账记录。"
                icon="transaction"
                onPress={handleOpenTransactions}
                title="交易记录"
              />
            </View>

            <Pressable onPress={closeMoreMenu} style={styles.moreCloseButton}>
              <Text style={styles.moreCloseText}>关闭</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

interface MoreMenuOptionProps {
  description: string;
  icon: AppIconName;
  onPress: () => void;
  title: string;
}

interface AccountCenterTileProps {
  icon: AppIconName;
  onPress: () => void;
  subtitle: string;
  title: string;
}

function AccountCenterTile({ icon, onPress, subtitle, title }: AccountCenterTileProps) {
  return (
    <Pressable onPress={onPress} style={styles.centerTile}>
      <View style={styles.centerTileIcon}>
        <AppIcon color="#FFFFFF" name={icon} size={27} strokeWidth={2.2} />
      </View>
      <View style={styles.centerTileCopy}>
        <Text numberOfLines={1} style={styles.centerTileTitle}>{title}</Text>
        <Text numberOfLines={1} style={styles.centerTileSubtitle}>{subtitle}</Text>
      </View>
      <AppIcon color={theme.colors.textMuted} name="chevronRight" size={18} strokeWidth={2.1} />
    </Pressable>
  );
}

function MoreMenuOption({ description, icon, onPress, title }: MoreMenuOptionProps) {
  return (
    <Pressable onPress={onPress} style={styles.moreOptionRow}>
      <View style={styles.moreOptionIcon}>
        <AppIcon color={theme.colors.primaryDeep} name={icon} size={21} />
      </View>
      <View style={styles.moreOptionContent}>
        <Text style={styles.moreOptionTitle}>{title}</Text>
        <Text style={styles.moreOptionDescription}>{description}</Text>
      </View>
      <AppIcon color={theme.colors.primaryDeep} name="chevronRight" size={18} strokeWidth={2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  heroHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "space-between",
  },
  brandBlock: {
    flex: 1,
    gap: 6,
  },
  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  brandText: {
    color: theme.colors.textPrimary,
    fontSize: 32,
    fontWeight: "900",
  },
  brandAccent: {
    color: theme.colors.primaryDeep,
    fontSize: 32,
    fontWeight: "900",
  },
  versionBadge: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    color: theme.colors.primaryDeep,
    fontSize: 15,
    fontWeight: "800",
    marginLeft: 4,
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  brandSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    lineHeight: 21,
  },
  periodTools: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
    paddingTop: 4,
  },
  periodButton: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    minHeight: 46,
    paddingHorizontal: 12,
    shadowColor: theme.colors.shadowSoft,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
  },
  periodText: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: "800",
  },
  periodArrow: {
    color: theme.colors.textPrimary,
    fontSize: 10,
  },
  calendarButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 46,
    minWidth: 36,
  },
  titleMark: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.pill,
    height: 24,
    width: 5,
  },
  aiPanel: {
    borderColor: "#FFD1A4",
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    gap: theme.spacing.md,
    padding: 14,
  },
  aiPromptRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  robotWrap: {
    alignItems: "center",
    justifyContent: "center",
    width: 64,
  },
  robotAntenna: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.pill,
    height: 15,
    marginBottom: -2,
    width: 4,
  },
  robotHead: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#FFE2C7",
    borderRadius: 22,
    borderWidth: 6,
    flexDirection: "row",
    gap: 10,
    height: 52,
    justifyContent: "center",
    shadowColor: theme.colors.primaryDeep,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    width: 64,
  },
  robotEye: {
    backgroundColor: theme.colors.textPrimary,
    borderRadius: theme.radius.pill,
    height: 10,
    width: 7,
  },
  aiTextBox: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: "#F6D5B8",
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flex: 1,
    minHeight: 166,
    padding: 14,
  },
  aiHintRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  aiHintText: {
    color: theme.colors.textMuted,
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  recognizeButton: {
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    flexDirection: "row",
    gap: theme.spacing.sm,
    justifyContent: "center",
    minHeight: 56,
  },
  recognizeSpark: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
  },
  recognizeButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  segmentedShell: {
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radius.xl,
    flexDirection: "row",
    padding: 3,
  },
  segmentButton: {
    alignItems: "center",
    borderColor: "transparent",
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 48,
  },
  segmentButtonActive: {
    backgroundColor: theme.colors.surface,
    borderColor: "#F7C89F",
  },
  segmentButtonText: {
    color: theme.colors.textPrimary,
    fontSize: 17,
    fontWeight: "800",
  },
  segmentButtonTextActive: {
    color: theme.colors.primaryDeep,
  },
  amountDisplay: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.lg,
    flexDirection: "row",
    gap: 18,
    minHeight: 88,
    paddingHorizontal: 22,
  },
  amountCurrency: {
    color: theme.colors.textPrimary,
    fontSize: 40,
    fontWeight: "900",
  },
  amountValue: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: 48,
    fontWeight: "300",
  },
  amountValueMuted: {
    color: theme.colors.textMuted,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryButton: {
    alignItems: "center",
    borderColor: "transparent",
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flexBasis: "30%",
    flexDirection: "row",
    flexGrow: 1,
    gap: 10,
    minHeight: 64,
    paddingHorizontal: 12,
  },
  categoryButtonActive: {
    borderColor: theme.colors.primary,
  },
  categoryIcon: {
    alignItems: "center",
    borderRadius: theme.radius.pill,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  categoryText: {
    color: theme.colors.textPrimary,
    flexShrink: 1,
    fontSize: 16,
    fontWeight: "800",
  },
  noteInputShell: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.lg,
    flexDirection: "row",
    gap: theme.spacing.sm,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  noteInput: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  noteCount: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: "700",
  },
  todayKey: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  keypadTextSmall: {
    color: theme.colors.textPrimary,
    fontSize: 17,
    fontWeight: "800",
  },
  keypadDoneButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  keypadDoneText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },
  centerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  centerTile: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    flexBasis: "47%",
    flexDirection: "row",
    flexGrow: 1,
    gap: 10,
    minHeight: 78,
    padding: 12,
  },
  centerTileIcon: {
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  centerTileCopy: {
    flex: 1,
    gap: 4,
  },
  centerTileTitle: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "900",
  },
  centerTileSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  amountInput: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    color: theme.colors.textPrimary,
    fontSize: 36,
    fontWeight: "900",
    minHeight: 70,
    paddingHorizontal: theme.spacing.md,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
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
  cardTitle: {
    color: theme.colors.textPrimary,
    fontSize: 25,
    fontWeight: "900",
  },
  cardTitleLeft: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  cardTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  fieldLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.label,
    fontWeight: "700",
    marginBottom: 6,
  },
  formCard: {
    gap: 18,
    padding: 18,
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
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    padding: 14,
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
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    minHeight: 38,
    minWidth: 40,
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
  moreOptionIcon: {
    alignItems: "center",
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
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
    minHeight: 72,
    padding: 14,
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
  aiInput: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 136,
    padding: 0,
    textAlignVertical: "top",
  },
  aiInputShell: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    minHeight: 152,
    padding: theme.spacing.md,
  },
  keypad: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  keypadButton: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    flexBasis: "22.5%",
    flexGrow: 1,
    justifyContent: "center",
    minHeight: 58,
    shadowColor: theme.colors.shadowSoft,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  keypadText: {
    color: theme.colors.textPrimary,
    fontSize: 22,
    fontWeight: "800",
  },
  modeSwitchButton: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderColor: "#F7C89F",
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 42,
    paddingHorizontal: 16,
  },
  modeSwitchText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "900",
  },
  naturalInput: {
    borderColor: theme.colors.border,
    minHeight: 54,
  },
  pageTitle: {
    color: theme.colors.textPrimary,
    fontSize: 30,
    fontWeight: "900",
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
    gap: theme.spacing.md,
  },
  successBox: {
    backgroundColor: theme.colors.successSoft,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    padding: 14,
  },
  viewAllText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: "800",
  },
  utilityButton: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderColor: "#F3D2B5",
    borderRadius: theme.radius.md,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 54,
    paddingHorizontal: 8,
  },
  utilityRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  utilityText: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: "800",
  },
});
