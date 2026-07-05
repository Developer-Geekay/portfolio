"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PostFrontmatter } from "@/lib/posts";

type Props = {
  mode: "new" | "edit";
  initialSlug?: string;
  initialData?: Partial<PostFrontmatter & { content: string }>;
};

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function PostEditor({ mode, initialSlug, initialData }: Props) {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialSlug ?? "");
  const [date, setDate] = useState(initialData?.date ?? today);
  const [tags, setTags] = useState((initialData?.tags ?? []).join(", "));
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? "");
  const [published, setPublished] = useState(initialData?.published ?? false);
  const [content, setContent] = useState(initialData?.content ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleTitleChange(val: string) {
    setTitle(val);
    if (mode === "new") setSlug(slugify(val));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      title,
      slug,
      date,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      excerpt,
      published,
      content,
    };

    const url = mode === "new" ? "/api/posts" : `/api/posts/${initialSlug}`;
    const method = mode === "new" ? "POST" : "PUT";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message ?? "Save failed.");
      }
      router.push("/admin/posts");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "w-full bg-surface border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-brand/50 transition-colors";
  const labelCls = "block text-[10px] uppercase tracking-widest text-muted mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label className={labelCls}>Title</label>
          <input type="text" value={title} onChange={(e) => handleTitleChange(e.target.value)} className={inputCls} required />
        </div>
        <div>
          <label className={labelCls}>Slug</label>
          <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className={inputCls} required readOnly={mode === "edit"} />
        </div>
        <div>
          <label className={labelCls}>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} required />
        </div>
        <div>
          <label className={labelCls}>Tags (comma-separated)</label>
          <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className={inputCls} placeholder="OutSystems, Architecture, React" />
        </div>
      </div>

      <div>
        <label className={labelCls}>Excerpt</label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          className={inputCls}
          placeholder="Short summary shown in the blog listing..."
        />
      </div>

      <div>
        <label className={labelCls}>Content (MDX)</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={24}
          className={`${inputCls} font-mono text-xs resize-y`}
          placeholder="Write your post in Markdown / MDX..."
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setPublished(!published)}
            className={`w-10 h-5 rounded-full border transition-colors relative cursor-pointer ${
              published ? "bg-brand/20 border-brand/50" : "bg-surface border-border"
            }`}
          >
            <div className={`absolute top-0.5 size-4 rounded-full transition-all ${
              published ? "left-5 bg-brand" : "left-0.5 bg-muted/50"
            }`} />
          </div>
          <span className="text-[11px] tracking-widest uppercase text-muted">
            {published ? "Published" : "Draft"}
          </span>
        </label>

        <div className="flex items-center gap-4">
          {error && <p className="text-xs text-destructive tracking-widest">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="bg-brand text-brand-foreground px-6 py-2.5 text-xs font-bold tracking-widest uppercase hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? "SAVING..." : mode === "new" ? "PUBLISH_POST" : "SAVE_CHANGES"}
          </button>
        </div>
      </div>
    </form>
  );
}
