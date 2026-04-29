export type TransactionType =
  | "income"
  | "expense"
  | "assetIncrease"
  | "assetDecrease"
  | "liabilityIncrease"
  | "liabilityDecrease"
  | "receivableRecognize"
  | "receivableCollect"
  | "payableRecognize"
  | "payablePay"
  | "transfer"
  | "investmentBuy"
  | "investmentSell"
  | "repayment"
  | "creditCardExpense"
  | "creditCardRepayment";

export type CashFlowType = "operating" | "investing" | "financing" | "nonCash";

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: TransactionType;
  category: string;
  accountId: string;
  counterAccountId?: string;
  cashFlowType: CashFlowType;
  note?: string;
  tags?: string[];
  relatedAssetId?: string;
  relatedLiabilityId?: string;
  journalEntryId?: string;
  createdAt: string;
  updatedAt: string;
}
