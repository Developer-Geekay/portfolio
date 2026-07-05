import { db } from "./db/client";

export type PostFrontmatter = {
  title: string;
  date: string;
  slug: string;
  tags: string[];
  excerpt: string;
  published: boolean;
};

export type Post = PostFrontmatter & {
  content: string;
};

type PostRow = {
  slug: string;
  title: string;
  date: string;
  tags: string;
  excerpt: string;
  content: string;
  published: number;
};

function rowToFrontmatter(row: PostRow): PostFrontmatter {
  return {
    slug: row.slug,
    title: row.title,
    date: row.date,
    tags: JSON.parse(row.tags) as string[],
    excerpt: row.excerpt,
    published: row.published === 1,
  };
}

export function getAllPosts(includeUnpublished = false): PostFrontmatter[] {
  const sql = includeUnpublished
    ? "SELECT slug, title, date, tags, excerpt, published FROM posts ORDER BY date DESC"
    : "SELECT slug, title, date, tags, excerpt, published FROM posts WHERE published = 1 ORDER BY date DESC";
  return (db.prepare(sql).all() as PostRow[]).map(rowToFrontmatter);
}

export function getPostBySlug(slug: string): Post | null {
  const row = db.prepare("SELECT * FROM posts WHERE slug = ?").get(slug) as PostRow | undefined;
  if (!row) return null;
  return { ...rowToFrontmatter(row), content: row.content };
}

export function savePost(slug: string, frontmatter: PostFrontmatter, content: string): void {
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO posts (slug, title, date, tags, excerpt, content, published, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(slug) DO UPDATE SET
       title = excluded.title,
       date = excluded.date,
       tags = excluded.tags,
       excerpt = excluded.excerpt,
       content = excluded.content,
       published = excluded.published,
       updated_at = excluded.updated_at`,
  ).run(
    slug,
    frontmatter.title,
    frontmatter.date,
    JSON.stringify(frontmatter.tags ?? []),
    frontmatter.excerpt ?? "",
    content,
    frontmatter.published ? 1 : 0,
    now,
    now,
  );
}

export function deletePost(slug: string): void {
  db.prepare("DELETE FROM posts WHERE slug = ?").run(slug);
}

export function readingTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
}
