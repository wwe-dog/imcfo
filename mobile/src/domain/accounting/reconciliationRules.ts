import type { Account, Asset, CashFlowType, Liability, Transaction, TransactionType } from "../models";
import type { FinancialState } from "./transactionRules";

export type ReconciliationReason =
  | "investmentIncomeReceived"
  | "bankInterestReceived"
  | "dividendReceived"
  | "assetValueIncrease"
  | "assetValueDecrease"
  | "missingTransferIn"
  | "missingTransferOut"
  | "missingExpense"
  | "feeDeduction"
  | "creditCardMissingExpense"
  | "creditCardFee"
  | "creditCardMissingRepayment"
  | "creditCardRefund"
  | "otherIncrease"
  | "otherDecrease";

export interface ReconciliationReasonOption {
  value: ReconciliationReason;
  label: string;
}

export interface ReconciliationInput {
  targetType: "account" | "asset";
  targetId: string;
  actualValue: number;
  reason: ReconciliationReason;
  date?: string;
  note?: string;
  payingAccountId?: string;
}

export const calculateReconciliationDiff = (bookValue: number, actualValue: number): number =>
  actualValue - bookValue;

export const getReconciliationReasonOptions = (
  targetType: "account" | "asset",
  diff: number,
  isCreditCard = false,
): ReconciliationReasonOption[] => {
  if (isCreditCard) {
    return diff > 0
      ? [
          { value: "creditCardMissingExpense", label: "漏记信用卡消费" },
          { value: "creditCardFee", label: "利息/手续费" },
          { value: "otherIncrease", label: "其他欠款调整" },
        ]
      : [
          { value: "creditCardMissingRepayment", label: "漏记还款" },
          { value: "creditCardRefund", label: "退款/冲正" },
          { value: "otherDecrease", label: "其他欠款调整" },
        ];
  }

  if (targetType === "asset") {
    return diff > 0
      ? [
          { value: "assetValueIncrease", label: "资产估值上涨" },
          { value: "otherIncrease", label: "其他调整" },
        ]
      : [
          { value: "assetValueDecrease", label: "资产估值下降" },
          { value: "otherDecrease", label: "其他调整" },
        ];
  }

  return diff > 0
    ? [
        { value: "bankInterestReceived", label: "银行利息到账" },
        { value: "investmentIncomeReceived", label: "投资收益到账" },
        { value: "dividendReceived", label: "基金/股票分红到账" },
        { value: "missingTransferIn", label: "漏记转入" },
        { value: "otherIncrease", label: "其他调整" },
      ]
    : [
        { value: "missingExpense", label: "漏记支出" },
        { value: "missingTransferOut", label: "漏记转出" },
        { value: "feeDeduction", label: "手续费/扣费" },
        { value: "otherDecrease", label: "其他调整" },
      ];
};

const isCreditCardAccount = (account: Account): boolean => account.type === "creditCard";

const getCreditCardDebt = (account: Account): number => account.currentDebt ?? Math.max(0, -account.balance);

const setAccountBalance = (accounts: Account[], accountId: string, balance: number): Account[] => {
  const timestamp = new Date().toISOString();
  return accounts.map((account) =>
    account.id === accountId
      ? {
          ...account,
          balance: Math.max(0, balance),
          updatedAt: timestamp,
        }
      : account,
  );
};

const setCreditCardDebt = (accounts: Account[], accountId: string, currentDebt: number): Account[] => {
  const timestamp = new Date().toISOString();
  return accounts.map((account) =>
    account.id === accountId && account.type === "creditCard"
      ? {
          ...account,
          balance: 0,
          currentDebt: Math.max(0, currentDebt),
          updatedAt: timestamp,
        }
      : account,
  );
};

const adjustAccountBalance = (accounts: Account[], accountId: string, delta: number): Account[] => {
  const account = accounts.find((currentAccount) => currentAccount.id === accountId);
  if (!account) return accounts;
  return setAccountBalance(accounts, accountId, account.balance + delta);
};

const syncOneToOneAccountAsset = (assets: Asset[], accountId: string, value: number): Asset[] => {
  const linkedAssets = assets.filter((asset) => asset.accountId === accountId);
  // A single account can hold multiple asset positions. Auto-sync is safe only
  // for a one-to-one account/asset link; otherwise keep asset details untouched.
  if (linkedAssets.length !== 1) return assets;

  const timestamp = new Date().toISOString();
  return assets.map((asset) =>
    asset.accountId === accountId
      ? {
          ...asset,
          amount: Math.max(0, value),
          currentValue: Math.max(0, value),
          updatedAt: timestamp,
        }
      : asset,
  );
};

const adjustOneToOneAccountAsset = (assets: Asset[], accountId: string, delta: number): Asset[] => {
  const linkedAsset = assets.find((asset) => asset.accountId === accountId);
  if (!linkedAsset) return assets;
  return syncOneToOneAccountAsset(assets, accountId, linkedAsset.currentValue + delta);
};

const setAssetValue = (assets: Asset[], assetId: string, value: number): Asset[] => {
  const timestamp = new Date().toISOString();
  return assets.map((asset) =>
    asset.id === assetId
      ? {
          ...asset,
          amount: Math.max(0, value),
          currentValue: Math.max(0, value),
          updatedAt: timestamp,
        }
      : asset,
  );
};

const syncOneToOneAccountLiability = (liabilities: Liability[], accountId: string, value: number): Liability[] => {
  const linkedLiabilities = liabilities.filter((liability) => liability.accountId === accountId);
  if (linkedLiabilities.length !== 1) return liabilities;

  const timestamp = new Date().toISOString();
  return liabilities.map((liability) =>
    liability.accountId === accountId
      ? {
          ...liability,
          amount: Math.max(0, value),
          updatedAt: timestamp,
        }
      : liability,
  );
};

const buildTransaction = (params: {
  amount: number;
  type: TransactionType;
  category: string;
  accountId: string;
  cashFlowType: CashFlowType;
  note?: string;
  date?: string;
  counterAccountId?: string;
  relatedAssetId?: string;
  relatedLiabilityId?: string;
}): Transaction => {
  const timestamp = new Date().toISOString();
  return {
    id: `tx-reconcile-${Date.now()}-${Math.round(Math.random() * 100000)}`,
    date: params.date ?? timestamp.slice(0, 10),
    amount: params.amount,
    type: params.type,
    category: params.category,
    accountId: params.accountId,
    counterAccountId: params.counterAccountId,
    cashFlowType: params.cashFlowType,
    note: params.note,
    relatedAssetId: params.relatedAssetId,
    relatedLiabilityId: params.relatedLiabilityId,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

const getAccountLinkedLiabilityId = (liabilities: Liability[], accountId: string): string | undefined =>
  liabilities.find((liability) => liability.accountId === accountId)?.id;

export const applyReconciliationAdjustment = <T extends FinancialState>(
  state: T,
  input: ReconciliationInput,
): T => {
  if (!Number.isFinite(input.actualValue) || input.actualValue < 0) return state;

  const timestamp = new Date().toISOString();
  let accounts = state.accounts;
  let assets = state.assets;
  let liabilities = state.liabilities;
  let transaction: Transaction | null = null;

  if (input.targetType === "asset") {
    const asset = assets.find((currentAsset) => currentAsset.id === input.targetId);
    if (!asset) return state;

    const diff = calculateReconciliationDiff(asset.currentValue, input.actualValue);
    if (Math.abs(diff) < 0.01) return state;

    const amount = Math.abs(diff);
    const isIncrease = diff > 0;
    assets = setAssetValue(assets, asset.id, input.actualValue);
    transaction = buildTransaction({
      amount,
      type: isIncrease ? "assetIncrease" : "assetDecrease",
      category: asset.category,
      accountId: asset.accountId ?? "",
      cashFlowType: "nonCash",
      relatedAssetId: asset.id,
      date: input.date,
      note: input.note?.trim() || (isIncrease ? "资产估值上涨对账调整" : "资产估值下降对账调整"),
    });
  } else {
    const account = accounts.find((currentAccount) => currentAccount.id === input.targetId);
    if (!account) return state;

    const isCreditCard = isCreditCardAccount(account);
    const bookValue = isCreditCard ? getCreditCardDebt(account) : account.balance;
    const diff = calculateReconciliationDiff(bookValue, input.actualValue);
    if (Math.abs(diff) < 0.01) return state;

    const amount = Math.abs(diff);

    if (isCreditCard) {
      accounts = setCreditCardDebt(accounts, account.id, input.actualValue);
      liabilities = syncOneToOneAccountLiability(liabilities, account.id, input.actualValue);
      const relatedLiabilityId = getAccountLinkedLiabilityId(liabilities, account.id);

      if (diff > 0) {
        transaction = buildTransaction({
          amount,
          type: "creditCardExpense",
          category: input.reason === "creditCardFee" ? "利息/手续费" : "信用卡消费",
          accountId: account.id,
          cashFlowType: "nonCash",
          relatedLiabilityId,
          date: input.date,
          note: input.note?.trim() || "信用卡欠款对账调增",
        });
      } else if (input.reason === "creditCardMissingRepayment") {
        if (!input.payingAccountId) return state;
        accounts = adjustAccountBalance(accounts, input.payingAccountId, -amount);
        assets = adjustOneToOneAccountAsset(assets, input.payingAccountId, -amount);
        transaction = buildTransaction({
          amount,
          type: "creditCardRepayment",
          category: "信用卡",
          accountId: input.payingAccountId,
          counterAccountId: account.id,
          cashFlowType: "financing",
          relatedLiabilityId,
          date: input.date,
          note: input.note?.trim() || "漏记信用卡还款对账调整",
        });
      } else {
        transaction = buildTransaction({
          amount,
          type: "liabilityDecrease",
          category: input.reason === "creditCardRefund" ? "退款/冲正" : "信用卡",
          accountId: account.id,
          cashFlowType: "nonCash",
          relatedLiabilityId,
          date: input.date,
          note: input.note?.trim() || "信用卡欠款非现金调减",
        });
      }
    } else {
      accounts = setAccountBalance(accounts, account.id, input.actualValue);
      assets = syncOneToOneAccountAsset(assets, account.id, input.actualValue);

      if (diff > 0) {
        if (input.reason === "bankInterestReceived") {
          transaction = buildTransaction({
            amount,
            type: "income",
            category: "利息收入",
            accountId: account.id,
            cashFlowType: "operating",
            date: input.date,
            note: input.note?.trim() || "银行利息到账对账调整",
          });
        } else if (input.reason === "investmentIncomeReceived" || input.reason === "dividendReceived") {
          transaction = buildTransaction({
            amount,
            type: "income",
            category: "投资收益",
            accountId: account.id,
            // V0.1 personal-finance adapted classification: cash investment
            // distributions are kept with operating inflows for current reports.
            cashFlowType: "operating",
            date: input.date,
            note: input.note?.trim() || "投资收益或分红到账对账调整",
          });
        } else {
          transaction = buildTransaction({
            amount,
            type: "transfer",
            category: "内部转入",
            accountId: account.id,
            cashFlowType: "nonCash",
            date: input.date,
            note: input.note?.trim() || "漏记转入或余额调增对账调整",
          });
        }
      } else if (input.reason === "missingExpense" || input.reason === "feeDeduction") {
        transaction = buildTransaction({
          amount,
          type: "expense",
          category: input.reason === "feeDeduction" ? "手续费" : "其他支出",
          accountId: account.id,
          cashFlowType: "operating",
          date: input.date,
          note: input.note?.trim() || "漏记支出对账调整",
        });
      } else {
        transaction = buildTransaction({
          amount,
          type: "transfer",
          category: "内部转出",
          accountId: account.id,
          cashFlowType: "nonCash",
          date: input.date,
          note: input.note?.trim() || "漏记转出或余额调减对账调整",
        });
      }
    }
  }

  return {
    ...state,
    accounts,
    assets,
    liabilities,
    transactions: transaction ? [{ ...transaction, updatedAt: timestamp }, ...state.transactions] : state.transactions,
  };
};
