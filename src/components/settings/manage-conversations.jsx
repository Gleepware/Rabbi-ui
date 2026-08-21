"use client";

import { useEffect, useState } from "react";
import {
  getConversations,
  updateConversation as updateConversationApi,
  deleteConversation as deleteConversationApi,
} from "../../services/conversation-service";
import { useConversationsContext } from "../../contexts/AppContext";

export default function ConversationsSettings({ onClose }) {
  const {
    conversations,
    setConversations,
    updateConversation,
    removeConversation,
  } = useConversationsContext();
  const [editingId, setEditingId] = useState(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    getConversations().then((data) => setConversations(data));
  }, [setConversations]);

  function startRename(conversation) {
    setEditingId(conversation.id);
    setDraftTitle(conversation.title);
  }

  function cancelRename() {
    setEditingId(null);
    setDraftTitle("");
  }

  async function saveRename() {
    const title = draftTitle.trim();
    if (!editingId || !title) return;
    const updated = await updateConversationApi(editingId, { title });
    if (updated) updateConversation(updated);
    cancelRename();
  }

  async function confirmDelete() {
    if (!deletingId) return;
    await deleteConversationApi(deletingId);
    removeConversation(deletingId);
    setDeletingId(null);
  }

  return (
    <div className="settings-container">
      <div className="settings-nav">
        <h2 style={{ flex: 1 }}>Manage Conversations</h2>
        <button className="standard-btn" onClick={onClose}>Back</button>
      </div>
      <div className="settings-list">
        {conversations.length === 0 && <p>No conversations</p>}
        {conversations.map((c) => (
          <div key={c.id} className="settings-list-item">
            {editingId === c.id ? (
              <>
                <input
                  className="settings-input"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveRename();
                    if (e.key === "Escape") cancelRename();
                  }}
                  autoFocus
                />
                <button
                  className="standard-btn"
                  onClick={saveRename}
                  disabled={!draftTitle.trim()}
                >
                  Save
                </button>
                <button className="standard-btn" onClick={cancelRename}>Cancel</button>
              </>
            ) : deletingId === c.id ? (
              <>
                <span className="settings-list-title">
                  Delete &quot;{c.title || "Untitled"}&quot;?
                </span>
                <button className="standard-btn" onClick={confirmDelete}>Yes</button>
                <button className="standard-btn" onClick={() => setDeletingId(null)}>No</button>
              </>
            ) : (
              <>
                <span className="settings-list-title">{c.title || "Untitled"}</span>
                <button className="standard-btn" onClick={() => startRename(c)}>Rename</button>
                <button
                  className="standard-btn"
                  style={{ padding: "2px" }}
                  aria-label={`Delete ${c.title || "Untitled"}`}
                  onClick={() => setDeletingId(c.id)}
                >
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18" />
                    <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
