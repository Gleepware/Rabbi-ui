"use client";

import { useRef } from "react";
import { useNavigationContext, useReaderContext } from "../contexts/AppContext";
import useClickOutside from "../hooks/use-click-outside";
import ContentSelector from "./content-selector";
import Bookmarks from "./bookmarks";
import { BookIcon, ChatIcon, MenuIcon } from "./icons";

export default function Navbar({ options, onSelect }) {
  const { menuOpen, setMenu } = useNavigationContext();
  const { activity, setActivity, hydrated } = useReaderContext();
  const navRef = useRef(null);

  useClickOutside(navRef, menuOpen, () => setMenu(false));

  const onMenuItemClick = (item) => {
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
        <MenuIcon />
      </button>
      <button
        className="navbar-conversation"
        aria-label="Open Conversation"
        onClick={() => setActivity(activity === "Reader" ? "Conversation" : "Reader")}
      >
        {hydrated && (activity === "Reader" ? (
          <ChatIcon />
        ) : (
          <BookIcon />
        )        )}
      </button>
      <Bookmarks />
      <ContentSelector />
      {menuOpen && (
        <ul className="navbar-menu">
          {options.map((item, idx) => (
            <li key={idx}>
              <button className="navbar-menu-item" onClick={() => onMenuItemClick(item.key)}>{item.label}</button>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
