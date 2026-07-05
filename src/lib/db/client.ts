import { DatabaseSync } from "node:sqlite";
import path from "path";

const DB_PATH = process.env.DATABASE_URL ?? path.join(process.cwd(), "data", "portfolio.db");

const globalForDb = globalThis as unknown as {
  _portfolioDb: DatabaseSync | undefined;
};

function createDb(): DatabaseSync {
  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA foreign_keys = ON");
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
  return db;
}

export const db: DatabaseSync =
  globalForDb._portfolioDb ?? (globalForDb._portfolioDb = createDb());
