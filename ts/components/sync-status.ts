// SyncStatus — small indicator showing current sync state

import m from "mithril";
import { store } from "../state.ts";

export function SyncStatus() {
  return {
    view() {
      const status = store.state.syncStatus;
      if (status.kind === "idle") return null;

      const label =
        status.kind === "syncing"   ? "SYNCING…" :
        status.kind === "upToDate"  ? "UP TO DATE" :
        status.kind === "error"     ? status.message :
        "";

      const cls =
        status.kind === "syncing"   ? "sync-status--syncing" :
        status.kind === "upToDate"  ? "sync-status--ok" :
        "sync-status--error";

      return m(`span.sync-status.${cls}`, label);
    },
  };
}
