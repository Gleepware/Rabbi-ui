import { render, screen } from "@testing-library/react";
import { AppProvider } from "../src/contexts/AppContext";
import ReaderPage from "../src/components/reader-page";

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