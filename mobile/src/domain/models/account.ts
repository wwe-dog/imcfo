export type AccountType =
  | "cash"
  | "bank"
  | "wechat"
  | "alipay"
  | "investment"
  | "creditCard"
  | "other";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  isEnabled: boolean;
  isActive?: boolean;
  note?: string;
  creditLimit?: number;
  currentDebt?: number;
  billDay?: number;
  repaymentDay?: number;
  createdAt: string;
  updatedAt: string;
}
