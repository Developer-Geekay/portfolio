import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/posts";
import PostEditor from "@/components/admin/PostEditor";

export default async function EditPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <div>
      <Link
        href="/admin/posts"
        className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted hover:text-brand transition-colors"
      >
        ← Back to posts
      </Link>
      <div className="mb-10">
        <p className="text-brand text-xs tracking-widest uppercase mb-2">// Editing post</p>
        <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight truncate">
          {post.title}
        </h1>
      </div>
      <PostEditor
        mode="edit"
        initialSlug={slug}
        initialData={post}
      />
    </div>
  );
}
