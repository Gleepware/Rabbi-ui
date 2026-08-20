"use client";

export default function AccountSettings({ onClose }) {
  return (
    <div className="questions-container">
      <div className="questions-nav">
        <h2 style={{ flex: 1 }}>Account Settings</h2>
        <button className="questions-btn" onClick={onClose}>Back</button>
      </div>
    </div>
  );
}
