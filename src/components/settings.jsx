"use client";

export default function Settings({ onClose }) {
  return (
    <div className="questions-container">
      <div className="questions-nav">
        <h2 style={{ flex: 1 }}>Settings</h2>
        <button className="questions-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
