"use client";

import { useEffect } from "react";

export default function AutoPrint() {
  useEffect(() => {
    try { window.print(); } catch {}
  }, []);
  return null;
}

