"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const baseLinks = [
  { href: "/admin/portfolio", label: "[ PORTFOLIO ]", exact: false, external: false },
  { href: "/", label: "[ VIEW_SITE ↗ ]", exact: true, external: true },
];

// The Data (migration) tab only appears while a migration is pending.
const dataLink = { href: "/admin/data", label: "[ DATA ]", exact: false, external: false };

export default function AdminNav({ showData = false }: { showData?: boolean }) {
  const pathname = usePathname();
  const links = showData ? [baseLinks[0], dataLink, baseLinks[1]] : baseLinks;

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono">
      {links.map(({ href, label, exact, external }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className={`px-3 py-1.5 rounded-md transition-all duration-150 tracking-wider text-[11px] sm:text-xs font-semibold ${
              isActive
                ? "bg-brand text-brand-foreground shadow-sm"
                : "text-muted-foreground dark:text-zinc-400 hover:text-foreground hover:bg-surface/80 dark:hover:bg-zinc-800/80 border border-transparent hover:border-border/60"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
