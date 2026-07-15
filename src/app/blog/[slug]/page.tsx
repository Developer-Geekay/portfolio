import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostBySlug, getAllPosts, readingTime } from "@/lib/posts";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import ReadingProgress from "@/components/blog/ReadingProgress";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { Metadata } from "next";

// always render from the live database
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} — Gokula Kannan`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || !post.published) notFound();

  const rt = readingTime(post.content);

  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      <ReadingProgress />

      {/* nav */}
      <nav className="border-b border-brand/20 bg-background/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/blog"
            className="flex items-center gap-2 text-muted hover:text-brand transition-colors text-xs tracking-widest"
          >
            ← BLOG
          </Link>
          <span className="text-[10px] text-muted/50 tracking-widest hidden sm:block">{rt}</span>
          <ThemeToggle />
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* article header — terminal window style */}
        <div className="mt-12 mb-10 border border-border rounded-lg overflow-hidden">
          <div className="bg-surface px-4 py-2.5 border-b border-border flex items-center gap-2">
            <div className="size-2 rounded-full bg-border" />
            <div className="size-2 rounded-full bg-border" />
            <div className="size-2 rounded-full bg-border" />
            <span className="text-[10px] text-muted ml-2 uppercase tracking-widest">
              blog/{slug}.mdx
            </span>
            <div className="ml-auto flex items-center gap-3 text-[10px] text-muted/60 tracking-widest">
              <span>{rt}</span>
              <span>·</span>
              <span>
                {new Date(post.date).toLocaleDateString("en-GB", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
          <div className="px-6 sm:px-8 py-8">
            <div className="flex flex-wrap gap-2 mb-5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[9px] px-2 py-0.5 border border-brand/30 text-brand tracking-widest uppercase"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-2xl sm:text-4xl font-display font-bold tracking-tighter leading-tight mb-4">
              {post.title}
            </h1>
            <p className="text-muted text-sm leading-relaxed">{post.excerpt}</p>
          </div>
        </div>

        {/* article body */}
        <article
          className="
            prose prose-sm sm:prose-base max-w-none pb-20
            prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
            prose-h1:text-2xl prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-border prose-h2:pb-3
            prose-h3:text-base prose-h3:text-brand/90 prose-h3:mt-8
            prose-p:text-muted prose-p:leading-[1.85] prose-p:my-5
            prose-a:text-brand prose-a:no-underline prose-a:border-b prose-a:border-brand/30 hover:prose-a:border-brand
            prose-strong:text-foreground prose-strong:font-bold
            prose-em:text-muted/80
            prose-code:text-brand prose-code:bg-surface/80 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.8em] prose-code:border prose-code:border-border prose-code:not-italic
            prose-pre:bg-surface prose-pre:border prose-pre:border-border prose-pre:rounded-none prose-pre:my-6 prose-pre:p-0
            prose-pre:before:content-[''] prose-pre:after:content-['']
            prose-blockquote:border-l-2 prose-blockquote:border-brand/40 prose-blockquote:bg-surface/30 prose-blockquote:px-5 prose-blockquote:py-1 prose-blockquote:not-italic prose-blockquote:text-muted
            prose-blockquote:before:content-none prose-blockquote:after:content-none
            prose-ul:text-muted prose-ol:text-muted
            prose-li:my-1 prose-li:leading-relaxed
            prose-hr:border-border prose-hr:my-10
            prose-img:border prose-img:border-border
            [&_pre_code]:bg-transparent [&_pre_code]:border-0 [&_pre_code]:p-0 [&_pre_code]:text-[0.875em] [&_pre_code]:text-foreground/90
            [&_pre]:px-5 [&_pre]:py-4
          "
        >
          <MDXRemote
            source={post.content}
            options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
          />
        </article>

        {/* footer */}
        <div className="border-t border-border py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-[10px] text-muted/50 tracking-widest uppercase mb-1">Written by</p>
            <p className="text-sm font-bold">Gokula Kannan</p>
            <p className="text-[11px] text-brand/70 tracking-widest mt-0.5">Technical Architect · OutSystems</p>
          </div>
          <Link
            href="/blog"
            className="border border-border px-5 py-2.5 text-xs tracking-widest uppercase text-muted hover:border-brand/50 hover:text-brand transition-colors"
          >
            ← More articles
          </Link>
        </div>
      </main>
    </div>
  );
}
