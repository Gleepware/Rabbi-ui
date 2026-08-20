const STORAGE_KEY = "conversations";
const NEXT_ID_KEY = "conversations-next-id";

function loadStore() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function loadNextId() {
  const raw = localStorage.getItem(NEXT_ID_KEY);
  if (raw) return Number(raw);
  const maxId = loadStore().reduce((max, c) => Math.max(max, Number(c.id)), 0);
  localStorage.setItem(NEXT_ID_KEY, String(maxId + 1));
  return maxId + 1;
}

function saveNextId(id) {
  localStorage.setItem(NEXT_ID_KEY, String(id));
}

function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getConversations() {
  await delay();
  return [...loadStore()];
}

export async function getConversation(conversationId) {
  await delay();
  return loadStore().find((c) => c.id === conversationId) ?? null;
}

export async function createConversation({ title, detail } = {}) {
  await delay();
  const nextId = loadNextId();
  const store = loadStore();
  const conversation = {
    id: String(nextId),
    title: title ?? "New Conversation",
    detail: detail ?? "",
    draftValue: "",
    messages: [],
  };
  store.push(conversation);
  saveStore(store);
  saveNextId(nextId + 1);
  return conversation;
}

export async function updateConversation(conversationId, { title, detail }) {
  await delay();
  const store = loadStore();
  const conversation = store.find((c) => c.id === conversationId);
  if (!conversation) return null;
  if (title !== undefined) conversation.title = title;
  if (detail !== undefined) conversation.detail = detail;
  saveStore(store);
  return { ...conversation };
}

export async function deleteConversation(conversationId) {
  await delay();
  const store = loadStore();
  const index = store.findIndex((c) => c.id === conversationId);
  if (index === -1) return null;
  const [removed] = store.splice(index, 1);
  saveStore(store);
  return removed;
}

export async function askQuestion(question, conversationId) {
  await delay(600);
  const nextId = loadNextId();
  const exchange = {
    id: String(nextId),
    question,
    answer: `This is a mock response to: "${question}"`,
  };
  saveNextId(nextId + 1);

  if (conversationId) {
    const store = loadStore();
    const conversation = store.find((c) => c.id === conversationId);
    if (conversation) {
      conversation.messages.push({ role: "user", text: question });
      conversation.messages.push({ role: "assistant", text: exchange.answer });
      saveStore(store);
    }
  }

  return exchange;
}

export async function saveDraft(conversationId, draftValue) {
  await delay();
  const store = loadStore();
  const conversation = store.find((c) => c.id === conversationId);
  if (!conversation) return null;
  conversation.draftValue = draftValue;
  saveStore(store);
  return { ...conversation };
}

export async function clearDraft(conversationId) {
  return saveDraft(conversationId, "");
}
