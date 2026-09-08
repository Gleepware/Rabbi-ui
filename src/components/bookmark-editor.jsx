"use client";

import { useState } from "react";
import { useBibleService } from "../hooks/use-bible-service";

export default function BookmarkEditor({ mode, bookmark, initial, onSave, onClose }) {
  const currentTranslationId = bookmark?.translationId ?? initial?.translationId ?? null;
  const currentBookId = bookmark?.bookId ?? initial?.bookId ?? null;
  const currentChapter = bookmark?.chapter ?? initial?.chapter ?? 1;

  const [includeTranslation, setIncludeTranslation] = useState(!!currentTranslationId);

  const { translations, translationBooks } = useBibleService({
    translationId: currentTranslationId,
  });

  const selectedTranslation = translations.find((t) => t.id === currentTranslationId) ?? null;
  const translationLabel = selectedTranslation?.abbreviationLocal || selectedTranslation?.name || "";
  const bookName =
    translationBooks.find((b) => b.id === currentBookId)?.name ?? currentBookId ?? "";
  const label = `${includeTranslation && translationLabel ? `${translationLabel}-` : ""}${bookName}:${currentChapter}`;

  const handleSave = () => {
    onSave({
      title: label,
      translationId: includeTranslation ? currentTranslationId : null,
      bookId: currentBookId,
      chapter: currentChapter,
    });
  };

  return (
    <div className="bookmarks-overlay">
      <div className="bookmarks-editor">
        <div className="bookmarks-editor-header">
          <h2 className="bookmarks-editor-title">
            {mode === "edit" ? "Edit Bookmark" : "Create Bookmark"}
          </h2>
          <button className="standard-btn" onClick={onClose}>Cancel</button>
        </div>
        <div className="bookmarks-editor-body">
          <p className="bookmarks-label">{label}</p>
          <label className="bookmarks-field-label bookmarks-include-row">
            <input
              type="checkbox"
              checked={includeTranslation}
              onChange={(e) => setIncludeTranslation(e.target.checked)}
            />
            Include translation
          </label>
        </div>
        <div className="bookmarks-editor-footer">
          <button className="standard-btn" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}