"use client";

import { useEffect, useRef, useState } from "react";
import * as bookmarkApi from "../services/bookmark-service";
import {
  useBookmarksContext,
  useNavigationContext,
  useReaderContext,
} from "../contexts/AppContext";
import useClickOutside from "../hooks/use-click-outside";
import BookmarkEditor from "./bookmark-editor";
import BookmarkRow from "./bookmark-row";
import { BookmarkIcon } from "./icons";

export default function Bookmarks() {
  const {
    bookmarks,
    setBookmarks,
    addBookmark,
    updateBookmark,
    removeBookmark,
  } = useBookmarksContext();
  const { ui, setUiState } = useNavigationContext();
  const { setActivity } = useReaderContext();
  const [open, setOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editor, setEditor] = useState(null);
  const [error, setError] = useState(null);
  const rootRef = useRef(null);
  const reader = ui.reader ?? {};

  useClickOutside(rootRef, open, () => setOpen(false));

  useEffect(() => {
    bookmarkApi
      .getBookmarks()
      .then((data) => setBookmarks(data))
      .catch(() => setError("Could not load bookmarks."));
  }, [setBookmarks]);

  const onBookmarkCreate = () => {
    setError(null);
    setDeletingId(null);
    setEditor({
      mode: "create",
      initial: {
        translationId: reader.translationId ?? null,
        bookId: reader.bookId ?? null,
        chapter: reader.chapter ?? 1,
      },
    });
  };

  const onBookmarkEdit = (bookmark) => {
    setError(null);
    setDeletingId(null);
    setEditor({ mode: "edit", bookmark });
  };

  const closeEditor = () => setEditor(null);

  const onBookmarkSave = async (values) => {
    try {
      if (editor.mode === "edit") {
        const updated = await bookmarkApi.updateBookmark(editor.bookmark.id, values);
        if (updated) updateBookmark(updated);
      } else {
        const created = await bookmarkApi.createBookmark(values);
        addBookmark(created);
      }
      closeEditor();
    } catch {
      setError("Could not save bookmark.");
    }
  };

  const onBookmarkDelete = async () => {
    if (!deletingId) return;
    try {
      await bookmarkApi.deleteBookmark(deletingId);
      removeBookmark(deletingId);
      setDeletingId(null);
    } catch {
      setError("Could not delete bookmark.");
    }
  };

  const onBookmarkOpen = (bookmark) => {
    setUiState("reader", {
      ...(bookmark.translationId ? { translationId: bookmark.translationId } : {}),
      bookId: bookmark.bookId,
      chapter: bookmark.chapter,
    });
    setActivity("Reader");
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="bookmarks">
      <button
        className="navbar-bookmarks"
        aria-label="Bookmarks"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <BookmarkIcon />
      </button>
      {open && (
        <div className="bookmarks-panel">
          <div className="bookmarks-panel-header">
            <h2 className="bookmarks-panel-title">Bookmarks</h2>
            <button className="standard-btn" onClick={onBookmarkCreate}>Create</button>
            <button className="standard-btn" onClick={() => setOpen(false)}>Close</button>
          </div>
          <div className="bookmarks-list">
            {bookmarks.length === 0 && (
              <p className="bookmarks-empty">No bookmarks</p>
            )}
            {bookmarks.map((b) => (
              <BookmarkRow
                key={b.id}
                bookmark={b}
                isDeleting={deletingId === b.id}
                onOpen={onBookmarkOpen}
                onEdit={onBookmarkEdit}
                onDelete={(bookmark) => setDeletingId(bookmark.id)}
                onCancelDelete={() => setDeletingId(null)}
                onConfirmDelete={onBookmarkDelete}
              />
            ))}
          </div>
          {error && <p className="bookmarks-error">{error}</p>}
        </div>
      )}
      {editor && (
        <BookmarkEditor
          mode={editor.mode}
          bookmark={editor.bookmark ?? null}
          initial={editor.initial ?? null}
          onBookmarkSave={onBookmarkSave}
          onBookmarkClose={closeEditor}
        />
      )}
    </div>
  );
}