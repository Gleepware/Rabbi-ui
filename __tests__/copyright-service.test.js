import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import {
  API_BASE_URL,
  COPYRIGHTS_CACHE_KEY,
  COPYRIGHTS_TTL_MS,
  getCachedCopyrights,
  scheduleCopyrightsRefresh,
} from "../src/services/copyright-service";

const DATA = [
  {
    bibleId: "de4e12af7f28f599-01",
    translationName: "King James Version",
    language: "English",
    abbreviationLocal: "KJV",
    copyright: { name: "King James Version", url: "", notice: "Public domain", requirements: [] },
  },
];

function seedBundle({ data = DATA, retrievedAt = Date.now() - 1000 } = {}) {
  const bundle = { data, retrievedAt, expiresAt: retrievedAt + COPYRIGHTS_TTL_MS };
  localStorage.setItem(COPYRIGHTS_CACHE_KEY, JSON.stringify(bundle));
  return bundle;
}

function jsonResponse(body) {
  return { ok: true, json: async () => body };
}

describe("scheduleCopyrightsRefresh", () => {
  let fetchMock;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("short-circuits when the cache is unexpired", async () => {
    const seed = seedBundle();
    const result = await scheduleCopyrightsRefresh();
    expect(result).toEqual(seed);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fetches when the cache is expired and writes the bundle back", async () => {
    seedBundle({ retrievedAt: Date.now() - COPYRIGHTS_TTL_MS - 1000 });
    fetchMock.mockResolvedValue(jsonResponse(DATA));

    const result = await scheduleCopyrightsRefresh();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/api/bible/copyrights`, expect.objectContaining({ method: "READ" }));
    expect(result.data).toEqual(DATA);
    expect(result.retrievedAt).toBeLessThanOrEqual(Date.now());
    expect(result.expiresAt).toBe(result.retrievedAt + COPYRIGHTS_TTL_MS);

    const stored = getCachedCopyrights();
    expect(stored?.data).toEqual(DATA);
    expect(stored?.retrievedAt).toBe(result.retrievedAt);
    expect(stored?.expiresAt).toBe(result.expiresAt);
  });

  it("preserves the cache when the fetch fails", async () => {
    const seed = seedBundle({ retrievedAt: Date.now() - COPYRIGHTS_TTL_MS - 1000 });
    fetchMock.mockRejectedValue(new Error("network down"));

    await expect(scheduleCopyrightsRefresh()).rejects.toThrow("network down");
    expect(getCachedCopyrights()).toEqual(seed);
  });

  it("caches an empty list as valid", async () => {
    seedBundle({ data: [], retrievedAt: Date.now() - COPYRIGHTS_TTL_MS - 1000 });
    fetchMock.mockResolvedValue(jsonResponse([]));

    const result = await scheduleCopyrightsRefresh();

    expect(result.data).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const fresh = scheduleCopyrightsRefresh();
    await expect(fresh).resolves.toEqual(result);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("dedupes concurrent refreshes", async () => {
    seedBundle({ retrievedAt: Date.now() - COPYRIGHTS_TTL_MS - 1000 });
    let resolveFetch;
    fetchMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = () => resolve(jsonResponse(DATA));
        })
    );

    const first = scheduleCopyrightsRefresh();
    const second = scheduleCopyrightsRefresh();
    expect(second).toBe(first);

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    resolveFetch();
    await expect(first).resolves.toMatchObject({ data: DATA });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("falls back to setTimeout when requestIdleCallback is unavailable", async () => {
    const originalIdle = globalThis.requestIdleCallback;
    const originalCancel = globalThis.cancelIdleCallback;
    delete globalThis.requestIdleCallback;
    delete globalThis.cancelIdleCallback;

    try {
      seedBundle({ retrievedAt: Date.now() - COPYRIGHTS_TTL_MS - 1000 });
      fetchMock.mockResolvedValue(jsonResponse(DATA));

      const result = await scheduleCopyrightsRefresh();
      expect(result.data).toEqual(DATA);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    } finally {
      globalThis.requestIdleCallback = originalIdle;
      globalThis.cancelIdleCallback = originalCancel;
    }
  });
});