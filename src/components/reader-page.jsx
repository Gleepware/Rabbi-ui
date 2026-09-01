import { useEffect, useState } from "react";
import { useNavigationContext } from "../contexts/AppContext";
import { getChapter } from "../services/bible-service";

export default function ReaderPage() {
  const { ui } = useNavigationContext();
  const reader = ui.reader ?? {};
  const { translationId, bookId, chapter } = reader;

  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!translationId || !bookId) {
      setVerses([]);
      return;
    }

    setLoading(true);
    getChapter(translationId, bookId, chapter ?? 1).then((data) => {
      setVerses(data);
      setLoading(false);
    });
  }, [translationId, bookId, chapter]);

  if (!translationId || !bookId) {
    return (
      <div className="p-4 text-center opacity-50">
        Select a translation and book above to begin reading.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 text-center opacity-50">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-4">
      {verses.map((v) => (
        <p key={v.verse} className="mb-3 leading-relaxed">
          <sup className="font-bold mr-1">{v.verse}</sup>
          {v.text}
        </p>
      ))}
    </div>
  );
}
