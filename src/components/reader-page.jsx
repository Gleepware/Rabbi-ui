import { useNavigationContext } from "../contexts/AppContext";
import { useBibleService } from "../hooks/use-bible-service";
import LoadingIndicator from "./loading-indicator";
import { CloseXIcon } from "./icons";

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

  if (error?.type === "verses" && verses.length === 0) {
    return (
      <div className="p-4 text-center opacity-70">
        Could not load this chapter. Please try again.
      </div>
    );
  }

  if (loadingVerses && verses.length === 0) {
    return (
      <div className="flex items-center justify-center gap-2 p-4 opacity-60">
        <LoadingIndicator size={14} label="Loading chapter" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {staleDataAvailable && (
        <div className="sticky top-0 z-10 flex items-center justify-between gap-2 bg-yellow-100 px-4 py-2 text-sm text-yellow-900 border-b border-yellow-300">
          <span>New content loaded</span>
          <button
            type="button"
            className="icon-btn icon-btn-inherit"
            aria-label="Close"
            onClick={clearStaleNotice}
          >
            <CloseXIcon size={16} />
          </button>
        </div>
      )}
      {loadingVerses && (
        <div className="flex items-center justify-center gap-2 py-1 text-xs opacity-60">
          <LoadingIndicator size={10} label="Updating chapter" />
          <span>Updating...</span>
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
