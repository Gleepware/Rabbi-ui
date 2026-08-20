"use client";

export default function ConversationsSettings({ onClose }) {
  return (
    <div className="questions-container">
      <div className="questions-nav">
        <h2 style={{ flex: 1 }}>Manage Conversations</h2>
        <button className="questions-btn" onClick={onClose}>Back</button>
      </div>
    </div>
  );
}
