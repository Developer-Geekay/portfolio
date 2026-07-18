"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Fires a fire-and-forget page-view beacon on each route change. Skips admin
// routes. The server reads IP + user-agent from the request; we only send the
// path so the client can't spoof visitor identity.
export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    const payload = JSON.stringify({ path: pathname });
    // keepalive so the request survives a fast navigation/unload
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
