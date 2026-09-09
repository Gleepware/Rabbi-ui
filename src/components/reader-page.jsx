import { useNavigationContext } from "../contexts/AppContext";
import { useBibleService } from "../hooks/use-bible-service";

export default function ReaderPage() {
  const { ui } = useNavigationContext();
  const reader = ui.reader ?? {};
  const { translationId, bookId, chapter } = reader;

  const { translationBooks, verses, loadingVerses, error, staleDataAvailable, clearStaleNotice } =
    useBibleService({ translationId, bookId, chapter });

  const currentChapter = chapter ?? 1;
  const selectedBook = bookId
    ? translationBooks.find((b) => b.id === bookId) ?? null
    : null;

  if (!translationId || !bookId) {
    return (
      <div className="p-4 text-center opacity-50">
        Select a translation and book above to begin reading.
      </div>
    );
  }

  if (translationBooks.length > 0 && !selectedBook) {
    return (
      <div className="p-4 text-center opacity-70">
        This book is not available in the selected translation.
      </div>
    );
  }

  if (selectedBook && currentChapter > selectedBook.chapterCount) {
    return (
      <div className="p-4 text-center opacity-70">
        This chapter does not exist in the selected book.
      </div>
    );
  }

  if (error?.type === "verses") {
    return (
      <div className="p-4 text-center opacity-70">
        Could not load this chapter. Please try again.
      </div>
    );
  }

  if (loadingVerses && verses.length === 0) {
    return (
      <div className="p-4 text-center opacity-50">
        Loading...
      </div>
    );
  }

  return (
    <div className="relative">
      {staleDataAvailable && (
        <div className="sticky top-0 z-10 flex items-center justify-between gap-2 bg-yellow-100 px-4 py-2 text-sm text-yellow-900 border-b border-yellow-300">
          <span>New content loaded</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={clearStaleNotice}
              className="rounded bg-yellow-500 px-2 py-1 text-white"
            >
              OK
            </button>
            <button
              type="button"
              onClick={clearStaleNotice}
              aria-label="Close"
              className="text-yellow-900"
            >
              &times;
            </button>
          </div>
        </div>
      )}
      <div className="p-4">
        {verses.map((v) => (
          <p key={v.verse} className="mb-3 leading-relaxed">
            <sup className="font-bold mr-1">{v.verse}</sup>
            {v.text}
          </p>
        ))}
      </div>
    </div>
  );
}
