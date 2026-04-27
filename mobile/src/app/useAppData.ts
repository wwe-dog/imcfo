import { useCallback, useEffect, useMemo, useState } from "react";
import { buildDashboardSummary } from "../domain/accounting/calculations";
import {
  applyTransactionToFinancialState,
  createTransactionFromInput,
  deleteAssetFromFinancialState,
  deleteLiabilityFromFinancialState,
  upsertAssetInFinancialState,
  upsertLiabilityInFinancialState,
  type AssetInput,
  type LiabilityInput,
  type TransactionInput,
} from "../domain/accounting/transactionRules";
import { asyncStorageAdapter } from "../storage/asyncStorageAdapter";
import type { AppData } from "../storage/seedData";
import type { StorageAdapter } from "../storage/storageAdapter";

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
      throw new Error(DEFAULT_ERROR_MESSAGE);
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
        return applyTransactionToFinancialState(currentData, transaction);
      });
    },
    [replaceData],
  );

  const saveAsset = useCallback(
    async (input: AssetInput) => replaceData((currentData) => upsertAssetInFinancialState(currentData, input)),
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
    return buildDashboardSummary(data.currentPeriod, data.assets, data.liabilities, data.transactions);
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
