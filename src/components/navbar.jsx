"use client";

import { useRef, useEffect } from "react";
import { useNavigationContext, useReaderContext } from "../contexts/AppContext";
import ContentSelector from "./content-selector";
import Bookmarks from "./bookmarks";

export default function Navbar({ options, onSelect }) {
  const { menuOpen, setMenu } = useNavigationContext();
  const { activity, setActivity, hydrated } = useReaderContext();
  const navRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen, setMenu]);

  const handleMenuItem = (item) => {
    onSelect?.(item)
    setMenu(false)
  }

  return (
    <nav ref={navRef} className="navbar">
      <button
        className="navbar-hamburger"
        aria-label="Menu"
        onClick={() => setMenu(!menuOpen)}
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <button
        className="navbar-conversation"
        aria-label="Open Conversation"
        onClick={() => setActivity(activity === "Reader" ? "Conversation" : "Reader")}
      >
        {hydrated && (activity === "Reader" ? (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4z" />
            <line x1="7" y1="9" x2="17" y2="9" />
            <line x1="7" y1="13" x2="17" y2="13" />
            <line x1="7" y1="17" x2="17" y2="17" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )        )}
      </button>
      <Bookmarks />
      <ContentSelector />
      {menuOpen && (
        <ul className="navbar-menu">
          {options.map((item, idx) => (
            <li key={idx}>
              <button className="navbar-menu-item" onClick={() => handleMenuItem(item.key)}>{item.label}</button>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
