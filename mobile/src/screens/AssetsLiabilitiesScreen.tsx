import { useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import AppIcon from "../components/AppIcon";
import ScreenTransition from "../components/ScreenTransition";
import {
  assetAccountingSubjects,
  getAssetAccountingSubject,
  getLiabilityAccountingSubject,
  liabilityAccountingSubjects,
  type AccountingSubject,
} from "../domain/accounting/accountingSubjectCatalog";
import {
  calculateReconciliationDiff,
  getReconciliationReasonOptions,
  type ReconciliationInput,
  type ReconciliationReason,
} from "../domain/accounting/reconciliationRules";
import type { AssetInput, LiabilityInput } from "../domain/accounting/transactionRules";
import type { Account, Asset, Liability, ReportSummary } from "../domain/models";
import { sharedStyles, theme } from "../styles/theme";
import { formatCurrency } from "../utils/formatters";

interface AssetsLiabilitiesScreenProps {
  accounts: Account[];
  assets: Asset[];
  liabilities: Liability[];
  onBack: () => void;
  onDeleteAsset: (assetId: string) => Promise<void>;
  onDeleteLiability: (liabilityId: string) => Promise<void>;
  onSaveAsset: (input: AssetInput) => Promise<void>;
  onSaveLiability: (input: LiabilityInput) => Promise<void>;
  onSaveReconciliation: (input: ReconciliationInput) => Promise<void>;
  summary: ReportSummary;
}

type LedgerKind = "asset" | "liability";
type LedgerRoute =
  | { name: "overview" }
  | { kind: LedgerKind; name: "subject"; subjectId: string }
  | { id: string; kind: LedgerKind; name: "detail"; subjectId: string };
type FormMode = "asset" | "liability" | null;

interface AssetFormState {
  accountId?: string;
  amount: string;
  category: Asset["category"];
  id?: string;
  name: string;
  note: string;
}

interface LiabilityFormState {
  amount: string;
  category: Liability["category"];
  dueDate: string;
  id?: string;
  name: string;
  note: string;
}

interface AssetReconciliationState {
  actualValue: string;
  asset?: Asset;
  isConfirming: boolean;
  isSaving: boolean;
  note: string;
  reason?: ReconciliationReason;
}

interface AssetSubjectGroup {
  amount: number;
  items: Asset[];
  subject: AccountingSubject;
}

interface LiabilitySubjectGroup {
  amount: number;
  items: Liability[];
  subject: AccountingSubject;
}

const assetCategoryOptions: Array<{ label: string; value: Asset["category"] }> = [
  { label: "现金", value: "cash" },
  { label: "银行卡 / 存款", value: "bankDeposit" },
  { label: "支付账户", value: "paymentAccount" },
  { label: "投资资产", value: "investment" },
  { label: "应收款", value: "receivable" },
  { label: "固定资产", value: "fixedAsset" },
  { label: "其他资产", value: "other" },
];

const liabilityCategoryOptions: Array<{ label: string; value: Liability["category"] }> = [
  { label: "信用卡", value: "creditCard" },
  { label: "消费分期", value: "huabei" },
  { label: "贷款", value: "loan" },
  { label: "借款", value: "borrowing" },
  { label: "应付款", value: "payable" },
  { label: "其他负债", value: "other" },
];

const subjectDefaultAssetCategory: Record<string, Asset["category"]> = {
  "bank-deposit": "bankDeposit",
  "cash-on-hand": "cash",
  "fixed-assets": "fixedAsset",
  "long-term-equity-investment": "investment",
  "other-assets": "other",
  "other-monetary-funds": "paymentAccount",
  "other-receivables": "receivable",
  "trading-financial-assets": "investment",
};

const subjectDefaultLiabilityCategory: Record<string, Liability["category"]> = {
  "accounts-payable": "payable",
  "long-term-borrowings": "loan",
  "long-term-payables": "huabei",
  "other-liabilities": "other",
  "other-payables": "payable",
  "short-term-borrowings": "borrowing",
  "taxes-payable": "payable",
};

const isAccountEnabled = (account: Account): boolean => account.isEnabled ?? account.isActive ?? true;
const getAssetValue = (asset: Asset): number => asset.currentValue ?? asset.amount ?? 0;

const createEmptyAssetForm = (subjectId?: string): AssetFormState => ({
  accountId: undefined,
  amount: "",
  category: subjectId ? subjectDefaultAssetCategory[subjectId] ?? "bankDeposit" : "bankDeposit",
  name: "",
  note: "",
});

const createEmptyLiabilityForm = (subjectId?: string): LiabilityFormState => ({
  amount: "",
  category: subjectId ? subjectDefaultLiabilityCategory[subjectId] ?? "creditCard" : "creditCard",
  dueDate: "",
  name: "",
  note: "",
});

const getSubjectCatalog = (kind: LedgerKind): AccountingSubject[] =>
  kind === "asset" ? assetAccountingSubjects : liabilityAccountingSubjects;

const getSubjectById = (kind: LedgerKind, subjectId: string): AccountingSubject =>
  getSubjectCatalog(kind).find((subject) => subject.id === subjectId) ?? getSubjectCatalog(kind)[0];

const buildAssetGroups = (assets: Asset[], accounts: Account[]): AssetSubjectGroup[] => {
  const groupMap = new Map<string, AssetSubjectGroup>();
  assetAccountingSubjects.forEach((subject) => groupMap.set(subject.id, { amount: 0, items: [], subject }));

  assets.forEach((asset) => {
    const subject = getAssetAccountingSubject(asset, accounts);
    const group = groupMap.get(subject.id);
    if (!group) return;
    group.items.push(asset);
    group.amount += getAssetValue(asset);
  });

  return assetAccountingSubjects.map((subject) => groupMap.get(subject.id) ?? { amount: 0, items: [], subject });
};

const buildLiabilityGroups = (liabilities: Liability[]): LiabilitySubjectGroup[] => {
  const groupMap = new Map<string, LiabilitySubjectGroup>();
  liabilityAccountingSubjects.forEach((subject) => groupMap.set(subject.id, { amount: 0, items: [], subject }));

  liabilities.forEach((liability) => {
    const subject = getLiabilityAccountingSubject(liability);
    const group = groupMap.get(subject.id);
    if (!group) return;
    group.items.push(liability);
    group.amount += liability.amount;
  });

  return liabilityAccountingSubjects.map((subject) => groupMap.get(subject.id) ?? { amount: 0, items: [], subject });
};

const getAssetTypeLabel = (category: Asset["category"]): string =>
  assetCategoryOptions.find((option) => option.value === category)?.label ?? String(category);

const getLiabilityTypeLabel = (category: Liability["category"]): string =>
  liabilityCategoryOptions.find((option) => option.value === category)?.label ?? String(category);

const getLinkedAccountName = (accounts: Account[], accountId?: string): string =>
  accountId ? accounts.find((account) => account.id === accountId)?.name ?? "已删除账户" : "无";

const normalizeSearchText = (value: unknown): string => String(value ?? "").trim().toLowerCase();

const doesSubjectGroupMatchSearch = (group: AssetSubjectGroup | LiabilitySubjectGroup, rawQuery: string): boolean => {
  const query = normalizeSearchText(rawQuery);
  if (!query) return true;

  const subject = group.subject;
  const itemText = group.items
    .map((item) => [item.name, item.category, item.note].filter(Boolean).join(" "))
    .join(" ");
  const searchableText = normalizeSearchText(
    [
      subject.displayName,
      subject.description,
      subject.personalExample,
      subject.rowExamples.join(" "),
      subject.detailExamples.join(" "),
      formatCurrency(group.amount),
      group.amount,
      itemText,
    ].join(" "),
  );

  return searchableText.includes(query);
};

const getSubjectHelpText = (subject: AccountingSubject): string => {
  switch (subject.id) {
    case "cash-on-hand":
      return "手上能直接使用的现金，比如纸币、零钱和备用金。";
    case "bank-deposit":
      return "存在银行卡、大额存单等银行账户里的资金。";
    case "other-monetary-funds":
      return "微信、支付宝、证券账户可用余额等暂放资金。";
    case "trading-financial-assets":
      return "股票、基金、ETF、黄金等用于交易或投资的资产。";
    case "other-receivables":
      return "别人还欠你的钱，比如报销款、朋友借款应收。";
    case "long-term-equity-investment":
      return "长期持有的项目、公司或合伙权益。";
    case "fixed-assets":
      return "房产、车辆、电脑等长期使用的实物资产。";
    case "other-assets":
      return "无法归入以上类别的其他个人资产。";
    case "short-term-borrowings":
      return "一年内需要偿还的借款或临时周转债务。";
    case "accounts-payable":
      return "已经发生但还没有支付的款项。";
    case "taxes-payable":
      return "已经计提但还没缴纳的个税、所得税或其他税费。";
    case "other-payables":
      return "信用卡账单或其他临时欠款中尚未偿还的负债。";
    case "long-term-borrowings":
      return "偿还周期较长的借款，比如房贷、车贷。";
    case "long-term-payables":
      return "长期分期或长期付款安排形成的负债。";
    case "other-liabilities":
      return "无法归入以上类别的其他应付款项。";
    default:
      return subject.personalExample || subject.description;
  }
};

export default function AssetsLiabilitiesScreen({
  accounts,
  assets,
  liabilities,
  onBack,
  onDeleteAsset,
  onDeleteLiability,
  onSaveAsset,
  onSaveLiability,
  onSaveReconciliation,
}: AssetsLiabilitiesScreenProps) {
  const [activeKind, setActiveKind] = useState<LedgerKind>("asset");
  const [subjectSearchQuery, setSubjectSearchQuery] = useState("");
  const [route, setRoute] = useState<LedgerRoute>({ name: "overview" });
  const [openHelpSubjectId, setOpenHelpSubjectId] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [assetForm, setAssetForm] = useState<AssetFormState>(() => createEmptyAssetForm());
  const [liabilityForm, setLiabilityForm] = useState<LiabilityFormState>(() => createEmptyLiabilityForm());
  const [isSavingAsset, setIsSavingAsset] = useState(false);
  const [isSavingLiability, setIsSavingLiability] = useState(false);
  const [assetReconciliation, setAssetReconciliation] = useState<AssetReconciliationState>({
    actualValue: "",
    isConfirming: false,
    isSaving: false,
    note: "",
  });

  const activeAccounts = useMemo(() => accounts.filter(isAccountEnabled), [accounts]);
  const assetGroups = useMemo(() => buildAssetGroups(assets, accounts), [accounts, assets]);
  const liabilityGroups = useMemo(() => buildLiabilityGroups(liabilities), [liabilities]);

  const closeForm = () => {
    setFormMode(null);
    setAssetForm(createEmptyAssetForm());
    setLiabilityForm(createEmptyLiabilityForm());
  };

  const openCreateForm = (kind: LedgerKind, subjectId?: string) => {
    if (kind === "asset") {
      setAssetForm(createEmptyAssetForm(subjectId));
    } else {
      setLiabilityForm(createEmptyLiabilityForm(subjectId));
    }
    setFormMode(kind);
  };

  const openEditAsset = (asset: Asset) => {
    setAssetForm({
      accountId: asset.accountId,
      amount: String(getAssetValue(asset)),
      category: asset.category,
      id: asset.id,
      name: asset.name,
      note: asset.note ?? "",
    });
    setFormMode("asset");
  };

  const openEditLiability = (liability: Liability) => {
    setLiabilityForm({
      amount: String(liability.amount),
      category: liability.category,
      dueDate: liability.dueDate ?? "",
      id: liability.id,
      name: liability.name,
      note: liability.note ?? "",
    });
    setFormMode("liability");
  };

  const handleBack = () => {
    if (route.name === "overview") {
      onBack();
      return;
    }

    if (route.name === "detail") {
      setRoute({ kind: route.kind, name: "subject", subjectId: route.subjectId });
      return;
    }

    setRoute({ name: "overview" });
  };

  const openAssetReconciliation = (asset: Asset) => {
    setAssetReconciliation({
      actualValue: String(getAssetValue(asset)),
      asset,
      isConfirming: false,
      isSaving: false,
      note: "",
      reason: undefined,
    });
  };

  const closeAssetReconciliation = () => {
    setAssetReconciliation({
      actualValue: "",
      isConfirming: false,
      isSaving: false,
      note: "",
    });
  };

  const handleAssetReconciliationSubmit = async () => {
    const asset = assetReconciliation.asset;
    if (!asset) return;

    const actualValue = Number(assetReconciliation.actualValue.replace(",", "."));
    const diff = calculateReconciliationDiff(getAssetValue(asset), actualValue);

    if (!Number.isFinite(actualValue) || actualValue < 0) {
      Alert.alert("请输入实际金额", "实际金额必须大于等于 0。");
      return;
    }

    if (Math.abs(diff) < 0.01) {
      Alert.alert("无需调整", "差额为 0，无需生成对账调整。");
      return;
    }

    if (!assetReconciliation.reason) {
      Alert.alert("请选择差额原因", "请选择这次估值差额产生的原因。");
      return;
    }

    if (!assetReconciliation.isConfirming) {
      setAssetReconciliation((current) => ({ ...current, isConfirming: true }));
      return;
    }

    setAssetReconciliation((current) => ({ ...current, isSaving: true }));
    try {
      await onSaveReconciliation({
        actualValue,
        note: assetReconciliation.note,
        reason: assetReconciliation.reason,
        targetId: asset.id,
        targetType: "asset",
      });
      Alert.alert("更新完成", "资产当前价值已更新，首页和报表已同步刷新。");
      closeAssetReconciliation();
    } catch {
      Alert.alert("更新失败", "无法保存这次资产估值调整。");
      setAssetReconciliation((current) => ({ ...current, isSaving: false }));
    }
  };

  const handleSubmitAsset = async () => {
    const name = assetForm.name.trim();
    const amount = Number(assetForm.amount.replace(",", "."));

    if (!name || !assetForm.amount.trim()) {
      Alert.alert("信息不完整", "请填写资产名称和金额。");
      return;
    }

    if (!Number.isFinite(amount) || amount < 0) {
      Alert.alert("金额无效", "请输入大于或等于 0 的资产金额。");
      return;
    }

    setIsSavingAsset(true);
    try {
      await onSaveAsset({
        accountId: assetForm.accountId,
        amount,
        category: assetForm.category,
        id: assetForm.id,
        name,
        note: assetForm.note,
      });
      closeForm();
    } finally {
      setIsSavingAsset(false);
    }
  };

  const handleSubmitLiability = async () => {
    const name = liabilityForm.name.trim();
    const amount = Number(liabilityForm.amount.replace(",", "."));

    if (!name || !liabilityForm.amount.trim()) {
      Alert.alert("信息不完整", "请填写负债名称和金额。");
      return;
    }

    if (!Number.isFinite(amount) || amount < 0) {
      Alert.alert("金额无效", "请输入大于或等于 0 的负债金额。");
      return;
    }

    setIsSavingLiability(true);
    try {
      await onSaveLiability({
        amount,
        category: liabilityForm.category,
        dueDate: liabilityForm.dueDate,
        id: liabilityForm.id,
        name,
        note: liabilityForm.note,
      });
      closeForm();
    } finally {
      setIsSavingLiability(false);
    }
  };

  const confirmDeleteAsset = (asset: Asset) => {
    Alert.alert("删除资产", `确认删除“${asset.name}”吗？`, [
      { text: "取消", style: "cancel" },
      {
        onPress: () => {
          void onDeleteAsset(asset.id);
          if (route.name === "detail") {
            setRoute({ kind: "asset", name: "subject", subjectId: route.subjectId });
          }
        },
        style: "destructive",
        text: "删除",
      },
    ]);
  };

  const confirmDeleteLiability = (liability: Liability) => {
    Alert.alert("删除负债", `确认删除“${liability.name}”吗？`, [
      { text: "取消", style: "cancel" },
      {
        onPress: () => {
          void onDeleteLiability(liability.id);
          if (route.name === "detail") {
            setRoute({ kind: "liability", name: "subject", subjectId: route.subjectId });
          }
        },
        style: "destructive",
        text: "删除",
      },
    ]);
  };

  const renderOverview = () => {
    const groups = activeKind === "asset" ? assetGroups : liabilityGroups;
    const visibleGroups = groups.filter((group) => doesSubjectGroupMatchSearch(group, subjectSearchQuery));
    const handleKindChange = (kind: LedgerKind) => {
      setOpenHelpSubjectId(null);
      setActiveKind(kind);
    };
    const handleSearchChange = (value: string) => {
      setOpenHelpSubjectId(null);
      setSubjectSearchQuery(value);
    };
    const handleSubjectHelpPress = (subject: AccountingSubject) => {
      setOpenHelpSubjectId((current) => (current === subject.id ? null : subject.id));
    };

    return (
      <ScreenTransition animateOnMount transitionKey={`ledger-overview-${activeKind}`} variant="drilldown">
        <View style={styles.stack}>
          <LedgerTopBar onAdd={() => openCreateForm(activeKind)} onBack={onBack} title="资产负债管理" />
          <View style={styles.toggleRow}>
            <ToggleButton active={activeKind === "asset"} label="资产类" onPress={() => handleKindChange("asset")} />
            <ToggleButton
              active={activeKind === "liability"}
              label="负债类"
              onPress={() => handleKindChange("liability")}
            />
          </View>

          <View style={styles.subjectSearchRow}>
            <View style={styles.subjectSearchBox}>
              <AppIcon color={theme.colors.textMuted} name="search" size={18} />
              <TextInput
                onChangeText={handleSearchChange}
                placeholder="搜索科目、金额、备注"
                placeholderTextColor={theme.colors.textMuted}
                style={styles.subjectSearchInput}
                value={subjectSearchQuery}
              />
            </View>
          </View>

          <View style={styles.subjectList}>
            {visibleGroups.map((group) => (
              <SubjectRow
                amount={group.amount}
                isHelpVisible={openHelpSubjectId === group.subject.id}
                key={group.subject.id}
                onExplain={handleSubjectHelpPress}
                onPress={() => setRoute({ kind: activeKind, name: "subject", subjectId: group.subject.id })}
                subject={group.subject}
              />
            ))}
            {visibleGroups.length === 0 ? <EmptyBox description="试试调整关键词。" title="没有找到科目" /> : null}
          </View>
        </View>
      </ScreenTransition>
    );
  };

  const renderSubjectDetail = (kind: LedgerKind, subjectId: string) => {
    const subject = getSubjectById(kind, subjectId);
    const assetGroup = kind === "asset" ? assetGroups.find((group) => group.subject.id === subjectId) : undefined;
    const liabilityGroup =
      kind === "liability" ? liabilityGroups.find((group) => group.subject.id === subjectId) : undefined;
    const amount = assetGroup?.amount ?? liabilityGroup?.amount ?? 0;
    const items = kind === "asset" ? assetGroup?.items ?? [] : liabilityGroup?.items ?? [];

    return (
      <ScreenTransition animateOnMount transitionKey={`ledger-subject-${subjectId}`} variant="drilldown">
        <View style={styles.stack}>
          <LedgerTopBar onAdd={() => openCreateForm(kind, subjectId)} onBack={handleBack} title={subject.displayName} />
          <View style={styles.subjectTotalRow}>
            <Text style={styles.subjectTotalLabel}>本科目合计</Text>
            <Text style={styles.subjectTotalValue}>{formatCurrency(amount)}</Text>
          </View>

          <View style={styles.ledgerList}>
            <Text style={styles.sectionHeading}>明细项目</Text>
            {items.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle}>暂无明细项目</Text>
                <Text style={styles.emptyText}>可点击右上角新增。</Text>
              </View>
            ) : null}
            {kind === "asset"
              ? (items as Asset[]).map((asset) => (
                  <DetailItemRow
                    amount={getAssetValue(asset)}
                    key={asset.id}
                    note={asset.note}
                    onPress={() => setRoute({ id: asset.id, kind, name: "detail", subjectId })}
                    title={asset.name}
                  />
                ))
              : (items as Liability[]).map((liability) => (
                  <DetailItemRow
                    amount={liability.amount}
                    key={liability.id}
                    note={liability.note ?? liability.dueDate}
                    onPress={() => setRoute({ id: liability.id, kind, name: "detail", subjectId })}
                    title={liability.name}
                  />
                ))}
          </View>
        </View>
      </ScreenTransition>
    );
  };

  const renderSpecificDetail = (kind: LedgerKind, subjectId: string, id: string) => {
    const subject = getSubjectById(kind, subjectId);
    const asset = kind === "asset" ? assets.find((item) => item.id === id) : undefined;
    const liability = kind === "liability" ? liabilities.find((item) => item.id === id) : undefined;

    if (!asset && !liability) {
      return (
        <ScreenTransition animateOnMount transitionKey="ledger-detail-missing" variant="drilldown">
          <View style={styles.stack}>
            <LedgerTopBar onBack={handleBack} title="明细不存在" />
            <EmptyBox description="该资产或负债可能已经被删除。" title="明细不存在" />
          </View>
        </ScreenTransition>
      );
    }

    return (
      <ScreenTransition animateOnMount transitionKey={`ledger-detail-${kind}-${id}`} variant="drilldown">
        <View style={styles.stack}>
          <LedgerTopBar onBack={handleBack} title={asset?.name ?? liability?.name ?? "明细详情"} />
          {asset ? (
            <SpecificDetail
              amount={getAssetValue(asset)}
              fields={[
                ["会计科目", subject.displayName],
                ["资产类型", getAssetTypeLabel(asset.category)],
                ["关联账户", getLinkedAccountName(accounts, asset.accountId)],
                ["用途 / 备注", asset.note || "无"],
                ["状态", "有效"],
              ]}
              name={asset.name}
            >
              <Pressable onPress={() => openAssetReconciliation(asset)} style={styles.operationButton}>
                <Text style={styles.operationButtonText}>更新当前价值</Text>
              </Pressable>
              <Pressable onPress={() => openEditAsset(asset)} style={styles.operationButton}>
                <Text style={styles.operationButtonText}>编辑资产</Text>
              </Pressable>
              <Pressable onPress={() => confirmDeleteAsset(asset)} style={styles.operationDangerButton}>
                <Text style={styles.operationDangerText}>删除资产</Text>
              </Pressable>
            </SpecificDetail>
          ) : null}
          {liability ? (
            <SpecificDetail
              amount={liability.amount}
              fields={[
                ["会计科目", subject.displayName],
                ["负债类型", getLiabilityTypeLabel(liability.category)],
                ["关联账户", getLinkedAccountName(accounts, liability.accountId)],
                ["到期日", liability.dueDate || "无"],
                ["用途 / 备注", liability.note || "无"],
                ["状态", "有效"],
              ]}
              name={liability.name}
            >
              <Pressable onPress={() => openEditLiability(liability)} style={styles.operationButton}>
                <Text style={styles.operationButtonText}>编辑负债</Text>
              </Pressable>
              <Pressable onPress={() => confirmDeleteLiability(liability)} style={styles.operationDangerButton}>
                <Text style={styles.operationDangerText}>删除负债</Text>
              </Pressable>
            </SpecificDetail>
          ) : null}
        </View>
      </ScreenTransition>
    );
  };

  return (
    <View style={styles.stack}>
      {route.name === "overview" ? renderOverview() : null}
      {route.name === "subject" ? renderSubjectDetail(route.kind, route.subjectId) : null}
      {route.name === "detail" ? renderSpecificDetail(route.kind, route.subjectId, route.id) : null}

      <AssetLiabilityFormModal
        activeAccounts={activeAccounts}
        assetForm={assetForm}
        formMode={formMode}
        isSavingAsset={isSavingAsset}
        isSavingLiability={isSavingLiability}
        liabilityForm={liabilityForm}
        onClose={closeForm}
        onSubmitAsset={() => void handleSubmitAsset()}
        onSubmitLiability={() => void handleSubmitLiability()}
        setAssetForm={setAssetForm}
        setLiabilityForm={setLiabilityForm}
      />
      <AssetReconciliationModal
        onClose={closeAssetReconciliation}
        onSubmit={() => void handleAssetReconciliationSubmit()}
        reconciliation={assetReconciliation}
        updateReconciliation={(patch) => setAssetReconciliation((current) => ({ ...current, ...patch }))}
      />
    </View>
  );
}

function ToggleButton({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.toggleButton, active ? styles.toggleButtonActive : null]}>
      <Text style={[styles.toggleText, active ? styles.toggleTextActive : null]}>{label}</Text>
    </Pressable>
  );
}

function LedgerTopBar({ onAdd, onBack, title }: { onAdd?: () => void; onBack: () => void; title: string }) {
  return (
    <View style={styles.topBar}>
      <Pressable onPress={onBack} style={styles.backButton}>
        <AppIcon color={theme.colors.backButtonText} name="back" size={15} strokeWidth={2.2} />
        <Text style={styles.backButtonText}>返回</Text>
      </Pressable>
      <Text style={styles.pageTitle}>{title}</Text>
      {onAdd ? (
        <Pressable accessibilityLabel="新增明细" onPress={onAdd} style={styles.addButton}>
          <AppIcon color={theme.colors.primaryDeep} name="add" size={20} />
        </Pressable>
      ) : (
        <View style={styles.headerSpacer} />
      )}
    </View>
  );
}

function SubjectRow({
  amount,
  isHelpVisible,
  onExplain,
  onPress,
  subject,
}: {
  amount: number;
  isHelpVisible: boolean;
  onExplain: (subject: AccountingSubject) => void;
  onPress: () => void;
  subject: AccountingSubject;
}) {
  return (
    <View style={[styles.subjectRow, isHelpVisible && styles.subjectRowActive]}>
      <Pressable onPress={onPress} style={styles.subjectRowPressable}>
        <View style={styles.subjectRowTop}>
          <View style={styles.subjectNameWrap}>
            <Text style={styles.subjectName}>{subject.displayName}</Text>
            <Pressable
              accessibilityLabel={`解释${subject.displayName}`}
              hitSlop={8}
              onPress={(event) => {
                event.stopPropagation();
                onExplain(subject);
              }}
            >
              <View style={styles.questionButton}>
                <Text style={styles.questionText}>?</Text>
              </View>
            </Pressable>
          </View>
          <View style={styles.subjectAmountWrap}>
            <Text style={styles.subjectAmount}>{formatCurrency(amount)}</Text>
            <AppIcon color={theme.colors.textMuted} name="chevronRight" size={16} />
          </View>
        </View>
        <Text numberOfLines={1} style={styles.subjectExamples}>
          {subject.rowExamples.join(" / ")}
        </Text>
      </Pressable>
      {isHelpVisible ? <SubjectHelpBubble text={getSubjectHelpText(subject)} /> : null}
    </View>
  );
}

function SubjectHelpBubble({ text }: { text: string }) {
  return (
    <View style={styles.helpBubbleWrap}>
      <View style={styles.helpBubbleCaret} />
      <View style={styles.helpBubble}>
        <Text style={styles.helpBubbleText}>{text}</Text>
      </View>
    </View>
  );
}

function DetailItemRow({
  amount,
  note,
  onPress,
  title,
}: {
  amount: number;
  note?: string;
  onPress: () => void;
  title: string;
}) {
  return (
    <Pressable onPress={onPress} style={styles.detailItemRow}>
      <View style={styles.detailItemMain}>
        <Text numberOfLines={1} style={styles.detailItemTitle}>
          {title}
        </Text>
        <Text numberOfLines={1} style={styles.detailItemNote}>
          {note || "无备注"}
        </Text>
      </View>
      <Text style={styles.detailItemAmount}>{formatCurrency(amount)}</Text>
      <AppIcon color={theme.colors.textMuted} name="chevronRight" size={16} />
    </Pressable>
  );
}

function SpecificDetail({
  amount,
  children,
  fields,
  name,
}: {
  amount: number;
  children: ReactNode;
  fields: Array<[string, string]>;
  name: string;
}) {
  return (
    <>
      <View style={styles.detailHero}>
        <Text style={styles.detailHeroName}>{name}</Text>
        <Text style={styles.detailHeroAmount}>{formatCurrency(amount)}</Text>
      </View>
      <View style={styles.detailPanel}>
        {fields.map(([label, value]) => (
          <View key={label} style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
          </View>
        ))}
      </View>
      <View style={styles.operations}>
        <Text style={styles.sectionHeading}>操作</Text>
        {children}
      </View>
    </>
  );
}

function EmptyBox({ description, title }: { description: string; title: string }) {
  return (
    <View style={styles.emptyBox}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{description}</Text>
    </View>
  );
}

function AssetLiabilityFormModal({
  activeAccounts,
  assetForm,
  formMode,
  isSavingAsset,
  isSavingLiability,
  liabilityForm,
  onClose,
  onSubmitAsset,
  onSubmitLiability,
  setAssetForm,
  setLiabilityForm,
}: {
  activeAccounts: Account[];
  assetForm: AssetFormState;
  formMode: FormMode;
  isSavingAsset: boolean;
  isSavingLiability: boolean;
  liabilityForm: LiabilityFormState;
  onClose: () => void;
  onSubmitAsset: () => void;
  onSubmitLiability: () => void;
  setAssetForm: Dispatch<SetStateAction<AssetFormState>>;
  setLiabilityForm: Dispatch<SetStateAction<LiabilityFormState>>;
}) {
  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={formMode !== null}>
      <Pressable onPress={onClose} style={styles.modalBackdrop}>
        <Pressable style={styles.modalPanel}>
          <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
            {formMode === "asset" ? (
              <>
                <Text style={styles.modalTitle}>{assetForm.id ? "编辑资产" : "新增资产"}</Text>
                <TextInput
                  onChangeText={(value) => setAssetForm((current) => ({ ...current, name: value }))}
                  placeholder="资产名称，例如：招商银行活期"
                  placeholderTextColor={theme.colors.textMuted}
                  style={sharedStyles.input}
                  value={assetForm.name}
                />
                <AssetCategoryChips form={assetForm} setForm={setAssetForm} />
                <TextInput
                  keyboardType="decimal-pad"
                  onChangeText={(value) => setAssetForm((current) => ({ ...current, amount: value }))}
                  placeholder="当前金额或当前价值"
                  placeholderTextColor={theme.colors.textMuted}
                  style={sharedStyles.input}
                  value={assetForm.amount}
                />
                <Text style={styles.fieldLabel}>关联账户（可选）</Text>
                <View style={styles.chipGroup}>
                  <Pressable
                    onPress={() => setAssetForm((current) => ({ ...current, accountId: undefined }))}
                    style={[sharedStyles.chip, !assetForm.accountId && sharedStyles.chipActiveLight]}
                  >
                    <Text style={sharedStyles.chipText}>不关联</Text>
                  </Pressable>
                  {activeAccounts.map((account) => (
                    <Pressable
                      key={account.id}
                      onPress={() => setAssetForm((current) => ({ ...current, accountId: account.id }))}
                      style={[sharedStyles.chip, assetForm.accountId === account.id && sharedStyles.chipActiveLight]}
                    >
                      <Text style={sharedStyles.chipText}>{account.name}</Text>
                    </Pressable>
                  ))}
                </View>
                <TextInput
                  multiline
                  onChangeText={(value) => setAssetForm((current) => ({ ...current, note: value }))}
                  placeholder="备注（可选）"
                  placeholderTextColor={theme.colors.textMuted}
                  style={[sharedStyles.input, sharedStyles.textArea]}
                  value={assetForm.note}
                />
                <ModalActions
                  disabled={isSavingAsset}
                  onCancel={onClose}
                  onSubmit={onSubmitAsset}
                  submitLabel={assetForm.id ? "保存资产修改" : "添加资产"}
                />
              </>
            ) : null}

            {formMode === "liability" ? (
              <>
                <Text style={styles.modalTitle}>{liabilityForm.id ? "编辑负债" : "新增负债"}</Text>
                <TextInput
                  onChangeText={(value) => setLiabilityForm((current) => ({ ...current, name: value }))}
                  placeholder="负债名称，例如：招商信用卡"
                  placeholderTextColor={theme.colors.textMuted}
                  style={sharedStyles.input}
                  value={liabilityForm.name}
                />
                <LiabilityCategoryChips form={liabilityForm} setForm={setLiabilityForm} />
                <TextInput
                  keyboardType="decimal-pad"
                  onChangeText={(value) => setLiabilityForm((current) => ({ ...current, amount: value }))}
                  placeholder="负债金额"
                  placeholderTextColor={theme.colors.textMuted}
                  style={sharedStyles.input}
                  value={liabilityForm.amount}
                />
                <TextInput
                  onChangeText={(value) => setLiabilityForm((current) => ({ ...current, dueDate: value }))}
                  placeholder="到期日（可选，YYYY-MM-DD）"
                  placeholderTextColor={theme.colors.textMuted}
                  style={sharedStyles.input}
                  value={liabilityForm.dueDate}
                />
                <TextInput
                  multiline
                  onChangeText={(value) => setLiabilityForm((current) => ({ ...current, note: value }))}
                  placeholder="备注（可选）"
                  placeholderTextColor={theme.colors.textMuted}
                  style={[sharedStyles.input, sharedStyles.textArea]}
                  value={liabilityForm.note}
                />
                <ModalActions
                  disabled={isSavingLiability}
                  onCancel={onClose}
                  onSubmit={onSubmitLiability}
                  submitLabel={liabilityForm.id ? "保存负债修改" : "添加负债"}
                />
              </>
            ) : null}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function AssetCategoryChips({
  form,
  setForm,
}: {
  form: AssetFormState;
  setForm: Dispatch<SetStateAction<AssetFormState>>;
}) {
  return (
    <View style={styles.chipGroup}>
      {assetCategoryOptions.map((option) => (
        <Pressable
          key={option.value}
          onPress={() => setForm((current) => ({ ...current, category: option.value }))}
          style={[sharedStyles.chip, form.category === option.value && sharedStyles.chipActiveLight]}
        >
          <Text style={sharedStyles.chipText}>{option.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function LiabilityCategoryChips({
  form,
  setForm,
}: {
  form: LiabilityFormState;
  setForm: Dispatch<SetStateAction<LiabilityFormState>>;
}) {
  return (
    <View style={styles.chipGroup}>
      {liabilityCategoryOptions.map((option) => (
        <Pressable
          key={option.value}
          onPress={() => setForm((current) => ({ ...current, category: option.value }))}
          style={[sharedStyles.chip, form.category === option.value && sharedStyles.chipActiveLight]}
        >
          <Text style={sharedStyles.chipText}>{option.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function ModalActions({
  disabled,
  onCancel,
  onSubmit,
  submitLabel,
}: {
  disabled: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel: string;
}) {
  return (
    <View style={styles.modalActions}>
      <Pressable onPress={onCancel} style={sharedStyles.secondaryButton}>
        <Text style={sharedStyles.secondaryButtonText}>取消</Text>
      </Pressable>
      <Pressable
        disabled={disabled}
        onPress={onSubmit}
        style={[sharedStyles.primaryButton, styles.modalPrimaryButton, disabled && styles.buttonDisabled]}
      >
        <Text style={sharedStyles.primaryButtonText}>{disabled ? "保存中..." : submitLabel}</Text>
      </Pressable>
    </View>
  );
}

function AssetReconciliationModal({
  onClose,
  onSubmit,
  reconciliation,
  updateReconciliation,
}: {
  onClose: () => void;
  onSubmit: () => void;
  reconciliation: AssetReconciliationState;
  updateReconciliation: (patch: Partial<AssetReconciliationState>) => void;
}) {
  const asset = reconciliation.asset;
  const actualValue = Number(reconciliation.actualValue.replace(",", "."));
  const bookValue = asset ? getAssetValue(asset) : 0;
  const displayActual = Number.isFinite(actualValue) ? actualValue : bookValue;
  const diff = asset ? calculateReconciliationDiff(bookValue, displayActual) : 0;
  const reasonOptions = asset && Math.abs(diff) >= 0.01 ? getReconciliationReasonOptions("asset", diff) : [];

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={asset !== undefined}>
      <Pressable onPress={onClose} style={styles.modalBackdrop}>
        <Pressable style={styles.modalPanel}>
          {reconciliation.isConfirming ? (
            <>
              <Text style={styles.modalTitle}>确认对账调整</Text>
              <Text style={styles.modalDescription}>
                系统将根据你选择的原因生成一笔调整记录，并更新相关账户或资产。请确认这不是重复记录。
              </Text>
              <DiffBox diff={diff} label="本次差额" value={Math.abs(diff)} />
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
              <Text style={styles.modalTitle}>更新当前价值</Text>
              <Text style={styles.modalDescription}>
                输入资产的实际市值，系统会生成安全的非现金估值调整，不计入收入、费用或现金流。
              </Text>
              <DiffBox diff={diff} label="当前账面价值" value={bookValue} />
              <Text style={styles.fieldLabel}>实际市值</Text>
              <TextInput
                keyboardType="decimal-pad"
                onChangeText={(value) => updateReconciliation({ actualValue: value, isConfirming: false, reason: undefined })}
                placeholder="请输入实际金额"
                placeholderTextColor={theme.colors.textMuted}
                style={sharedStyles.input}
                value={reconciliation.actualValue}
              />
              <Text style={styles.fieldLabel}>差额原因</Text>
              <View style={styles.chipGroup}>
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
              <Text style={styles.fieldLabel}>备注</Text>
              <TextInput
                multiline
                onChangeText={(value) => updateReconciliation({ note: value })}
                placeholder="可补充估值来源或说明"
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

function DiffBox({ diff, label, value }: { diff: number; label: string; value: number }) {
  return (
    <View style={styles.diffBox}>
      <View>
        <Text style={styles.diffLabel}>{label}</Text>
        <Text style={styles.diffBookValue}>{formatCurrency(value)}</Text>
      </View>
      <View style={styles.diffRight}>
        <Text style={styles.diffLabel}>差额</Text>
        <Text style={[styles.diffValue, diff >= 0 ? styles.diffPositive : styles.diffNegative]}>
          {Math.abs(diff) < 0.01 ? "" : diff > 0 ? "+" : "-"}
          {formatCurrency(Math.abs(diff))}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  addButton: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceSoft,
    borderColor: theme.colors.border,
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  backButton: {
    alignItems: "center",
    backgroundColor: theme.colors.backButtonBackground,
    borderColor: theme.colors.backButtonBorder,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  backButtonText: {
    color: theme.colors.backButtonText,
    fontSize: 13,
    fontWeight: "800",
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  chipGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  detailHero: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    padding: theme.spacing.lg,
  },
  detailHeroAmount: {
    color: theme.colors.textPrimary,
    fontSize: 24,
    fontWeight: "900",
    marginTop: 8,
  },
  detailHeroName: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: "800",
  },
  detailItemAmount: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: "900",
    maxWidth: 132,
    textAlign: "right",
  },
  detailItemMain: {
    flex: 1,
    gap: 4,
  },
  detailItemNote: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  detailItemRow: {
    alignItems: "center",
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
  },
  detailItemTitle: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: "800",
  },
  detailPanel: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
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
  emptyBox: {
    alignItems: "center",
    gap: 6,
    padding: theme.spacing.lg,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    textAlign: "center",
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "900",
  },
  fieldLabel: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: -2,
  },
  headerSpacer: {
    width: 36,
  },
  helpBubble: {
    backgroundColor: theme.colors.surfaceStrong,
    borderRadius: theme.radius.lg,
    elevation: 12,
    maxWidth: 286,
    paddingHorizontal: 12,
    paddingVertical: 9,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
  },
  helpBubbleCaret: {
    borderBottomColor: theme.colors.surfaceStrong,
    borderBottomWidth: 7,
    borderLeftColor: "transparent",
    borderLeftWidth: 7,
    borderRightColor: "transparent",
    borderRightWidth: 7,
    height: 0,
    marginLeft: 74,
    width: 0,
  },
  helpBubbleText: {
    color: theme.colors.textInverse,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
  },
  helpBubbleWrap: {
    alignItems: "flex-start",
    elevation: 12,
    left: 18,
    position: "absolute",
    top: 31,
    zIndex: 20,
  },
  infoLabel: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
    width: 86,
  },
  infoRow: {
    alignItems: "center",
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "space-between",
    paddingVertical: 13,
  },
  infoValue: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
    textAlign: "right",
  },
  ledgerList: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    overflow: "hidden",
  },
  modalActions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    justifyContent: "flex-end",
    marginTop: theme.spacing.sm,
  },
  modalBackdrop: {
    backgroundColor: "rgba(13, 25, 18, 0.42)",
    flex: 1,
    justifyContent: "flex-end",
    padding: theme.spacing.container,
  },
  modalContent: {
    gap: theme.spacing.md,
  },
  modalDescription: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  modalPanel: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    maxHeight: "86%",
    padding: theme.spacing.lg,
  },
  modalPrimaryButton: {
    flex: 1,
  },
  modalTitle: {
    color: theme.colors.textPrimary,
    fontSize: 22,
    fontWeight: "900",
  },
  operationButton: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceSoft,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    paddingVertical: 12,
  },
  operationButtonText: {
    color: theme.colors.primaryDeep,
    fontSize: 14,
    fontWeight: "800",
  },
  operationDangerButton: {
    alignItems: "center",
    backgroundColor: theme.colors.dangerSoft,
    borderRadius: theme.radius.lg,
    paddingVertical: 12,
  },
  operationDangerText: {
    color: theme.colors.danger,
    fontSize: 14,
    fontWeight: "800",
  },
  operations: {
    gap: theme.spacing.sm,
  },
  pageTitle: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
  },
  questionButton: {
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderColor: "#D1D5DB",
    borderRadius: 9,
    borderWidth: 1,
    height: 18,
    justifyContent: "center",
    width: 18,
  },
  questionText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 14,
  },
  sectionHeading: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "900",
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  stack: {
    gap: theme.spacing.md,
  },
  subjectAmount: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: "900",
    maxWidth: 132,
    textAlign: "right",
  },
  subjectAmountWrap: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
  },
  subjectExamples: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  subjectName: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: "900",
  },
  subjectNameWrap: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 6,
  },
  subjectList: {
    borderTopColor: theme.colors.divider,
    borderTopWidth: 1,
  },
  subjectRow: {
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    position: "relative",
    zIndex: 1,
  },
  subjectRowActive: {
    elevation: 12,
    zIndex: 30,
  },
  subjectRowPressable: {
    paddingHorizontal: 2,
    paddingVertical: 13,
  },
  subjectRowTop: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
    justifyContent: "space-between",
  },
  subjectTotalLabel: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "800",
  },
  subjectTotalRow: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: theme.spacing.lg,
  },
  subjectTotalValue: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: "900",
  },
  subjectSearchBox: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: theme.spacing.sm,
    minHeight: 42,
    paddingHorizontal: theme.spacing.md,
  },
  subjectSearchInput: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  subjectSearchRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  toggleButton: {
    alignItems: "center",
    borderBottomColor: "transparent",
    borderBottomWidth: 2,
    paddingBottom: 9,
    paddingHorizontal: theme.spacing.sm,
    paddingTop: 3,
  },
  toggleButtonActive: {
    borderBottomColor: theme.colors.primaryDeep,
  },
  toggleRow: {
    flexDirection: "row",
    gap: theme.spacing.lg,
    paddingHorizontal: 2,
  },
  toggleText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: "800",
  },
  toggleTextActive: {
    color: theme.colors.textPrimary,
  },
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
});
