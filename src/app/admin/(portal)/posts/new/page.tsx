import Link from "next/link";
import PostEditor from "@/components/admin/PostEditor";

export default function NewPostPage() {
  return (
    <div>
      <Link
        href="/admin/posts"
        className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted hover:text-brand transition-colors"
      >
        ← Back to posts
      </Link>
      <div className="mb-10">
        <p className="text-brand text-xs tracking-widest uppercase mb-2">// New entry</p>
        <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">NEW_POST</h1>
      </div>
      <PostEditor mode="new" />
    </div>
  );
}
