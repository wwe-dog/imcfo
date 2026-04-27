import type {
  Account,
  AppSettings,
  Asset,
  JournalEntry,
  Liability,
  ReportPeriod,
  Transaction,
} from "../domain/models";

export const APP_VERSION = "0.1.0";

const now = "2026-04-27T00:00:00.000Z";

export interface AppData {
  version: string;
  accounts: Account[];
  transactions: Transaction[];
  assets: Asset[];
  liabilities: Liability[];
  journalEntries: JournalEntry[];
  settings: AppSettings;
  currentPeriod: ReportPeriod;
}

export const seedData: AppData = {
  version: APP_VERSION,
  accounts: [
    {
      id: "account-bank-1",
      name: "招商银行卡",
      type: "bank",
      balance: 10000,
      currency: "CNY",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "account-credit-card-1",
      name: "信用卡",
      type: "creditCard",
      balance: -2100,
      currency: "CNY",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ],
  assets: [
    {
      id: "asset-bank-1",
    name: "招商银行卡余额",
      category: "bankDeposit",
      amount: 10000,
      valuationMethod: "currentValue",
      currentValue: 10000,
      accountId: "account-bank-1",
    note: "本地示例现金资产",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "asset-fund-1",
      name: "基金持仓",
      category: "investment",
      amount: 2000,
      valuationMethod: "manual",
      currentValue: 2000,
      accountId: "account-bank-1",
    note: "本地示例投资资产",
      createdAt: now,
      updatedAt: now,
    },
  ],
  liabilities: [
    {
      id: "liability-credit-card-1",
      name: "信用卡应还款",
      category: "creditCard",
      amount: 2100,
      accountId: "account-credit-card-1",
    note: "本地示例信用卡负债",
      createdAt: now,
      updatedAt: now,
    },
  ],
  transactions: [
    {
      id: "tx-income-1",
      date: "2026-04-05",
      amount: 8000,
      type: "income",
      category: "工资薪金",
      accountId: "account-bank-1",
      cashFlowType: "operating",
      note: "工资到账",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "tx-expense-1",
      date: "2026-04-06",
      amount: 1200,
      type: "expense",
      category: "餐饮",
      accountId: "account-bank-1",
      cashFlowType: "operating",
    note: "餐饮支出",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "tx-investment-1",
      date: "2026-04-10",
      amount: 2000,
      type: "investmentBuy",
    category: "投资资产",
      accountId: "account-bank-1",
      relatedAssetId: "asset-fund-1",
      cashFlowType: "investing",
    note: "买入基金，不直接影响本期利润",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "tx-credit-card-1",
      date: "2026-04-12",
      amount: 100,
      type: "expense",
      category: "餐饮",
      accountId: "account-credit-card-1",
      relatedLiabilityId: "liability-credit-card-1",
      cashFlowType: "nonCash",
    note: "信用卡消费，不产生现金流",
      createdAt: now,
      updatedAt: now,
    },
  ],
  journalEntries: [
    {
      id: "journal-income-1",
      transactionId: "tx-income-1",
      date: "2026-04-05",
      description: "工资到账",
      lines: [
        {
          accountCode: "1002",
          accountName: "银行存款",
          debit: 8000,
          credit: 0,
          reportElement: "asset",
        },
        {
          accountCode: "6001",
          accountName: "工资薪金收入",
          debit: 0,
          credit: 8000,
          reportElement: "income",
        },
      ],
      createdAt: now,
      updatedAt: now,
    },
  ],
  settings: {
    currency: "CNY",
    defaultPeriod: "month",
    defaultReportMode: "simple",
    enableSampleData: true,
    createdAt: now,
    updatedAt: now,
  },
  currentPeriod: {
    id: "period-2026-04",
    type: "month",
    startDate: "2026-04-01",
    endDate: "2026-04-30",
    label: "2026 年 4 月",
  },
};

export const createEmptyAppData = (): AppData => ({
  version: APP_VERSION,
  accounts: [],
  transactions: [],
  assets: [],
  liabilities: [],
  journalEntries: [],
  settings: {
    ...seedData.settings,
  },
  currentPeriod: {
    ...seedData.currentPeriod,
  },
});
