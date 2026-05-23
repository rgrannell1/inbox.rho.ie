// Entry point — reads stored token, mounts Mithril app, kicks off sync

import m from "mithril";
import { readToken, readAuthError } from "./storage.ts";
import { store } from "./state.ts";
import { startSync, startPollLoop } from "./boot.ts";
import { App } from "./components/app.ts";

window.addEventListener("error", (event) => {
  store.setFatalError(event.message, event.error?.stack ?? "(no stack)");
});

window.addEventListener("unhandledrejection", (event) => {
  const err = event.reason;
  const message = err instanceof Error ? err.message : String(err);
  const stack   = err instanceof Error ? (err.stack ?? "(no stack)") : "(no stack)";
  store.setFatalError(message, stack);
});

async function main(): Promise<void> {
  const [token, hadAuthError] = await Promise.all([readToken(), readAuthError()]);

  if (token) {
    store.setToken(token);
  } else {
    store.openAuthModal();
  }

  if (token && hadAuthError) store.openAuthModal();

  m.mount(document.getElementById("app")!, App());

  if (token && !hadAuthError) {
    startSync(token)
      .then(() => startPollLoop(token))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        const stack   = err instanceof Error ? (err.stack ?? "(no stack)") : "(no stack)";
        store.setFatalError(message, stack);
      });
  }
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  const stack   = err instanceof Error ? (err.stack ?? "(no stack)") : "(no stack)";
  store.setFatalError(message, stack);
});
