"use client";

import { useState } from "react";

export default function Navbar({ options, onSelect }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleMenuItem = (item) => {
    onSelect?.(item)
    setMenuOpen(false)
  }

  return (
    <nav className="navbar">
      <button
        className="navbar-hamburger"
        aria-label="Menu"
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      {menuOpen && (
        <ul className="navbar-menu">
          {options.map((item, idx) => (
            <li key={idx}>
              <button className="navbar-menu-item" onClick={() => handleMenuItem(item)}>{item}</button>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
