function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

export async function getTranslations() {
  await delay();
  return SEED_TRANSLATIONS.map(({ books, ...t }) => t);
}

export async function getTranslation(translationId) {
  await delay();
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
