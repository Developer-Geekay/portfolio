import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import PostCard from "@/components/blog/PostCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Gokula Kannan",
  description:
    "Thoughts on OutSystems architecture, enterprise development, and technical leadership.",
};

// always render from the live database
export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getAllPosts(false);

  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      {/* nav */}
      <nav
        aria-label="Blog"
        className="border-b border-brand/20 bg-background/90 backdrop-blur-sm sticky top-0 z-50"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 h-full px-2 -mx-2 text-muted hover:text-brand transition-colors text-xs tracking-widest
              focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand"
          >
            ← ROOT
          </Link>
          <div className="h-4 w-px bg-border" aria-hidden="true" />
          <div className="flex items-center gap-2">
            <div className="size-1.5 rounded-full bg-brand glow-sm" aria-hidden="true" />
            <span className="text-xs font-bold tracking-widest text-brand">&gt;_ BLOG</span>
          </div>
          <ThemeToggle className="ml-auto" />
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* header */}
        <div className="py-16 sm:py-20 border-b border-border">
          <p className="text-brand text-[11px] tracking-[0.3em] uppercase mb-4">
            $ ls ./knowledge-base --sort=date
          </p>
          <h1 className="text-4xl sm:text-6xl font-display font-bold tracking-tighter mb-5 leading-none">
            KNOWLEDGE
            <br />
            <span className="text-brand italic">BASE_</span>
          </h1>
          <p className="text-foreground/70 text-[15px] leading-relaxed max-w-xl">
            Architecture patterns, OutSystems deep-dives, and notes from the field.
          </p>
          <div className="mt-6 flex items-center gap-3 text-xs text-muted tracking-widest">
            <span className="size-1.5 rounded-full bg-brand/40" aria-hidden="true" />
            <span>
              {posts.length} DISPATCH{posts.length !== 1 ? "ES" : ""}
            </span>
          </div>
        </div>

        {/* post list */}
        {posts.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm text-muted tracking-[0.2em] uppercase mb-6">
              NO_POSTS_FOUND — check back soon.
            </p>
            <Link
              href="/"
              className="inline-flex items-center min-h-11 border border-border px-5 text-xs tracking-widest uppercase text-muted
                hover:border-brand/50 hover:text-brand transition-colors
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              ← Back to portfolio
            </Link>
          </div>
        ) : (
          <div>
            {posts.map((post, i) => (
              <PostCard key={post.slug} post={post} index={i} />
            ))}
          </div>
        )}

        {/* footer */}
        <div className="py-12 border-t border-border flex items-center justify-between text-[11px] text-muted tracking-widest uppercase">
          <span>G.KANNAN // KNOWLEDGE_BASE</span>
          <Link
            href="/"
            className="inline-flex items-center min-h-11 px-2 -mx-2 hover:text-brand transition-colors
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            ← Back to root
          </Link>
        </div>
      </main>
    </div>
  );
}
