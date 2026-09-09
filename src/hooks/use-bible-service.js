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

function useAsyncResource({
  enabled,
  cacheRead,
  cacheWrite,
  load,
  setData,
  setLoading,
  setError,
  errorType,
  onLoaded,
  onSkip,
  onCleanup,
  deps,
}) {
  useEffect(() => {
    let cancelled = false;
    let controller = null;
    if (!enabled) {
      setData([]);
      onSkip?.();
    } else {
      const cached = cacheRead();
      if (cached !== undefined) {
        setData(cached);
        onLoaded?.(cached);
      } else {
        controller = new AbortController();
        setLoading(true);
        setError((e) => (e?.type === errorType ? null : e));
        load(controller.signal)
          .then((data) => {
            if (cancelled) return;
            cacheWrite(data);
            setData(data);
            onLoaded?.(data);
          })
          .catch((err) => {
            if (cancelled || isAbortError(err)) return;
            setError({ type: errorType, message: String(err?.message ?? err) });
          })
          .finally(() => {
            if (!cancelled) setLoading(false);
          });
      }
    }
    return () => {
      cancelled = true;
      controller?.abort();
      onCleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
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
  const onTranslationLoadedRef = useRef(onTranslationLoaded);
  const onBooksLoadedRef = useRef(onBooksLoaded);
  const onVersesLoadedRef = useRef(onVersesLoaded);
  const translationIdRef = useRef(translationId);
  const bookIdRef = useRef(bookId);
  const chapterRef = useRef(chapter);
  const versesRef = useRef(verses);
  const verseKeyRef = useRef(null);

  useEffect(() => {
    onChangeRef.current = onChange;
    onTranslationLoadedRef.current = onTranslationLoaded;
    onBooksLoadedRef.current = onBooksLoaded;
    onVersesLoadedRef.current = onVersesLoaded;
    translationIdRef.current = translationId;
    bookIdRef.current = bookId;
    chapterRef.current = chapter;
    versesRef.current = verses;
  });

  useAsyncResource({
    enabled: true,
    cacheRead: () => (isFresh(cache.translations) ? cache.translations.data : undefined),
    cacheWrite: (list) => {
      cache.translations = { data: list, timestamp: Date.now(), ttl: TRANSLATIONS_TTL };
    },
    load: (signal) => getTranslations({ signal }),
    setData: setTranslations,
    setLoading: setLoadingTranslations,
    setError,
    errorType: "translations",
    onLoaded: (list) => onTranslationLoadedRef.current?.(list),
    deps: [],
  });

  useAsyncResource({
    enabled: !!translationId,
    cacheRead: () => getCached(cache.translationBooks, translationId),
    cacheWrite: (books) => setCached(cache.translationBooks, translationId, books, BOOKS_TTL),
    load: (signal) =>
      dedupe(pending.translationBooks, translationId, () =>
        getTranslation(translationId, { signal }).then((translation) => translation?.books ?? [])
      ),
    setData: setTranslationBooks,
    setLoading: setLoadingBooks,
    setError,
    errorType: "books",
    onLoaded: (books) => onBooksLoadedRef.current?.(books),
    onSkip: () => setLoadingBooks(false),
    deps: [translationId],
  });

  const currentChapter = chapter ?? 1;
  const verseKey = `${translationId}:${bookId}:${currentChapter}`;
  useAsyncResource({
    enabled: !!translationId && !!bookId,
    cacheRead: () => getCached(cache.chapters, verseKey),
    cacheWrite: (data) => setCached(cache.chapters, verseKey, data, CHAPTERS_TTL),
    load: (signal) =>
      dedupe(pending.chapters, verseKey, () =>
        getChapter(translationId, bookId, currentChapter, { signal })
      ),
    setData: setVerses,
    setLoading: setLoadingVerses,
    setError,
    errorType: "verses",
    onLoaded: (data) => {
      if (verseKeyRef.current === verseKey && !sameVerses(versesRef.current, data)) {
        setStaleDataAvailable(true);
      }
      verseKeyRef.current = verseKey;
      onVersesLoadedRef.current?.(data);
    },
    onSkip: () => {
      verseKeyRef.current = null;
    },
    onCleanup: () => {
      verseKeyRef.current = null;
    },
    deps: [translationId, bookId, chapter],
  });

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
    clearStaleNotice,
  };
}