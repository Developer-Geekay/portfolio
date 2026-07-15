import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/posts";
import PostEditor from "@/components/admin/PostEditor";

export default async function EditPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <div>
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
