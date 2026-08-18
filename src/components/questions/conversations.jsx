"use client";

import { useState, useEffect } from "react";
import ContentPanel from "../content-panel";
import Conversation from "./conversation";
import { getConversations } from "../../services/conversation-service";

export default function Questions({ onClose }) {
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const selectedConversation = conversations.find((c) => c.id === selectedId) ?? null;

  useEffect(() => {
    getConversations().then((data) => {
      setConversations(data);
      if (data.length > 0) setSelectedId(data[0].id);
    });
  }, []);

  return (
    <div className="questions-container">
      <div className="questions-nav">
        <select
          className="questions-select"
          value={selectedId ?? ""}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          {conversations.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
        <button className="questions-btn">New</button>
        <button className="questions-btn" onClick={onClose}>Close</button>
      </div>
      <Conversation conversation={selectedConversation}></Conversation>
    </div>
  );
}
