export type ReportElement =
  | "asset"
  | "liability"
  | "ownerEquity"
  | "income"
  | "expense"
  | "profit";

export interface JournalEntryLine {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  reportElement: ReportElement;
}

export interface JournalEntry {
  id: string;
  transactionId: string;
  date: string;
  description: string;
  lines: JournalEntryLine[];
  createdAt: string;
  updatedAt: string;
}
