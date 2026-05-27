// Central state store — one mutable AppState, mutations trigger redraws

import m from "mithril";
import type { AppState, Entry, SyncStatus } from "./types.ts";

function initialState(): AppState {
  return {
    token:         null,
    entries:       new Map(),
    syncStatus:    { kind: "idle" },
    showAuthModal: false,
    editingId:     null,
    editDraft:     "",
    fatalError:    null,
  };
}

function applyToken(state: AppState, token: string | null): void {
  state.token = token;
  state.showAuthModal = token === null;
}

function applyEntry(state: AppState, entry: Entry): void {
  if (entry.payload === null) {
    state.entries.delete(entry.id);
  } else {
    state.entries.set(entry.id, entry);
  }
}

class Store {
  readonly #state: AppState = initialState();

  get state(): AppState { return this.#state; }

  setToken(token: string | null): void {
    applyToken(this.#state, token);
    m.redraw();
  }

  setReady(entries: Entry[]): void {
    this.#state.entries = new Map(
      entries.filter(entry => entry.payload !== null).map(entry => [entry.id, entry])
    );
    m.redraw();
  }

  applyEntry(entry: Entry): void {
    applyEntry(this.#state, entry);
    m.redraw();
  }

  setSyncStatus(status: SyncStatus): void {
    this.#state.syncStatus = status;
    m.redraw();
  }

  openAuthModal(): void {
    this.#state.showAuthModal = true;
    m.redraw();
  }

  closeAuthModal(): void {
    this.#state.showAuthModal = false;
    m.redraw();
  }

  startEdit(id: string, text: string): void {
    this.#state.editingId = id;
    this.#state.editDraft = text;
    m.redraw();
  }

  updateEditDraft(text: string): void {
    this.#state.editDraft = text;
  }

  cancelEdit(): void {
    this.#state.editingId = null;
    this.#state.editDraft = "";
    m.redraw();
  }

  setFatalError(message: string, stack: string): void {
    this.#state.fatalError = { message, stack };
    m.redraw();
  }
}

export const store = new Store();
