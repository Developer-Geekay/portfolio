#!/usr/bin/env node
// Seeds MongoDB into the per-section portfolio collections.
// Portfolio source order: legacy SQLite (data/portfolio.db) → legacy Mongo
// single-doc blob ("portfolios" collection) → data/portfolio.json.
// Posts: SQLite if present, else content/posts/*.mdx.
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import mongoose from "mongoose";
import { Post } from "../src/lib/db/schema";
import { savePortfolio } from "../src/lib/portfolio";
import { migrateLegacyPortfolioIfNeeded } from "../src/lib/server/services/portfolio.migration.server";

const MONGODB_URI =
  process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/personal-portfolio";
const SQLITE_PATH = process.env.DATABASE_URL ?? path.join(process.cwd(), "data", "portfolio.db");
const JSON_PATH = path.join(process.cwd(), "data", "portfolio.json");
const POSTS_DIR = path.join(process.cwd(), "content", "posts");

type SqlitePostRow = {
  slug: string;
  title: string;
  date: string;
  tags: string;
  excerpt: string;
  content: string;
  published: number;
};

async function migrateFromSqlite(): Promise<boolean> {
  if (!fs.existsSync(SQLITE_PATH)) return false;
  const { DatabaseSync } = await import("node:sqlite");
  const sqlite = new DatabaseSync(SQLITE_PATH, { readOnly: true });

  const portfolioRow = sqlite.prepare("SELECT data FROM portfolio WHERE id = 1").get() as
    | { data: string }
    | undefined;
  if (portfolioRow) {
    await savePortfolio(JSON.parse(portfolioRow.data));
    console.log("✓ Portfolio migrated from SQLite into per-section collections");
  }

  const rows = sqlite.prepare("SELECT * FROM posts").all() as unknown as SqlitePostRow[];
  for (const row of rows) {
    await Post.findOneAndUpdate(
      { slug: row.slug },
      {
        slug: row.slug,
        title: row.title,
        date: row.date,
        tags: JSON.parse(row.tags) as string[],
        excerpt: row.excerpt,
        content: row.content,
        published: row.published === 1,
      },
      { upsert: true },
    );
  }
  console.log(`✓ Migrated ${rows.length} post(s) from SQLite`);
  sqlite.close();
  return true;
}

async function seedPortfolioFromJson() {
  if (!fs.existsSync(JSON_PATH)) {
    console.warn("⚠ data/portfolio.json not found — skipping portfolio seed");
    return;
  }
  const raw = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));
  await savePortfolio(raw);
  console.log("✓ Portfolio seeded from data/portfolio.json into per-section collections");
}

async function seedPostsFromFiles() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.log("No content/posts directory — skipping post seed");
    return;
  }
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"));
  for (const file of files) {
    const { data, content } = matter(fs.readFileSync(path.join(POSTS_DIR, file), "utf8"));
    const slug = (data.slug as string | undefined) ?? file.replace(/\.mdx$/, "");
    await Post.findOneAndUpdate(
      { slug },
      {
        slug,
        title: (data.title as string | undefined) ?? "",
        date: (data.date as string | undefined) ?? new Date().toISOString().split("T")[0],
        tags: (data.tags as string[] | undefined) ?? [],
        excerpt: (data.excerpt as string | undefined) ?? "",
        content,
        published: !!(data.published as boolean | undefined),
      },
      { upsert: true },
    );
  }
  console.log(`✓ Seeded ${files.length} post(s) from content/posts/`);
}

async function main() {
  await mongoose.connect(MONGODB_URI);

  const migratedSqlite = await migrateFromSqlite();
  if (!migratedSqlite) {
    console.log("No SQLite database found");
    const migratedLegacy = await migrateLegacyPortfolioIfNeeded();
    if (!migratedLegacy) await seedPortfolioFromJson();
    await seedPostsFromFiles();
  }

  await mongoose.disconnect();
  console.log(`\nMongoDB ready at: ${MONGODB_URI.replace(/\/\/[^@]*@/, "//<credentials>@")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
