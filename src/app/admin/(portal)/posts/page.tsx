import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import DeletePostButton from "@/components/admin/DeletePostButton";

export default async function AdminPostsPage() {
  const posts = await getAllPosts(true);

  return (
    <div>
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-brand text-xs tracking-widest uppercase mb-2">// Content management</p>
          <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">POSTS</h1>
        </div>
        <Link
          href="/admin/posts/new"
          className="bg-brand text-brand-foreground px-4 py-2 text-xs font-bold tracking-widest uppercase hover:opacity-90 transition-opacity"
        >
          + NEW_POST
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="border border-border p-8 text-center">
          <p className="text-muted text-sm tracking-widest">NO_POSTS — create your first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.slug} className="border border-border p-5 bg-surface/20 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-sm font-bold truncate">{post.title}</h3>
                  <span className={`text-[9px] px-1.5 py-0.5 border tracking-widest shrink-0 ${
                    post.published
                      ? "border-brand/40 text-brand bg-brand/5"
                      : "border-border text-muted"
                  }`}>
                    {post.published ? "PUBLISHED" : "DRAFT"}
                  </span>
                </div>
                <p className="text-[11px] text-muted tracking-widest">
                  {new Date(post.date).toLocaleDateString("en-GB")} — {post.slug}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href={`/admin/posts/${post.slug}/edit`}
                  className="text-[10px] tracking-widest text-muted hover:text-brand transition-colors uppercase"
                >
                  Edit
                </Link>
                {post.published && (
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="text-[10px] tracking-widest text-muted hover:text-brand transition-colors uppercase"
                  >
                    View
                  </Link>
                )}
                <DeletePostButton slug={post.slug} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
