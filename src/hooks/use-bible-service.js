"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getTranslations,
  getTranslation,
  getChapter,
} from "../services/bible-service";

const TRANSLATIONS_TTL = 5 * 60 * 1000;
const BOOKS_TTL = 10 * 60 * 1000;
const CHAPTERS_TTL = 10 * 60 * 1000;

const cache = {
  translations: { data: null, timestamp: 0, ttl: TRANSLATIONS_TTL },
  translationBooks: new Map(),
  chapters: new Map(),
};

const pending = {
  translationBooks: new Map(),
  chapters: new Map(),
};

function isFresh(entry) {
  return !!entry && Date.now() - entry.timestamp < entry.ttl;
}

function setCached(map, key, data, ttl) {
  map.set(key, { data, timestamp: Date.now(), ttl });
}

function getCached(map, key) {
  const entry = map.get(key);
  if (!isFresh(entry)) {
    if (entry) map.delete(key);
    return undefined;
  }
  return entry.data;
}

function dedupe(pendingMap, key, fetchFn) {
  if (pendingMap.has(key)) return pendingMap.get(key);
  const p = fetchFn().finally(() => pendingMap.delete(key));
  pendingMap.set(key, p);
  return p;
}

function isAbortError(err) {
  return err?.name === "AbortError";
}

function sameVerses(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].verse !== b[i].verse || a[i].text !== b[i].text) return false;
  }
  return true;
}

export function useBibleService({
  translationId,
  bookId,
  chapter,
  onChange,
  onTranslationLoaded,
  onBooksLoaded,
  onVersesLoaded,
} = {}) {
  const [translations, setTranslations] = useState([]);
  const [translationBooks, setTranslationBooks] = useState([]);
  const [verses, setVerses] = useState([]);
  const [loadingTranslations, setLoadingTranslations] = useState(false);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [loadingVerses, setLoadingVerses] = useState(false);
  const [error, setError] = useState(null);
  const [staleDataAvailable, setStaleDataAvailable] = useState(false);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onTranslationLoadedRef = useRef(onTranslationLoaded);
  onTranslationLoadedRef.current = onTranslationLoaded;
  const onBooksLoadedRef = useRef(onBooksLoaded);
  onBooksLoadedRef.current = onBooksLoaded;
  const onVersesLoadedRef = useRef(onVersesLoaded);
  onVersesLoadedRef.current = onVersesLoaded;

  const translationIdRef = useRef(translationId);
  translationIdRef.current = translationId;
  const bookIdRef = useRef(bookId);
  bookIdRef.current = bookId;
  const chapterRef = useRef(chapter);
  chapterRef.current = chapter;
  const versesRef = useRef(verses);
  versesRef.current = verses;
  const verseKeyRef = useRef(null);

  useEffect(() => {
    if (isFresh(cache.translations)) {
      const list = cache.translations.data;
      setTranslations(list);
      onTranslationLoadedRef.current?.(list);
      return;
    }
    const controller = new AbortController();
    let cancelled = false;
    setLoadingTranslations(true);
    setError((e) => (e?.type === "translations" ? null : e));
    getTranslations({ signal: controller.signal })
      .then((list) => {
        if (cancelled) return;
        cache.translations = { data: list, timestamp: Date.now(), ttl: TRANSLATIONS_TTL };
        setTranslations(list);
        onTranslationLoadedRef.current?.(list);
      })
      .catch((err) => {
        if (cancelled || isAbortError(err)) return;
        setError({ type: "translations", message: String(err?.message ?? err) });
      })
      .finally(() => {
        if (!cancelled) setLoadingTranslations(false);
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!translationId) {
      setTranslationBooks([]);
      setLoadingBooks(false);
      return;
    }
    const cached = getCached(cache.translationBooks, translationId);
    if (cached !== undefined) {
      setTranslationBooks(cached);
      onBooksLoadedRef.current?.(cached);
      return;
    }
    const controller = new AbortController();
    let cancelled = false;
    setLoadingBooks(true);
    setError((e) => (e?.type === "books" ? null : e));
    dedupe(pending.translationBooks, translationId, () =>
      getTranslation(translationId, { signal: controller.signal })
    )
      .then((translation) => {
        if (cancelled) return;
        const books = translation?.books ?? [];
        setCached(cache.translationBooks, translationId, books, BOOKS_TTL);
        setTranslationBooks(books);
        onBooksLoadedRef.current?.(books);
      })
      .catch((err) => {
        if (cancelled || isAbortError(err)) return;
        setError({ type: "books", message: String(err?.message ?? err) });
      })
      .finally(() => {
        if (!cancelled) setLoadingBooks(false);
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [translationId]);

  useEffect(() => {
    if (!translationId || !bookId) {
      setVerses([]);
      verseKeyRef.current = null;
      return;
    }
    const currentChapter = chapter ?? 1;
    const key = `${translationId}:${bookId}:${currentChapter}`;
    const cached = getCached(cache.chapters, key);
    if (cached !== undefined) {
      setVerses(cached);
      verseKeyRef.current = key;
      onVersesLoadedRef.current?.(cached);
      return;
    }
    const controller = new AbortController();
    let cancelled = false;
    setLoadingVerses(true);
    setError((e) => (e?.type === "verses" ? null : e));
    dedupe(pending.chapters, key, () =>
      getChapter(translationId, bookId, currentChapter, { signal: controller.signal })
    )
      .then((data) => {
        if (cancelled) return;
        setCached(cache.chapters, key, data, CHAPTERS_TTL);
        if (verseKeyRef.current === key && !sameVerses(versesRef.current, data)) {
          setStaleDataAvailable(true);
        }
        verseKeyRef.current = key;
        setVerses(data);
        onVersesLoadedRef.current?.(data);
      })
      .catch((err) => {
        if (cancelled || isAbortError(err)) return;
        setError({ type: "verses", message: String(err?.message ?? err) });
      })
      .finally(() => {
        if (!cancelled) setLoadingVerses(false);
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [translationId, bookId, chapter]);

  const setTranslation = useCallback(
    (id) => {
      if (id === translationIdRef.current) return;
      onChangeRef.current?.({
        translationId: id,
        bookId: bookIdRef.current,
        chapter: chapterRef.current ?? 1,
      });
    },
    []
  );

  const setBook = useCallback(
    (id) => {
      if (id === bookIdRef.current) return;
      onChangeRef.current?.({
        translationId: translationIdRef.current,
        bookId: id,
        chapter: 1,
      });
    },
    []
  );

  const setChapter = useCallback(
    (n) => {
      if (n === (chapterRef.current ?? 1)) return;
      onChangeRef.current?.({
        translationId: translationIdRef.current,
        bookId: bookIdRef.current,
        chapter: n,
      });
    },
    []
  );

  const clearError = useCallback(() => setError(null), []);
  const clearStaleNotice = useCallback(() => setStaleDataAvailable(false), []);

  return {
    translations,
    translationBooks,
    verses,
    loadingTranslations,
    loadingBooks,
    loadingVerses,
    error,
    staleDataAvailable,
    setTranslation,
    setBook,
    setChapter,
    clearError,
    clearStaleNotice,
  };
}
