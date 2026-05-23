export type TransactionAuditEventType =
  | "created"
  | "journalEntryGenerated"
  | "replaced"
  | "reversalGenerated"
  | "voided";

export interface TransactionAuditEvent {
  id: string;
  transactionId: string;
  type: TransactionAuditEventType;
  reason?: string;
  relatedTransactionId?: string;
  createdAt: string;
}
