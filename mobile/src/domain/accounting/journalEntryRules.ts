import type { JournalEntry } from "../models";
import { validateJournalEntryBalance } from "./calculations";

export const areJournalEntriesBalanced = (entries: JournalEntry[]): boolean =>
  entries.every(validateJournalEntryBalance);
