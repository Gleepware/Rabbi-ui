import { createLocalStore, delay } from "./local-store";

const store = createLocalStore({ storeKey: "conversations", nextIdKey: "conversations-next-id" });

export async function getConversations() {
  return store.list();
}

export async function getConversation(conversationId) {
  return store.get(conversationId);
}

export async function createConversation({ title, detail } = {}) {
  return store.create((id) => ({
    id,
    title: title ?? "New Conversation",
    detail: detail ?? "",
    messages: [],
  }));
}

export async function updateConversation(conversationId, { title, detail }) {
  return store.update(conversationId, { title, detail });
}

export async function deleteConversation(conversationId) {
  return store.remove(conversationId);
}

export async function askQuestion(question, conversationId) {
  await delay(600);
  const exchange = {
    id: String(store.loadNextId()),
    question,
    answer: `This is a mock response to: "${question}"`,
  };
  store.saveNextId(Number(exchange.id) + 1);

  if (conversationId) {
    store.mutate(conversationId, (conversation) => {
      conversation.messages.push({ role: "user", text: question });
      conversation.messages.push({ role: "assistant", text: exchange.answer });
    });
  }

  return exchange;
}