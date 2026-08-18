let nextId = 4;

const store = [
  {
    id: "1",
    title: "What is the meaning of life?",
    detail: "",
    draftValue: "",
    messages: [
      { role: "user", text: "What is the meaning of life?" },
      { role: "assistant", text: "The meaning of life is a profound philosophical question that has been explored for millennia. Many traditions suggest it centers on love, service to others, and the pursuit of wisdom." },
      { role: "user", text: "Can you elaborate on the service aspect?" },
      { role: "assistant", text: "Service to others is the idea that purpose is found not in self-interest alone, but in contributing to the well-being of those around you. Whether through acts of kindness, community involvement, or mentorship, helping others gives a sense of connection and fulfillment that purely personal pursuits often lack." },
    ],
  },
  {
    id: "2",
    title: "How do I learn Hebrew?",
    detail: "",
    draftValue: "",
    messages: [
      { role: "user", text: "How do I learn Hebrew?" },
      { role: "assistant", text: "Start with the Hebrew alphabet (Aleph-Bet). Master letter recognition and vowel markings before moving to basic vocabulary and simple sentences." },
      { role: "user", text: "What resources would you recommend?" },
      { role: "assistant", text: "For beginners, try apps like Duolingo or Clozemaster for daily practice. Pair that with a structured course like Ulpan or a textbook such as 'Modern Hebrew: An Essential Grammar.' Immersing yourself in Hebrew media—music, podcasts, and Israeli TV—will accelerate your progress." },
      { role: "user", text: "How long does it usually take to become fluent?" },
      { role: "assistant", text: "The FSI estimates around 1100 hours of study for English speakers to reach professional proficiency in Hebrew. That could be 1-2 years of consistent daily practice. Progress accelerates once you can consume native content comfortably." },
    ],
  },
  {
    id: "3",
    title: "When is Passover this year?",
    detail: "",
    draftValue: "",
    messages: [
      { role: "user", text: "When is Passover this year?" },
      { role: "assistant", text: "In 2026, Passover begins on the evening of April 1 and ends on the evening of April 9." },
      { role: "user", text: "What are the main observances?" },
      { role: "assistant", text: "The main observances include the Seder meal on the first two nights, which involves retelling the Exodus story, eating symbolic foods like matzah and maror, and singing traditional songs. During the eight days, observant Jews also avoid leavened bread (chametz) and attend synagogue services." },
    ],
  },
];

function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getConversations() {
  await delay();
  return [...store];
}

export async function getConversation(conversationId) {
  await delay();
  return store.find((c) => c.id === conversationId) ?? null;
}

export async function createConversation({ title, detail } = {}) {
  await delay();
  const conversation = {
    id: String(nextId++),
    title: title ?? "New Conversation",
    detail: detail ?? "",
    draftValue: "",
  };
  store.push(conversation);
  return conversation;
}

export async function updateConversation(conversationId, { title, detail }) {
  await delay();
  const conversation = store.find((c) => c.id === conversationId);
  if (!conversation) return null;
  if (title !== undefined) conversation.title = title;
  if (detail !== undefined) conversation.detail = detail;
  return { ...conversation };
}

export async function deleteConversation(conversationId) {
  await delay();
  const index = store.findIndex((c) => c.id === conversationId);
  if (index === -1) return null;
  const [removed] = store.splice(index, 1);
  return removed;
}

export async function askQuestion(question, conversationId) {
  await delay(600);
  const exchange = {
    id: String(nextId++),
    question,
    answer: `This is a mock response to: "${question}"`,
  };

  if (conversationId) {
    const conversation = store.find((c) => c.id === conversationId);
    if (conversation) {
      conversation.messages.push({ role: "user", text: question });
      conversation.messages.push({ role: "assistant", text: exchange.answer });
    }
  }

  return exchange;
}

export async function saveDraft(conversationId, draftValue) {
  await delay();
  const conversation = store.find((c) => c.id === conversationId);
  if (!conversation) return null;
  conversation.draftValue = draftValue;
  return { ...conversation };
}

export async function clearDraft(conversationId) {
  return saveDraft(conversationId, "");
}
