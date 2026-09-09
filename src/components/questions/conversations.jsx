"use client";

import { useEffect } from "react";
import Conversation from "./conversation";
import { getConversations, createConversation } from "../../services/conversation-service";
import { useConversationsContext } from "../../contexts/AppContext";

export default function Conversations({ onClose }) {
  const {
    conversations,
    selectedId,
    setConversations,
    addConversation,
    updateConversation,
    selectConversation,
  } = useConversationsContext();

  const selectedConversation = conversations.find((c) => c.id === selectedId) ?? null;

  const onConversationCreate = async () => {
    const newConversation = await createConversation({ title: "" });
    addConversation(newConversation);
    selectConversation(newConversation.id);
  };

  useEffect(() => {
    getConversations()
      .then((data) => {
        setConversations(data);
        if (data.length > 0) selectConversation(data[0].id);
      })
      .catch(() => {});
  }, [setConversations, selectConversation]);

  return (
    <div className="questions-container">
      <div className="questions-nav">
        <select
          className="questions-select"
          value={selectedId ?? ""}
          onChange={(e) => selectConversation(e.target.value)}
        >
          {conversations.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
        <button className="standard-btn" disabled={conversations.length === 0} onClick={onConversationCreate}>New</button>
        <button className="standard-btn" onClick={onClose}>Close</button>
      </div>
      <Conversation conversation={selectedConversation} onConversationCreated={(newConversation) => {
        addConversation(newConversation);
        selectConversation(newConversation.id);
      }} onConversationUpdated={(updated) => {
        updateConversation(updated);
      }}></Conversation>
    </div>
  );
}
