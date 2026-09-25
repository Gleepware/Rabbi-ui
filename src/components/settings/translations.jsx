"use client";

import { CloseXIcon } from "../icons";

export default function TranslationSettings({ onClose }) {
  return (
    <div className="settings-container">
      <div className="settings-nav">
        <h2 style={{ flex: 1 }}>Manage Translations</h2>
        <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
          <CloseXIcon />
        </button>
      </div>
    </div>
  );
}
