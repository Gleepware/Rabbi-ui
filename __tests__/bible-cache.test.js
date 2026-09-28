import { afterEach, describe, expect, it, vi } from "vitest";
import {
  BOOKS_TTL,
  CHAPTERS_TTL,
  COPYRIGHTS_TTL,
  MAX_CHAPTERS_PER_TRANSLATION,
  TRANSLATIONS_TTL,
  clearBibleCache,
  readChapter,
  readCopyrights,
  readTranslationBooks,
  readTranslations,
  sweepLegacyCacheKeys,
  translationCacheKey,
  writeChapter,
  writeCopyrights,
  writeTranslationBooks,
  writeTranslations,
} from "../src/services/bible-cache";

const KJV = "de4e12af7f28f599-01";
const RVR60 = "de4e12af7f28f599-03";
const CHAPTERS = [{ verse: 1, text: "In the beginning God created the heaven and the earth." }];

function setItem(key, value) {
  localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
}

function readRawBlob(translationId) {
  return JSON.parse(localStorage.getItem(translationCacheKey(translationId)));
}

function keysInStore() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i));
  return keys;
}

describe("bible-cache", () => {
  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it("round-trips a bundle and reports it fresh before the ttl elapses", () => {
    const written = writeTranslations([1, 2, 3]);

    const read = readTranslations();

    expect(read.data).toEqual([1, 2, 3]);
    expect(read.retrievedAt).toBe(written.retrievedAt);
    expect(read.expiresAt).toBe(written.retrievedAt + TRANSLATIONS_TTL);
    expect(read.isStale).toBe(false);
  });

  it("caches copyrights under a single dedicated key", () => {
    const written = writeCopyrights([{ bibleId: KJV }]);

    const read = readCopyrights();

    expect(read.data).toEqual([{ bibleId: KJV }]);
    expect(read.expiresAt).toBe(written.retrievedAt + COPYRIGHTS_TTL);
    expect(read.isStale).toBe(false);
    expect(keysInStore()).toEqual(["bible:copyrights"]);
  });

  it("stores loaded chapters under their translation key", () => {
    writeChapter(KJV, "GEN", 1, CHAPTERS);

    expect(keysInStore()).toEqual([translationCacheKey(KJV)]);
    expect(readChapter(KJV, "GEN", 1).data).toEqual(CHAPTERS);
    expect(readChapter(KJV, "GEN", 2)).toBeNull();
    expect(readChapter(RVR60, "GEN", 1)).toBeNull();
  });

  it("keeps books and chapters as independent fragments of one translation key", () => {
    writeChapter(KJV, "GEN", 1, CHAPTERS);
    writeTranslationBooks(KJV, [{ id: "GEN" }]);

    const blob = readRawBlob(KJV);
    expect(blob.books.data).toEqual([{ id: "GEN" }]);
    expect(blob.chapters["GEN:1"].data).toEqual(CHAPTERS);
    expect(readTranslationBooks(KJV).data).toEqual([{ id: "GEN" }]);
    expect(readChapter(KJV, "GEN", 1).data).toEqual(CHAPTERS);
  });

  it("expires books and chapters on their own clocks", () => {
    const written = writeTranslationBooks(KJV, [{ id: "GEN" }]);
    writeChapter(KJV, "GEN", 1, CHAPTERS);
    const blob = readRawBlob(KJV);
    blob.books.expiresAt = Date.now() - 1;
    blob.chapters["GEN:1"].expiresAt = Date.now() + CHAPTERS_TTL;
    setItem(translationCacheKey(KJV), blob);

    expect(readTranslationBooks(KJV).isStale).toBe(true);
    expect(readTranslationBooks(KJV).data).toEqual([{ id: "GEN" }]);
    expect(readChapter(KJV, "GEN", 1).isStale).toBe(false);
    expect(written.expiresAt).toBeGreaterThan(0);
  });

  it("reports an expired entry as stale but still returns its data", () => {
    const written = writeChapter(KJV, "GEN", 1, CHAPTERS);
    const blob = readRawBlob(KJV);
    blob.chapters["GEN:1"].expiresAt = Date.now() - 1;
    setItem(translationCacheKey(KJV), blob);

    const read = readChapter(KJV, "GEN", 1);

    expect(read.isStale).toBe(true);
    expect(read.data).toEqual(CHAPTERS);
    expect(written.retrievedAt).toBeGreaterThan(0);
  });

  it("treats a fragment with no expiry as stale", () => {
    writeChapter(KJV, "GEN", 1, CHAPTERS);
    const blob = readRawBlob(KJV);
    delete blob.chapters["GEN:1"].expiresAt;
    setItem(translationCacheKey(KJV), blob);

    expect(readChapter(KJV, "GEN", 1).isStale).toBe(true);
    expect(readChapter(KJV, "GEN", 1).data).toEqual(CHAPTERS);
  });

  it("returns null for a miss and for unparseable or malformed entries", () => {
    expect(readChapter(KJV, "GEN", 99)).toBeNull();

    const corrupt = translationCacheKey(KJV);
    setItem(corrupt, "{not json");
    expect(readChapter(KJV, "GEN", 1)).toBeNull();
    expect(localStorage.getItem(corrupt)).toBeNull();

    setItem(corrupt, { chapters: { "GEN:2": { retrievedAt: 1 } } });
    expect(readChapter(KJV, "GEN", 2)).toBeNull();
  });

  it("evicts the least recently used chapters past the per-translation cap", () => {
    for (let i = 0; i < MAX_CHAPTERS_PER_TRANSLATION; i++) {
      writeChapter(KJV, "GEN", i, [{ verse: i }]);
    }
    expect(Object.keys(readRawBlob(KJV).chapters)).toHaveLength(MAX_CHAPTERS_PER_TRANSLATION);

    writeChapter(KJV, "GEN", 999, CHAPTERS);

    const remaining = Object.keys(readRawBlob(KJV).chapters);
    expect(remaining).toHaveLength(MAX_CHAPTERS_PER_TRANSLATION);
    expect(readChapter(KJV, "GEN", 0)).toBeNull();
    expect(readChapter(KJV, "GEN", 999).data).toEqual(CHAPTERS);
  });

  it("spares other translations when a cap is reached", () => {
    for (let i = 0; i <= MAX_CHAPTERS_PER_TRANSLATION; i++) {
      writeChapter(KJV, "GEN", i, [{ verse: i }]);
    }
    writeChapter(RVR60, "GEN", 1, CHAPTERS);

    expect(Object.keys(readRawBlob(KJV).chapters)).toHaveLength(MAX_CHAPTERS_PER_TRANSLATION);
    expect(readChapter(RVR60, "GEN", 1).data).toEqual(CHAPTERS);
  });

  it("reclaims space from its own chapters when the quota is exceeded", () => {
    writeChapter(KJV, "GEN", 1, CHAPTERS);

    const original = Storage.prototype.setItem;
    let blocked = true;
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (key, value) {
      if (key === translationCacheKey(KJV) && blocked) {
        blocked = false;
        throw new DOMException("quota", "QuotaExceededError");
      }
      return original.call(this, key, value);
    });

    writeChapter(KJV, "GEN", 2, [{ verse: 2 }]);

    expect(readChapter(KJV, "GEN", 1)).toBeNull();
    expect(readChapter(KJV, "GEN", 2).data).toEqual([{ verse: 2 }]);
    setItem.mockRestore();
  });

  it("still returns the bundle when storage rejects every write", () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("quota", "QuotaExceededError");
    });

    const bundle = writeChapter(KJV, "GEN", 1, CHAPTERS);

    expect(bundle.data).toEqual(CHAPTERS);
    expect(bundle.expiresAt).toBe(bundle.retrievedAt + CHAPTERS_TTL);
    setItem.mockRestore();
  });

  it("survives storage that throws on read", () => {
    const getItem = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("denied", "SecurityError");
    });

    expect(readChapter(KJV, "GEN", 1)).toBeNull();
    expect(readTranslations()).toBeNull();
    getItem.mockRestore();
  });

  it("sweeps legacy cache keys and leaves the new layout alone", () => {
    setItem("bible-cache-index", "{}");
    setItem("bible-cache:translations", { data: [] });
    setItem("bible-cache:books:de4e12af7f28f599-01", { data: [] });
    setItem("bible-cache:chapter:de4e12af7f28f599-01:GEN:1", { data: [] });
    setItem("copyrights-cache", { data: [] });
    setItem("appState", { activity: "Reader" });
    writeChapter(KJV, "GEN", 1, CHAPTERS);

    sweepLegacyCacheKeys();

    expect(keysInStore().sort()).toEqual(["appState", translationCacheKey(KJV)].sort());

    sweepLegacyCacheKeys();
    expect(keysInStore().sort()).toEqual(["appState", translationCacheKey(KJV)].sort());
  });

  it("clears every cached bible key", () => {
    writeTranslations([1]);
    writeCopyrights([{ bibleId: KJV }]);
    writeTranslationBooks(KJV, [{ id: "GEN" }]);
    writeChapter(KJV, "GEN", 1, CHAPTERS);
    writeChapter(RVR60, "GEN", 1, CHAPTERS);

    clearBibleCache();

    expect(readTranslations()).toBeNull();
    expect(readCopyrights()).toBeNull();
    expect(readTranslationBooks(KJV)).toBeNull();
    expect(readChapter(KJV, "GEN", 1)).toBeNull();
    expect(readChapter(RVR60, "GEN", 1)).toBeNull();
    expect(keysInStore()).toEqual([]);
  });
});
