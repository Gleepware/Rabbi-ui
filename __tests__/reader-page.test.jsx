import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { AppProvider } from "../src/contexts/AppContext";
import ReaderPage from "../src/components/reader-page";

vi.mock("../src/services/bible-service", () => {
  const KJV = "de4e12af7f28f599-01";
  const RVR60 = "de4e12af7f28f599-03";
  const TRANSLATIONS = [
    {
      id: KJV,
      name: "King James Version",
      language: "English",
      kind: "bible",
      abbreviation: "engKJV",
      abbreviationLocal: "KJV",
      books: [
        { id: "GEN", name: "Genesis", abbreviation: "Gen", chapterCount: 50 },
        { id: "PSA", name: "Psalms", abbreviation: "Ps", chapterCount: 150 },
      ],
    },
    {
      id: RVR60,
      name: "Biblia Reina Valera 1960",
      language: "Spanish",
      kind: "bible",
      abbreviationLocal: "RVR60",
      books: [
        { id: "GEN", name: "Génesis", abbreviation: "Gn", chapterCount: 50 },
        { id: "MAT", name: "Mateo", abbreviation: "Mt", chapterCount: 28 },
      ],
    },
  ];
  return {
    API_BASE_URL: "http://localhost:8080",
    getTranslations: vi.fn(() => Promise.resolve(TRANSLATIONS.map(({ books, ...t }) => t))),
    getTranslation: vi.fn((translationId) => {
      const found = TRANSLATIONS.find((t) => t.id === translationId);
      return Promise.resolve(found ? { ...found, books: found.books.map((b) => ({ ...b })) } : null);
    }),
    getChapter: vi.fn((translationId, bookId, chapter) => {
      if (translationId === KJV && bookId === "GEN" && chapter === 1) {
        return Promise.resolve([
          { verse: 1, text: "In the beginning God created the heaven and the earth." },
          { verse: 2, text: "And the earth was without form, and void;..." },
          { verse: 3, text: "And God said, Let there be light: and there was light." },
        ]);
      }
      return Promise.resolve([]);
    }),
  };
});

const KJV = "de4e12af7f28f599-01";
const RVR60 = "de4e12af7f28f599-03";

function renderReader(reader) {
  const stored = reader ? { activity: "Reader", ui: { reader } } : {};
  localStorage.setItem("appState", JSON.stringify(stored));
  return render(
    <AppProvider>
      <ReaderPage />
    </AppProvider>
  );
}

test("prompts to select a translation and book when nothing is chosen", async () => {
  renderReader(null);
  expect(
    await screen.findByText("Select a translation and book above to begin reading.")
  ).toBeInTheDocument();
});

test("renders verses for the selected chapter", async () => {
  renderReader({ translationId: KJV, bookId: "GEN", chapter: 1 });
  expect(
    await screen.findByText(/In the beginning God created the heaven and the earth\./)
  ).toBeInTheDocument();
  expect(screen.getByText(/And God said, Let there be light/)).toBeInTheDocument();
});

test("warns when the book is not available in the selected translation", async () => {
  renderReader({ translationId: RVR60, bookId: "PSA", chapter: 1 });
  expect(
    await screen.findByText("This book is not available in the selected translation.")
  ).toBeInTheDocument();
});

test("warns when the chapter does not exist in the selected book", async () => {
  renderReader({ translationId: KJV, bookId: "GEN", chapter: 51 });
  expect(
    await screen.findByText("This chapter does not exist in the selected book.")
  ).toBeInTheDocument();
});