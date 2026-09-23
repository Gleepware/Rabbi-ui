"use client";

import { useEffect } from "react";
import { scheduleCopyrightsRefresh } from "../services/copyright-service";

export default function useCopyrightsPrewarm() {
  useEffect(() => {
    scheduleCopyrightsRefresh().catch(() => {});
  }, []);
}