export type AccountType =
  | "cash"
  | "bank"
  | "wechat"
  | "alipay"
  | "investment"
  | "creditCard"
  | "loan"
  | "other";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
