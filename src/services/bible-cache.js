const COPYRIGHTS_KEY = "bible:copyrights";
const TRANSLATIONS_KEY = "bible:translations";
const TRANSLATION_PREFIX = "bible:translation:";

export const TRANSLATIONS_TTL = 12 * 60 * 60 * 1000;
export const BOOKS_TTL = 7 * 24 * 60 * 60 * 1000;
export const CHAPTERS_TTL = 30 * 24 * 60 * 60 * 1000;
export const COPYRIGHTS_TTL = 30 * 24 * 60 * 60 * 1000;

export const MAX_CHAPTERS_PER_TRANSLATION = 50;

const TOUCH_INTERVAL_MS = 60 * 1000;

const LEGACY_EXACT_KEYS = ["bible-cache-index", "copyrights-cache"];
const LEGACY_PREFIXES = ["bible-cache:"];

export function translationCacheKey(translationId) {
  return `${TRANSLATION_PREFIX}${translationId}`;
}

function chapterId(bookId, chapter) {
  return `${bookId}:${chapter}`;
}

function removeKey(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // nothing to reclaim if storage is unavailable
  }
}

function keysWithPrefix(prefix) {
  const keys = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (typeof key === "string" && key.startsWith(prefix)) keys.push(key);
    }
  } catch {
    // an unreadable store simply yields no keys
  }
  return keys;
}

function accessedAt(fragment) {
  return typeof fragment?.accessedAt === "number" ? fragment.accessedAt : 0;
}

function normalize(fragment) {
  if (!fragment || typeof fragment !== "object" || !("data" in fragment)) return null;
  const now = Date.now();
  return {
    data: fragment.data,
    retrievedAt: typeof fragment.retrievedAt === "number" ? fragment.retrievedAt : 0,
    expiresAt: typeof fragment.expiresAt === "number" ? fragment.expiresAt : 0,
    isStale: typeof fragment.expiresAt !== "number" || now >= fragment.expiresAt,
  };
}

function store(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function readFragment(key) {
  let raw;
  try {
    raw = localStorage.getItem(key);
  } catch {
    return null;
  }
  if (!raw) return null;
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    removeKey(key);
    return null;
  }
  return normalize(parsed);
}

function readBlob(translationId) {
  const key = translationCacheKey(translationId);
  let raw;
  try {
    raw = localStorage.getItem(key);
  } catch {
    return null;
  }
  if (!raw) return null;
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    removeKey(key);
    return null;
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    removeKey(key);
    return null;
  }
  return {
    books:
      parsed.books && typeof parsed.books === "object" && !Array.isArray(parsed.books)
        ? parsed.books
        : null,
    chapters:
      parsed.chapters && typeof parsed.chapters === "object" && !Array.isArray(parsed.chapters)
        ? parsed.chapters
        : {},
  };
}

function emptyBlob() {
  return { books: null, chapters: {} };
}

function chaptersByAge(chapters) {
  return Object.keys(chapters).sort((a, b) => accessedAt(chapters[a]) - accessedAt(chapters[b]));
}

function pruneChapters(chapters) {
  const keys = Object.keys(chapters);
  if (keys.length <= MAX_CHAPTERS_PER_TRANSLATION) return;
  for (const key of keys
    .sort((a, b) => accessedAt(chapters[a]) - accessedAt(chapters[b]))
    .slice(0, keys.length - MAX_CHAPTERS_PER_TRANSLATION)) {
    delete chapters[key];
  }
}

// Reclaims space from this translation's own chapters rather than from other
// translations, so a write never has to read or rewrite a sibling blob.
function persist(translationId, blob) {
  const key = translationCacheKey(translationId);
  if (store(key, blob)) return true;
  for (const victim of chaptersByAge(blob.chapters)) {
    delete blob.chapters[victim];
    if (store(key, blob)) return true;
  }
  return false;
}

export function readTranslations() {
  return readFragment(TRANSLATIONS_KEY);
}

export function writeTranslations(data) {
  const retrievedAt = Date.now();
  const fragment = { data, retrievedAt, expiresAt: retrievedAt + TRANSLATIONS_TTL };
  store(TRANSLATIONS_KEY, fragment);
  return fragment;
}

export function readCopyrights() {
  return readFragment(COPYRIGHTS_KEY);
}

export function writeCopyrights(data) {
  const retrievedAt = Date.now();
  const fragment = { data, retrievedAt, expiresAt: retrievedAt + COPYRIGHTS_TTL };
  store(COPYRIGHTS_KEY, fragment);
  return fragment;
}

export function readTranslationBooks(translationId) {
  const blob = readBlob(translationId);
  if (!blob) return null;
  return normalize(blob.books);
}

export function writeTranslationBooks(translationId, books) {
  const blob = readBlob(translationId) ?? emptyBlob();
  const retrievedAt = Date.now();
  blob.books = { data: books, retrievedAt, expiresAt: retrievedAt + BOOKS_TTL };
  persist(translationId, blob);
  return blob.books;
}

export function readChapter(translationId, bookId, chapter) {
  const blob = readBlob(translationId);
  if (!blob) return null;
  const stored = blob.chapters[chapterId(bookId, chapter)];
  const entry = normalize(stored);
  if (!entry) return null;

  const now = Date.now();
  if (now - accessedAt(stored) > TOUCH_INTERVAL_MS) {
    stored.accessedAt = now;
    persist(translationId, blob);
  }
  return entry;
}

export function writeChapter(translationId, bookId, chapter, data) {
  const blob = readBlob(translationId) ?? emptyBlob();
  const retrievedAt = Date.now();
  blob.chapters[chapterId(bookId, chapter)] = {
    data,
    retrievedAt,
    expiresAt: retrievedAt + CHAPTERS_TTL,
    accessedAt: retrievedAt,
  };
  pruneChapters(blob.chapters);
  persist(translationId, blob);
  return { data, retrievedAt, expiresAt: retrievedAt + CHAPTERS_TTL };
}

export function clearBibleCache() {
  removeKey(COPYRIGHTS_KEY);
  removeKey(TRANSLATIONS_KEY);
  for (const key of keysWithPrefix(TRANSLATION_PREFIX)) removeKey(key);
}

export function sweepLegacyCacheKeys() {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (LEGACY_EXACT_KEYS.includes(key) || LEGACY_PREFIXES.some((p) => key.startsWith(p))) {
        removeKey(key);
      }
    }
  } catch {
    // an unavailable store simply has nothing to sweep
  }
}

let initialized = false;
function init() {
  if (initialized) return;
  initialized = true;
  sweepLegacyCacheKeys();
}
init();
