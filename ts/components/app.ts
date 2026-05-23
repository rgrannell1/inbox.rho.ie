// App — root component; composes all panels

import m from "mithril";
import { store } from "../state.ts";
import { AuthModal } from "./auth-modal.ts";
import { Prompt } from "./prompt.ts";
import { EntryList } from "./entry-list.ts";
import { SyncStatus } from "./sync-status.ts";

export function App() {
  return {
    view() {
      if (store.state.fatalError) {
        return m("div.fatal-error", [
          m("p.fatal-title", "ERROR"),
          m("p.fatal-message", store.state.fatalError.message),
          m("pre.fatal-stack", store.state.fatalError.stack),
        ]);
      }

      return m("div.app-inner", [
        m(AuthModal),
        m("div.app-header", [
          m("span.brand", "index"),
          m(SyncStatus),
        ]),
        m(Prompt),
        m(EntryList),
      ]);
    },
  };
}
