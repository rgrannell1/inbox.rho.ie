// Project-wide constants

// Base URL for the cmstr server
export const CMSTR_URL = "https://cs.rho.ie";

// cmstr object topic for inbox entries
export const INDEX_TOPIC = "inbox";

// IndexedDB database name
export const IDB_NAME = "index-rho-ie";

// IDB object store for live entries
export const STORE_ENTRIES = "entries";

// IDB key-value meta store
export const STORE_META = "meta";

// Meta key — bearer token
export const META_TOKEN = "token";

// Meta key — last seen object seq
export const META_LAST_SEQ = "lastSeq";

// Meta key — whether last sync ended with an auth error
export const META_AUTH_ERROR = "authError";

// How long to wait with no new objects before treating the stream as exhausted
export const STREAM_IDLE_TIMEOUT_MS = 3_000;

// How often to poll for updates
export const POLL_INTERVAL_MS = 30_000;
