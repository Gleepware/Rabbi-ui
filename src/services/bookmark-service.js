import { createLocalStore } from "./local-store";

const store = createLocalStore({ storeKey: "bookmarks", nextIdKey: "bookmarks-next-id" });

export async function getBookmarks() {
  return store.list();
}

export async function createBookmark({ title, translationId, bookId, chapter, includeTranslation } = {}) {
  return store.create((id) => ({
    id,
    title: title ?? "",
    translationId: translationId ?? null,
    bookId: bookId ?? null,
    chapter: chapter ?? 1,
    includeTranslation: includeTranslation ?? true,
  }));
}

export async function updateBookmark(bookmarkId, { title, translationId, bookId, chapter, includeTranslation }) {
  return store.update(bookmarkId, { title, translationId, bookId, chapter, includeTranslation });
}

export async function deleteBookmark(bookmarkId) {
  return store.remove(bookmarkId);
}