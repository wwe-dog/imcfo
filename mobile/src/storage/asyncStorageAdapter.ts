import AsyncStorage from "@react-native-async-storage/async-storage";
import { APP_VERSION, seedData, type AppData } from "./seedData";
import type { StorageAdapter } from "./storageAdapter";

const STORAGE_KEYS = {
  accounts: "imcfo.accounts",
  transactions: "imcfo.transactions",
  assets: "imcfo.assets",
  liabilities: "imcfo.liabilities",
  journalEntries: "imcfo.journalEntries",
  settings: "imcfo.settings",
  version: "imcfo.version",
  currentPeriod: "imcfo.currentPeriod",
} as const;

const cloneData = (data: AppData): AppData => JSON.parse(JSON.stringify(data)) as AppData;

const readJson = async <T,>(key: string, fallback: T): Promise<T> => {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const asyncStorageAdapter: StorageAdapter = {
  async saveData(data) {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.version, data.version],
      [STORAGE_KEYS.accounts, JSON.stringify(data.accounts)],
      [STORAGE_KEYS.transactions, JSON.stringify(data.transactions)],
      [STORAGE_KEYS.assets, JSON.stringify(data.assets)],
      [STORAGE_KEYS.liabilities, JSON.stringify(data.liabilities)],
      [STORAGE_KEYS.journalEntries, JSON.stringify(data.journalEntries)],
      [STORAGE_KEYS.settings, JSON.stringify(data.settings)],
      [STORAGE_KEYS.currentPeriod, JSON.stringify(data.currentPeriod)],
    ]);
  },

  async loadData() {
    const version = await AsyncStorage.getItem(STORAGE_KEYS.version);
    if (!version) {
      const initialData = cloneData(seedData);
      await this.saveData(initialData);
      return initialData;
    }

    return {
      version: version || APP_VERSION,
      accounts: await readJson(STORAGE_KEYS.accounts, seedData.accounts),
      transactions: await readJson(STORAGE_KEYS.transactions, seedData.transactions),
      assets: await readJson(STORAGE_KEYS.assets, seedData.assets),
      liabilities: await readJson(STORAGE_KEYS.liabilities, seedData.liabilities),
      journalEntries: await readJson(STORAGE_KEYS.journalEntries, seedData.journalEntries),
      settings: await readJson(STORAGE_KEYS.settings, seedData.settings),
      currentPeriod: await readJson(STORAGE_KEYS.currentPeriod, seedData.currentPeriod),
    };
  },

  async resetData() {
    const freshData = cloneData(seedData);
    await this.saveData(freshData);
    return freshData;
  },

  async exportData() {
    const data = await this.loadData();
    return JSON.stringify(data, null, 2);
  },

  async importData(serializedData) {
    const parsed = JSON.parse(serializedData) as AppData;
    const importedData: AppData = {
      ...parsed,
      version: parsed.version || APP_VERSION,
    };
    await this.saveData(importedData);
    return importedData;
  },
};
