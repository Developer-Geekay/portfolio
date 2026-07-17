throw new Error("deliberately broken build - phase 5 test");
/**
 * Pure Node.js server — zero external dependencies.
 * Requires Node.js v14.8+.
 *
 * Deploy checklist:
 *   • Copy this file, the dist/ folder, and data/ folder to your server.
 *   • If you deploy WITHOUT a package.json alongside this file, rename it to server.mjs
 *     so Node knows it is an ES module:  node server.mjs
 *   • If you deploy WITH the project package.json (which has "type":"module"), keep the
 *     name server.js and run:  node server.js
 */

import { createServer } from "node:http";
import { promises as fs, createReadStream } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "data", "portfolio.json");
const DIST_DIR = path.join(__dirname, "dist");

const MIME = {
  ".html":  "text/html; charset=utf-8",
  ".css":   "text/css; charset=utf-8",
  ".js":    "application/javascript; charset=utf-8",
  ".mjs":   "application/javascript; charset=utf-8",
  ".json":  "application/json; charset=utf-8",
  ".jpg":   "image/jpeg",
  ".jpeg":  "image/jpeg",
  ".png":   "image/png",
  ".gif":   "image/gif",
  ".svg":   "image/svg+xml",
  ".ico":   "image/x-icon",
  ".pdf":   "application/pdf",
  ".woff":  "font/woff",
  ".woff2": "font/woff2",
  ".ttf":   "font/ttf",
  ".eot":   "application/vnd.ms-fontobject",
  ".webp":  "image/webp",
  ".mp4":   "video/mp4",
  ".webm":  "video/webm",
};

function sortPortfolio(data) {
  const safeSort = (arr) => {
    if (!Array.isArray(arr)) return [];
    return [...arr].sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));
  };
  return {
    ...data,
    projects:       safeSort(data.projects),
    experience:     safeSort(data.experience),
    stack:          safeSort(data.stack),
    certifications: safeSort(data.certifications),
    proficiency:    safeSort(data.proficiency),
    awards:         safeSort(data.awards),
    languages:      safeSort(data.languages),
  };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));
    req.on("end", () => {
      try { resolve(JSON.parse(body)); }
      catch (e) { reject(new Error("Invalid JSON body.")); }
    });
    req.on("error", reject);
  });
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type":   "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

async function serveStaticFile(res, filePath) {
  let stat;
  try {
    stat = await fs.stat(filePath);
  } catch {
    return false;
  }
  if (!stat.isFile()) return false;

  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    "Content-Type":   MIME[ext] || "application/octet-stream",
    "Content-Length": stat.size,
    "Cache-Control":  ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable",
  });
  createReadStream(filePath).pipe(res);
  return true;
}

const server = createServer(async (req, res) => {
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);

  // ── API: GET /api/portfolio ──────────────────────────────────────────────
  if (urlPath === "/api/portfolio" && req.method === "GET") {
    try {
      const raw = await fs.readFile(DATA_FILE, "utf8");
      const sorted = sortPortfolio(JSON.parse(raw));
      sendJson(res, 200, sorted);
    } catch (err) {
      if (err.code === "ENOENT") {
        sendJson(res, 404, { message: "Portfolio data file not found." });
      } else {
        console.error("GET /api/portfolio error:", err);
        sendJson(res, 500, { message: "Failed to read portfolio data." });
      }
    }
    return;
  }

  // ── API: POST /api/portfolio ─────────────────────────────────────────────
  if (urlPath === "/api/portfolio" && req.method === "POST") {
    try {
      const input = await readBody(req);
      if (!input || typeof input !== "object" || Array.isArray(input)) {
        sendJson(res, 400, { message: "Invalid payload." });
        return;
      }
      const sorted = sortPortfolio(input);
      await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
      await fs.writeFile(DATA_FILE, JSON.stringify(sorted, null, 2) + "\n", "utf8");
      sendJson(res, 200, sorted);
    } catch (err) {
      if (err.message === "Invalid JSON body.") {
        sendJson(res, 400, { message: err.message });
      } else {
        console.error("POST /api/portfolio error:", err);
        sendJson(res, 500, { message: "Failed to save portfolio data." });
      }
    }
    return;
  }

  // ── Static files ─────────────────────────────────────────────────────────
  const safePath = urlPath === "/" ? "/index.html" : urlPath;
  const filePath = path.normalize(path.join(DIST_DIR, safePath));

  // Directory traversal guard
  if (!filePath.startsWith(DIST_DIR + path.sep) && filePath !== DIST_DIR) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  const served = await serveStaticFile(res, filePath);
  if (!served) {
    // SPA fallback — all unknown paths serve index.html
    const fallback = await serveStaticFile(res, path.join(DIST_DIR, "index.html"));
    if (!fallback) {
      res.writeHead(404);
      res.end("Not found");
    }
  }
});

server.on("error", (err) => {
  console.error("Server error:", err);
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
