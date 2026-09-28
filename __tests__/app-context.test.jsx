import { render, screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import { afterEach, describe, expect, it } from "vitest";import { AppProvider, useNavigationContext, useReaderContext } from "../src/contexts/AppContext";
import { readChapter, readTranslations, writeChapter, writeTranslations } from "../src/services/bible-cache";

const KJV = "de4e12af7f28f599-01";

// Enforces a byte budget on localStorage the way a browser enforces its quota,
// so a full bible cache starves the appState write the way it does in the browser.
function enforceQuota(bytes) {
  const original = Storage.prototype.setItem;
  const used = () => {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      total += key.length + localStorage.getItem(key).length;
    }
    return total;
  };
  const setItem = function (key, value) {
    const existing = localStorage.getItem(key);
    const projected =
      used() - (existing ? existing.length + key.length : 0) + String(value).length + String(key).length;
    if (projected > bytes) {
      throw new DOMException("quota", "QuotaExceededError");
    }
    return original.call(this, key, value);
  };
  Storage.prototype.setItem = setItem;
  return () => {
    Storage.prototype.setItem = original;
  };
}

function usedBytes() {
  return Object.keys(localStorage).reduce(
    (n, k) => n + k.length + localStorage.getItem(k).length,
    0
  );
}

const FAT_VERSES = Array.from({ length: 40 }, (_, i) => ({
  verse: i + 1,
  text: "The LORD is my shepherd; I shall not want. ".repeat(6),
}));

function Selector() {
  const { hydrated } = useReaderContext();
  const { setUiState } = useNavigationContext();
  useEffect(() => {
    if (hydrated) setUiState("reader", { translationId: KJV, bookId: "PSA", chapter: 23 });
  }, [hydrated, setUiState]);
  return <span data-testid="hydrated">{String(hydrated)}</span>;
}

// Fills the cache, then squeezes the quota down to what it already occupies so
// there is no room left for app state. This is the state a heavy reader reaches.
function fillCacheAndSqueeze() {
  const fill = enforceQuota(60_000);
  try {
    for (let chapter = 1; chapter <= 50; chapter++) writeChapter(KJV, "PSA", chapter, FAT_VERSES);
  } finally {
    fill();
  }
  return enforceQuota(usedBytes() + 40);
}

describe("app state persistence", () => {
  it("persists the reader selection even when the bible cache fills the quota", async () => {
    const restore = fillCacheAndSqueeze();
    try {
      render(
        <AppProvider>
          <Selector />
        </AppProvider>
      );
      await waitFor(() => expect(screen.getByTestId("hydrated")).toHaveTextContent("true"));

      const stored = JSON.parse(localStorage.getItem("appState"));
      expect(stored.ui.reader).toEqual({ translationId: KJV, bookId: "PSA", chapter: 23 });
    } finally {
      restore();
    }
  });

  it("yields the oldest chapters and keeps the translation list", async () => {
    writeTranslations([{ id: KJV, name: "King James Version" }]);
    const restore = fillCacheAndSqueeze();
    try {
      render(
        <AppProvider>
          <Selector />
        </AppProvider>
      );
      await waitFor(() => expect(screen.getByTestId("hydrated")).toHaveTextContent("true"));

      expect(JSON.parse(localStorage.getItem("appState")).ui.reader).toBeDefined();
      expect(readTranslations().data).toEqual([{ id: KJV, name: "King James Version" }]);
      expect(readChapter(KJV, "PSA", 1)).toBeNull();
      expect(readChapter(KJV, "PSA", 50).data).toEqual(FAT_VERSES);
    } finally {
      restore();
    }
  });
});
