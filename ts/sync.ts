// Sync — CommonStorageNode wrapping IDBBackend + SetIntervalScheduler

import { CommonStorageNode } from "cmstr/node";
import { IDBBackend } from "cmstr/idb";
import { SetIntervalScheduler } from "cmstr/scheduler";
import { CMSTR_URL, INDEX_TOPIC, IDB_NAME, POLL_INTERVAL_MS } from "./constants.ts";

export type { ChangeEvent } from "cmstr/node";

let node: CommonStorageNode | null = null;

export async function initNode(token: string): Promise<CommonStorageNode> {
  node?.stop();
  const backend   = await IDBBackend.open(IDB_NAME);
  const scheduler = new SetIntervalScheduler();
  node = new CommonStorageNode(
    { backend, scheduler },
    { objects: [{ topic: INDEX_TOPIC, remoteUrl: CMSTR_URL, token, intervalMs: POLL_INTERVAL_MS }] },
  );
  return node;
}

export async function writeEntry(id: string, text: string): Promise<void> {
  if (!node) throw new Error("node not initialised");
  await node.putObject(INDEX_TOPIC, id, { text, createdAt: Date.now() });
}

export async function deleteEntry(id: string): Promise<void> {
  if (!node) throw new Error("node not initialised");
  await node.deleteObject(INDEX_TOPIC, id);
}
