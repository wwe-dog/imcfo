import type { AppData } from "./seedData";

export interface StorageAdapter {
  loadData: () => Promise<AppData>;
  saveData: (data: AppData) => Promise<void>;
  resetData: () => Promise<AppData>;
  clearData: () => Promise<AppData>;
  exportData: () => Promise<string>;
  importData: (serializedData: string) => Promise<AppData>;
}
