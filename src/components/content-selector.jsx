"use client";

import { useEffect, useRef, useState } from "react";
import { getTranslations, getTranslation } from "../services/bible-service";
import { useReaderContext, useNavigationContext } from "../contexts/AppContext";

export default function ContentSelector() {
  const { hydrated } = useReaderContext();
  const { ui, setUiState } = useNavigationContext();
  const reader = ui.reader ?? {};
  const translationId = reader.translationId ?? null;
  const bookId = reader.bookId ?? null;
  const chapter = reader.chapter ?? 1;

  const [translations, setTranslations] = useState([]);
  const [books, setBooks] = useState([]);
  const [spaceEm, setSpaceEm] = useState(0);

  const containerRef = useRef(null);

  const selectedTranslation =
    translations.find((t) => t.id === translationId) ?? null;
  const selectedBook = books.find((b) => b.id === bookId) ?? null;
  const chapterCount = selectedBook?.chapterCount ?? 1;

  const setReader = (patch) =>
    setUiState("reader", { ...reader, ...patch });

  useEffect(() => {
    getTranslations().then((list) => {
      setTranslations(list);
      if (!translationId && list.length > 0) {
        setReader({ translationId: list[0].id, bookId: null, chapter: 1 });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!translationId) return;
    getTranslation(translationId).then((translation) => {
      if (!translation) return;
      setBooks(translation.books);
      if (translation.books.length > 0 && !translation.books.some((b) => b.id === bookId)) {
        setReader({ bookId: translation.books[0].id, chapter: 1 });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translationId]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const style = getComputedStyle(el);
      const px = parseFloat(style.fontSize) || 16;
      setSpaceEm(el.clientWidth / px);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [hydrated]);

  const handleTranslation = (e) => {
    const id = e.target.value;
    setBooks([]);
    setReader({ translationId: id, bookId: null, chapter: 1 });
  };

  const handleBook = (e) => {
    setReader({ bookId: e.target.value, chapter: 1 });
  };

  const changeChapter = (delta) => {
    const next = chapter + delta;
    if (next < 1 || next > chapterCount) return;
    setReader({ chapter: next });
  };

  const measureEm = (text) => {
    if (!text) return 0;
    if (typeof document === "undefined") return 0;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return 0;
    ctx.font = "16px Arial, Helvetica, sans-serif";
    return ctx.measureText(text).width / 16;
  };

  const translationName = selectedTranslation?.name ?? "";
  const translationAbbrev =
    selectedTranslation?.abbreviationLocal || translationName;
  const bookName = selectedBook?.name ?? "";
  const bookAbbrev = selectedBook?.abbreviation || bookName;

  const fullEm = measureEm(translationName) + measureEm(bookName) + 12;
  const shortLabelEm = measureEm(translationAbbrev) + measureEm(bookAbbrev);
  const abbreviate = spaceEm > 0 && fullEm > spaceEm && shortLabelEm <= spaceEm;

  const showTranslationAbbrev =
    abbreviate && !!selectedTranslation?.abbreviationLocal;
  const showBookAbbrev = abbreviate && !!selectedBook?.abbreviation;

  if (!hydrated) return null;

  return (
    <div ref={containerRef} className="content-selector">
      <select
        className="content-selector-select"
        value={translationId ?? ""}
        onChange={handleTranslation}
        aria-label="Translation"
      >
        <option value="" disabled>
          Translation
        </option>
        {translations.map((t) => (
          <option key={t.id} value={t.id}>
            {showTranslationAbbrev
              ? t.abbreviationLocal || t.name
              : t.name}
          </option>
        ))}
      </select>
      <select
        className="content-selector-select"
        value={bookId ?? ""}
        onChange={handleBook}
        aria-label="Book"
        disabled={!translationId}
      >
        <option value="" disabled>
          Book
        </option>
        {books.map((b) => (
          <option key={b.id} value={b.id}>
            {showBookAbbrev ? b.abbreviation || b.name : b.name}
          </option>
        ))}
      </select>
      <div className="chapter-pill">
        <button
          className="chapter-pill-btn"
          aria-label="Previous chapter"
          onClick={() => changeChapter(-1)}
          disabled={chapter <= 1}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M15 5l-7 7 7 7z" />
          </svg>
        </button>
        <select
          className="content-selector-select"
          value={chapter}
          onChange={(e) => setReader({ chapter: Number(e.target.value) })}
          aria-label="Chapter"
          disabled={!bookId}
        >
          {Array.from({ length: chapterCount }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <button
          className="chapter-pill-btn"
          aria-label="Next chapter"
          onClick={() => changeChapter(1)}
          disabled={chapter >= chapterCount}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M9 5l7 7-7 7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
