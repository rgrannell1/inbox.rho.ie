// Boot — sync orchestration called on load and after token is set

import { readAllEntries, readLastSeq, writeAuthError } from "./storage.ts";
import { streamEntries } from "./sync.ts";
import { store } from "./state.ts";
import { POLL_INTERVAL_MS } from "./constants.ts";
import type { Entry } from "./types.ts";

function isAuthError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return message.includes("403") || message.includes("401");
}

function onStreamEntry(entry: Entry): void {
  store.applyEntry(entry);
}

export async function startSync(token: string): Promise<void> {
  store.setSyncStatus({ kind: "syncing" });

  const [stored, lastSeq] = await Promise.all([readAllEntries(), readLastSeq()]);
  store.setReady(stored);
  store.setLastSeq(lastSeq);

  try {
    await streamEntries(token, lastSeq + 1, onStreamEntry);
    await writeAuthError(false);
    store.setSyncStatus({ kind: "upToDate" });
    setTimeout(() => {
      if (store.state.syncStatus.kind === "upToDate") {
        store.setSyncStatus({ kind: "idle" });
      }
    }, 3_000);
  } catch (err) {
    if (isAuthError(err)) {
      await writeAuthError(true);
      store.openAuthModal();
      return;
    }
    store.setSyncStatus({ kind: "error", message: "SYNC ERROR" });
    throw err;
  }
}

let syncInProgress = false;

async function pollOnce(token: string): Promise<void> {
  if (syncInProgress) return;
  syncInProgress = true;
  try {
    await streamEntries(token, store.state.lastSeq + 1, onStreamEntry);
  } finally {
    syncInProgress = false;
  }
}

export function startPollLoop(token: string): void {
  setInterval(() => { pollOnce(token).catch(console.error); }, POLL_INTERVAL_MS);
}
