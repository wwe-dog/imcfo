import type { Account, Asset, CashFlowType, Liability, Transaction, TransactionType } from "../models";

export interface TransactionRule {
  type: TransactionType;
  label: string;
  cashFlowType: CashFlowType;
  accountingEffect: string;
  limitation?: string;
}

export interface TransactionInput {
  type: TransactionType;
  amount: number;
  category: string;
  accountId: string;
  counterAccountId?: string;
  date: string;
  note?: string;
  relatedAssetId?: string;
  relatedLiabilityId?: string;
}

export interface FinancialState {
  accounts: Account[];
  assets: Asset[];
  liabilities: Liability[];
  transactions: Transaction[];
}

export interface AssetInput {
  id?: string;
  name: string;
  category: Asset["category"];
  amount: number;
  accountId?: string;
  note?: string;
}

export interface LiabilityInput {
  id?: string;
  name: string;
  category: Liability["category"];
  amount: number;
  dueDate?: string;
  note?: string;
}

export interface AccountInput {
  id?: string;
  name: string;
  type: Account["type"];
  balance: number;
  isEnabled: boolean;
  note?: string;
  creditLimit?: number;
  currentDebt?: number;
  billDay?: number;
  repaymentDay?: number;
}

export const transactionRules: TransactionRule[] = [
  {
    type: "income",
    label: "收入",
    cashFlowType: "operating",
    accountingEffect: "资产增加，收入增加，经营活动现金流入。",
  },
  {
    type: "expense",
    label: "支出",
    cashFlowType: "operating",
    accountingEffect: "费用增加，资产减少，经营活动现金流出。",
  },
  {
    type: "assetIncrease",
    label: "资产增加",
    cashFlowType: "nonCash",
    accountingEffect: "资产增加，暂不自动确认为收入。",
  },
  {
    type: "assetDecrease",
    label: "资产减少",
    cashFlowType: "nonCash",
    accountingEffect: "资产减少，暂不自动确认为费用。",
  },
  {
    type: "liabilityIncrease",
    label: "负债增加",
    cashFlowType: "financing",
    accountingEffect: "负债增加，通常对应筹资活动现金流入。",
  },
  {
    type: "liabilityDecrease",
    label: "负债减少",
    cashFlowType: "financing",
    accountingEffect: "负债减少，通常对应筹资活动现金流出。",
  },
  {
    type: "receivableRecognize",
    label: "应收确认",
    cashFlowType: "nonCash",
    accountingEffect: "应收资产增加，现金不增加，不产生现金流。",
  },
  {
    type: "receivableCollect",
    label: "应收收回",
    cashFlowType: "operating",
    accountingEffect: "现金增加，应收资产减少，不重复确认收入。",
  },
  {
    type: "payableRecognize",
    label: "应付确认",
    cashFlowType: "nonCash",
    accountingEffect: "应付负债增加，现金不变，不产生现金流。",
  },
  {
    type: "payablePay",
    label: "应付支付",
    cashFlowType: "operating",
    accountingEffect: "现金减少，应付负债减少，不重复确认费用。",
  },
  {
    type: "transfer",
    label: "转账",
    cashFlowType: "nonCash",
    accountingEffect: "账户之间转移，不影响收入、费用或利润。",
  },
  {
    type: "investmentBuy",
    label: "投资买入",
    cashFlowType: "investing",
    accountingEffect: "投资资产增加，现金资产减少，投资活动现金流出，不直接影响利润表。",
  },
  {
    type: "investmentSell",
    label: "投资卖出",
    cashFlowType: "investing",
    accountingEffect: "现金资产增加，投资资产减少，投资活动现金流入。",
    limitation: "V0.1 暂无成本基础字段，投资卖出默认不确认投资收益或亏损。",
  },
  {
    type: "repayment",
    label: "还款",
    cashFlowType: "financing",
    accountingEffect: "负债减少，资产减少，筹资活动现金流出。",
  },
  {
    type: "creditCardExpense",
    label: "信用卡消费",
    cashFlowType: "nonCash",
    accountingEffect: "费用增加，负债增加，不产生现金流出。",
  },
  {
    type: "creditCardRepayment",
    label: "信用卡还款",
    cashFlowType: "financing",
    accountingEffect: "负债减少，资产减少，筹资活动现金流出。",
  },
];

export const getTransactionRule = (type: TransactionType): TransactionRule =>
  transactionRules.find((rule) => rule.type === type) ?? transactionRules[0];

export const createTransactionFromInput = (input: TransactionInput): Transaction => {
  const rule = getTransactionRule(input.type);
  const timestamp = new Date().toISOString();

  return {
    id: `tx-${Date.now()}`,
    date: input.date,
    amount: input.amount,
    type: input.type,
    category: input.category.trim(),
    accountId: input.accountId,
    counterAccountId: input.counterAccountId,
    cashFlowType: rule.cashFlowType,
    note: input.note?.trim() || rule.limitation,
    relatedAssetId: input.relatedAssetId,
    relatedLiabilityId: input.relatedLiabilityId,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

const updateAccountBalance = (accounts: Account[], accountId: string, delta: number): Account[] =>
  accounts.map((account) =>
    account.id === accountId
      ? {
          ...account,
          balance: account.balance + delta,
          updatedAt: new Date().toISOString(),
        }
      : account,
  );

const updateCreditCardDebt = (accounts: Account[], accountId: string, delta: number): Account[] =>
  accounts.map((account) => {
    if (account.id !== accountId || account.type !== "creditCard") return account;

    const currentDebt = Math.max(0, (account.currentDebt ?? Math.max(0, -account.balance)) + delta);
    return {
      ...account,
      balance: 0,
      currentDebt,
      updatedAt: new Date().toISOString(),
    };
  });

const updateAssetByAccount = (assets: Asset[], accountId: string, delta: number): Asset[] => {
  const linkedAssets = assets.filter((asset) => asset.accountId === accountId);
  if (linkedAssets.length !== 1) return assets;

  return assets.map((asset) =>
    asset.accountId === accountId
      ? {
          ...asset,
          amount: Math.max(0, asset.amount + delta),
          currentValue: Math.max(0, asset.currentValue + delta),
          updatedAt: new Date().toISOString(),
        }
      : asset,
  );
};

const updateAssetById = (assets: Asset[], assetId: string | undefined, delta: number): Asset[] => {
  if (!assetId || !assets.some((asset) => asset.id === assetId)) return assets;

  return assets.map((asset) =>
    asset.id === assetId
      ? {
          ...asset,
          amount: Math.max(0, asset.amount + delta),
          currentValue: Math.max(0, asset.currentValue + delta),
          updatedAt: new Date().toISOString(),
        }
      : asset,
  );
};

const updateLiabilityById = (
  liabilities: Liability[],
  liabilityId: string | undefined,
  delta: number,
): Liability[] => {
  if (!liabilityId || !liabilities.some((liability) => liability.id === liabilityId)) return liabilities;

  return liabilities.map((liability) =>
    liability.id === liabilityId
      ? {
          ...liability,
          amount: Math.max(0, liability.amount + delta),
          updatedAt: new Date().toISOString(),
        }
      : liability,
  );
};

const updateLiabilityByIdStrict = (
  liabilities: Liability[],
  liabilityId: string | undefined,
  delta: number,
): Liability[] => {
  if (!liabilityId || !liabilities.some((liability) => liability.id === liabilityId)) return liabilities;

  return liabilities.map((liability) =>
    liability.id === liabilityId
      ? {
          ...liability,
          amount: Math.max(0, liability.amount + delta),
          updatedAt: new Date().toISOString(),
        }
      : liability,
  );
};

const findLiabilityAccountId = (liabilities: Liability[], liabilityId: string | undefined): string | undefined =>
  liabilities.find((liability) => liability.id === liabilityId)?.accountId;

const findFirstCreditCardAccountId = (accounts: Account[]): string | undefined =>
  accounts.find((account) => account.type === "creditCard")?.id;

const updateLiabilityByIdOrAccount = (
  liabilities: Liability[],
  liabilityId: string | undefined,
  accountId: string | undefined,
  delta: number,
): Liability[] => {
  if (liabilityId && liabilities.some((liability) => liability.id === liabilityId)) {
    return updateLiabilityById(liabilities, liabilityId, delta);
  }

  if (accountId && liabilities.some((liability) => liability.accountId === accountId)) {
    return liabilities.map((liability) =>
      liability.accountId === accountId
        ? {
            ...liability,
            amount: Math.max(0, liability.amount + delta),
            updatedAt: new Date().toISOString(),
          }
        : liability,
    );
  }

  return liabilities;
};

const syncAssetsByAccountBalance = (assets: Asset[], accountId: string, balance: number): Asset[] => {
  const linkedAssets = assets.filter((asset) => asset.accountId === accountId);
  // Only one-to-one account/asset links are safe to sync. Investment accounts can
  // hold multiple asset records, so copying one account balance into every linked
  // asset would overstate the balance sheet.
  if (linkedAssets.length !== 1) return assets;

  return assets.map((asset) =>
    asset.accountId === accountId
      ? {
          ...asset,
          amount: Math.max(0, balance),
          currentValue: Math.max(0, balance),
          updatedAt: new Date().toISOString(),
        }
      : asset,
  );
};

const syncLiabilitiesByAccountDebt = (
  liabilities: Liability[],
  accountId: string,
  currentDebt: number,
): Liability[] =>
  liabilities.map((liability) =>
    liability.accountId === accountId
      ? {
          ...liability,
          amount: Math.max(0, currentDebt),
          updatedAt: new Date().toISOString(),
        }
      : liability,
  );

export const applyTransactionToFinancialState = <T extends FinancialState>(
  state: T,
  transaction: Transaction,
): T => {
  let accounts = state.accounts;
  let assets = state.assets;
  let liabilities = state.liabilities;

  switch (transaction.type) {
    case "income":
      accounts = updateAccountBalance(accounts, transaction.accountId, transaction.amount);
      assets = updateAssetByAccount(assets, transaction.accountId, transaction.amount);
      break;
    case "expense":
      accounts = updateAccountBalance(accounts, transaction.accountId, -transaction.amount);
      assets = updateAssetByAccount(assets, transaction.accountId, -transaction.amount);
      break;
    case "assetIncrease":
      if (transaction.cashFlowType === "nonCash") {
        assets = updateAssetById(assets, transaction.relatedAssetId, transaction.amount);
      } else {
        accounts = updateAccountBalance(accounts, transaction.accountId, transaction.amount);
        assets = updateAssetByAccount(assets, transaction.accountId, transaction.amount);
      }
      break;
    case "assetDecrease":
      if (transaction.cashFlowType === "nonCash") {
        assets = updateAssetById(assets, transaction.relatedAssetId, -transaction.amount);
      } else {
        accounts = updateAccountBalance(accounts, transaction.accountId, -transaction.amount);
        assets = updateAssetByAccount(assets, transaction.accountId, -transaction.amount);
      }
      break;
    case "investmentBuy":
      accounts = updateAccountBalance(accounts, transaction.accountId, -transaction.amount);
      assets = updateAssetByAccount(assets, transaction.accountId, -transaction.amount);
      assets = updateAssetById(assets, transaction.relatedAssetId, transaction.amount);
      break;
    case "investmentSell":
      accounts = updateAccountBalance(accounts, transaction.accountId, transaction.amount);
      assets = updateAssetByAccount(assets, transaction.accountId, transaction.amount);
      assets = updateAssetById(assets, transaction.relatedAssetId, -transaction.amount);
      break;
    case "liabilityIncrease":
      if (transaction.cashFlowType !== "nonCash") {
        accounts = updateAccountBalance(accounts, transaction.accountId, transaction.amount);
        assets = updateAssetByAccount(assets, transaction.accountId, transaction.amount);
      }
      liabilities = updateLiabilityByIdOrAccount(
        liabilities,
        transaction.relatedLiabilityId,
        transaction.counterAccountId ?? transaction.accountId,
        transaction.amount,
      );
      break;
    case "liabilityDecrease":
    case "repayment":
      if (transaction.cashFlowType !== "nonCash") {
        accounts = updateAccountBalance(accounts, transaction.accountId, -transaction.amount);
        assets = updateAssetByAccount(assets, transaction.accountId, -transaction.amount);
      }
      liabilities = updateLiabilityByIdOrAccount(
        liabilities,
        transaction.relatedLiabilityId,
        transaction.counterAccountId ?? transaction.accountId,
        -transaction.amount,
      );
      break;
    case "receivableRecognize":
      assets = updateAssetById(assets, transaction.relatedAssetId, transaction.amount);
      break;
    case "receivableCollect":
      if (transaction.relatedAssetId && assets.some((asset) => asset.id === transaction.relatedAssetId)) {
        accounts = updateAccountBalance(accounts, transaction.accountId, transaction.amount);
        assets = updateAssetByAccount(assets, transaction.accountId, transaction.amount);
        assets = updateAssetById(assets, transaction.relatedAssetId, -transaction.amount);
      }
      break;
    case "payableRecognize":
      liabilities = updateLiabilityByIdStrict(liabilities, transaction.relatedLiabilityId, transaction.amount);
      break;
    case "payablePay":
      if (
        transaction.relatedLiabilityId &&
        liabilities.some((liability) => liability.id === transaction.relatedLiabilityId)
      ) {
        accounts = updateAccountBalance(accounts, transaction.accountId, -transaction.amount);
        assets = updateAssetByAccount(assets, transaction.accountId, -transaction.amount);
        liabilities = updateLiabilityByIdStrict(liabilities, transaction.relatedLiabilityId, -transaction.amount);
      }
      break;
    case "creditCardRepayment": {
      const creditCardAccountId =
        transaction.counterAccountId ??
        findLiabilityAccountId(liabilities, transaction.relatedLiabilityId) ??
        findFirstCreditCardAccountId(accounts);
      accounts = updateAccountBalance(accounts, transaction.accountId, -transaction.amount);
      assets = updateAssetByAccount(assets, transaction.accountId, -transaction.amount);
      if (creditCardAccountId) {
        accounts = updateCreditCardDebt(accounts, creditCardAccountId, -transaction.amount);
      }
      liabilities = updateLiabilityByIdOrAccount(
        liabilities,
        transaction.relatedLiabilityId,
        creditCardAccountId,
        -transaction.amount,
      );
      break;
    }
    case "creditCardExpense":
      accounts = updateCreditCardDebt(accounts, transaction.accountId, transaction.amount);
      liabilities = updateLiabilityByIdOrAccount(
        liabilities,
        transaction.relatedLiabilityId,
        transaction.accountId,
        transaction.amount,
      );
      break;
    case "transfer":
      break;
  }

  return {
    ...state,
    accounts,
    assets,
    liabilities,
    transactions: [transaction, ...state.transactions],
  };
};

export const upsertAssetInFinancialState = <T extends FinancialState>(
  state: T,
  input: AssetInput,
): T => {
  const timestamp = new Date().toISOString();
  const asset: Asset = {
    id: input.id ?? `asset-${Date.now()}`,
    name: input.name.trim(),
    category: input.category,
    amount: input.amount,
    currentValue: input.amount,
    valuationMethod: "manual",
    accountId: input.accountId || undefined,
    note: input.note?.trim() || undefined,
    createdAt: input.id
      ? state.assets.find((currentAsset) => currentAsset.id === input.id)?.createdAt ?? timestamp
      : timestamp,
    updatedAt: timestamp,
  };

  const existingIndex = state.assets.findIndex((currentAsset) => currentAsset.id === asset.id);
  const assets =
    existingIndex >= 0
      ? state.assets.map((currentAsset) => (currentAsset.id === asset.id ? asset : currentAsset))
      : [asset, ...state.assets];

  return {
    ...state,
    assets,
  };
};

export const deleteAssetFromFinancialState = <T extends FinancialState>(state: T, assetId: string): T => ({
  ...state,
  assets: state.assets.filter((asset) => asset.id !== assetId),
});

export const upsertAccountInFinancialState = <T extends FinancialState>(
  state: T,
  input: AccountInput,
): T => {
  const timestamp = new Date().toISOString();
  const existingAccount = input.id ? state.accounts.find((account) => account.id === input.id) : undefined;
  const normalizedDebt =
    input.type === "creditCard"
      ? Math.max(0, input.currentDebt ?? Math.max(0, -input.balance))
      : undefined;
  const account: Account = {
    id: input.id ?? `account-${Date.now()}`,
    name: input.name.trim(),
    type: input.type,
    balance: input.type === "creditCard" ? 0 : input.balance,
    currency: existingAccount?.currency ?? "CNY",
    isEnabled: input.isEnabled,
    isActive: input.isEnabled,
    note: input.note?.trim() || undefined,
    creditLimit: input.type === "creditCard" ? input.creditLimit : undefined,
    currentDebt: input.type === "creditCard" ? normalizedDebt : undefined,
    billDay: input.type === "creditCard" ? input.billDay : undefined,
    repaymentDay: input.type === "creditCard" ? input.repaymentDay : undefined,
    createdAt: existingAccount?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };

  const accounts = existingAccount
    ? state.accounts.map((currentAccount) => (currentAccount.id === account.id ? account : currentAccount))
    : [account, ...state.accounts];
  const assets =
    account.type === "creditCard"
      ? state.assets
      : syncAssetsByAccountBalance(state.assets, account.id, account.balance);
  const liabilities =
    account.type === "creditCard" && account.currentDebt !== undefined
      ? syncLiabilitiesByAccountDebt(state.liabilities, account.id, account.currentDebt)
      : state.liabilities;

  return {
    ...state,
    accounts,
    assets,
    liabilities,
  };
};

export const disableAccountInFinancialState = <T extends FinancialState>(state: T, accountId: string): T => ({
  ...state,
  accounts: state.accounts.map((account) =>
    account.id === accountId
      ? {
          ...account,
          isActive: false,
          isEnabled: false,
          updatedAt: new Date().toISOString(),
        }
      : account,
  ),
});

export const deleteAccountFromFinancialState = <T extends FinancialState>(state: T, accountId: string): T => ({
  ...state,
  accounts: state.accounts.filter((account) => account.id !== accountId),
});

export const upsertLiabilityInFinancialState = <T extends FinancialState>(
  state: T,
  input: LiabilityInput,
): T => {
  const timestamp = new Date().toISOString();
  const liability: Liability = {
    id: input.id ?? `liability-${Date.now()}`,
    name: input.name.trim(),
    category: input.category,
    amount: input.amount,
    dueDate: input.dueDate?.trim() || undefined,
    note: input.note?.trim() || undefined,
    createdAt: input.id
      ? state.liabilities.find((currentLiability) => currentLiability.id === input.id)?.createdAt ?? timestamp
      : timestamp,
    updatedAt: timestamp,
  };

  const existingIndex = state.liabilities.findIndex(
    (currentLiability) => currentLiability.id === liability.id,
  );
  const liabilities =
    existingIndex >= 0
      ? state.liabilities.map((currentLiability) =>
          currentLiability.id === liability.id ? liability : currentLiability,
        )
      : [liability, ...state.liabilities];

  return {
    ...state,
    liabilities,
  };
};

export const deleteLiabilityFromFinancialState = <T extends FinancialState>(
  state: T,
  liabilityId: string,
): T => ({
  ...state,
  liabilities: state.liabilities.filter((liability) => liability.id !== liabilityId),
});
