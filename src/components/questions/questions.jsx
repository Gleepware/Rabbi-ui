"use client";

import ContentPanel from "../content-panel";
import Conversation from "./conversation";

export default function Questions({ onClose }) {
  return (
    <div className="questions-container">
      <div className="questions-nav">
        <select className="questions-select">
          <option>What is the meaning of life?</option>
          <option>How do I learn Hebrew?</option>
          <option>When is Passover this year?</option>
        </select>
        <button className="questions-btn">New</button>
        <button className="questions-btn" onClick={onClose}>Close</button>
      </div>
      <Conversation></Conversation>
    </div>
  );
}
