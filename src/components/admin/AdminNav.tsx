"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const baseLinks = [
  { href: "/admin", label: "[ DASHBOARD ]", exact: true },
  { href: "/admin/posts", label: "[ POSTS ]", exact: false },
  { href: "/admin/portfolio", label: "[ PORTFOLIO ]", exact: false },
  { href: "/admin/analytics", label: "[ ANALYTICS ]", exact: false },
  { href: "/", label: "[ VIEW_SITE ]", exact: true },
];

// The Data (migration) tab only appears while a migration is pending.
const dataLink = { href: "/admin/data", label: "[ DATA ]", exact: false };

export default function AdminNav({ showData = false }: { showData?: boolean }) {
  const pathname = usePathname();
  const links = showData ? [...baseLinks.slice(0, 3), dataLink, ...baseLinks.slice(3)] : baseLinks;

  return (
    <div className="hidden md:flex gap-5 text-[11px] tracking-widest text-muted">
      {links.map(({ href, label, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`transition-colors hover:text-brand ${isActive ? "text-brand" : ""}`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
