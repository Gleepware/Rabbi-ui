"use client";

import { useEffect, useRef, useState } from "react";
import {
  getBookmarks,
  createBookmark as createBookmarkApi,
  updateBookmark as updateBookmarkApi,
  deleteBookmark as deleteBookmarkApi,
} from "../services/bookmark-service";
import {
  useBookmarksContext,
  useNavigationContext,
  useReaderContext,
} from "../contexts/AppContext";
import BookmarkEditor from "./bookmark-editor";

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

  useEffect(() => {
    getBookmarks().then((data) => setBookmarks(data));
  }, [setBookmarks]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleCreate = () => {
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

  const handleEdit = (bookmark) => {
    setError(null);
    setDeletingId(null);
    setEditor({ mode: "edit", bookmark });
  };

  const closeEditor = () => setEditor(null);

  const handleSave = async (values) => {
    try {
      if (editor.mode === "edit") {
        const updated = await updateBookmarkApi(editor.bookmark.id, values);
        if (updated) updateBookmark(updated);
      } else {
        const created = await createBookmarkApi(values);
        addBookmark(created);
      }
      closeEditor();
    } catch {
      setError("Could not save bookmark.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteBookmarkApi(deletingId);
      removeBookmark(deletingId);
      setDeletingId(null);
    } catch {
      setError("Could not delete bookmark.");
    }
  };

  const handleOpenBookmark = (bookmark) => {
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
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </button>
      {open && (
        <div className="bookmarks-panel">
          <div className="bookmarks-panel-header">
            <h2 className="bookmarks-panel-title">Bookmarks</h2>
            <button className="standard-btn" onClick={handleCreate}>Create</button>
            <button className="standard-btn" onClick={() => setOpen(false)}>Close</button>
          </div>
          <div className="bookmarks-list">
            {bookmarks.length === 0 && (
              <p className="bookmarks-empty">No bookmarks</p>
            )}
            {bookmarks.map((b) => (
              <div key={b.id} className="bookmarks-list-item">
                {deletingId === b.id ? (
                  <>
                    <span className="bookmarks-list-title">Delete &quot;{b.title}&quot;?</span>
                    <button className="standard-btn" onClick={handleConfirmDelete}>Yes</button>
                    <button className="standard-btn" onClick={() => setDeletingId(null)}>No</button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="bookmarks-list-title bookmarks-nav-btn"
                      onClick={() => handleOpenBookmark(b)}
                    >
                      {b.title}
                    </button>
                    <button
                      type="button"
                      className="bookmarks-icon-btn"
                      aria-label={`Edit ${b.title}`}
                      onClick={() => handleEdit(b)}
                    >
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="bookmarks-icon-btn"
                      aria-label={`Delete ${b.title}`}
                      onClick={() => setDeletingId(b.id)}
                    >
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18" />
                        <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
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
          onSave={handleSave}
          onClose={closeEditor}
        />
      )}
    </div>
  );
}