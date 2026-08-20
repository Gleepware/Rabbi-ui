"use client";

export default function TranslationsConfiguration({ onClose }) {
  return (
    <div className="settings-container">
      <div className="settings-nav">
        <h2 style={{ flex: 1 }}>Manage Translations</h2>
        <button className="standard-btn" onClick={onClose}>Back</button>
      </div>
    </div>
  );
}
