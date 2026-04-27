import AsyncStorage from "@react-native-async-storage/async-storage";
import { APP_VERSION, createEmptyAppData, seedData, type AppData } from "./seedData";
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

const cloneValue = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const readJson = async <T,>(key: string, fallback: T): Promise<T> => {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const normalizeAppData = (input: Partial<AppData> | null | undefined): AppData => ({
  version: input?.version || APP_VERSION,
  accounts: Array.isArray(input?.accounts) ? input.accounts : [],
  transactions: Array.isArray(input?.transactions) ? input.transactions : [],
  assets: Array.isArray(input?.assets) ? input.assets : [],
  liabilities: Array.isArray(input?.liabilities) ? input.liabilities : [],
  journalEntries: Array.isArray(input?.journalEntries) ? input.journalEntries : [],
  settings:
    input?.settings && typeof input.settings === "object"
      ? { ...seedData.settings, ...input.settings }
      : cloneValue(seedData.settings),
  currentPeriod:
    input?.currentPeriod && typeof input.currentPeriod === "object"
      ? { ...seedData.currentPeriod, ...input.currentPeriod }
      : cloneValue(seedData.currentPeriod),
});

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
      const initialData = cloneValue(seedData);
      await this.saveData(initialData);
      return initialData;
    }

    return normalizeAppData({
      version: version || APP_VERSION,
      accounts: await readJson(STORAGE_KEYS.accounts, seedData.accounts),
      transactions: await readJson(STORAGE_KEYS.transactions, seedData.transactions),
      assets: await readJson(STORAGE_KEYS.assets, seedData.assets),
      liabilities: await readJson(STORAGE_KEYS.liabilities, seedData.liabilities),
      journalEntries: await readJson(STORAGE_KEYS.journalEntries, seedData.journalEntries),
      settings: await readJson(STORAGE_KEYS.settings, seedData.settings),
      currentPeriod: await readJson(STORAGE_KEYS.currentPeriod, seedData.currentPeriod),
    });
  },

  async resetData() {
    const freshData = cloneValue(seedData);
    await this.saveData(freshData);
    return freshData;
  },

  async clearData() {
    const emptyData = createEmptyAppData();
    await this.saveData(emptyData);
    return emptyData;
  },

  async exportData() {
    const data = await this.loadData();
    return JSON.stringify(data, null, 2);
  },

  async importData(serializedData) {
    const parsed = JSON.parse(serializedData) as Partial<AppData>;
    const importedData = normalizeAppData(parsed);
    await this.saveData(importedData);
    return importedData;
  },
};
