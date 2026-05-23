// EntryRow — single entry with inline edit and delete

import m from "mithril";
import { store } from "../state.ts";
import { writeEntry, deleteEntry } from "../sync.ts";
import type { Entry } from "../types.ts";

type Attrs = { entry: Entry };

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" });
}

function autoResize(el: HTMLTextAreaElement): void {
  const lineH = parseFloat(getComputedStyle(el).lineHeight);
  el.style.height = "0";
  const lines = Math.ceil(el.scrollHeight / lineH);
  el.style.height = `${lines * lineH}px`;
}

function onEditInput(event: Event): void {
  const el = event.target as HTMLTextAreaElement;
  store.updateEditDraft(el.value);
  autoResize(el);
}

async function saveEdit(entry: Entry): Promise<void> {
  const text = store.state.editDraft.trim();
  if (!text || !store.state.token) {
    store.cancelEdit();
    return;
  }
  const updated: Entry = { ...entry, payload: { text, createdAt: entry.payload!.createdAt }, updatedAt: Date.now() };
  store.applyEntry(updated);
  store.cancelEdit();
  await writeEntry(store.state.token, entry.id, text);
}

function onEditKeydown(entry: Entry, event: KeyboardEvent): void {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    saveEdit(entry);
  } else if (event.key === "Escape") {
    store.cancelEdit();
  }
}

async function onDelete(entry: Entry): Promise<void> {
  if (!store.state.token) return;
  store.applyEntry({ ...entry, payload: null });
  await deleteEntry(store.state.token, entry.id);
}

function viewEditing(entry: Entry) {
  return m("div.entry-card.entry-card--editing", [
    m("textarea.entry-edit-input", {
      oninput:   onEditInput,
      onkeydown: (event: KeyboardEvent) => onEditKeydown(entry, event),
      oncreate(vnode: m.VnodeDOM) {
        const el = vnode.dom as HTMLTextAreaElement;
        el.value = store.state.editDraft;
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
        autoResize(el);
      },
    }),
    m("div.entry-edit-actions", [
      m("button.entry-btn[type=button]", { onclick: () => saveEdit(entry) }, "SAVE"),
      m("button.entry-btn.entry-btn--dim[type=button]", { onclick: () => store.cancelEdit() }, "CANCEL"),
    ]),
  ]);
}

function viewEntry(entry: Entry) {
  const payload = entry.payload!;
  return m("div.entry-card", [
    m("span.entry-date", formatDate(payload.createdAt)),
    m("p.entry-text", { onclick: () => store.startEdit(entry.id, payload.text) }, payload.text),
    m("div.entry-actions", [
      m("button.entry-btn.entry-btn--dim[type=button]", { onclick: () => onDelete(entry) }, "×"),
    ]),
  ]);
}

export function EntryRow(): { view(vnode: m.Vnode<Attrs>): m.Children } {
  return {
    view(vnode: m.Vnode<Attrs>) {
      const { entry } = vnode.attrs;
      if (store.state.editingId === entry.id) return viewEditing(entry);
      return viewEntry(entry);
    },
  };
}
