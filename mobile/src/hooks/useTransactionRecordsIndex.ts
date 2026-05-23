import { useEffect, useState } from "react";
import { InteractionManager } from "react-native";
import type { Account, Transaction } from "../domain/models";
import {
  buildTransactionRecordsIndex,
  type TransactionRecordsIndex,
} from "../domain/transactions/transactionDisplayIndex";
import { getEffectiveTransactions } from "../domain/accounting/transactionAuditRules";

export const useTransactionRecordsIndex = ({
  accounts,
  transactions,
}: {
  accounts?: Account[];
  transactions?: Transaction[];
}): { index: TransactionRecordsIndex | null; isPreparing: boolean } => {
  const [index, setIndex] = useState<TransactionRecordsIndex | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);

  useEffect(() => {
    if (!accounts || !transactions) {
      setIndex(null);
      setIsPreparing(false);
      return;
    }

    let isCancelled = false;
    setIsPreparing(true);

    const task = InteractionManager.runAfterInteractions(() => {
      const nextIndex = buildTransactionRecordsIndex(getEffectiveTransactions(transactions), accounts);
      if (isCancelled) return;
      setIndex(nextIndex);
      setIsPreparing(false);
    });

    return () => {
      isCancelled = true;
      task.cancel();
    };
  }, [accounts, transactions]);

  return { index, isPreparing };
};
