# API Services

This document describes the two cloud APIs consumed by the UI.

---

## Conversations API

**Base URL:** `http://localhost:7072/api/conversations` (local dev)

**User identification:** All requests must include a user-ID header. The header name is
configured via the `USER_ID_HEADER_NAME` secret (defaults to `RABBI_USER_ID`).

### Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| `READ` | `/conversations` | List all conversations for the user |
| `READ` | `/conversations/{conversationId}` | Get a single conversation |
| `CREATE` | `/conversations` | Create a new conversation |
| `UPDATE` | `/conversations/{conversationId}` | Update a conversation's title/detail |
| `DELETE` | `/conversations/{conversationId}` | Delete a conversation |
| `QUERY` | `/conversations` | Ask a question (creates a new conversation) |
| `QUERY` | `/conversations/{conversationId}` | Ask a follow-up in an existing conversation |

> **Note:** The API uses custom HTTP methods (`READ`, `CREATE`, `UPDATE`, `DELETE`, `QUERY`) rather than standard REST verbs. The UI should send these as the HTTP method.

### Request / Response shapes

#### READ (list all)

**Response 200:**

```json
[
  {
    "id": "123",
    "title": "My Conversation",
    "detail": "latest message preview",
    "messages": [...],
    "draftValue": "",
    "errorMessage": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-02T00:00:00.000Z",
    "originalQuestion": "first question",
    "latestMessage": "last answer text",
    "questionCount": 3,
    "tokenUsage": {
      "promptTokens": 150,
      "completionTokens": 200,
      "totalTokens": 350
    }
  }
]
```

#### READ (single)

Same shape as a single element from the list above. **Response 200.**

#### CREATE

**Request body:**

```json
{
  "title": "Optional title",
  "detail": "Optional detail text"
}
```

Both fields are optional. `title` max 200 chars.

**Response 201:**

```json
{ "conversationId": "456" }
```

#### UPDATE

**Request body:** Same shape as CREATE (title, detail — both optional).

**Response 200:**

```json
{ "message": "Conversation updated successfully" }
```

#### DELETE

**Response 200:**

```json
{ "message": "Conversation deleted successfully" }
```

#### QUERY (ask a question)

**Request body:**

```json
{
  "question": "What is the meaning of life?",
  "title": "Optional override title"
}
```

- `question` — required, non-empty string.
- `title` — optional, max 200 chars. If omitted, the first 40 chars of `question` are used.

Sends the question to an LLM (OpenRouter / `openai/gpt-5.2`), appends both the question and answer as messages to the conversation, and persists the result. Creates a new conversation if no `conversationId` is provided.

**Response 201** (new conversation) / **Response 200** (existing conversation):

```json
{
  "id": "456",
  "title": "My Conversation",
  "detail": "latest answer preview",
  "messages": [
    {
      "id": "question-1700000000000-abc123",
      "role": "question",
      "body": "What is the meaning of life?",
      "modelName": null,
      "promptTokens": 0,
      "completionTokens": 0,
      "totalTokens": 0,
      "createdAt": "2026-01-01T00:00:00.000Z"
    },
    {
      "id": "answer-1700000001000-def456",
      "role": "answer",
      "body": "The meaning of life is...",
      "modelName": "openai/gpt-5.2",
      "promptTokens": 50,
      "completionTokens": 100,
      "totalTokens": 150,
      "createdAt": "2026-01-01T00:00:01.000Z"
    }
  ],
  "draftValue": "",
  "errorMessage": null,
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:01.000Z",
  "originalQuestion": "What is the meaning of life?",
  "latestMessage": "The meaning of life is...",
  "questionCount": 1,
  "tokenUsage": {
    "promptTokens": 50,
    "completionTokens": 100,
    "totalTokens": 150
  }
}
```

### Conversation object fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Conversation ID |
| `title` | string | User-assigned title (max 200 chars) |
| `detail` | string | Latest message preview |
| `messages` | Message[] | Ordered list of question/answer messages |
| `draftValue` | string | Draft input value |
| `errorMessage` | string \| null | Last error, if any |
| `createdAt` | ISO 8601 | Creation timestamp |
| `updatedAt` | ISO 8601 | Last update timestamp |
| `originalQuestion` | string | The first question asked |
| `latestMessage` | string | Body of the most recent message |
| `questionCount` | number | Number of questions in the conversation |
| `tokenUsage` | TokenUsage | Cumulative token usage |

### Message object fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Message ID (e.g. `question-1700000000000-abc123`) |
| `role` | `"question"` \| `"answer"` | Message sender role |
| `body` | string | Message content |
| `modelName` | string \| null | LLM model used (answer messages only) |
| `promptTokens` | number | Prompt tokens for this message |
| `completionTokens` | number | Completion tokens for this message |
| `totalTokens` | number | Total tokens for this message |
| `createdAt` | ISO 8601 | Message timestamp |

---

## Translations (Bible) API

**Base URL:** `http://localhost:7073/api/translations` (local dev)

**User identification:** Same user-ID header as Conversations.

### Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| `READ` | `/translations` | List all available translations |
| `READ` | `/translations/{translationId}` | Get a single translation with its books |
| `READ` | `/translations/{translationId}/{bookId}/{chapterId}` | Get a specific chapter |

### Request / Response shapes

#### READ (list all translations)

**Response 200:**

```json
[
  {
    "id": "de4e1257-0bfd-4e4a-a2be-5247d4c39f23",
    "name": "King James Version",
    "language": "English",
    "kind": "bible"
  }
]
```

#### READ (single translation)

**Response 200:**

```json
{
  "id": "de4e1257-0bfd-4e4a-a2be-5247d4c39f23",
  "name": "King James Version",
  "language": "English",
  "kind": "bible",
  "books": [
    {
      "id": "GEN",
      "name": "Genesis",
      "chapterCount": 50
    },
    {
      "id": "EXO",
      "name": "Exodus",
      "chapterCount": 40
    }
  ],
  "copyright": {
    "name": "King James Version",
    "url": "",
    "notice": "Public domain",
    "requirements": []
  }
}
```

Books are sorted in canonical biblical order. Book IDs use the [API.Bible](https://scripture.api.bible) standard abbreviations (e.g. `GEN`, `EXO`, `PSA`, `MAT`, `REV`).

#### READ (chapter)

**Response 200:**

```json
{
  "translation": "de4e1257-0bfd-4e4a-a2be-5247d4c39f23",
  "book": "GEN",
  "chapter": "1",
  "verses": [
    "In the beginning God created the heaven and the earth.",
    "And the earth was without form, and void..."
  ],
  "paragraphs": [
    { "verses": [{ "number": 1, "text": "In the beginning God created the heaven and the earth." }] },
    { "verses": [{ "number": 2, "text": "And the earth was without form, and void..." }] }
  ]
}
```

### Translation object fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Provider translation ID (API.Bible UUID) |
| `name` | string | Human-readable name |
| `language` | string | Language name (e.g. `"English"`) |
| `kind` | string \| undefined | `"bible"` or `"commentary"` |
| `books` | Book[] | Only present on single-translation responses |
| `copyright` | Copyright \| undefined | Copyright info, if available |

### Book object fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Book ID in API.Bible format (e.g. `"GEN"`, `"PSA"`) |
| `name` | string | Full book name (e.g. `"Genesis"`) |
| `chapterCount` | number | Total chapters in this book |

### Common book IDs

| ID | Book | ID | Book |
|----|------|----|------|
| `GEN` | Genesis | `MAT` | Matthew |
| `EXO` | Exodus | `MRK` | Mark |
| `LEV` | Leviticus | `LUK` | Luke |
| `NUM` | Numbers | `JHN` | John |
| `DEU` | Deuteronomy | `ACT` | Acts |
| `PSA` | Psalms | `ROM` | Romans |
| `PRO` | Proverbs | `HEB` | Hebrews |
| `ISA` | Isaiah | `REV` | Revelation |

---

## Error responses

All endpoints return errors in this shape:

```json
{ "error": "Error message describing the problem" }
```

Common HTTP status codes:
- `400` — Bad request (missing/invalid parameters)
- `404` — Resource not found
- `405` — Method not allowed
- `409` — Conflict (e.g. user not found when creating conversation)
- `500` — Internal server error
