export type LiabilityCategory =
  | "creditCard"
  | "huabei"
  | "loan"
  | "borrowing"
  | "payable"
  | "other"
  | "房贷"
  | "车贷"
  | "信用卡"
  | "消费分期"
  | "融资负债"
  | "应付款"
  | "借款";

export interface Liability {
  id: string;
  name: string;
  category: LiabilityCategory;
  amount: number;
  dueDate?: string;
  interestRate?: number;
  accountId?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}
