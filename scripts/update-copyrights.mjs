import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const siblingDir = path.resolve(rootDir, "..");

async function findLocalSettings(dir) {
  const results = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      results.push(...(await findLocalSettings(fullPath)));
    } else if (entry.name === "local.settings.json") {
      results.push(fullPath);
    }
  }
  return results;
}

async function readSettingsKeys() {
  const keys = [];
  const siblingEntries = await readdir(siblingDir, { withFileTypes: true });
  const searchRoots = siblingEntries
    .filter(
      (entry) =>
        entry.isDirectory() &&
        !entry.name.startsWith(".") &&
        entry.name !== path.basename(rootDir)
    )
    .map((entry) => path.join(siblingDir, entry.name));
  for (const dir of searchRoots) {
    for (const file of await findLocalSettings(dir)) {
      try {
        const settings = JSON.parse(await readFile(file, "utf8"));
        const values = settings.Values ?? {};
        for (const name of ["API_BIBLE_API_KEY", "API_BIBLE_KEY"]) {
          if (values[name]) keys.push(values[name]);
        }
      } catch {
        // skip settings files that are invalid or encrypted
      }
    }
  }
  return keys;
}

const apiKey = process.env.API_BIBLE_KEY || process.env.API_BIBLE_API_KEY || (await readSettingsKeys()).find(Boolean);

if (!apiKey) {
  console.error(
    "No API.Bible key found. Set API_BIBLE_KEY (or API_BIBLE_API_KEY) in the environment, or add it as Values.API_BIBLE_API_KEY to a local.settings.json in a folder sibling to ui."
  );
  process.exit(1);
}

const apiBaseUrl = process.env.API_BIBLE_BASE_URL || "https://api.scripture.api.bible/v1";

async function fetchBibles() {
  const response = await fetch(
    `${apiBaseUrl}/bibles?include-full-details=true`,
    { headers: { "api-key": apiKey } }
  );
  if (!response.ok) {
    throw new Error(`API.Bible request failed with status ${response.status}.`);
  }
  const payload = await response.json();
  return payload.data;
}

const source = await readFile(
  path.join(rootDir, "src", "services", "bible-service.js"),
  "utf8"
);

const abbreviations = [...source.matchAll(/abbreviationLocal:\s*"([^"]+)"/g)].map(
  (match) => match[1]
);
const names = [...source.matchAll(/\bname:\s*"([^"]{2,})"/g)]
  .map((match) => match[1])
  .slice(0, abbreviations.length);

const lowercase = (value) => (value || "").toLowerCase();

const bibles = await fetchBibles();

const usedIds = new Set();
const matches = abbreviations.map((abbreviation, index) => {
  const name = names[index] ?? abbreviation;
  const bible = bibles.find((candidate) => {
    if (usedIds.has(candidate.id)) return false;
    return (
      lowercase(candidate.abbreviationLocal) === lowercase(abbreviation) ||
      lowercase(candidate.abbreviation) === lowercase(abbreviation) ||
      lowercase(candidate.name) === lowercase(name)
    );
  });
  if (bible) usedIds.add(bible.id);
  return { abbreviation, name, bible };
});

const lines = [
  "# Scripture Copyrights",
  "",
  "Scripture content is provided through API.Bible and used in accordance with the API.Bible Terms and Conditions. The attribution text below is provided verbatim by the API.Bible copyright metadata for each translation.",
  "",
];

for (const { abbreviation, name, bible } of matches) {
  const label = bible
    ? `${bible.name} (${bible.abbreviationLocal || abbreviation})`
    : `${name} (${abbreviation})`;
  lines.push(`## ${label}`, "");
  if (bible && bible.copyright) {
    lines.push(bible.copyright);
  } else {
    lines.push(
      "(API.Bible returned no copyright metadata for this translation. Confirm the abbreviation/name in src/services/bible-service.js before release.)"
    );
  }
  lines.push("");
}

const content = lines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
await writeFile(path.join(rootDir, "copyrights.md"), content);

const missing = matches.filter((match) => !match.bible);
for (const match of missing) {
  console.warn(
    `No API.Bible match found for translation "${match.name}" (${match.abbreviation}).`
  );
}
console.log(
  `Updated copyrights.md with ${matches.length} translation(s); ${missing.length} not found in API.Bible.`
);