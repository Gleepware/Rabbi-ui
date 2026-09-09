const STORAGE_KEY = "bookmarks";
const NEXT_ID_KEY = "bookmarks-next-id";

function loadStore() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function loadNextId() {
  const raw = localStorage.getItem(NEXT_ID_KEY);
  if (raw) return Number(raw);
  const maxId = loadStore().reduce((max, b) => Math.max(max, Number(b.id)), 0);
  localStorage.setItem(NEXT_ID_KEY, String(maxId + 1));
  return maxId + 1;
}

function saveNextId(id) {
  localStorage.setItem(NEXT_ID_KEY, String(id));
}

function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getBookmarks() {
  await delay();
  return [...loadStore()];
}

export async function createBookmark({ title, translationId, bookId, chapter, includeTranslation } = {}) {
  await delay();
  const nextId = loadNextId();
  const store = loadStore();
  const bookmark = {
    id: String(nextId),
    title: title ?? "",
    translationId: translationId ?? null,
    bookId: bookId ?? null,
    chapter: chapter ?? 1,
    includeTranslation: includeTranslation ?? true,
  };
  store.push(bookmark);
  saveStore(store);
  saveNextId(nextId + 1);
  return bookmark;
}

export async function updateBookmark(bookmarkId, { title, translationId, bookId, chapter, includeTranslation }) {
  await delay();
  const store = loadStore();
  const bookmark = store.find((b) => b.id === bookmarkId);
  if (!bookmark) return null;
  if (title !== undefined) bookmark.title = title;
  if (translationId !== undefined) bookmark.translationId = translationId;
  if (bookId !== undefined) bookmark.bookId = bookId;
  if (chapter !== undefined) bookmark.chapter = chapter;
  if (includeTranslation !== undefined) bookmark.includeTranslation = includeTranslation;
  saveStore(store);
  return { ...bookmark };
}

export async function deleteBookmark(bookmarkId) {
  await delay();
  const store = loadStore();
  const index = store.findIndex((b) => b.id === bookmarkId);
  if (index === -1) return null;
  const [removed] = store.splice(index, 1);
  saveStore(store);
  return removed;
}