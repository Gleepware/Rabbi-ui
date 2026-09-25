"use client";

import { CloseXIcon } from "../icons";

export default function AccountSettings({ onClose }) {
  return (
    <div className="settings-container">
      <div className="settings-nav">
        <h2 style={{ flex: 1 }}>Account Settings</h2>
        <button type="button" className="icon-btn" aria-label="Back" onClick={onClose}>
          <CloseXIcon />
        </button>
      </div>
    </div>
  );
}
