"use client";

import { useState } from "react";

const APP_NAME = "Rabbi";
const APP_VERSION = "0.1.0";

const DetailsRow = ({ label, value }) => (
  <div className="about-row">
    <span className="about-row-label">{label}</span>
    <span className="about-row-value">{value}</span>
  </div>
);

const AboutTab = () => (
  <div className="about-body">
    <h3 className="about-title">{APP_NAME}</h3>
    <DetailsRow label="Version" value={APP_VERSION} />
  </div>
);

const EulaTab = () => (
  <div className="about-body">
    <h3 className="about-title">End User License Agreement</h3>
    <p>End User License Agreement text is yet to be added.</p>
  </div>
);

const CopyrightsTab = () => (
  <div className="about-body">
    <h3 className="about-title">Copyrights</h3>
    <p>Copyright information is yet to be added.</p>
  </div>
);

const SourcesTab = () => (
  <div className="about-body">
    <h3 className="about-title">Sources</h3>
    <p>Source references are yet to be added.</p>
  </div>
);

const tabs = {
  "About": AboutTab,
  "EULA": EulaTab,
  "Copyrights": CopyrightsTab,
  "Sources": SourcesTab,
};

export default function AboutPanel({ onClose }) {
  const [activeTab, setActiveTab] = useState("About");
  const ActiveTab = tabs[activeTab];

  const onTabSelect = (tab) => setActiveTab(tab);

  return (
    <div className="about-container">
      <div className="about-nav">
        <h2 style={{ flex: 1 }}>About Rabbi</h2>
        <button className="standard-btn" onClick={onClose}>Close</button>
      </div>
      <div className="about-tabs">
        {Object.keys(tabs).map((tab) => (
          <button
            key={tab}
            className={tab === activeTab ? "about-tab about-tab-active" : "about-tab"}
            onClick={() => onTabSelect(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <ActiveTab />
    </div>
  );
}