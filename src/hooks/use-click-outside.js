"use client";

import { useEffect } from "react";

export default function useClickOutside(ref, enabled, onOutside) {
  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onOutside();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [enabled, ref, onOutside]);
}