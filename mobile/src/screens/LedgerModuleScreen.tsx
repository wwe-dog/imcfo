import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import AppIcon, { type AppIconName } from "../components/AppIcon";
import {
  LedgerFullBleedList,
  LedgerGlassHero,
  LedgerPageHeader,
  LedgerSectionHeader,
  LedgerValueRow,
  TransactionListRow,
  getLedgerScreenPadding,
  type LedgerRowTone,
} from "../components/LedgerUI";
import type { Transaction } from "../domain/models";
import { theme } from "../styles/theme";
import { formatCurrency } from "../utils/formatters";

type LedgerModuleRoute = "budget" | "projects" | "root";
type BudgetTab = "category" | "fixed" | "overview" | "project";
type BudgetSheet = "edit" | "new" | null;
type NewBudgetType = "category" | "fixed" | "project";
type BudgetTone = "amber" | "blue" | "danger" | "default" | "green";
type BudgetThreshold = "100%" | "80%" | "90%";
type FixedPaymentStatus = "已支付" | "待扣款" | "未支付" | "需保留";
type FixedRepeatCycle = "每年" | "每月" | "一次性";

interface LedgerModuleScreenProps {
  onOpenAssets: () => void;
  onOpenTransactions: () => void;
  transactions: Transaction[];
}

interface BudgetRow {
  amount: string;
  detail?: string;
  progress: number;
  rightSub?: string;
  title: string;
  tone?: BudgetTone;
}

interface CategoryBudgetRow extends BudgetRow {
  percent: string;
  rank: number;
  status?: string;
}

interface ProjectBudgetRow {
  amount: string;
  remaining: string;
  progress: number;
  status: string;
  title: string;
  tone?: BudgetTone;
}

interface FixedOccupancyRow {
  amount: string;
  date: string;
  status: string;
  subtitle: string;
  title: string;
  tone?: BudgetTone;
}

interface ProjectBudgetItem {
  amount: string;
  id: number;
  name: string;
}

const projectRows = [
  {
    icon: "chart" as const,
    tone: "amber" as const,
    title: "小红书接单",
    subtitle: "投入期 · 拍摄灯、课程、推广成本",
    value: "-¥899",
    valueDetail: "本月",
  },
  {
    icon: "asset" as const,
    tone: "green" as const,
    title: "闲鱼卖货",
    subtitle: "回收闲置资产，形成一次性现金流",
    value: "+¥620",
    valueDetail: "本月",
  },
  {
    icon: "reports" as const,
    tone: "default" as const,
    title: "课程产品",
    subtitle: "观察中 · 暂无稳定收入",
    value: "¥0",
    valueDetail: "观察",
  },
];

const budgetTabs: Array<{ label: string; value: BudgetTab }> = [
  { label: "总览", value: "overview" },
  { label: "分类预算", value: "category" },
  { label: "项目预算", value: "project" },
  { label: "固定占用", value: "fixed" },
];

const overviewBudgetRows: BudgetRow[] = [
  { amount: "分类预算 + 项目预算", detail: "¥5,200", progress: 100, title: "可控预算" },
  { amount: "来自已确认交易", detail: "¥3,920", progress: 75, rightSub: "75%", title: "已用", tone: "amber" },
  { amount: "可控预算剩余额度", detail: "¥1,280", progress: 25, rightSub: "25%", title: "剩余", tone: "green" },
];

const categoryBudgetRows: CategoryBudgetRow[] = [
  { amount: "¥760 / ¥600", detail: "已超 ¥160", percent: "127%", progress: 100, rank: 1, status: "超支", title: "娱乐", tone: "danger" },
  { amount: "¥420 / ¥500", detail: "接近上限", percent: "84%", progress: 84, rank: 2, status: "留意", title: "交通", tone: "amber" },
  { amount: "¥860 / ¥1,200", percent: "72%", progress: 72, rank: 3, title: "餐饮" },
  { amount: "¥320 / ¥800", percent: "40%", progress: 40, rank: 4, title: "学习成长", tone: "green" },
];

const projectBudgetRows: ProjectBudgetRow[] = [
  {
    amount: "¥899 / ¥1,200",
    progress: 75,
    remaining: "还剩 ¥301",
    status: "75%",
    title: "小红书接单",
    tone: "blue",
  },
  {
    amount: "¥120 / ¥300",
    progress: 40,
    remaining: "还剩 ¥180",
    status: "40%",
    title: "闲鱼卖货",
    tone: "green",
  },
  {
    amount: "¥0 / ¥500",
    progress: 0,
    remaining: "还剩 ¥500",
    status: "0%",
    title: "课程产品",
  },
];

const fixedOccupancyRows: FixedOccupancyRow[] = [
  { amount: "¥2,000", date: "5 月 20 日", status: "未支付", subtitle: "固定生活支出", title: "房租" },
  {
    amount: "¥6,800",
    date: "5 月 22 日",
    status: "需保留",
    subtitle: "到期还款，不属于可控消费预算",
    title: "信用卡还款",
    tone: "amber",
  },
  { amount: "¥68", date: "5 月 25 日", status: "待扣款", subtitle: "自动续费", title: "订阅服务" },
  { amount: "¥59", date: "每月 10 日", status: "已支付", subtitle: "通讯固定占用", title: "手机话费", tone: "green" },
];

const newBudgetTypes: Array<{ label: string; value: NewBudgetType }> = [
  { label: "分类预算", value: "category" },
  { label: "项目预算", value: "project" },
  { label: "固定占用", value: "fixed" },
];

const categoryTemplates = ["餐饮", "交通", "娱乐", "学习成长", "购物"];
const thresholdOptions: BudgetThreshold[] = ["80%", "90%", "100%"];
const initialProjectBudgetItems: ProjectBudgetItem[] = [
  { amount: "¥399", id: 1, name: "拍摄设备" },
  { amount: "¥299", id: 2, name: "课程学习" },
  { amount: "¥300", id: 3, name: "推广投流" },
  { amount: "¥120", id: 4, name: "交通差旅" },
  { amount: "¥82", id: 5, name: "备用预算" },
];
const projectTemplates = ["设备", "课程", "推广", "差旅", "外包"];
const fixedPaymentStatusOptions: FixedPaymentStatus[] = ["未支付", "已支付", "待扣款", "需保留"];
const fixedRepeatCycleOptions: FixedRepeatCycle[] = ["每月", "一次性", "每年"];
const editBudgetOptions: Array<{ icon: AppIconName; subtitle: string; title: string }> = [
  { icon: "reports", subtitle: "调整分类预算和项目预算总额", title: "编辑可控预算" },
  { icon: "chart", subtitle: "调整餐饮、交通、娱乐等分类额度", title: "编辑分类预算" },
  { icon: "cashFlow", subtitle: "调整小红书接单、闲鱼卖货等投入额度", title: "编辑项目预算" },
  { icon: "report", subtitle: "更新金额、日期和支付状态", title: "管理固定占用" },
];

export default function LedgerModuleScreen({
  onOpenAssets,
  onOpenTransactions,
  transactions,
}: LedgerModuleScreenProps) {
  const [route, setRoute] = React.useState<LedgerModuleRoute>("root");
  const { width } = useWindowDimensions();
  const horizontalPadding = getLedgerScreenPadding(width);
  const recentTransactions = transactions.slice(0, 3);

  const goRoot = () => setRoute("root");

  return (
    <View style={[styles.screen, { marginHorizontal: -horizontalPadding, paddingHorizontal: horizontalPadding }]}>
      {route === "root" ? (
        <View style={styles.scrollContent}>
          <LedgerPageHeader title="账本" />

          <LedgerGlassHero
            badge="92%"
            badgeVariant="circle"
            eyebrow="本月账本状态"
            metrics={[
              { label: "已入账", value: "86", unit: "笔" },
              { label: "本月新增", value: "12", unit: "笔" },
              { label: "完整度", value: "92", unit: "%" },
            ]}
            title={"底账基本完整，\n经营结论可追溯。"}
          />

          <LedgerSectionHeader action="管理" title="核心入口" />
          <View style={styles.entryGrid}>
            <EntryTile
              icon="transaction"
              onPress={onOpenTransactions}
              subtitle="查看、搜索、修改已确认交易。"
              title="交易记录"
            />
            <EntryTile
              icon="reports"
              onPress={() => setRoute("budget")}
              subtitle="管理预算额度、项目预算和固定占用。"
              title="预算管理"
            />
            <EntryTile
              icon="asset"
              onPress={onOpenAssets}
              subtitle="管理资产、负债与净资产结构。"
              title="资产负债管理"
            />
            <EntryTile
              icon="chart"
              onPress={() => setRoute("projects")}
              subtitle="追踪副业、项目和长期现金流。"
              title="经营项目"
            />
          </View>

          <LedgerSectionHeader action="查看全部" onAction={onOpenTransactions} title="最近财务事件" />
          <LedgerFullBleedList horizontalPadding={horizontalPadding}>
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction, index) => (
                <RecentEventRow
                  key={transaction.id}
                  last={index === recentTransactions.length - 1}
                  transaction={transaction}
                />
              ))
            ) : (
              <LedgerValueRow last title="暂无财务事件" subtitle="入账后会显示最近的收入、支出和资产负债事件。" value="空" />
            )}
          </LedgerFullBleedList>
        </View>
      ) : null}

      {route === "budget" ? <BudgetManagementView horizontalPadding={horizontalPadding} onBack={goRoot} /> : null}

      {route === "projects" ? (
        <View style={styles.scrollContent}>
          <LedgerPageHeader onBack={goRoot} title="经营项目" />
          <LedgerGlassHero
            badge="观察"
            badgeTone="amber"
            eyebrow="项目经营结果"
            metrics={[
              { label: "项目收入", tone: "green", value: "¥2,040" },
              { label: "项目成本", value: "¥2,319" },
              { label: "净现金流", tone: "amber", value: "-¥279" },
            ]}
            title={"2 个项目在跑，\n本月净现金流 -¥279。"}
          />
          <LedgerSectionHeader action="新建项目" title="项目列表" />
          <LedgerFullBleedList horizontalPadding={horizontalPadding}>
            {projectRows.map((item, index) => (
              <LedgerValueRow
                icon={item.icon}
                key={item.title}
                last={index === projectRows.length - 1}
                subtitle={item.subtitle}
                title={item.title}
                tone={item.tone}
                value={item.value}
                valueDetail={item.valueDetail}
              />
            ))}
          </LedgerFullBleedList>
        </View>
      ) : null}
    </View>
  );
}

function EntryTile({
  icon,
  onPress,
  subtitle,
  title,
}: {
  icon: AppIconName;
  onPress: () => void;
  subtitle: string;
  title: string;
}) {
  return (
    <Pressable onPress={onPress} style={styles.entryTile}>
      <View style={styles.entryTop}>
        <View style={styles.entryIcon}>
          <AppIcon color={theme.colors.textSecondary} name={icon} size={18} />
        </View>
        <Text style={styles.entryArrow}>↗</Text>
      </View>
      <Text style={styles.entryTitle}>{title}</Text>
      <Text numberOfLines={2} style={styles.entrySubtitle}>
        {subtitle}
      </Text>
    </Pressable>
  );
}

function BudgetManagementView({ horizontalPadding, onBack }: { horizontalPadding: number; onBack: () => void }) {
  const [activeTab, setActiveTab] = React.useState<BudgetTab>("overview");
  const [activeSheet, setActiveSheet] = React.useState<BudgetSheet>(null);
  const [newBudgetType, setNewBudgetType] = React.useState<NewBudgetType>("category");
  const closeSheet = () => setActiveSheet(null);

  return (
    <View style={styles.scrollContent}>
      <View style={styles.budgetHeader}>
        <View style={styles.budgetBackTitle}>
          <Pressable accessibilityRole="button" hitSlop={12} onPress={onBack} style={styles.budgetBackButton}>
            <AppIcon color={theme.colors.textPrimary} name="back" size={31} strokeWidth={2.35} />
          </Pressable>
          <Text numberOfLines={1} style={styles.pageTitle}>
            预算管理
          </Text>
        </View>
        <Pressable accessibilityRole="button" onPress={() => setActiveSheet("new")} style={styles.glassAddButton}>
          <LinearGradient
            colors={["rgba(255,255,255,0.18)", "rgba(255,255,255,0.065)", "rgba(255,255,255,0.035)"]}
            pointerEvents="none"
            style={StyleSheet.absoluteFill}
          />
          <AppIcon color={theme.colors.textPrimary} name="add" size={22} strokeWidth={2.1} />
        </Pressable>
      </View>

      <View style={styles.budgetToolbar}>
        <View style={styles.budgetPeriod}>
          <Text style={styles.budgetPeriodTitle}>2026 年 5 月</Text>
          <Text style={styles.budgetPeriodDesc}>设置预算额度，查看使用进度和偏差</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={() => setActiveSheet("edit")} style={styles.budgetEditButton}>
          <Text style={styles.budgetEditText}>编辑</Text>
        </Pressable>
      </View>

      <BudgetTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "overview" ? <BudgetOverview horizontalPadding={horizontalPadding} /> : null}
      {activeTab === "category" ? <BudgetCategory horizontalPadding={horizontalPadding} /> : null}
      {activeTab === "project" ? <BudgetProject horizontalPadding={horizontalPadding} /> : null}
      {activeTab === "fixed" ? <FixedOccupancyPanel horizontalPadding={horizontalPadding} /> : null}

      <NewBudgetSheet
        activeType={newBudgetType}
        onChangeType={setNewBudgetType}
        onClose={closeSheet}
        visible={activeSheet === "new"}
      />
      <EditBudgetSheet onClose={closeSheet} visible={activeSheet === "edit"} />
    </View>
  );
}

function BudgetTabs({ activeTab, onChange }: { activeTab: BudgetTab; onChange: (tab: BudgetTab) => void }) {
  return (
    <View style={styles.budgetTabs}>
      {budgetTabs.map((tab) => {
        const active = tab.value === activeTab;
        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            key={tab.value}
            onPress={() => onChange(tab.value)}
            style={[styles.budgetTab, active && styles.budgetTabActive]}
          >
            <Text style={[styles.budgetTabText, active && styles.budgetTabTextActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function BudgetOverview({ horizontalPadding }: { horizontalPadding: number }) {
  return (
    <View style={styles.budgetPanel}>
      <LedgerSectionHeader action="本月" title="总览" />
      <Text style={styles.moduleDesc}>总览只汇总可控预算的使用情况，并单独列出本月固定占用。</Text>
      <BudgetVisualPanel horizontalPadding={horizontalPadding}>
        <View style={styles.visualHead}>
          <View>
            <Text style={styles.visualLabel}>可控预算使用率</Text>
            <Text style={styles.visualAmount}>¥3,920 / ¥5,200</Text>
          </View>
          <View style={styles.visualRight}>
            <Text style={styles.visualPercent}>75%</Text>
            <Text style={styles.visualSub}>剩余 ¥1,280</Text>
          </View>
        </View>
        <ProgressBar progress={75} size="large" />
      </BudgetVisualPanel>
      <LedgerFullBleedList horizontalPadding={horizontalPadding}>
        {overviewBudgetRows.map((row, index) => (
          <BudgetProgressRow key={row.title} row={row} />
        ))}
        <FixedSummaryRow
          amount="¥8,927"
          detail="4 项"
          subtitle="本月确定会发生的支出，不计入可控预算使用率"
          title="固定占用"
        />
        <FixedSummaryRow
          amount="1"
          detail="超支"
          subtitle="正常 8 项｜接近上限 2 项｜超支 1 项"
          title="预算状态"
          tone="danger"
          last
        />
      </LedgerFullBleedList>
    </View>
  );
}

function BudgetCategory({ horizontalPadding }: { horizontalPadding: number }) {
  return (
    <View style={styles.budgetPanel}>
      <LedgerSectionHeader action="管理分类" title="分类预算" />
      <Text style={styles.moduleDesc}>分类预算用于日常消费额度管理。接近上限或超支时才显示提示。</Text>
      <LedgerFullBleedList horizontalPadding={horizontalPadding}>
        {categoryBudgetRows.map((row, index) => (
          <CategoryBudgetRowView key={row.title} last={index === categoryBudgetRows.length - 1} row={row} />
        ))}
      </LedgerFullBleedList>
    </View>
  );
}

function BudgetProject({ horizontalPadding }: { horizontalPadding: number }) {
  return (
    <View style={styles.budgetPanel}>
      <LedgerSectionHeader action="新建项目" title="项目预算" />
      <Text style={styles.moduleDesc}>项目预算只管理本月批准投入、已用和剩余。项目回报分析放到经营项目页。</Text>
      <LedgerFullBleedList horizontalPadding={horizontalPadding}>
        {projectBudgetRows.map((row, index) => (
          <ProjectBudgetRowView key={row.title} last={index === projectBudgetRows.length - 1} row={row} />
        ))}
      </LedgerFullBleedList>
    </View>
  );
}

function FixedOccupancyPanel({ horizontalPadding }: { horizontalPadding: number }) {
  return (
    <View style={styles.budgetPanel}>
      <LedgerSectionHeader action="本月固定项" title="固定占用" />
      <Text style={styles.moduleDesc}>这些不是“预算多少”的问题，而是已经确定会发生的资金占用。</Text>
      <LedgerFullBleedList horizontalPadding={horizontalPadding}>
        {fixedOccupancyRows.map((row, index) => (
          <FixedOccupancyRowView key={row.title} last={index === fixedOccupancyRows.length - 1} row={row} />
        ))}
      </LedgerFullBleedList>
    </View>
  );
}

function NewBudgetSheet({
  activeType,
  onChangeType,
  onClose,
  visible,
}: {
  activeType: NewBudgetType;
  onChangeType: (type: NewBudgetType) => void;
  onClose: () => void;
  visible: boolean;
}) {
  return (
    <BudgetSheetFrame
      description="选择预算类型，填写本月额度或固定占用信息。"
      onClose={onClose}
      title="新建预算"
      visible={visible}
    >
      <View style={styles.newBudgetSummary}>
        <Text style={styles.newBudgetSummaryTitle}>新建内容只进入预算管理</Text>
        <Text style={styles.newBudgetSummaryText}>预算是计划层，只和已确认交易做对比，不会修改账本事实和报表结果。</Text>
      </View>

      <View style={styles.sheetTypeTabs}>
        {newBudgetTypes.map((type) => {
          const active = type.value === activeType;
          return (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              key={type.value}
              onPress={() => onChangeType(type.value)}
              style={[styles.sheetTypeButton, active && styles.sheetTypeButtonActive]}
            >
              <Text style={[styles.sheetTypeText, active && styles.sheetTypeTextActive]}>{type.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {activeType === "category" ? <NewCategoryBudgetForm onClose={onClose} /> : null}
      {activeType === "project" ? <NewProjectBudgetForm onClose={onClose} /> : null}
      {activeType === "fixed" ? <NewFixedOccupancyForm onClose={onClose} /> : null}
    </BudgetSheetFrame>
  );
}

function NewCategoryBudgetForm({ onClose }: { onClose: () => void }) {
  const [threshold, setThreshold] = React.useState<BudgetThreshold>("80%");

  return (
    <View style={styles.budgetForm}>
      <FormSectionTitle subtitle="可控支出额度" title="分类预算" />
      <FormField label="分类名称" value="餐饮" />
      <View style={styles.fieldInline}>
        <FormField label="本月额度" value="¥1,200" />
        <ChoiceSelect label="提醒阈值" onChange={setThreshold} options={thresholdOptions} value={threshold} />
      </View>
      <TemplateRow labels={categoryTemplates} title="常用分类" />
      <Text style={styles.formNote}>当前提醒阈值：{threshold}。分类预算会进入总览里的可控预算使用率。</Text>
      <SheetActions onClose={onClose} primaryLabel="创建分类预算" />
    </View>
  );
}

function NewProjectBudgetForm({ onClose }: { onClose: () => void }) {
  const [threshold, setThreshold] = React.useState<BudgetThreshold>("80%");
  const [items, setItems] = React.useState<ProjectBudgetItem[]>(initialProjectBudgetItems);
  const nextItemIdRef = React.useRef(initialProjectBudgetItems.length + 1);
  const projectTotal = items.reduce((sum, item) => sum + parseBudgetAmount(item.amount), 0);

  const updateProjectItem = (id: number, patch: Partial<Pick<ProjectBudgetItem, "amount" | "name">>) => {
    setItems((currentItems) => currentItems.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const addProjectItem = () => {
    const nextId = nextItemIdRef.current;
    nextItemIdRef.current += 1;
    setItems((currentItems) => [...currentItems, { amount: "¥0", id: nextId, name: "新增预算项" }]);
  };

  const removeProjectItem = (id: number) => {
    setItems((currentItems) => (currentItems.length > 1 ? currentItems.filter((item) => item.id !== id) : currentItems));
  };

  return (
    <View style={styles.budgetForm}>
      <FormSectionTitle subtitle="预算包 · 自动汇总" title="项目预算" />
      <FormField label="项目名称" value="小红书接单" />
      <View style={styles.projectPackage}>
        <FormSectionTitle subtitle="项目总预算 = 各项预算之和" title="预算明细" />
        <View style={styles.budgetItemList}>
          {items.map((item, index) => (
            <View key={item.id} style={[styles.budgetItem, index < items.length - 1 && styles.rowDivider]}>
              <TextInput
                onChangeText={(name) => updateProjectItem(item.id, { name })}
                placeholderTextColor={theme.colors.textMuted}
                value={item.name}
                style={[styles.formInput, styles.itemNameInput]}
              />
              <TextInput
                keyboardType="numeric"
                onChangeText={(amount) => updateProjectItem(item.id, { amount })}
                placeholderTextColor={theme.colors.textMuted}
                value={item.amount}
                style={[styles.formInput, styles.itemAmountInput]}
              />
              <Pressable
                accessibilityRole="button"
                disabled={items.length <= 1}
                hitSlop={8}
                onPress={() => removeProjectItem(item.id)}
                style={[styles.removeBudgetItemButton, items.length <= 1 && styles.removeBudgetItemButtonDisabled]}
              >
                <Text style={styles.removeBudgetItemText}>×</Text>
              </Pressable>
            </View>
          ))}
        </View>
        <Pressable accessibilityRole="button" onPress={addProjectItem} style={styles.addBudgetItemButton}>
          <Text style={styles.addBudgetItemText}>＋ 添加预算项</Text>
        </Pressable>
      </View>
      <View style={styles.fieldInline}>
        <View style={styles.projectTotalBox}>
          <View>
            <Text style={styles.projectTotalLabel}>项目总预算</Text>
            <Text style={styles.projectTotalSub}>自动汇总预算明细</Text>
          </View>
          <Text style={styles.projectTotalAmount}>{formatBudgetAmount(projectTotal)}</Text>
        </View>
        <ChoiceSelect label="提醒阈值" onChange={setThreshold} options={thresholdOptions} value={threshold} />
      </View>
      <TemplateRow labels={projectTemplates} title="常用预算项" />
      <Text style={styles.formNote}>当前提醒阈值：{threshold}。项目预算是预算包，只管理投入额度；项目回报分析放在经营项目页。</Text>
      <SheetActions onClose={onClose} primaryLabel="创建项目预算" />
    </View>
  );
}

function NewFixedOccupancyForm({ onClose }: { onClose: () => void }) {
  const [paymentStatus, setPaymentStatus] = React.useState<FixedPaymentStatus>("未支付");
  const [repeatCycle, setRepeatCycle] = React.useState<FixedRepeatCycle>("每月");

  return (
    <View style={styles.budgetForm}>
      <FormSectionTitle subtitle="确定资金占用" title="固定占用" />
      <FormField label="占用名称" value="房租" />
      <View style={styles.fieldInline}>
        <FormField label="金额" value="¥2,000" />
        <FormField label="发生日期" value="5 月 20 日" />
      </View>
      <View style={styles.fieldInline}>
        <ChoiceSelect
          label="支付状态"
          onChange={setPaymentStatus}
          options={fixedPaymentStatusOptions}
          value={paymentStatus}
        />
        <ChoiceSelect
          label="重复周期"
          onChange={setRepeatCycle}
          options={fixedRepeatCycleOptions}
          value={repeatCycle}
        />
      </View>
      <Text style={styles.formNote}>当前状态：{paymentStatus} · {repeatCycle}。固定占用不进入可控预算使用率。</Text>
      <SheetActions onClose={onClose} primaryLabel="创建固定占用" />
    </View>
  );
}

function EditBudgetSheet({ onClose, visible }: { onClose: () => void; visible: boolean }) {
  return (
    <BudgetSheetFrame
      description="调整预算额度、项目投入或固定占用。不会修改已入账交易。"
      onClose={onClose}
      title="编辑本月预算"
      visible={visible}
    >
      <View style={styles.sheetOptionList}>
        {editBudgetOptions.map((option, index) => (
          <Pressable
            accessibilityRole="button"
            key={option.title}
            onPress={onClose}
            style={[styles.sheetOption, index < editBudgetOptions.length - 1 && styles.rowDivider]}
          >
            <View style={styles.sheetOptionIcon}>
              <AppIcon color={theme.colors.textSecondary} name={option.icon} size={17} strokeWidth={1.85} />
            </View>
            <View style={styles.sheetOptionText}>
              <Text numberOfLines={1} style={styles.sheetOptionTitle}>
                {option.title}
              </Text>
              <Text numberOfLines={1} style={styles.sheetOptionSubtitle}>
                {option.subtitle}
              </Text>
            </View>
            <Text style={styles.sheetOptionArrow}>›</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.sheetFoot}>预算是计划层，只和交易事实做对比，不改变报表与账本事实。</Text>
    </BudgetSheetFrame>
  );
}

function BudgetSheetFrame({
  children,
  description,
  onClose,
  title,
  visible,
}: {
  children: React.ReactNode;
  description: string;
  onClose: () => void;
  title: string;
  visible: boolean;
}) {
  return (
    <Modal animationType="fade" onRequestClose={onClose} statusBarTranslucent transparent visible={visible}>
      <View style={styles.sheetOverlay}>
        <Pressable accessibilityRole="button" onPress={onClose} style={styles.sheetBackdrop} />
        <LinearGradient
          colors={["rgba(31,36,54,0.96)", "rgba(20,24,41,0.98)", "rgba(14,17,31,0.99)"]}
          style={styles.budgetSheet}
        >
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHead}>
            <View style={styles.sheetHeadText}>
              <Text style={styles.sheetTitle}>{title}</Text>
              <Text style={styles.sheetDesc}>{description}</Text>
            </View>
            <Pressable accessibilityRole="button" hitSlop={8} onPress={onClose} style={styles.sheetCloseButton}>
              <Text style={styles.sheetCloseText}>×</Text>
            </Pressable>
          </View>
          <ScrollView
            bounces={false}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={styles.sheetScroll}
          >
            {children}
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
  );
}

function FormSectionTitle({ subtitle, title }: { subtitle: string; title: string }) {
  return (
    <View style={styles.formSectionTitle}>
      <Text style={styles.formSectionText}>{title}</Text>
      <Text style={styles.formSectionSub}>{subtitle}</Text>
    </View>
  );
}

function FormField({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>{label}</Text>
      <TextInput defaultValue={value} placeholderTextColor={theme.colors.textMuted} style={styles.formInput} />
    </View>
  );
}

function ChoiceSelect<T extends string>({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: T) => void;
  options: T[];
  value: T;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>{label}</Text>
      <Pressable accessibilityRole="button" onPress={() => setOpen((current) => !current)} style={styles.formSelect}>
        <Text style={styles.formSelectValue}>{value}</Text>
        <Text style={styles.formSelectArrow}>⌄</Text>
      </Pressable>
      {open ? (
        <View style={styles.selectMenu}>
          {options.map((option, index) => (
            <Pressable
              accessibilityRole="button"
              key={option}
              onPress={() => {
                onChange(option);
                setOpen(false);
              }}
              style={[
                styles.selectMenuOption,
                index < options.length - 1 && styles.rowDivider,
                option === value && styles.selectMenuOptionActive,
              ]}
            >
              <Text style={[styles.selectMenuText, option === value && styles.selectMenuTextActive]}>{option}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function TemplateRow({ labels, title }: { labels: string[]; title: string }) {
  return (
    <View style={styles.templateRow}>
      <Text style={styles.templateTitle}>{title}</Text>
      <View style={styles.templateChips}>
        {labels.map((label) => (
          <View key={label} style={styles.templateChip}>
            <Text style={styles.templateChipText}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function SheetActions({ onClose, primaryLabel }: { onClose: () => void; primaryLabel: string }) {
  return (
    <View style={styles.sheetActions}>
      <Pressable accessibilityRole="button" onPress={onClose} style={styles.sheetSecondaryButton}>
        <Text style={styles.sheetSecondaryText}>取消</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={onClose} style={styles.sheetPrimaryButton}>
        <Text style={styles.sheetPrimaryText}>{primaryLabel}</Text>
      </Pressable>
    </View>
  );
}

function BudgetVisualPanel({
  children,
  horizontalPadding,
}: {
  children: React.ReactNode;
  horizontalPadding: number;
}) {
  return (
    <LinearGradient
      colors={["rgba(255,255,255,0.075)", "rgba(255,255,255,0.028)", "rgba(255,255,255,0.035)"]}
      style={[
        styles.budgetVisual,
        {
          marginLeft: -horizontalPadding,
          marginRight: -horizontalPadding,
          paddingHorizontal: horizontalPadding,
        },
      ]}
    >
      {children}
    </LinearGradient>
  );
}

function BudgetProgressRow({ last, row }: { last?: boolean; row: BudgetRow }) {
  return (
    <View style={[styles.budgetRow, !last && styles.rowDivider]}>
      <View style={styles.budgetMain}>
        <View style={styles.budgetTitleRow}>
          <Text numberOfLines={1} style={styles.budgetRowTitle}>
            {row.title}
          </Text>
          <Text numberOfLines={1} style={styles.budgetRowMeta}>
            {row.amount}
          </Text>
        </View>
        <ProgressBar progress={row.progress} tone={row.tone} />
      </View>
      <View style={styles.budgetRight}>
        <Text style={[styles.budgetPercent, getBudgetToneStyle(row.tone)]}>{row.detail ?? `${row.progress}%`}</Text>
        {row.rightSub ? <Text style={[styles.budgetRightSub, getBudgetToneStyle(row.tone)]}>{row.rightSub}</Text> : null}
      </View>
    </View>
  );
}

function FixedSummaryRow({
  amount,
  detail,
  last,
  subtitle,
  title,
  tone = "default",
}: {
  amount: string;
  detail?: string;
  last?: boolean;
  subtitle: string;
  title: string;
  tone?: BudgetTone;
}) {
  return (
    <View style={[styles.fixedSummaryRow, !last && styles.rowDivider]}>
      <View style={styles.budgetMain}>
        <Text numberOfLines={1} style={styles.budgetRowTitle}>
          {title}
        </Text>
        <Text numberOfLines={1} style={styles.fixedSubtitle}>
          {subtitle}
        </Text>
      </View>
      <View style={styles.budgetRight}>
        <Text style={[styles.fixedAmount, getBudgetToneStyle(tone)]}>{amount}</Text>
        {detail ? <Text style={styles.budgetRightSub}>{detail}</Text> : null}
      </View>
    </View>
  );
}

function CategoryBudgetRowView({ last, row }: { last?: boolean; row: CategoryBudgetRow }) {
  return (
    <View style={[styles.rankRow, !last && styles.rowDivider]}>
      <View style={styles.rankNumber}>
        <Text style={styles.rankNumberText}>{row.rank}</Text>
      </View>
      <View style={styles.budgetMain}>
        <Text style={styles.budgetRowTitle}>{row.title}</Text>
        <View style={styles.rankMeta}>
          <Text style={styles.budgetRowMeta}>{row.amount}</Text>
          {row.detail ? <Text style={[styles.budgetRowMeta, getBudgetToneStyle(row.tone)]}>{row.detail}</Text> : null}
        </View>
        <ProgressBar progress={row.progress} tone={row.tone} />
      </View>
      <View style={styles.rankRight}>
        <Text style={[styles.budgetPercent, getBudgetToneStyle(row.tone)]}>{row.percent}</Text>
        {row.status ? <Text style={styles.budgetRightSub}>{row.status}</Text> : null}
      </View>
    </View>
  );
}

function ProjectBudgetRowView({ last, row }: { last?: boolean; row: ProjectBudgetRow }) {
  return (
    <View style={[styles.projectBudgetRow, !last && styles.rowDivider]}>
      <View style={styles.budgetMain}>
        <Text style={styles.budgetRowTitle}>{row.title}</Text>
        <Text numberOfLines={1} style={styles.projectNote}>
          {row.amount} · {row.remaining}
        </Text>
        <ProgressBar progress={row.progress} tone={row.tone} />
      </View>
      <View style={styles.projectRight}>
        <Text style={[styles.budgetPercent, getBudgetToneStyle(row.tone)]}>{row.status}</Text>
      </View>
    </View>
  );
}

function FixedOccupancyRowView({ last, row }: { last?: boolean; row: FixedOccupancyRow }) {
  return (
    <View style={[styles.fixedOccupancyRow, !last && styles.rowDivider]}>
      <View style={styles.budgetMain}>
        <Text numberOfLines={1} style={styles.budgetRowTitle}>
          {row.title}
          <Text style={styles.inlineDate}> {row.date}</Text>
        </Text>
        <Text numberOfLines={1} style={styles.fixedSubtitle}>
          {row.subtitle}
        </Text>
      </View>
      <View style={styles.budgetRight}>
        <Text style={[styles.fixedAmount, getBudgetToneStyle(row.tone)]}>{row.amount}</Text>
        <Text style={[styles.budgetRightSub, getBudgetToneStyle(row.tone)]}>{row.status}</Text>
      </View>
    </View>
  );
}

function ProgressBar({
  progress,
  size = "small",
  tone: _tone = "default",
}: {
  progress: number;
  size?: "large" | "small";
  tone?: BudgetTone;
}) {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  return (
    <View style={[styles.progressTrack, size === "large" && styles.progressTrackLarge]}>
      <LinearGradient
        colors={[theme.colors.success, theme.colors.warning, theme.colors.danger]}
        end={{ x: 1, y: 0 }}
        pointerEvents="none"
        start={{ x: 0, y: 0 }}
        style={[styles.progressFill, size === "large" && styles.progressFillLarge, { width: `${clampedProgress}%` }]}
      />
    </View>
  );
}

function RecentEventRow({ last, transaction }: { last?: boolean; transaction: Transaction }) {
  const positive = transaction.type === "income";
  const tone: LedgerRowTone = positive ? "green" : transaction.cashFlowType === "nonCash" ? "blue" : "default";
  const amountPrefix = positive ? "+" : transaction.cashFlowType === "nonCash" ? "" : "-";
  const title = [transaction.note || transaction.category, transaction.accountId ? "账户" : ""].filter(Boolean).join(" · ");

  return (
    <TransactionListRow
      amount={`${amountPrefix}${formatLedgerCurrency(Math.abs(transaction.amount))}`}
      horizontalPadding={0}
      last={last}
      time={formatRecentEventTime(transaction)}
      title={title || "财务事件"}
      tone={tone}
    />
  );
}

function formatRecentEventTime(transaction: Transaction) {
  const createdAt = new Date(transaction.createdAt);

  if (!Number.isNaN(createdAt.getTime())) {
    const hours = String(createdAt.getHours()).padStart(2, "0");
    const minutes = String(createdAt.getMinutes()).padStart(2, "0");
    if (hours !== "00" || minutes !== "00") return `${hours}:${minutes}`;
  }

  const [, month, day] = transaction.date.split("-");
  return month && day ? `${month}.${day}` : transaction.date;
}

function formatLedgerCurrency(value: number) {
  return formatCurrency(value).replace("CN¥", "¥");
}

function parseBudgetAmount(value: string) {
  const numericValue = Number(value.replace(/[^\d.-]/g, ""));
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function formatBudgetAmount(value: number) {
  return `¥${Math.round(value).toLocaleString("zh-CN")}`;
}

function getBudgetToneStyle(tone?: BudgetTone) {
  if (tone === "amber") return styles.toneAmber;
  if (tone === "blue") return styles.toneBlue;
  if (tone === "danger") return styles.toneDanger;
  if (tone === "green") return styles.toneGreen;
  return styles.toneDefault;
}

const styles = StyleSheet.create({
  addBudgetItemButton: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    height: 36,
    justifyContent: "center",
    marginTop: 8,
  },
  addBudgetItemText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "800",
  },
  budgetForm: {
    gap: 10,
    paddingBottom: 4,
  },
  budgetItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    paddingVertical: 7,
  },
  budgetItemList: {
    borderBottomColor: "rgba(255,255,255,0.085)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.085)",
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  budgetSheet: {
    borderColor: "rgba(255,255,255,0.12)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    bottom: 0,
    left: 0,
    maxHeight: "80%",
    paddingBottom: 22,
    paddingHorizontal: 14,
    paddingTop: 8,
    position: "absolute",
    right: 0,
  },
  budgetBackButton: {
    alignItems: "center",
    height: 38,
    justifyContent: "center",
    marginLeft: -8,
    width: 34,
  },
  budgetBackTitle: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 8,
    minWidth: 0,
  },
  budgetEditButton: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  budgetEditText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "800",
  },
  budgetHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    minHeight: 52,
  },
  budgetMain: {
    flex: 1,
    minWidth: 0,
  },
  budgetPanel: {
    gap: 8,
  },
  budgetPercent: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontVariant: ["tabular-nums"],
    fontWeight: "900",
    textAlign: "right",
  },
  budgetPeriod: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  budgetPeriodDesc: {
    color: theme.colors.textMuted,
    fontSize: 11,
  },
  budgetPeriodTitle: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
  budgetRight: {
    alignItems: "flex-end",
    minWidth: 66,
  },
  budgetRightSub: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: "700",
    marginTop: 4,
    textAlign: "right",
  },
  budgetRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    paddingVertical: 13,
  },
  budgetRowMeta: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontVariant: ["tabular-nums"],
    fontWeight: "700",
  },
  budgetRowTitle: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
  budgetTab: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.035)",
    borderColor: "rgba(255,255,255,0.09)",
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    height: 34,
    justifyContent: "center",
  },
  budgetTabActive: {
    backgroundColor: "rgba(255,93,187,0.12)",
    borderColor: "rgba(255,93,187,0.34)",
  },
  budgetTabText: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
  },
  budgetTabTextActive: {
    color: theme.colors.textPrimary,
  },
  budgetTabs: {
    flexDirection: "row",
    gap: 5,
  },
  budgetTitleRow: {
    alignItems: "baseline",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
    marginBottom: 7,
  },
  budgetToolbar: {
    alignItems: "center",
    borderBottomColor: "rgba(255,255,255,0.08)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.08)",
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  budgetVisual: {
    borderBottomColor: "rgba(255,255,255,0.085)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.085)",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: 14,
  },
  fieldInline: {
    flexDirection: "row",
    gap: 8,
  },
  formField: {
    flex: 1,
    gap: 6,
    minWidth: 0,
  },
  formInput: {
    backgroundColor: "rgba(255,255,255,0.045)",
    borderColor: "rgba(255,255,255,0.09)",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontVariant: ["tabular-nums"],
    fontWeight: "800",
    minHeight: 39,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  formLabel: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: "800",
  },
  formNote: {
    color: theme.colors.textMuted,
    fontSize: 10,
    lineHeight: 15,
  },
  formSectionSub: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: "700",
  },
  formSectionText: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: "900",
  },
  formSectionTitle: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
  formSelect: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.045)",
    borderColor: "rgba(255,255,255,0.09)",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 39,
    paddingHorizontal: 11,
  },
  formSelectArrow: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: "900",
  },
  formSelectValue: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontVariant: ["tabular-nums"],
    fontWeight: "800",
  },
  itemAmountInput: {
    maxWidth: 92,
    textAlign: "right",
  },
  itemNameInput: {
    flex: 1,
  },
  removeBudgetItemButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.045)",
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  removeBudgetItemButtonDisabled: {
    opacity: 0.35,
  },
  removeBudgetItemText: {
    color: theme.colors.textMuted,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 20,
  },
  newBudgetSummary: {
    backgroundColor: "rgba(74,222,128,0.07)",
    borderColor: "rgba(74,222,128,0.14)",
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 3,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  newBudgetSummaryText: {
    color: theme.colors.textMuted,
    fontSize: 10,
    lineHeight: 14,
  },
  newBudgetSummaryTitle: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "900",
  },
  optionGroup: {
    gap: 7,
  },
  optionGroupTitle: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: "800",
  },
  projectPackage: {
    backgroundColor: "rgba(255,255,255,0.026)",
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 8,
    padding: 10,
  },
  projectTotalAmount: {
    color: theme.colors.textPrimary,
    fontSize: 17,
    fontVariant: ["tabular-nums"],
    fontWeight: "900",
  },
  projectTotalBox: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.045)",
    borderColor: "rgba(255,255,255,0.09)",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
    minHeight: 55,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  projectTotalLabel: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: "800",
  },
  projectTotalSub: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 3,
  },
  cashAxis: {
    backgroundColor: "rgba(255,255,255,0.13)",
    height: StyleSheet.hairlineWidth,
    left: 5,
    position: "absolute",
    right: 5,
    top: 44,
  },
  cashDate: {
    color: theme.colors.textMuted,
    fontSize: 9,
    marginTop: 3,
    textAlign: "center",
  },
  cashEvent: {
    alignItems: "center",
    marginLeft: -29,
    position: "absolute",
    top: 0,
    width: 58,
  },
  cashList: {
    borderTopColor: "rgba(255,255,255,0.10)",
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 8,
  },
  cashflowRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    paddingVertical: 13,
  },
  cashflowSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 7,
  },
  cashPin: {
    backgroundColor: "rgba(255,255,255,0.55)",
    borderColor: "#090c1d",
    borderRadius: 999,
    borderWidth: 2,
    height: 12,
    marginBottom: 7,
    marginTop: 38,
    width: 12,
  },
  cashPinAmber: {
    backgroundColor: theme.colors.warning,
  },
  cashTitle: {
    color: theme.colors.textPrimary,
    fontSize: 11,
    fontWeight: "800",
  },
  cashWeek: {
    height: 92,
    marginBottom: 8,
    marginTop: 2,
    position: "relative",
  },
  chipAmber: {
    backgroundColor: "rgba(251,191,36,0.08)",
    borderColor: "rgba(251,191,36,0.18)",
  },
  chipBlue: {
    backgroundColor: "rgba(96,165,250,0.08)",
    borderColor: "rgba(96,165,250,0.18)",
  },
  chipDanger: {
    backgroundColor: "rgba(248,113,113,0.08)",
    borderColor: "rgba(248,113,113,0.18)",
  },
  chipDefault: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.10)",
  },
  chipGreen: {
    backgroundColor: "rgba(74,222,128,0.08)",
    borderColor: "rgba(74,222,128,0.18)",
  },
  entryArrow: {
    color: "rgba(255,255,255,0.36)",
    fontSize: 16,
    fontWeight: "800",
  },
  entryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  entryIcon: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.035)",
    borderColor: "rgba(255,255,255,0.09)",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  entrySubtitle: {
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  entryTile: {
    backgroundColor: "rgba(255,255,255,0.045)",
    borderColor: "rgba(255,255,255,0.085)",
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    flexBasis: "48.8%",
    flexGrow: 1,
    gap: 7,
    minHeight: 106,
    padding: 12,
  },
  entryTitle: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
  entryTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  fillAmber: {
    backgroundColor: theme.colors.warning,
  },
  fillBlue: {
    backgroundColor: theme.colors.blueText,
  },
  fillDanger: {
    backgroundColor: theme.colors.danger,
  },
  fillDefault: {
    backgroundColor: "rgba(255,255,255,0.62)",
  },
  fillGreen: {
    backgroundColor: theme.colors.success,
  },
  fixedAmount: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontVariant: ["tabular-nums"],
    fontWeight: "900",
    textAlign: "right",
  },
  fixedOccupancyRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    minHeight: 58,
    paddingVertical: 12,
  },
  fixedSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 5,
  },
  fixedSummaryRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    minHeight: 58,
    paddingVertical: 12,
  },
  glassAddButton: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 13,
    borderWidth: StyleSheet.hairlineWidth,
    height: 36,
    justifyContent: "center",
    overflow: "hidden",
    width: 36,
  },
  legendDot: {
    borderRadius: 999,
    height: 6,
    width: 6,
  },
  legendItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    minWidth: 0,
  },
  legendText: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: "700",
  },
  inlineDate: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
  },
  moduleDesc: {
    color: theme.colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    paddingHorizontal: 2,
  },
  netChip: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 23,
    minWidth: 56,
    paddingHorizontal: 8,
  },
  netChipText: {
    fontSize: 10,
    fontVariant: ["tabular-nums"],
    fontWeight: "800",
    lineHeight: 22,
  },
  pageTitle: {
    color: theme.colors.textPrimary,
    flexShrink: 1,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 40,
  },
  progressFill: {
    borderRadius: 999,
    height: "100%",
  },
  progressFillLarge: {
    backgroundColor: theme.colors.warning,
  },
  progressTrack: {
    backgroundColor: "rgba(255,255,255,0.075)",
    borderRadius: 999,
    height: 6,
    overflow: "hidden",
  },
  progressTrackLarge: {
    height: 12,
    marginBottom: 12,
  },
  projectBudgetRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingVertical: 14,
  },
  projectNote: {
    color: theme.colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 8,
    marginTop: 4,
  },
  projectRight: {
    alignItems: "flex-end",
    minWidth: 74,
  },
  rankMeta: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
    marginBottom: 6,
    marginTop: 7,
  },
  rankNumber: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.045)",
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 9,
    borderWidth: StyleSheet.hairlineWidth,
    height: 25,
    justifyContent: "center",
    width: 25,
  },
  rankNumberText: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: "800",
  },
  rankRight: {
    alignItems: "flex-end",
    minWidth: 58,
  },
  rankRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    paddingVertical: 13,
  },
  rowDivider: {
    borderBottomColor: "rgba(255,255,255,0.08)",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  screen: {
    backgroundColor: theme.colors.background,
  },
  selectMenu: {
    backgroundColor: "rgba(20,24,41,0.98)",
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  selectMenuOption: {
    paddingHorizontal: 11,
    paddingVertical: 10,
  },
  selectMenuOptionActive: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  selectMenuText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
  },
  selectMenuTextActive: {
    color: theme.colors.textPrimary,
  },
  sheetActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.42)",
  },
  sheetCloseButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.055)",
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  sheetCloseText: {
    color: theme.colors.textSecondary,
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 22,
  },
  sheetDesc: {
    color: theme.colors.textMuted,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 5,
  },
  sheetFoot: {
    color: theme.colors.textMuted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 12,
    paddingHorizontal: 2,
  },
  sheetHandle: {
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.28)",
    borderRadius: 999,
    height: 4,
    marginBottom: 14,
    marginTop: 2,
    width: 42,
  },
  sheetHead: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sheetHeadText: {
    flex: 1,
    minWidth: 0,
  },
  sheetOption: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    minHeight: 60,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  sheetOptionArrow: {
    color: "rgba(255,255,255,0.34)",
    fontSize: 19,
    fontWeight: "700",
  },
  sheetOptionIcon: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.045)",
    borderColor: "rgba(255,255,255,0.09)",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  sheetOptionList: {
    backgroundColor: "rgba(255,255,255,0.026)",
    borderBottomColor: "rgba(255,255,255,0.085)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.085)",
    borderTopWidth: StyleSheet.hairlineWidth,
    marginHorizontal: -14,
  },
  sheetOptionSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 10,
    lineHeight: 14,
  },
  sheetOptionText: {
    flex: 1,
    minWidth: 0,
  },
  sheetOptionTitle: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 4,
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheetPrimaryButton: {
    alignItems: "center",
    backgroundColor: theme.colors.success,
    borderRadius: 14,
    flex: 1,
    height: 38,
    justifyContent: "center",
  },
  sheetPrimaryText: {
    color: "#07120c",
    fontSize: 12,
    fontWeight: "900",
  },
  sheetScroll: {
    maxHeight: 560,
  },
  sheetSecondaryButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.045)",
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    height: 38,
    justifyContent: "center",
  },
  sheetSecondaryText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "900",
  },
  sheetTitle: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 21,
  },
  sheetTypeButton: {
    alignItems: "center",
    borderRadius: 999,
    flex: 1,
    height: 30,
    justifyContent: "center",
  },
  sheetTypeButtonActive: {
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  sheetTypeTabs: {
    backgroundColor: "rgba(255,255,255,0.035)",
    borderColor: "rgba(255,255,255,0.075)",
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 3,
    marginBottom: 12,
    padding: 3,
  },
  sheetTypeText: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
  },
  sheetTypeTextActive: {
    color: theme.colors.textPrimary,
  },
  scrollContent: {
    gap: 14,
    paddingBottom: 176,
    paddingTop: 18,
  },
  stackBar: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 999,
    flexDirection: "row",
    height: 16,
    marginBottom: 8,
    marginTop: 10,
    overflow: "hidden",
  },
  stackLegend: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
  stackSegFlex: {
    backgroundColor: "rgba(255,255,255,0.28)",
  },
  stackSegGrowth: {
    backgroundColor: theme.colors.success,
  },
  stackSegLife: {
    backgroundColor: "rgba(255,255,255,0.52)",
  },
  stackSegProject: {
    backgroundColor: theme.colors.blueText,
  },
  templateChip: {
    backgroundColor: "rgba(255,255,255,0.048)",
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  templateChipText: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: "800",
  },
  templateChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  templateRow: {
    gap: 8,
  },
  templateTitle: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: "800",
  },
  toneAmber: {
    color: theme.colors.warning,
  },
  toneBlue: {
    color: theme.colors.blueText,
  },
  toneDanger: {
    color: theme.colors.danger,
  },
  toneDefault: {
    color: theme.colors.textPrimary,
  },
  toneGreen: {
    color: theme.colors.success,
  },
  visualAmount: {
    color: theme.colors.textPrimary,
    fontSize: 24,
    fontVariant: ["tabular-nums"],
    fontWeight: "900",
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  visualHead: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    marginBottom: 12,
  },
  visualLabel: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 5,
  },
  visualPercent: {
    color: theme.colors.warning,
    fontSize: 18,
    fontVariant: ["tabular-nums"],
    fontWeight: "900",
    lineHeight: 20,
  },
  visualRight: {
    alignItems: "flex-end",
  },
  visualSub: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: "700",
    marginTop: 5,
  },
});
