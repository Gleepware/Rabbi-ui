"use client";

import { useEffect } from "react";

export default function useClickOutside(ref, enabled, onOutside) {
  useEffect(() => {
    if (!enabled) return;

    const onOutsideClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onOutside();
      }
    };

    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, [enabled, ref, onOutside]);
}