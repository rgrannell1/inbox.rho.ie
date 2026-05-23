// Domain types — entry shapes and app state

export type EntryPayload = {
  text: string;
  createdAt: number;
};

export type Entry = {
  id: string;
  seq: number;
  createdAt: number;
  updatedAt: number;
  payload: EntryPayload | null;
};

export type SyncStatus =
  | { kind: "idle" }
  | { kind: "syncing" }
  | { kind: "upToDate" }
  | { kind: "error"; message: string };

export type AppState = {
  token: string | null;
  entries: Map<string, Entry>;
  lastSeq: number;
  syncStatus: SyncStatus;
  showAuthModal: boolean;
  editingId: string | null;
  editDraft: string;
  fatalError: { message: string; stack: string } | null;
};
