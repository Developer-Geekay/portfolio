import type { NextConfig } from "next";

// Gokul AI assistant backend (FastAPI) — proxied under /assistant-api so the
// static assistant app at /assistant stays same-origin (mic + no CORS).
const ASSISTANT_API_URL =
  process.env.ASSISTANT_API_URL ?? "http://localhost:16000";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["gray-matter"],
  async rewrites() {
    return [
      // /assistant → the static Vite build in public/assistant/
      { source: "/assistant", destination: "/assistant/index.html" },
      // assistant API calls → FastAPI backend
      {
        source: "/assistant-api/:path*",
        destination: `${ASSISTANT_API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
