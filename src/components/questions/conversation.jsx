import { useState, useRef, useEffect } from "react";
import ContentPanel from "../content-panel";
import { askQuestion, createConversation, getConversation, updateConversation } from "../../services/conversation-service";

const MAX_TITLE_LENGTH = 40;

export default function Conversation({ conversation, onConversationCreated, onConversationUpdated }) {
  const [messages, setMessages] = useState(conversation?.messages ?? []);
  const [input, setInput] = useState("");
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const prevConversationIdRef = useRef(null);

  useEffect(() => {
    const currentId = conversation?.id ?? null;
    if (currentId !== prevConversationIdRef.current) {
      setMessages(conversation?.messages ?? []);
      prevConversationIdRef.current = currentId;
    }
  }, [conversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function onMessageSend() {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setError(null);

    try {
      let conversationId = conversation?.id;
      const isNew = !conversationId;
      if (isNew) {
        const title = text.substring(0, MAX_TITLE_LENGTH);
        const newConversation = await createConversation({ title });
        conversationId = newConversation.id;
      }

      const exchange = await askQuestion(text, conversationId);
      setMessages((prev) => [...prev, { role: "assistant", text: exchange.answer }]);

      if (isNew && onConversationCreated) {
        const fullConversation = await getConversation(conversationId);
        if (fullConversation) onConversationCreated(fullConversation);
      }

      if (conversation && !conversation.title) {
        const title = text.substring(0, MAX_TITLE_LENGTH);
        const updated = await updateConversation(conversationId, { title });
        if (updated && onConversationUpdated) onConversationUpdated(updated);
      }
    } catch {
      setError("Could not send message.");
    }
  }

  function onEnterPress(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onMessageSend();
    }
  }

  return (
    <div className="conversation">
      <ContentPanel className="conversation-messages">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`conversation-bubble conversation-bubble-${msg.role}`}
          >
            {msg.text}
          </div>
        ))}
        {error && <p className="conversation-error">{error}</p>}
        <div ref={messagesEndRef} />
      </ContentPanel>
      <div className="conversation-input">
        <textarea
          className="conversation-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onEnterPress}
          rows={1}
          placeholder="Type a message..."
        />
        <button className="conversation-send" onClick={onMessageSend}>
          Send
        </button>
      </div>
    </div>
  );
}
