const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

function apiError(status) {
  return new Error(`Bible request failed with status ${status}.`);
}

async function parseJson(response) {
  if (!response.ok) throw apiError(response.status);
  return response.json();
}

export async function getTranslations({ signal } = {}) {
  const response = await fetch(`${API_BASE_URL}/api/translations`, {
    method: "READ",
    signal,
  });
  return parseJson(response);
}

export async function getTranslation(translationId, { signal } = {}) {
  const response = await fetch(`${API_BASE_URL}/api/translations/${translationId}`, {
    method: "READ",
    signal,
  });
  if (response.status === 404) return null;
  return parseJson(response);
}

export async function getChapter(translationId, bookId, chapter, { signal } = {}) {
  const response = await fetch(
    `${API_BASE_URL}/api/translations/${translationId}/${bookId}/${chapter}`,
    { method: "READ", signal }
  );
  const data = await parseJson(response);
  return flattenParagraphs(data.paragraphs ?? []);
}

function flattenParagraphs(paragraphs) {
  const verses = [];
  for (const paragraph of paragraphs) {
    for (const verse of paragraph.verses ?? []) {
      verses.push({ verse: verse.number, text: verse.text });
    }
  }
  return verses;
}

export { API_BASE_URL };