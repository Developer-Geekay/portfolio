#!/usr/bin/env node
import { DatabaseSync } from "node:sqlite";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const DB_PATH = process.env.DATABASE_URL ?? path.join(process.cwd(), "data", "portfolio.db");
const JSON_PATH = path.join(process.cwd(), "data", "portfolio.json");
const POSTS_DIR = path.join(process.cwd(), "content", "posts");

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS portfolio (
    id INTEGER PRIMARY KEY NOT NULL,
    data TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    tags TEXT NOT NULL DEFAULT '[]',
    excerpt TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    published INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);

// Seed portfolio
if (fs.existsSync(JSON_PATH)) {
  const raw = fs.readFileSync(JSON_PATH, "utf8");
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO portfolio (id, data, updated_at) VALUES (1, ?, ?)
     ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
  ).run(raw, now);
  console.log("✓ Portfolio seeded from data/portfolio.json");
} else {
  console.warn("⚠ data/portfolio.json not found — skipping portfolio seed");
}

// Seed posts from MDX files
if (fs.existsSync(POSTS_DIR)) {
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"));
  const upsert = db.prepare(`
    INSERT INTO posts (slug, title, date, tags, excerpt, content, published, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET
      title = excluded.title,
      date = excluded.date,
      tags = excluded.tags,
      excerpt = excluded.excerpt,
      content = excluded.content,
      published = excluded.published,
      updated_at = excluded.updated_at
  `);

  let count = 0;
  for (const file of files) {
    const { data, content } = matter(fs.readFileSync(path.join(POSTS_DIR, file), "utf8"));
    const slug = (data.slug as string | undefined) ?? file.replace(/\.mdx$/, "");
    const now = new Date().toISOString();
    upsert.run(
      slug,
      (data.title as string | undefined) ?? "",
      (data.date as string | undefined) ?? now.split("T")[0],
      JSON.stringify((data.tags as string[] | undefined) ?? []),
      (data.excerpt as string | undefined) ?? "",
      content,
      (data.published as boolean | undefined) ? 1 : 0,
      now,
      now,
    );
    count++;
  }
  console.log(`✓ Seeded ${count} post(s) from content/posts/`);
} else {
  console.log("No content/posts directory — skipping post seed");
}

db.close();
console.log(`\nDatabase ready at: ${DB_PATH}`);
