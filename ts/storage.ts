// Auth state — localStorage helpers for token and auth error flag

// localStorage keys for auth state
const KEY_TOKEN      = "inbox:token";
const KEY_AUTH_ERROR = "inbox:authError";

export function readToken(): string | null {
  return localStorage.getItem(KEY_TOKEN);
}

export function writeToken(token: string): void {
  localStorage.setItem(KEY_TOKEN, token);
}

export function readAuthError(): boolean {
  return localStorage.getItem(KEY_AUTH_ERROR) === "true";
}

export function writeAuthError(flag: boolean): void {
  if (flag) {
    localStorage.setItem(KEY_AUTH_ERROR, "true");
  } else {
    localStorage.removeItem(KEY_AUTH_ERROR);
  }
}
