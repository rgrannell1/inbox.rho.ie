// Auth state (localStorage) and entry/cursor persistence (IDB)

import { openDB, type IDBPDatabase } from "idb";
import { IDB_NAME, STORE_ENTRIES, STORE_META, META_LAST_SEQ } from "./constants.ts";
import type { Entry } from "./types.ts";

// localStorage keys for auth state
const KEY_TOKEN      = "inbox:token";
const KEY_AUTH_ERROR = "inbox:authError";

type IndexDB = IDBPDatabase<{
  [STORE_ENTRIES]: { key: string; value: Entry };
  [STORE_META]:    { key: string; value: unknown };
}>;

async function openIndexDB(): Promise<IndexDB> {
  return openDB(IDB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_ENTRIES, { keyPath: "id" });
      db.createObjectStore(STORE_META);
    },
  });
}

export function readToken(): string | null {
  return localStorage.getItem(KEY_TOKEN);
}

export function writeToken(token: string): void {
  localStorage.setItem(KEY_TOKEN, token);
}

export function readAuthError(): boolean {
  return localStorage.getItem(KEY_AUTH_ERROR) === "true";
}

export function writeAuthError(flag: boolean): void {
  if (flag) {
    localStorage.setItem(KEY_AUTH_ERROR, "true");
  } else {
    localStorage.removeItem(KEY_AUTH_ERROR);
  }
}

export async function readLastSeq(): Promise<number> {
  const db = await openIndexDB();
  return (await db.get(STORE_META, META_LAST_SEQ) as number | undefined) ?? 0;
}

export async function readAllEntries(): Promise<Entry[]> {
  const db = await openIndexDB();
  return db.getAll(STORE_ENTRIES);
}

// Applies a streamed object: upserts live entries, removes tombstones, advances the seq cursor.
export async function applyEntryToStorage(entry: Entry): Promise<void> {
  const db = await openIndexDB();
  const tx = db.transaction([STORE_ENTRIES, STORE_META], "readwrite");
  if (entry.payload === null) {
    await tx.objectStore(STORE_ENTRIES).delete(entry.id);
  } else {
    await tx.objectStore(STORE_ENTRIES).put(entry);
  }
  await tx.objectStore(STORE_META).put(entry.seq, META_LAST_SEQ);
  await tx.done;
}
