export type AssetCategory =
  | "cash"
  | "bankDeposit"
  | "paymentAccount"
  | "investment"
  | "receivable"
  | "fixedAsset"
  | "other";

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  amount: number;
  valuationMethod?: string;
  purchaseDate?: string;
  currentValue: number;
  accountId?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}
