import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { AppProvider } from "../src/contexts/AppContext";
import ContentSelector from "../src/components/content-selector";
import * as bibleService from "../src/services/bible-service";

const KJV = "de4e12af7f28f599-01";
const RVR60 = "de4e12af7f28f599-03";

const TRANSLATIONS = [
  { id: KJV, name: "King James Version", language: "English", kind: "bible", abbreviationLocal: "KJV" },
  { id: RVR60, name: "Biblia Reina Valera 1960", language: "Spanish", kind: "bible", abbreviationLocal: "RVR60" },
];

const BOOKS = [
  { id: "GEN", name: "Genesis", abbreviation: "Gen", chapterCount: 50 },
  { id: "PSA", name: "Psalms", abbreviation: "Ps", chapterCount: 150 },
];

vi.mock("../src/services/bible-service", () => ({
  API_BASE_URL: "http://localhost:8080",
  getTranslations: vi.fn(() => Promise.resolve(TRANSLATIONS.map((t) => ({ ...t })))),
  getTranslation: vi.fn((translationId) =>
    Promise.resolve(
      TRANSLATIONS.some((t) => t.id === translationId)
        ? { id: translationId, books: BOOKS.map((b) => ({ ...b })) }
        : null
    )
  ),
  getChapter: vi.fn(() => Promise.resolve([])),
}));

function renderSelector() {
  localStorage.setItem("appState", JSON.stringify({ activity: "Reader", ui: {} }));
  return render(
    <AppProvider>
      <ContentSelector />
    </AppProvider>
  );
}

function optionLabels(label) {
  return [...screen.getByLabelText(label).querySelectorAll("option")].map((o) => o.textContent);
}

// A cached hit is served synchronously, while the network resolves after the
// provider hydrates. Only the cached path can lose the auto-selected
// translation to the hydration state, so this must run before the in-memory
// cache is warmed by any other test in this file.
test("auto-selects the first translation from the cache before the app hydrates", async () => {
  const now = Date.now();
  localStorage.setItem("bible:translations", JSON.stringify({ data: TRANSLATIONS, retrievedAt: now, expiresAt: now + 60 * 60 * 1000 }));
  localStorage.setItem("appState", JSON.stringify({ activity: "Reader", ui: {} }));

  render(
    <AppProvider>
      <ContentSelector />
    </AppProvider>
  );

  await waitFor(() => expect(optionLabels("Book")).toContain("Genesis"));
  expect(bibleService.getTranslations).not.toHaveBeenCalled();
  expect(screen.getByLabelText("Translation")).toHaveValue(KJV);
});

test("lists translations and books when nothing is cached", async () => {
  renderSelector();

  expect(await screen.findByRole("option", { name: "King James Version" })).toBeInTheDocument();
  await waitFor(() => expect(optionLabels("Book")).toContain("Genesis"));
  expect(screen.getByLabelText("Translation")).toHaveValue(KJV);
});

test("reports an unavailable translation list instead of showing an empty dropdown", async () => {
  // Step past the in-memory TTL so the request actually goes out and fails.
  const dateSpy = vi
    .spyOn(Date, "now")
    .mockReturnValue(Date.now() + 13 * 60 * 60 * 1000);
  bibleService.getTranslations.mockRejectedValue(
    new Error("Bible request failed with status 502.")
  );

  renderSelector();

  expect(await screen.findByRole("option", { name: "Unavailable" })).toBeInTheDocument();
  expect(optionLabels("Translation")).toEqual(["Unavailable"]);
  expect(screen.queryByRole("status", { name: "Loading content" })).not.toBeInTheDocument();
  dateSpy.mockRestore();
});
