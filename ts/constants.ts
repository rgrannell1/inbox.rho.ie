// Project-wide constants

// Base URL for the cmstr server
export const CMSTR_URL = "https://cs.rho.ie";

// cmstr object topic for inbox entries
export const INDEX_TOPIC = "inbox";

// IndexedDB database name (v2 — uses IDBBackend schema, incompatible with v1)
export const IDB_NAME = "index-rho-ie-v2";

// How often to poll for updates
export const POLL_INTERVAL_MS = 30_000;
