export type BudgetType = "category" | "fixed" | "project";
export type BudgetFixedStatus = "paid" | "pending" | "reserved" | "unpaid";

export interface BudgetPlan {
  id: string;
  type: BudgetType;
  periodId: string;
  title: string;
  amount: number;
  category?: string;
  tag?: string;
  thresholdPercent: number;
  fixedStatus?: BudgetFixedStatus;
  dueDate?: string;
  linkedTransactionId?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}
