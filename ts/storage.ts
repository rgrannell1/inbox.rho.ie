// IDB persistence — token, live entries, and lastSeq cursor

import { openDB, type IDBPDatabase } from "idb";
import { IDB_NAME, STORE_ENTRIES, STORE_META, META_TOKEN, META_LAST_SEQ, META_AUTH_ERROR } from "./constants.ts";
import type { Entry } from "./types.ts";

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

export async function readToken(): Promise<string | null> {
  const db = await openIndexDB();
  return (await db.get(STORE_META, META_TOKEN) as string | undefined) ?? null;
}

export async function writeToken(token: string): Promise<void> {
  const db = await openIndexDB();
  await db.put(STORE_META, token, META_TOKEN);
}

export async function readLastSeq(): Promise<number> {
  const db = await openIndexDB();
  return (await db.get(STORE_META, META_LAST_SEQ) as number | undefined) ?? 0;
}

export async function readAllEntries(): Promise<Entry[]> {
  const db = await openIndexDB();
  return db.getAll(STORE_ENTRIES);
}

export async function readAuthError(): Promise<boolean> {
  const db = await openIndexDB();
  return (await db.get(STORE_META, META_AUTH_ERROR) as boolean | undefined) ?? false;
}

export async function writeAuthError(flag: boolean): Promise<void> {
  const db = await openIndexDB();
  await db.put(STORE_META, flag, META_AUTH_ERROR);
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
