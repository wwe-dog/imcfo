import { useCallback, useEffect, useMemo, useState } from "react";
import { buildDashboardSummary } from "../domain/accounting/calculations";
import { filterTransactionsByReportPeriod } from "../domain/accounting/periodFilters";
import {
  applyConfirmedTransactionToFinancialState,
  createTransactionReplacement,
  createTransactionFromInput,
  deleteAccountFromFinancialState,
  deleteAssetFromFinancialState,
  deleteLiabilityFromFinancialState,
  disableAccountInFinancialState,
  upsertAccountInFinancialState,
  upsertAssetInFinancialState,
  upsertLiabilityInFinancialState,
  voidTransaction,
  type AccountInput,
  type AssetInput,
  type LiabilityInput,
  type TransactionInput,
} from "../domain/accounting/transactionRules";
import { getEffectiveTransactions } from "../domain/accounting/transactionAuditRules";
import {
  applyReconciliationAdjustment,
  type ReconciliationInput,
} from "../domain/accounting/reconciliationRules";
import { asyncStorageAdapter } from "../storage/asyncStorageAdapter";
import type { AppData } from "../storage/seedData";
import type { StorageAdapter } from "../storage/storageAdapter";
import type { AppSettings, BudgetPlan } from "../domain/models";

type AppDataStatus = "idle" | "loading" | "ready" | "saving" | "error";

interface UseAppDataResult {
  data: AppData | null;
  summary: ReturnType<typeof buildDashboardSummary> | null;
  status: AppDataStatus;
  errorMessage: string | null;
  isLoading: boolean;
  isSaving: boolean;
  reloadData: () => Promise<void>;
  saveTransaction: (input: TransactionInput) => Promise<void>;
  replaceTransaction: (transactionId: string, input: TransactionInput, reason?: string) => Promise<AppData>;
  voidTransactionById: (transactionId: string, reason?: string) => Promise<AppData>;
  saveBudget: (input: BudgetPlan) => Promise<AppData>;
  deleteBudget: (budgetId: string) => Promise<AppData>;
  saveSettings: (settings: Partial<AppSettings>) => Promise<AppData>;
  saveReconciliation: (input: ReconciliationInput) => Promise<AppData>;
  saveAccount: (input: AccountInput) => Promise<AppData>;
  disableAccount: (accountId: string) => Promise<AppData>;
  deleteAccount: (accountId: string) => Promise<AppData>;
  saveAsset: (input: AssetInput) => Promise<AppData>;
  deleteAsset: (assetId: string) => Promise<AppData>;
  saveLiability: (input: LiabilityInput) => Promise<AppData>;
  deleteLiability: (liabilityId: string) => Promise<AppData>;
  replaceData: (updater: (current: AppData) => AppData) => Promise<AppData>;
  resetDemoData: () => Promise<AppData>;
  clearAllData: () => Promise<AppData>;
  exportData: () => Promise<string>;
  importData: (serializedData: string) => Promise<AppData>;
}

const DEFAULT_ERROR_MESSAGE = "无法读取本地数据。";

export function useAppData(storage: StorageAdapter = asyncStorageAdapter): UseAppDataResult {
  const [data, setData] = useState<AppData | null>(null);
  const [status, setStatus] = useState<AppDataStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadFromStorage = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);

    try {
      const nextData = await storage.loadData();
      setData(nextData);
      setStatus("ready");
    } catch {
      setStatus("error");
      setErrorMessage(DEFAULT_ERROR_MESSAGE);
    }
  }, [storage]);

  useEffect(() => {
    void loadFromStorage();
  }, [loadFromStorage]);

  const persistData = useCallback(
    async (nextData: AppData) => {
      setStatus("saving");
      setErrorMessage(null);

      try {
        await storage.saveData(nextData);
        setData(nextData);
        setStatus("ready");
        return nextData;
      } catch {
        setStatus("error");
        setErrorMessage("保存本地数据失败。");
        throw new Error("保存本地数据失败。");
      }
    },
    [storage],
  );

  const replaceData = useCallback(
    async (updater: (current: AppData) => AppData) => {
      if (!data) {
        throw new Error("当前数据尚未加载完成。");
      }

      const nextData = updater(data);
      return persistData(nextData);
    },
    [data, persistData],
  );

  const saveTransaction = useCallback(
    async (input: TransactionInput) => {
      await replaceData((currentData) => {
        const transaction = createTransactionFromInput(input);
        return applyConfirmedTransactionToFinancialState(currentData, transaction);
      });
    },
    [replaceData],
  );

  const replaceTransaction = useCallback(
    async (transactionId: string, input: TransactionInput, reason?: string) =>
      replaceData((currentData) => createTransactionReplacement(currentData, transactionId, input, reason)),
    [replaceData],
  );

  const voidTransactionById = useCallback(
    async (transactionId: string, reason?: string) =>
      replaceData((currentData) => voidTransaction(currentData, transactionId, reason)),
    [replaceData],
  );

  const saveBudget = useCallback(
    async (input: BudgetPlan) =>
      replaceData((currentData) => {
        const exists = currentData.budgets.some((budget) => budget.id === input.id);
        const timestamp = new Date().toISOString();
        const nextBudget = {
          ...input,
          updatedAt: timestamp,
          createdAt: exists
            ? currentData.budgets.find((budget) => budget.id === input.id)?.createdAt ?? input.createdAt
            : input.createdAt || timestamp,
        };
        return {
          ...currentData,
          budgets: exists
            ? currentData.budgets.map((budget) => (budget.id === input.id ? nextBudget : budget))
            : [nextBudget, ...currentData.budgets],
        };
      }),
    [replaceData],
  );

  const deleteBudget = useCallback(
    async (budgetId: string) =>
      replaceData((currentData) => ({
        ...currentData,
        budgets: currentData.budgets.filter((budget) => budget.id !== budgetId),
      })),
    [replaceData],
  );

  const saveSettings = useCallback(
    async (settings: Partial<AppSettings>) =>
      replaceData((currentData) => ({
        ...currentData,
        settings: {
          ...currentData.settings,
          ...settings,
          updatedAt: new Date().toISOString(),
        },
      })),
    [replaceData],
  );

  const saveAsset = useCallback(
    async (input: AssetInput) => replaceData((currentData) => upsertAssetInFinancialState(currentData, input)),
    [replaceData],
  );

  const saveReconciliation = useCallback(
    async (input: ReconciliationInput) =>
      replaceData((currentData) => applyReconciliationAdjustment(currentData, input)),
    [replaceData],
  );

  const saveAccount = useCallback(
    async (input: AccountInput) => replaceData((currentData) => upsertAccountInFinancialState(currentData, input)),
    [replaceData],
  );

  const disableAccount = useCallback(
    async (accountId: string) => replaceData((currentData) => disableAccountInFinancialState(currentData, accountId)),
    [replaceData],
  );

  const deleteAccount = useCallback(
    async (accountId: string) => replaceData((currentData) => deleteAccountFromFinancialState(currentData, accountId)),
    [replaceData],
  );

  const deleteAsset = useCallback(
    async (assetId: string) =>
      replaceData((currentData) => deleteAssetFromFinancialState(currentData, assetId)),
    [replaceData],
  );

  const saveLiability = useCallback(
    async (input: LiabilityInput) =>
      replaceData((currentData) => upsertLiabilityInFinancialState(currentData, input)),
    [replaceData],
  );

  const deleteLiability = useCallback(
    async (liabilityId: string) =>
      replaceData((currentData) => deleteLiabilityFromFinancialState(currentData, liabilityId)),
    [replaceData],
  );

  const resetDemoData = useCallback(async () => {
    setStatus("saving");
    setErrorMessage(null);

    try {
      const freshData = await storage.resetData();
      setData(freshData);
      setStatus("ready");
      return freshData;
    } catch {
      setStatus("error");
      setErrorMessage("重置本地数据失败。");
      throw new Error("重置本地数据失败。");
    }
  }, [storage]);

  const clearAllData = useCallback(async () => {
    setStatus("saving");
    setErrorMessage(null);

    try {
      const emptyData = await storage.clearData();
      setData(emptyData);
      setStatus("ready");
      return emptyData;
    } catch {
      setStatus("error");
      setErrorMessage("清空本地数据失败。");
      throw new Error("清空本地数据失败。");
    }
  }, [storage]);

  const exportData = useCallback(async () => {
    try {
      return await storage.exportData();
    } catch {
      setStatus("error");
      setErrorMessage("导出本地数据失败。");
      throw new Error("导出本地数据失败。");
    }
  }, [storage]);

  const importData = useCallback(
    async (serializedData: string) => {
      setStatus("saving");
      setErrorMessage(null);

      try {
        const importedData = await storage.importData(serializedData);
        setData(importedData);
        setStatus("ready");
        return importedData;
      } catch {
        setStatus("error");
        setErrorMessage("导入本地数据失败，请检查 JSON 格式。");
        throw new Error("导入本地数据失败，请检查 JSON 格式。");
      }
    },
    [storage],
  );

  const summary = useMemo(() => {
    if (!data) return null;
    const reportTransactions = getEffectiveTransactions(data.transactions, {
      includeVoided: data.settings.includeVoidedTransactionsInReports,
    });
    const periodTransactions = filterTransactionsByReportPeriod(reportTransactions, data.currentPeriod);
    return buildDashboardSummary(data.currentPeriod, data.assets, data.liabilities, periodTransactions);
  }, [data]);

  return {
    data,
    summary,
    status,
    errorMessage,
    isLoading: status === "idle" || status === "loading",
    isSaving: status === "saving",
    reloadData: loadFromStorage,
    saveTransaction,
    replaceTransaction,
    voidTransactionById,
    saveBudget,
    deleteBudget,
    saveSettings,
    saveReconciliation,
    saveAccount,
    disableAccount,
    deleteAccount,
    saveAsset,
    deleteAsset,
    saveLiability,
    deleteLiability,
    replaceData,
    resetDemoData,
    clearAllData,
    exportData,
    importData,
  };
}
