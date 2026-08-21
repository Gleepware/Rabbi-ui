"use client";

import ConversationsSettings from "./settings/manage-conversations";
import AccountSettings from "./settings/account";
import TranslationSettings from './settings/translations'
import { useNavigationContext } from "../contexts/AppContext";

const menuOptions = {
  "Conversations": { label: "Manage Conversations", component: ConversationsSettings },
  "Translations": {label: "Manage Translations", component: TranslationSettings},
  "Account": { label: "Account", component: AccountSettings },
};

const SETTINGS_PANEL_KEY = "settingsPanel";

export default function Settings({ onClose }) {
  const { ui, setUiState } = useNavigationContext();
  const activity = ui[SETTINGS_PANEL_KEY] ?? null;
  const ActiveComponent = activity ? (menuOptions[activity]?.component ?? null) : null;

  const selectMenuItem = item => setUiState(SETTINGS_PANEL_KEY, item)

  const returnToMenu = () => selectMenuItem(null)

  return (
    <div className="questions-container">
      <div className="questions-nav">
        <h2 style={{ flex: 1 }}>Settings</h2>
        <button className="standard-btn" onClick={onClose}>Close</button>
      </div>
      {ActiveComponent
        ? <ActiveComponent onClose={returnToMenu}></ActiveComponent>
        : <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {Object.keys(menuOptions).map((item) => {
            const selection = menuOptions[item]
            return <button key={item} className="standard-btn" style={{ width: "100%" }} onClick={() => selectMenuItem(item)}>
              {selection.label}
            </button>
          })}
        </div>
      }

    </div>
  );
}
