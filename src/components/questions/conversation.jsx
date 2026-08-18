import { useState, useRef, useEffect } from "react";
import ContentPanel from "../content-panel";

export default function Conversation({ conversation }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMessages(conversation?.messages ?? []);
  }, [conversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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
        <div ref={messagesEndRef} />
      </ContentPanel>
      <div className="conversation-input">
        <textarea
          className="conversation-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Type a message..."
        />
        <button className="conversation-send" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
}
