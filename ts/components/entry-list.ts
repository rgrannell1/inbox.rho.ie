// EntryList — scrollable list of entries, oldest first (notebook order)

import m from "mithril";
import { store } from "../state.ts";
import { EntryRow } from "./entry-row.ts";

export function EntryList() {
  return {
    view() {
      const sorted = [...store.state.entries.values()]
        .sort((entryA, entryB) => (entryA.payload?.createdAt ?? 0) - (entryB.payload?.createdAt ?? 0));

      if (sorted.length === 0) {
        return m("div.entry-list", m("p.entry-empty", "nothing yet"));
      }

      return m("div.entry-list", sorted.map(entry => m(EntryRow, { key: entry.id, entry })));
    },
  };
}
