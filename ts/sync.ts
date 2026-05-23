// Sync — stream objects from cmstr, write and delete entries

import { CmstrClient } from "cmstr";
import { applyEntryToStorage } from "./storage.ts";
import { CMSTR_URL, INDEX_TOPIC, STREAM_IDLE_TIMEOUT_MS } from "./constants.ts";
import type { Entry } from "./types.ts";

// Streams objects from startSeq onward, aborting after STREAM_IDLE_TIMEOUT_MS of silence.
// Calls onEntry for each received object so the caller can update state immediately.
export async function streamEntries(
  token: string,
  startSeq: number,
  onEntry: (entry: Entry) => void,
): Promise<void> {
  const client = new CmstrClient({ url: CMSTR_URL, token });
  const controller = new AbortController();
  let idleTimer: ReturnType<typeof setTimeout> | null = null;

  function resetIdleTimer(): void {
    if (idleTimer !== null) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => controller.abort(), STREAM_IDLE_TIMEOUT_MS);
  }

  resetIdleTimer();

  try {
    const start = startSeq > 0 ? startSeq : undefined;
    for await (const obj of client.streamObjects({ topic: INDEX_TOPIC, start, signal: controller.signal })) {
      resetIdleTimer();
      const entry = obj as Entry;
      await applyEntryToStorage(entry);
      onEntry(entry);
    }
  } catch (err) {
    if (!(err instanceof DOMException && err.name === "AbortError")) throw err;
  } finally {
    if (idleTimer !== null) clearTimeout(idleTimer);
  }
}

export async function writeEntry(token: string, id: string, text: string): Promise<void> {
  const client = new CmstrClient({ url: CMSTR_URL, token });
  await client.putObject({
    topic:           INDEX_TOPIC,
    id,
    payload:         { text, createdAt: Date.now() },
    idempotencyKey:  id,
  });
}

export async function deleteEntry(token: string, id: string): Promise<void> {
  const client = new CmstrClient({ url: CMSTR_URL, token });
  await client.deleteObject({ topic: INDEX_TOPIC, id });
}
