export type LiabilityCategory =
  | "creditCard"
  | "huabei"
  | "loan"
  | "borrowing"
  | "payable"
  | "other";

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
