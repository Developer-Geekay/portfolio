import { dbConnect } from "./db/client";
import { Post as PostModel, type PostDoc } from "./db/schema";

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

function toFrontmatter(doc: PostDoc): PostFrontmatter {
  return {
    slug: doc.slug,
    title: doc.title,
    date: doc.date,
    tags: doc.tags ?? [],
    excerpt: doc.excerpt ?? "",
    published: !!doc.published,
  };
}

export async function getAllPosts(includeUnpublished = false): Promise<PostFrontmatter[]> {
  await dbConnect();
  const filter = includeUnpublished ? {} : { published: true };
  const docs = await PostModel.find(filter, "slug title date tags excerpt published")
    .sort({ date: -1 })
    .lean();
  return docs.map(toFrontmatter);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  await dbConnect();
  const doc = await PostModel.findOne({ slug }).lean();
  if (!doc) return null;
  return { ...toFrontmatter(doc), content: doc.content ?? "" };
}

export async function savePost(
  slug: string,
  frontmatter: PostFrontmatter,
  content: string,
): Promise<void> {
  await dbConnect();
  await PostModel.findOneAndUpdate(
    { slug },
    {
      slug,
      title: frontmatter.title,
      date: frontmatter.date,
      tags: frontmatter.tags ?? [],
      excerpt: frontmatter.excerpt ?? "",
      content,
      published: !!frontmatter.published,
    },
    { upsert: true, runValidators: true },
  );
}

export async function deletePost(slug: string): Promise<void> {
  await dbConnect();
  await PostModel.deleteOne({ slug });
}

export function readingTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
}
