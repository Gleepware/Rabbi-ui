function delay(ms = 300, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
      return;
    }
    const id = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(id);
        reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
      },
      { once: true }
    );
  });
}

const SEED_TRANSLATIONS = [
  {
    id: "de4e12af7f28f599-01",
    name: "King James Version",
    language: "English",
    kind: "bible",
    abbreviation: "engKJV",
    abbreviationLocal: "KJV",
    books: [
      { id: "GEN", name: "Genesis", abbreviation: "Gen", chapterCount: 50 },
      { id: "EXO", name: "Exodus", abbreviation: "Ex", chapterCount: 40 },
      { id: "PSA", name: "Psalms", abbreviation: "Ps", chapterCount: 150 },
      { id: "MAT", name: "Matthew", abbreviation: "Mt", chapterCount: 28 },
      { id: "MRK", name: "Mark", abbreviation: "Mk", chapterCount: 16 },
      { id: "JHN", name: "John", abbreviation: "Jn", chapterCount: 21 },
      { id: "ROM", name: "Romans", abbreviation: "Rom", chapterCount: 16 },
      { id: "REV", name: "Revelation", abbreviation: "Rev", chapterCount: 22 },
    ],
  },
  {
    id: "de4e12af7f28f599-02",
    name: "New American Standard Bible",
    language: "English",
    kind: "bible",
    abbreviation: "engNASB",
    abbreviationLocal: "NASB",
    books: [
      { id: "GEN", name: "Genesis", abbreviation: "Gen", chapterCount: 50 },
      { id: "MAT", name: "Matthew", abbreviation: "Mt", chapterCount: 28 },
      { id: "REV", name: "Revelation", abbreviation: "Rev", chapterCount: 22 },
    ],
  },
  {
    id: "de4e12af7f28f599-03",
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

export async function getTranslations({ signal } = {}) {
  await delay(300, signal);
  if (signal?.aborted) throw signal.reason ?? new DOMException("Aborted", "AbortError");
  return SEED_TRANSLATIONS.map(({ books, ...t }) => t);
}

export async function getTranslation(translationId, { signal } = {}) {
  await delay(300, signal);
  if (signal?.aborted) throw signal.reason ?? new DOMException("Aborted", "AbortError");
  const translation = SEED_TRANSLATIONS.find((t) => t.id === translationId);
  if (!translation) return null;
  return {
    id: translation.id,
    name: translation.name,
    language: translation.language,
    kind: translation.kind,
    abbreviation: translation.abbreviation,
    abbreviationLocal: translation.abbreviationLocal,
    books: translation.books.map((b) => ({ ...b })),
  };
}

const SEED_VERSES = {
  "de4e12af7f28f599-01": {
    GEN: {
      1: [
        { verse: 1, text: "In the beginning God created the heaven and the earth." },
        { verse: 2, text: "And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters." },
        { verse: 3, text: "And God said, Let there be light: and there was light." },
        { verse: 4, text: "And God saw the light, that it was good: and God divided the light from the darkness." },
        { verse: 5, text: "And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day." },
      ],
    },
    MAT: {
      1: [
        { verse: 1, text: "The book of the generation of Jesus Christ, the son of David, the son of Abraham:" },
        { verse: 2, text: "Abraham begat Isaac; and Isaac begat Jacob; and Jacob begat Judas and his brethren;" },
        { verse: 3, text: "And Judas begat Phares and Zara of Thamar; and Phares begat Esrom; and Esrom begat Aram;" },
      ],
    },
  },
};

export async function getChapter(translationId, bookId, chapter, { signal } = {}) {
  await delay(200, signal);
  if (signal?.aborted) throw signal.reason ?? new DOMException("Aborted", "AbortError");
  const verses = SEED_VERSES[translationId]?.[bookId]?.[chapter];
  if (!verses) {
    return [
      { verse: 1, text: "[Content not available in seed data. Select a different translation, book, or chapter.]" },
    ];
  }
  return verses;
}
