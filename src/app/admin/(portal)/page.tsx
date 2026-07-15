import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export default async function AdminDashboard() {
  const allPosts = await getAllPosts(true);
  const published = allPosts.filter((p) => p.published).length;
  const drafts = allPosts.length - published;

  const stats = [
    { label: "Total_Posts", value: allPosts.length },
    { label: "Published", value: published },
    { label: "Drafts", value: drafts },
  ];

  const quickLinks = [
    { href: "/admin/posts/new", label: "New_Post", desc: "Write a new blog entry" },
    { href: "/admin/posts", label: "Manage_Posts", desc: "Edit or delete existing posts" },
    { href: "/admin/portfolio", label: "Edit_Portfolio", desc: "Update portfolio content" },
    { href: "/blog", label: "View_Blog", desc: "See the public blog" },
  ];

  return (
    <div>
      <div className="mb-10">
        <p className="text-brand text-xs tracking-widest uppercase mb-2">// Control center</p>
        <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">DASHBOARD</h1>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="border border-border p-5 bg-surface/20">
            <p className="text-2xl font-bold text-brand font-display">{s.value}</p>
            <p className="text-[10px] text-muted tracking-widest uppercase mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group border border-border p-5 bg-surface/20 hover:border-brand/40 transition-all duration-300"
          >
            <p className="text-sm font-bold tracking-widest uppercase group-hover:text-brand transition-colors mb-1">
              {link.label}
            </p>
            <p className="text-xs text-muted">{link.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
