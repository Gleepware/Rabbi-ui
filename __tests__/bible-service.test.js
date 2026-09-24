import { afterEach, describe, expect, it, vi } from "vitest";
import {
  API_BASE_URL,
  getTranslations,
  getTranslation,
  getChapter,
} from "../src/services/bible-service";

const KJV = "de4e12af7f28f599-01";

function jsonResponse(body, status = 200) {
  return { ok: status < 400, status, json: async () => body };
}

describe("bible-service", () => {
  let fetchMock;

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches translations with the READ verb", async () => {
    const TRANSLATIONS = [{ id: KJV, name: "King James Version", language: "English" }];
    fetchMock = vi.fn().mockResolvedValue(jsonResponse(TRANSLATIONS));
    vi.stubGlobal("fetch", fetchMock);

    const result = await getTranslations();

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/translations`,
      expect.objectContaining({ method: "READ" })
    );
    expect(result).toEqual(TRANSLATIONS);
  });

  it("fetches a translation detail and returns null on 404", async () => {
    fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ id: KJV, name: "King James Version", books: [{ id: "GEN", chapterCount: 50 }] })
      )
      .mockResolvedValueOnce(jsonResponse({ error: "not found" }, 404));
    vi.stubGlobal("fetch", fetchMock);

    const detail = await getTranslation(KJV);
    const missing = await getTranslation("nope");

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `${API_BASE_URL}/api/translations/${KJV}`,
      expect.objectContaining({ method: "READ" })
    );
    expect(detail.books).toHaveLength(1);
    expect(missing).toBeNull();
  });

  it("flattens chapter paragraphs into verse objects", async () => {
    fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        translation: KJV,
        book: "GEN",
        chapter: "1",
        paragraphs: [
          {
            verses: [
              { number: 1, text: "In the beginning God created the heaven and the earth." },
              { number: 2, text: "And the earth was without form, and void;..." },
            ],
          },
        ],
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const verses = await getChapter(KJV, "GEN", 1);

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/translations/${KJV}/GEN/1`,
      expect.objectContaining({ method: "READ" })
    );
    expect(verses).toEqual([
      { verse: 1, text: "In the beginning God created the heaven and the earth." },
      { verse: 2, text: "And the earth was without form, and void;..." },
    ]);
  });

  it("resolves to an empty verse list when the chapter has no paragraphs", async () => {
    fetchMock = vi.fn().mockResolvedValue(jsonResponse({ translation: KJV, book: "GEN", chapter: "2" }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getChapter(KJV, "GEN", 2)).resolves.toEqual([]);
  });

  it("propagates the abort signal into fetch", async () => {
    fetchMock = vi.fn().mockResolvedValue(jsonResponse([]));
    vi.stubGlobal("fetch", fetchMock);
    const signal = new AbortController().signal;

    await getTranslations({ signal });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/translations`,
      expect.objectContaining({ method: "READ", signal })
    );
  });
});