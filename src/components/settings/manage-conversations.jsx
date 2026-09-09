"use client";

import { useEffect, useState } from "react";
import {
  getConversations,
  updateConversation as updateConversationApi,
  deleteConversation as deleteConversationApi,
} from "../../services/conversation-service";
import { useConversationsContext } from "../../contexts/AppContext";
import { DeleteIcon } from "../icons";

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
    getConversations()
      .then((data) => setConversations(data))
      .catch(() => {});
  }, [setConversations]);

  function onRenameStart(conversation) {
    setEditingId(conversation.id);
    setDraftTitle(conversation.title);
  }

  function onRenameCancel() {
    setEditingId(null);
    setDraftTitle("");
  }

  async function onRenameSave() {
    const title = draftTitle.trim();
    if (!editingId || !title) return;
    const updated = await updateConversationApi(editingId, { title });
    if (updated) updateConversation(updated);
    onRenameCancel();
  }

  async function onDeleteConfirm() {
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
                    if (e.key === "Enter") onRenameSave();
                    if (e.key === "Escape") onRenameCancel();
                  }}
                  autoFocus
                />
                <button
                  className="standard-btn"
                  onClick={onRenameSave}
                  disabled={!draftTitle.trim()}
                >
                  Save
                </button>
                <button className="standard-btn" onClick={onRenameCancel}>Cancel</button>
              </>
            ) : deletingId === c.id ? (
              <>
                <span className="settings-list-title">
                  Delete &quot;{c.title || "Untitled"}&quot;?
                </span>
                <button className="standard-btn" onClick={onDeleteConfirm}>Yes</button>
                <button className="standard-btn" onClick={() => setDeletingId(null)}>No</button>
              </>
            ) : (
              <>
                <span className="settings-list-title">{c.title || "Untitled"}</span>
                <button className="standard-btn" onClick={() => onRenameStart(c)}>Rename</button>
                <button
                  className="standard-btn"
                  style={{ padding: "2px" }}
                  aria-label={`Delete ${c.title || "Untitled"}`}
                  onClick={() => setDeletingId(c.id)}
                >
                  <DeleteIcon />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
