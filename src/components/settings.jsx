"use client";

import { useEffect, useState } from "react";
import ConversationsSettings from "./settings/manage-conversations";
import AccountSettings from "./settings/account";

const menuOptions = {
  "Conversations": { label: "Manage Conversations", component: ConversationsSettings },
  "Account": { label: "Account", component: AccountSettings },
};


export default function Settings({ onClose }) {
  const [activity, setActivity] = useState(null);
  const ActiveComponent = activity ? (menuOptions[activity]?.component ?? null) : null;

  const selectMenuItem = item => {
    console.log(`Switching to ${item}`)
    setActivity(item)
  }

  useEffect(() => {
    console.log(`Activity: ${activity}`)
  })

  const returnToMenu = () => selectMenuItem()

  return (
    <div className="questions-container">
      <div className="questions-nav">
        <h2 style={{ flex: 1 }}>Settings</h2>
        <button className="questions-btn" onClick={onClose}>Close</button>
      </div>
      {ActiveComponent
        ? <ActiveComponent onClose={returnToMenu}></ActiveComponent>
        : <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {Object.keys(menuOptions).map((item) => {
            const selection = menuOptions[item]
            return <button key={item} className="questions-btn" style={{ width: "100%" }} onClick={() => selectMenuItem(item)}>
              {selection.label}
            </button>
          })}
        </div>
      }

    </div>
  );
}
