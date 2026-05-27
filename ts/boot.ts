// Boot — sync orchestration called on load and after token is set

import { initNode } from "./sync.ts";
import { writeAuthError } from "./storage.ts";
import { store } from "./state.ts";
import { INDEX_TOPIC } from "./constants.ts";
import type { Entry } from "./types.ts";
import type { ChangeEvent } from "./sync.ts";

function isAuthError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return message.includes("403") || message.includes("401");
}

function applyChange(change: ChangeEvent): void {
  if (change.type === "delete") {
    store.applyEntry({ id: change.id, seq: 0, createdAt: 0, updatedAt: 0, payload: null });
  } else {
    store.applyEntry(change.entry as Entry);
  }
}

export async function startSync(token: string): Promise<void> {
  store.setSyncStatus({ kind: "syncing" });

  const node    = await initNode(token);
  const stored  = await node.getObjects(INDEX_TOPIC) ?? [];
  store.setReady(stored as Entry[]);

  try {
    await node.sync(INDEX_TOPIC);
    writeAuthError(false);
    store.setSyncStatus({ kind: "upToDate" });
    setTimeout(() => {
      if (store.state.syncStatus.kind === "upToDate") {
        store.setSyncStatus({ kind: "idle" });
      }
    }, 3_000);
  } catch (err) {
    if (isAuthError(err)) {
      writeAuthError(true);
      store.openAuthModal();
      return;
    }
    store.setSyncStatus({ kind: "error", message: "SYNC ERROR" });
    throw err;
  }

  node.start();

  // Drive UI updates from all local writes and incoming sync
  (async () => {
    for await (const change of node.watch(INDEX_TOPIC)) {
      applyChange(change);
    }
  })().catch(console.error);
}
