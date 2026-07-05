"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

// Same palette as PortfolioClient — admin gets index 0 (green family) as its fixed accent
const DARK_ACCENT  = "#e2ff66";
const LIGHT_ACCENT = "#3d7000";
const DARK_FG      = "#0a0a0b";
const LIGHT_FG     = "#f3f2ed";

export default function AdminAccent() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const isDark = resolvedTheme === "dark";
    document.documentElement.style.setProperty("--brand", isDark ? DARK_ACCENT : LIGHT_ACCENT);
    document.documentElement.style.setProperty("--brand-foreground", isDark ? DARK_FG : LIGHT_FG);
  }, [resolvedTheme]);

  return null;
}
