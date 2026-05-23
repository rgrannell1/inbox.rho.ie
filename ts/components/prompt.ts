// Prompt — textarea for capturing new entries; Enter submits, Shift+Enter adds newline

import m from "mithril";
import { store } from "../state.ts";
import { writeEntry } from "../sync.ts";
import type { Entry } from "../types.ts";

let draft = "";

function autoResize(el: HTMLTextAreaElement): void {
  const lineH = parseFloat(getComputedStyle(el).lineHeight);
  el.style.height = "0";
  const lines = Math.ceil(el.scrollHeight / lineH);
  el.style.height = `${lines * lineH}px`;
}

function onInput(event: Event): void {
  const el = event.target as HTMLTextAreaElement;
  draft = el.value;
  autoResize(el);
}

async function submit(el: HTMLTextAreaElement): Promise<void> {
  const text = draft.trim();
  if (!text || !store.state.token) return;

  const id  = crypto.randomUUID();
  const now = Date.now();
  const optimistic: Entry = { id, seq: 0, createdAt: now, updatedAt: now, payload: { text, createdAt: now } };

  store.applyEntry(optimistic);
  draft = "";
  el.value = "";
  autoResize(el);
  el.scrollIntoView({ behavior: "smooth", block: "center" });

  try {
    await writeEntry(store.state.token, id, text);
  } catch (err) {
    store.applyEntry({ ...optimistic, payload: null });
    const message = err instanceof Error ? err.message : String(err);
    const stack   = err instanceof Error ? (err.stack ?? "(no stack)") : "(no stack)";
    store.setFatalError(message, stack);
  }
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    submit(event.target as HTMLTextAreaElement);
  }
}

export function Prompt() {
  return {
    view() {
      if (!store.state.token) return null;

      return [
        m("div.prompt-area", [
          m("span.prompt-sigil", ">"),
          m("textarea.prompt-input", {
            placeholder: "capture…",
            oninput:     onInput,
            onkeydown:   onKeydown,
            oncreate(vnode: m.VnodeDOM) {
              (vnode.dom as HTMLTextAreaElement).focus();
            },
          }),
        ]),
        m("div.prompt-after"),
      ];
    },
  };
}
