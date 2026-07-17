import Link from "next/link";
import type { PostFrontmatter } from "@/lib/posts";
import { readingTime } from "@/lib/posts";

export default function PostCard({
  post,
  index,
}: {
  post: PostFrontmatter & { content?: string };
  index: number;
}) {
  const num = String(index + 1).padStart(2, "0");
  const rt = post.content ? readingTime(post.content) : null;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative flex gap-5 sm:gap-8 border-b border-border py-8 px-3 -mx-3 rounded-md
        hover:bg-surface/20 hover:border-brand/30 transition-colors duration-200 last:border-b-0
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      {/* number */}
      <div className="shrink-0 pt-1" aria-hidden="true">
        <span className="text-xs font-bold text-brand/70 tracking-widest group-hover:text-brand transition-colors tabular-nums">
          {num}
        </span>
      </div>

      {/* body */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] px-2.5 py-1 border border-border text-muted tracking-widest uppercase group-hover:border-brand/30 group-hover:text-brand/80 transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>

        <h2 className="text-xl sm:text-2xl font-display font-bold tracking-tight leading-snug mb-3 group-hover:text-brand transition-colors duration-200">
          {post.title}
        </h2>

        <p className="text-[15px] text-foreground/70 leading-relaxed mb-4 max-w-2xl line-clamp-3">
          {post.excerpt}
        </p>

        <div className="flex items-center gap-4 text-xs text-muted tracking-widest">
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString("en-GB", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </time>
          {rt && (
            <>
              <span className="text-border" aria-hidden="true">
                ·
              </span>
              <span>{rt}</span>
            </>
          )}
        </div>
      </div>

      {/* arrow */}
      <div className="hidden sm:flex items-center shrink-0 self-center" aria-hidden="true">
        <span className="text-brand/40 group-hover:text-brand text-lg transition-all duration-300 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0">
          →
        </span>
      </div>
    </Link>
  );
}
