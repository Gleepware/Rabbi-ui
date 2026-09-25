const COPYRIGHTS_CACHE_KEY = "copyrights-cache";
const COPYRIGHTS_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

let refreshInFlight = null;

function readCache() {
  try {
    const raw = localStorage.getItem(COPYRIGHTS_CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (!cached || !Array.isArray(cached.data)) return null;
    return cached;
  } catch {
    return null;
  }
}

function isExpired(cached) {
  return !cached || !cached.expiresAt || Date.now() >= cached.expiresAt;
}

function writeCache(data) {
  const retrievedAt = Date.now();
  const bundle = {
    data,
    retrievedAt,
    expiresAt: retrievedAt + COPYRIGHTS_TTL_MS,
  };
  try {
    localStorage.setItem(COPYRIGHTS_CACHE_KEY, JSON.stringify(bundle));
  } catch {
    // storage unavailable; the in-memory bundle is still returned
  }
  return bundle;
}

function runAfterIdle(task) {
  if (typeof requestIdleCallback === "function") {
    return requestIdleCallback(
      () => task(),
      { timeout: 1000 }
    );
  }
  return setTimeout(() => task(), 0);
}

function cancelIdle(id) {
  if (typeof cancelIdleCallback === "function") {
    cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
}

export function getCachedCopyrights() {
  return readCache();
}

export function scheduleCopyrightsRefresh() {
  const cached = getCachedCopyrights();
  if (isExpired(cached) && !refreshInFlight) {
    refreshInFlight = new Promise((resolve, reject) => {
      const idleId = runAfterIdle(async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/bible/copyrights`, {
            method: "READ",
            signal: new AbortController().signal,
          });
          if (!response.ok) {
            throw new Error(`Copyright request failed with status ${response.status}.`);
          }
          const data = await response.json();
          resolve(writeCache(data));
        } catch (error) {
          reject(error);
        } finally {
          refreshInFlight = null;
          cancelIdle(idleId);
        }
      });
    });
  }
  return refreshInFlight ?? Promise.resolve(cached);
}

export { COPYRIGHTS_CACHE_KEY, COPYRIGHTS_TTL_MS, API_BASE_URL };