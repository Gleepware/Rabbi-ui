"use client";

export default function ConversationsSettings({ onClose }) {
  return (
    <div className="settings-container">
      <div className="settings-nav">
        <h2 style={{ flex: 1 }}>Manage Conversations</h2>
        <button className="standard-btn" onClick={onClose}>Back</button>
      </div>
    </div>
  );
}
