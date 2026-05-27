// AuthModal — token entry; shown on first load when no token is stored

import m from "mithril";
import { store } from "../state.ts";
import { writeToken } from "../storage.ts";
import { startSync, startPollLoop } from "../boot.ts";

let tokenDraft = "";

function onTokenInput(event: Event): void {
  tokenDraft = (event.target as HTMLInputElement).value;
}

async function submitToken(event: Event): Promise<void> {
  event.preventDefault();
  const token = tokenDraft.trim();
  if (!token) return;
  writeToken(token);
  store.setToken(token);
  tokenDraft = "";
  startSync(token)
    .then(() => startPollLoop(token))
    .catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      const stack   = err instanceof Error ? (err.stack ?? "(no stack)") : "(no stack)";
      store.setFatalError(message, stack);
    });
}

function closeIfAuthed(): void {
  if (store.state.token) store.closeAuthModal();
}

function onEscKey(event: KeyboardEvent): void {
  if (event.key === "Escape") closeIfAuthed();
}

function onPanelClick(event: Event): void {
  event.stopPropagation();
}

export function AuthModal() {
  return {
    view() {
      if (!store.state.showAuthModal) return null;
      const canClose = Boolean(store.state.token);

      return m("div.modal-backdrop", {
        onclick:  closeIfAuthed,
        oncreate: () => document.addEventListener("keydown", onEscKey),
        onremove: () => document.removeEventListener("keydown", onEscKey),
      }, [
        m("div.modal-panel", { onclick: onPanelClick }, [
          canClose
            ? m("button.modal-close[type=button]", { onclick: () => store.closeAuthModal() }, "×")
            : null,
          m("p.modal-title", "AUTHENTICATE"),
          m("p.modal-subtitle", "bearer token — cs.rho.ie"),
          m("form.modal-form", { onsubmit: submitToken }, [
            m("input.modal-input", {
              type:         "password",
              placeholder:  "token…",
              oninput:      onTokenInput,
              autocomplete: "off",
              oncreate(vnode: m.VnodeDOM) {
                (vnode.dom as HTMLInputElement).focus();
              },
            }),
            m("button.modal-submit[type=submit]", "CONNECT"),
          ]),
        ]),
      ]);
    },
  };
}
