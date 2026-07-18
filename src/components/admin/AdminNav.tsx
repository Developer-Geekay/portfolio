"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "[ DASHBOARD ]", exact: true },
  { href: "/admin/posts", label: "[ POSTS ]", exact: false },
  { href: "/admin/portfolio", label: "[ PORTFOLIO ]", exact: false },
  { href: "/admin/data", label: "[ DATA ]", exact: false },
  { href: "/", label: "[ VIEW_SITE ]", exact: true },
];

export default function AdminNav() {
  const pathname = usePathname();

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
